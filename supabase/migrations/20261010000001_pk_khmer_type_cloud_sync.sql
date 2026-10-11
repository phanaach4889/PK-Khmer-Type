-- ============================================================================
-- PK Khmer Type — Production Cloud Sync Schema, Triggers, Storage & RLS
-- Migration: 20261010000001_pk_khmer_type_cloud_sync.sql
-- ============================================================================

BEGIN;

-- Ensure required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- 1. SHARED TIMESTAMP & VALIDATION FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- Protect immutable columns on public.profiles so users cannot alter id or created_at
CREATE OR REPLACE FUNCTION public.protect_profile_immutable_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Modifying profile id is not permitted.';
  END IF;
  NEW.created_at := OLD.created_at;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- Validate that user_settings.settings only contains permitted application setting keys
-- and never stores secrets, privileged flags, or deeply nested blobs.
CREATE OR REPLACE FUNCTION public.validate_user_settings_payload(payload JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  k TEXT;
  v JSONB;
BEGIN
  IF payload IS NULL OR jsonb_typeof(payload) <> 'object' THEN
    RETURN FALSE;
  END IF;

  IF pg_column_size(payload) > 65536 THEN
    RETURN FALSE;
  END IF;

  FOR k, v IN SELECT * FROM jsonb_each(payload) LOOP
    -- Reject any suspicious or privileged key names
    IF k ~* '(password|secret|service_role|private_key|is_admin|admin|role|jwt|token)' THEN
      RETURN FALSE;
    END IF;

    -- Allow only known PK Khmer Type setting prefixes/keys and sync metadata
    IF NOT (
      k LIKE 'khmerSetting%' OR
      k IN (
        'khmerLayout',
        'kk_site_lang',
        'pk_unlock_all_lessons',
        'khmerUnlockAll',
        'khmerCursorInspector',
        'khmerCustomWallpaperDim',
        'khmerCustomWallpaperUrl',
        'khmerCustomWallpaperFileId',
        'khmerAvatarFileId',
        '_meta',
        '_updatedAtByKey'
      )
    ) THEN
      RETURN FALSE;
    END IF;
  END LOOP;

  RETURN TRUE;
END;
$$;

-- Server-side monotonic merge on lesson_progress updates so concurrent updates
-- from multiple devices never erase a completed lesson or lower personal bests
-- unless '_force_reset' is explicitly true.
CREATE OR REPLACE FUNCTION public.merge_lesson_progress_on_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  force_reset BOOLEAN := COALESCE((NEW.progress->>'_force_reset')::boolean, false);
  old_completed BOOLEAN := COALESCE((OLD.progress->>'completed')::boolean, false);
  new_completed BOOLEAN := COALESCE((NEW.progress->>'completed')::boolean, false);
  old_mastered BOOLEAN := COALESCE((OLD.progress->>'mastered')::boolean, false) OR (OLD.progress->>'masteryState' = 'mastered');
  new_mastered BOOLEAN := COALESCE((NEW.progress->>'mastered')::boolean, false) OR (NEW.progress->>'masteryState' = 'mastered');
  old_best_wpm NUMERIC := COALESCE(NULLIF(OLD.progress->>'bestWpm', '')::numeric, COALESCE(NULLIF(OLD.progress->>'wpm', '')::numeric, 0));
  new_best_wpm NUMERIC := COALESCE(NULLIF(NEW.progress->>'bestWpm', '')::numeric, COALESCE(NULLIF(NEW.progress->>'wpm', '')::numeric, 0));
  old_best_acc NUMERIC := COALESCE(NULLIF(OLD.progress->>'bestAccuracy', '')::numeric, COALESCE(NULLIF(OLD.progress->>'accuracy', '')::numeric, 0));
  new_best_acc NUMERIC := COALESCE(NULLIF(NEW.progress->>'bestAccuracy', '')::numeric, COALESCE(NULLIF(NEW.progress->>'accuracy', '')::numeric, 0));
  old_attempts INTEGER := COALESCE(NULLIF(OLD.progress->>'attempts', '')::integer, 0);
  new_attempts INTEGER := COALESCE(NULLIF(NEW.progress->>'attempts', '')::integer, 0);
BEGIN
  IF NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.lesson_id IS DISTINCT FROM OLD.lesson_id THEN
    RAISE EXCEPTION 'Modifying lesson_progress ownership or lesson_id is not permitted.';
  END IF;

  NEW.updated_at := NOW();

  -- If this is a regular lesson record (not an explicit reset and not a _meta aggregate record)
  IF NOT force_reset AND LEFT(NEW.lesson_id, 6) <> '_meta:' THEN
    IF old_completed AND NOT new_completed THEN
      NEW.progress := jsonb_set(NEW.progress, '{completed}', 'true'::jsonb, true);
    END IF;

    IF old_mastered AND NOT new_mastered THEN
      NEW.progress := jsonb_set(NEW.progress, '{mastered}', 'true'::jsonb, true);
      IF NEW.progress ? 'masteryState' THEN
        NEW.progress := jsonb_set(NEW.progress, '{masteryState}', '"mastered"'::jsonb, true);
      END IF;
    END IF;

    IF old_best_wpm > new_best_wpm AND (OLD.progress ? 'bestWpm' OR NEW.progress ? 'bestWpm') THEN
      NEW.progress := jsonb_set(NEW.progress, '{bestWpm}', to_jsonb(old_best_wpm), true);
    END IF;

    IF old_best_acc > new_best_acc AND (OLD.progress ? 'bestAccuracy' OR NEW.progress ? 'bestAccuracy') THEN
      NEW.progress := jsonb_set(NEW.progress, '{bestAccuracy}', to_jsonb(old_best_acc), true);
    END IF;

    IF old_attempts > new_attempts AND (OLD.progress ? 'attempts' OR NEW.progress ? 'attempts') THEN
      NEW.progress := jsonb_set(NEW.progress, '{attempts}', to_jsonb(old_attempts), true);
    END IF;
  END IF;

  -- Strip transient _force_reset flag before persisting
  IF NEW.progress ? '_force_reset' THEN
    NEW.progress := NEW.progress - '_force_reset';
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- A. User Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT CHECK (display_name IS NULL OR (char_length(btrim(display_name)) BETWEEN 1 AND 64)),
  avatar_storage_path TEXT CHECK (avatar_storage_path IS NULL OR (char_length(avatar_storage_path) <= 512 AND split_part(avatar_storage_path, '/', 1) = id::text)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_profiles_protect_immutable ON public.profiles;
CREATE TRIGGER trg_profiles_protect_immutable
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_immutable_fields();

-- Safe automatic profile provisioning trigger on auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  raw_name TEXT;
  safe_name TEXT;
BEGIN
  BEGIN
    raw_name := COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'username',
      split_part(COALESCE(NEW.email, ''), '@', 1)
    );
    safe_name := NULLIF(LEFT(btrim( COALESCE(raw_name, '') ), 64), '');

    INSERT INTO public.profiles (id, display_name, created_at, updated_at)
    VALUES (NEW.id, safe_name, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Never block account registration if profile provisioning encounters an unexpected error
    RETURN NEW;
  END;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- B. User Settings
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_settings_valid_payload CHECK (public.validate_user_settings_payload(settings))
);

DROP TRIGGER IF EXISTS trg_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER trg_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- C. Lesson Progress
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  progress JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, lesson_id),
  CONSTRAINT lesson_id_valid_format CHECK (
    char_length(lesson_id) BETWEEN 1 AND 128
    AND lesson_id ~ '^[A-Za-z0-9_:\-\.]+$'
  ),
  CONSTRAINT lesson_progress_is_object CHECK (jsonb_typeof(progress) = 'object'),
  CONSTRAINT lesson_progress_max_size CHECK (pg_column_size(progress) <= 262144)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_updated
  ON public.lesson_progress (user_id, updated_at DESC);

DROP TRIGGER IF EXISTS trg_lesson_progress_merge_update ON public.lesson_progress;
CREATE TRIGGER trg_lesson_progress_merge_update
  BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.merge_lesson_progress_on_update();

-- D. Cloud File Metadata
CREATE TABLE IF NOT EXISTS public.user_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  file_category TEXT NOT NULL DEFAULT 'backup' CHECK (file_category IN ('avatar', 'wallpaper', 'backup', 'document')),
  mime_type TEXT NOT NULL CHECK (mime_type IN ('image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/json', 'text/plain')),
  size_bytes BIGINT NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 5242880),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_files_storage_path_scoped CHECK (
    split_part(storage_path, '/', 1) = user_id::text
    AND position('..' in storage_path) = 0
    AND char_length(storage_path) BETWEEN 38 AND 512
  ),
  CONSTRAINT user_files_name_valid CHECK (
    char_length(btrim(file_name)) BETWEEN 1 AND 180
    AND position('/' in file_name) = 0
    AND position('\' in file_name) = 0
  )
);

CREATE INDEX IF NOT EXISTS idx_user_files_user_created
  ON public.user_files (user_id, created_at DESC);

DROP TRIGGER IF EXISTS trg_user_files_updated_at ON public.user_files;
CREATE TRIGGER trg_user_files_updated_at
  BEFORE UPDATE ON public.user_files
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 3. PRIVATE STORAGE BUCKET (user-files)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-files',
  'user-files',
  false,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/json', 'text/plain']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES — MANDATORY
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings FORCE ROW LEVEL SECURITY;

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress FORCE ROW LEVEL SECURITY;

ALTER TABLE public.user_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_files FORCE ROW LEVEL SECURITY;

-- Revoke anonymous access on all user tables
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.user_settings FROM anon;
REVOKE ALL ON public.lesson_progress FROM anon;
REVOKE ALL ON public.user_files FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_files TO authenticated;

-- 4A. public.profiles policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- 4B. public.user_settings policies
DROP POLICY IF EXISTS "user_settings_select_own" ON public.user_settings;
CREATE POLICY "user_settings_select_own"
  ON public.user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_settings_insert_own" ON public.user_settings;
CREATE POLICY "user_settings_insert_own"
  ON public.user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_settings_update_own" ON public.user_settings;
CREATE POLICY "user_settings_update_own"
  ON public.user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_settings_delete_own" ON public.user_settings;
CREATE POLICY "user_settings_delete_own"
  ON public.user_settings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4C. public.lesson_progress policies
DROP POLICY IF EXISTS "lesson_progress_select_own" ON public.lesson_progress;
CREATE POLICY "lesson_progress_select_own"
  ON public.lesson_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "lesson_progress_insert_own" ON public.lesson_progress;
CREATE POLICY "lesson_progress_insert_own"
  ON public.lesson_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "lesson_progress_update_own" ON public.lesson_progress;
CREATE POLICY "lesson_progress_update_own"
  ON public.lesson_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "lesson_progress_delete_own" ON public.lesson_progress;
CREATE POLICY "lesson_progress_delete_own"
  ON public.lesson_progress
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4D. public.user_files policies
DROP POLICY IF EXISTS "user_files_select_own" ON public.user_files;
CREATE POLICY "user_files_select_own"
  ON public.user_files
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    AND split_part(storage_path, '/', 1) = auth.uid()::text
  );

DROP POLICY IF EXISTS "user_files_insert_own" ON public.user_files;
CREATE POLICY "user_files_insert_own"
  ON public.user_files
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND split_part(storage_path, '/', 1) = auth.uid()::text
  );

DROP POLICY IF EXISTS "user_files_update_own" ON public.user_files;
CREATE POLICY "user_files_update_own"
  ON public.user_files
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND split_part(storage_path, '/', 1) = auth.uid()::text
  )
  WITH CHECK (
    auth.uid() = user_id
    AND split_part(storage_path, '/', 1) = auth.uid()::text
  );

DROP POLICY IF EXISTS "user_files_delete_own" ON public.user_files;
CREATE POLICY "user_files_delete_own"
  ON public.user_files
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND split_part(storage_path, '/', 1) = auth.uid()::text
  );

-- 4E. storage.objects policies for private bucket 'user-files'
DROP POLICY IF EXISTS "user_files_storage_select_own" ON storage.objects;
CREATE POLICY "user_files_storage_select_own"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'user-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "user_files_storage_insert_own" ON storage.objects;
CREATE POLICY "user_files_storage_insert_own"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "user_files_storage_update_own" ON storage.objects;
CREATE POLICY "user_files_storage_update_own"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'user-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'user-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "user_files_storage_delete_own" ON storage.objects;
CREATE POLICY "user_files_storage_delete_own"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'user-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- 5. SAFE SELF-SERVICE ACCOUNT DELETION RPC
-- ============================================================================

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, storage
AS $$
DECLARE
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required to delete account.';
  END IF;

  -- Remove all private storage objects belonging to the authenticated user
  DELETE FROM storage.objects
  WHERE bucket_id = 'user-files'
    AND (storage.foldername(name))[1] = uid::text;

  -- Remove user-owned relational rows (also covered by ON DELETE CASCADE)
  DELETE FROM public.user_files WHERE user_id = uid;
  DELETE FROM public.lesson_progress WHERE user_id = uid;
  DELETE FROM public.user_settings WHERE user_id = uid;
  DELETE FROM public.profiles WHERE id = uid;

  -- Delete the user's authentication record
  DELETE FROM auth.users WHERE id = uid;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_own_account() FROM anon;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;

COMMIT;
