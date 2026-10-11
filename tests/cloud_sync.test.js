/**
 * PK Khmer Type — Automated Test Suite for Supabase Auth, RLS, Cloud Sync & File Sync
 * Run with: node --test tests/cloud_sync.test.js
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
constPKSupabaseConfig = require(path.join(ROOT, 'js', 'supabase-config.js'));
const PKCloudSync = require(path.join(ROOT, 'js', 'cloud-sync.js'));

/* ============================================================
   In-Memory Browser LocalStorage & RLS-Enforced Supabase Mock
   ============================================================ */
function createMockLocalStorage() {
  const map = new Map();
  return {
    getItem(k) {
      return map.has(String(k)) ? map.get(String(k)) : null;
    },
    setItem(k, v) {
      map.set(String(k), String(v));
    },
    removeItem(k) {
      map.delete(String(k));
    },
    clear() {
      map.clear();
    },
    get length() {
      return map.size;
    },
    key(idx) {
      return Array.from(map.keys())[idx] || null;
    },
    _dump() {
      return Object.fromEntries(map.entries());
    }
  };
}

/**
 * Simulates Supabase Postgres + Auth + Private Storage with strict RLS enforcement
 * matching supabase/migrations/20261010000001_pk_khmer_type_cloud_sync.sql
 */
function createRlsEnforcedSupabaseMock() {
  let currentUser = null;
  const db = {
    profiles: new Map(),        // id -> row
    user_settings: new Map(),   // user_id -> row
    lesson_progress: new Map(), // `${user_id}::${lesson_id}` -> row
    user_files: new Map(),      // id -> row
    storage_objects: new Map()  // storage_path -> { owner, blob, mime }
  };

  function requireAuth() {
    if (!currentUser || !currentUser.id) {
      const err = new Error('new row violates row-level security policy (anonymous access denied)');
      err.code = '42501';
      return { ok: false, error: err };
    }
    return { ok: true, uid: currentUser.id };
  }

  return {
    _db: db,
    _setCurrentUser(user) {
      currentUser = user;
    },
    auth: {
      async getSession() {
        return {
          data: {
            session: currentUser ? { user: currentUser, access_token: 'mock-jwt-' + currentUser.id } : null
          },
          error: null
        };
      },
      async getUser() {
        return {
          data: { user: currentUser || null },
          error: currentUser ? null : new Error('Auth session missing')
        };
      },
      async signOut() {
        currentUser = null;
        return { error: null };
      }
    },
    async rpc(fnName) {
      if (fnName === 'delete_own_account') {
        const auth = requireAuth();
        if (!auth.ok) return { data: null, error: auth.error };
        const uid = auth.uid;
        db.profiles.delete(uid);
        db.user_settings.delete(uid);
        for (const [k, row] of db.lesson_progress.entries()) {
          if (row.user_id === uid) db.lesson_progress.delete(k);
        }
        for (const [id, row] of db.user_files.entries()) {
          if (row.user_id === uid) db.user_files.delete(id);
        }
        for (const [p] of db.storage_objects.entries()) {
          if (p.startsWith(uid + '/')) db.storage_objects.delete(p);
        }
        currentUser = null;
        return { data: true, error: null };
      }
      return { data: null, error: new Error('Unknown RPC: ' + fnName) };
    },
    storage: {
      from(bucketName) {
        assert.equal(bucketName, 'user-files', 'Must use private user-files bucket');
        return {
          async upload(storagePath, fileOrBlob, opts) {
            const auth = requireAuth();
            if (!auth.ok) return { data: null, error: auth.error };
            const folderOwner = String(storagePath).split('/')[0];
            if (folderOwner !== auth.uid) {
              return {
                data: null,
                error: new Error('new row violates row-level security policy for table "objects"')
              };
            }
            if (String(storagePath).includes('..')) {
              return { data: null, error: new Error('Path traversal rejected by RLS') };
            }
            db.storage_objects.set(storagePath, {
              owner: auth.uid,
              blob: fileOrBlob,
              contentType: opts && opts.contentType
            });
            return { data: { path: storagePath }, error: null };
          },
          async download(storagePath) {
            const auth = requireAuth();
            if (!auth.ok) return { data: null, error: auth.error };
            const folderOwner = String(storagePath).split('/')[0];
            if (folderOwner !== auth.uid) {
              return {
                data: null,
                error: new Error('row-level security policy blocked access to object')
              };
            }
            const obj = db.storage_objects.get(storagePath);
            if (!obj) return { data: null, error: new Error('Object not found') };
            return { data: obj.blob, error: null };
          },
          async remove(paths) {
            const auth = requireAuth();
            if (!auth.ok) return { data: null, error: auth.error };
            for (const p of paths) {
              const folderOwner = String(p).split('/')[0];
              if (folderOwner !== auth.uid) {
                return {
                  data: null,
                  error: new Error('row-level security policy blocked delete on object')
                };
              }
              db.storage_objects.delete(p);
            }
            return { data: paths, error: null };
          }
        };
      }
    },
    from(table) {
      return {
        select() {
          const filters = {};
          const query = {
            eq(col, val) {
              filters[col] = val;
              return query;
            },
            order() {
              return query;
            },
            async maybeSingle() {
              const auth = requireAuth();
              if (!auth.ok) return { data: null, error: auth.error };
              if (table === 'user_settings') {
                if (filters.user_id && filters.user_id !== auth.uid) {
                  return { data: null, error: null }; // RLS hides other users' rows
                }
                return { data: db.user_settings.get(auth.uid) || null, error: null };
              }
              if (table === 'profiles') {
                if (filters.id && filters.id !== auth.uid) {
                  return { data: null, error: null };
                }
                return { data: db.profiles.get(auth.uid) || null, error: null };
              }
              return { data: null, error: null };
            },
            async single() {
              const res = await query.maybeSingle();
              if (!res.data && !res.error) {
                return { data: null, error: new Error('Row not found or hidden by RLS') };
              }
              return res;
            },
            then(resolve, reject) {
              const run = async () => {
                const auth = requireAuth();
                if (!auth.ok) return { data: null, error: auth.error };
                if (table === 'lesson_progress') {
                  if (filters.user_id && filters.user_id !== auth.uid) {
                    return { data: [], error: null };
                  }
                  const rows = [];
                  for (const row of db.lesson_progress.values()) {
                    if (row.user_id === auth.uid) rows.push(row);
                  }
                  return { data: rows, error: null };
                }
                if (table === 'user_files') {
                  if (filters.user_id && filters.user_id !== auth.uid) {
                    return { data: [], error: null };
                  }
                  const rows = [];
                  for (const row of db.user_files.values()) {
                    if (row.user_id === auth.uid && (!filters.id || row.id === filters.id)) {
                      rows.push(row);
                    }
                  }
                  return { data: rows, error: null };
                }
                return { data: [], error: null };
              };
              return run().then(resolve, reject);
            }
          };
          return query;
        },
        async upsert(payload) {
          const auth = requireAuth();
          if (!auth.ok) return { data: null, error: auth.error };
          const items = Array.isArray(payload) ? payload : [payload];

          for (const item of items) {
            const ownerCol = table === 'profiles' ? item.id : item.user_id;
            if (ownerCol !== auth.uid) {
              return {
                data: null,
                error: new Error(`new row violates row-level security policy for table "${table}"`)
              };
            }
            if (table === 'user_settings') {
              db.user_settings.set(auth.uid, { ...item });
            } else if (table === 'profiles') {
              db.profiles.set(auth.uid, { ...item });
            } else if (table === 'lesson_progress') {
              const key = `${auth.uid}::${item.lesson_id}`;
              const existing = db.lesson_progress.get(key);
              const mergedProgress = existing
                ? PKCloudSync.mergeLessonRecord(existing.progress, item.progress)
                : item.progress;
              db.lesson_progress.set(key, {
                user_id: auth.uid,
                lesson_id: item.lesson_id,
                progress: mergedProgress,
                updated_at: item.updated_at || new Date().toISOString()
              });
            } else if (table === 'user_files') {
              if (!item.storage_path || !item.storage_path.startsWith(auth.uid + '/')) {
                return {
                  data: null,
                  error: new Error('new row violates user_files storage_path RLS check')
                };
              }
              db.user_files.set(item.id, { ...item });
            }
          }
          return {
            data: items,
            error: null,
            select() {
              return {
                async single() {
                  return { data: items[0], error: null };
                }
              };
            }
          };
        },
        delete() {
          const filters = {};
          const delQuery = {
            eq(col, val) {
              filters[col] = val;
              return delQuery;
            },
            then(resolve, reject) {
              const run = async () => {
                const auth = requireAuth();
                if (!auth.ok) return { data: null, error: auth.error };
                if (filters.user_id && filters.user_id !== auth.uid) {
                  return { data: [], error: null }; // Cannot delete another user's rows
                }
                if (table === 'user_files' && filters.id) {
                  const row = db.user_files.get(filters.id);
                  if (row && row.user_id === auth.uid) {
                    db.user_files.delete(filters.id);
                  }
                }
                return { data: [], error: null };
              };
              return run().then(resolve, reject);
            }
          };
          return delQuery;
        }
      };
    }
  };
}

/* ============================================================
   1. Environment & Client Configuration Validation Tests
   ============================================================ */
test('1.1 validateSupabaseConfig rejects missing or placeholder variables clearly', () => {
  const emptyRes = constPKSupabaseConfig.validateSupabaseConfig('', '');
  assert.equal(emptyRes.valid, false);
  assert.match(emptyRes.error, /VITE_SUPABASE_URL/);
  assert.match(emptyRes.error, /VITE_SUPABASE_ANON_KEY/);

  const placeholderRes = constPKSupabaseConfig.validateSupabaseConfig(
    'https://your-project-ref.supabase.co',
    'your-anon-key-here'
  );
  assert.equal(placeholderRes.valid, false);
  assert.match(placeholderRes.error, /VITE_SUPABASE_URL/);
});

test('1.2 validateSupabaseConfig strictly blocks service_role and secret keys in frontend config', () => {
  // Construct a fake JWT with role: "service_role" in payload
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ role: 'service_role', iss: 'supabase' })).toString('base64url');
  const fakeServiceRoleJwt = `${header}.${payload}.signature1234567890`;

  const jwtCheck = constPKSupabaseConfig.validateSupabaseConfig(
    'https://xyzcompany.supabase.co',
    fakeServiceRoleJwt
  );
  assert.equal(jwtCheck.valid, false);
  assert.match(jwtCheck.error, /SECURITY ERROR/i);

  const secretKeyCheck = constPKSupabaseConfig.validateSupabaseConfig(
    'https://xyzcompany.supabase.co',
    'sb_secret_1234567890abcdefghijklmnop'
  );
  assert.equal(secretKeyCheck.valid, false);
  assert.match(secretKeyCheck.error, /SECURITY ERROR/i);
});

test('1.3 validateSupabaseConfig accepts valid HTTPS Supabase URL and publishable/anon key', () => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ role: 'anon', iss: 'supabase' })).toString('base64url');
  const validAnonJwt = `${header}.${payload}.signature1234567890`;

  const okRes = constPKSupabaseConfig.validateSupabaseConfig(
    'https://xyzcompany.supabase.co/',
    validAnonJwt
  );
  assert.equal(okRes.valid, true);
  assert.equal(okRes.url, 'https://xyzcompany.supabase.co');
  assert.equal(okRes.anonKey, validAnonJwt);
});

/* ============================================================
   2. Database Schema & Row Level Security (RLS) Migration Verification
   ============================================================ */
test('2.1 SQL Migration enables & forces RLS on all user tables and defines strict ownership policies', () => {
  const migrationPath = path.join(
    ROOT,
    'supabase',
    'migrations',
    '20261010000001_pk_khmer_type_cloud_sync.sql'
  );
  assert.equal(fs.existsSync(migrationPath), true, 'Migration SQL file must exist');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Verify all 4 required tables exist
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.profiles/i);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.user_settings/i);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.lesson_progress/i);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.user_files/i);

  // Verify RLS is enabled and forced on all 4 tables
  for (const tbl of ['profiles', 'user_settings', 'lesson_progress', 'user_files']) {
    assert.match(sql, new RegExp(`ALTER TABLE public\\.${tbl} ENABLE ROW LEVEL SECURITY`, 'i'));
    assert.match(sql, new RegExp(`ALTER TABLE public\\.${tbl} FORCE ROW LEVEL SECURITY`, 'i'));
    assert.match(sql, new RegExp(`REVOKE ALL ON public\\.${tbl} FROM anon`, 'i'));
  }

  // Verify safe trigger with fixed search_path and exception fallback
  assert.match(sql, /SECURITY DEFINER\s+SET search_path = public/i);
  assert.match(sql, /EXCEPTION WHEN OTHERS THEN/i);

  // Verify private user-files bucket and storage.objects RLS policies
  assert.match(sql, /VALUES\s*\(\s*'user-files'\s*,\s*'user-files'\s*,\s*false/i);
  assert.match(sql, /\(storage\.foldername\(name\)\)\[1\]\s*=\s*auth\.uid\(\)::text/i);

  // Verify account deletion RPC
  assert.match(sql, /CREATE OR REPLACE FUNCTION public\.delete_own_account\(\)/i);
});

test('2.2 RLS Enforcement: User A cannot read or write User B data, and anonymous users are blocked', async () => {
  const mockSb = createRlsEnforcedSupabaseMock();
  const userA = { id: '11111111-1111-4111-8111-111111111111', email: 'usera@example.com' };
  const userB = { id: '22222222-2222-4222-8222-222222222222', email: 'userb@example.com' };

  // 1. Anonymous user cannot read or write settings or lesson progress
  mockSb._setCurrentUser(null);
  const anonWrite = await mockSb.from('user_settings').upsert({
    user_id: userA.id,
    settings: { values: { khmerTheme: 'emerald' } }
  });
  assert.ok(anonWrite.error, 'Anonymous user write must be rejected by RLS');

  // 2. User A writes own settings and lesson progress
  mockSb._setCurrentUser(userA);
  const userAWrite = await mockSb.from('lesson_progress').upsert({
    user_id: userA.id,
    lesson_id: 'l1-1',
    progress: { completed: true, bestWpm: 55, bestAccuracy: 98, masteryState: 'mastered' }
  });
  assert.equal(userAWrite.error, null);

  // 3. User A attempts to spoof user_id = userB.id on write -> rejected by WITH CHECK
  const spoofWrite = await mockSb.from('lesson_progress').upsert({
    user_id: userB.id,
    lesson_id: 'l1-1',
    progress: { completed: true, bestWpm: 999 }
  });
  assert.ok(spoofWrite.error, 'Spoofing another user_id on write must be rejected by RLS');

  // 4. User B signs in and cannot see User A's lesson progress or files
  mockSb._setCurrentUser(userB);
  const userBReadOfA = await mockSb.from('lesson_progress').select('*').eq('user_id', userA.id);
  assert.deepEqual(userBReadOfA.data, [], 'User B must not be able to read User A lesson_progress');
});

/* ============================================================
   3. Local-First Synchronization & Conflict Resolution Tests
   ============================================================ */
test('3.1 Monotonic Lesson Progress Merge preserves completed status, highest mastery, best WPM/Accuracy, and attempts', () => {
  const deviceARecord = {
    lessonId: 'l1-1',
    completed: true,
    masteryState: 'proficient',
    starsEarned: 2,
    bestWpm: 42,
    bestAccuracy: 96,
    lastWpm: 42,
    lastAccuracy: 96,
    totalAttempts: 3,
    completionCount: 2,
    updatedAt: '2026-10-10T08:00:00.000Z'
  };

  // Device B practiced later with higher WPM (58) and mastered state, or lower incomplete attempt
  const deviceBRecord = {
    lessonId: 'l1-1',
    completed: false, // Even if a later attempt didn't complete, completed=true must NEVER be lost
    masteryState: 'mastered',
    starsEarned: 3,
    bestWpm: 58,
    bestAccuracy: 94,
    lastWpm: 58,
    lastAccuracy: 94,
    totalAttempts: 5,
    completionCount: 3,
    updatedAt: '2026-10-10T09:00:00.000Z'
  };

  const merged = PKCloudSync.mergeLessonRecord(deviceARecord, deviceBRecord);
  assert.equal(merged.completed, true, 'Completed lesson must remain completed');
  assert.equal(merged.masteryState, 'mastered', 'Highest masteryState must win');
  assert.equal(merged.starsEarned, 3, 'Highest starsEarned must win');
  assert.equal(merged.bestWpm, 58, 'Highest bestWpm must win');
  assert.equal(merged.bestAccuracy, 96, 'Highest bestAccuracy must win');
  assert.equal(merged.totalAttempts, 5, 'Highest totalAttempts must be preserved');
  assert.equal(merged.completionCount, 3, 'Highest completionCount must be preserved');
  assert.equal(merged.lastWpm, 58, 'Newer timestamp determines lastWpm');
});

test('3.2 Per-Key Settings Merge resolves conflicts deterministically by per-setting timestamp', () => {
  const localSettings = {
    values: { khmerTheme: 'obsidian', khmerKeyLayout: 'nida', khmerSoundOn: '1' },
    timestamps: {
      khmerTheme: '2026-10-10T10:00:00.000Z',     // Newer locally
      khmerKeyLayout: '2026-10-10T08:00:00.000Z', // Older locally
      khmerSoundOn: '2026-10-10T09:00:00.000Z'
    },
    updatedAt: '2026-10-10T10:00:00.000Z'
  };

  const remoteSettings = {
    values: { khmerTheme: 'angkor', khmerKeyLayout: 'standard', khmerFontSize: 'lg' },
    timestamps: {
      khmerTheme: '2026-10-10T09:00:00.000Z',     // Older remotely
      khmerKeyLayout: '2026-10-10T09:30:00.000Z', // Newer remotely
      khmerFontSize: '2026-10-10T09:15:00.000Z'   // Only on remote
    },
    updatedAt: '2026-10-10T09:30:00.000Z'
  };

  const merged = PKCloudSync.mergeSettings(localSettings, remoteSettings);
  assert.equal(merged.values.khmerTheme, 'obsidian', 'Newer local theme wins');
  assert.equal(merged.values.khmerKeyLayout, 'standard', 'Newer remote layout wins');
  assert.equal(merged.values.khmerSoundOn, '1', 'Local-only setting preserved');
  assert.equal(merged.values.khmerFontSize, 'lg', 'Remote-only setting preserved');
});

test('3.3 Cross-Account Isolation prevents User A local progress from leaking into User B on sign-in', async () => {
  global.localStorage = createMockLocalStorage();
  const mockSb = createRlsEnforcedSupabaseMock();
  global.window = {
    localStorage: global.localStorage,
    PKSupabaseConfig: {
      isSupabaseConfigured: () => true,
      getSupabaseClient: () => mockSb
    }
  };

  const userA = { id: '11111111-1111-4111-8111-111111111111', email: 'usera@example.com' };
  const userB = { id: '22222222-2222-4222-8222-222222222222', email: 'userb@example.com' };

  // User A has local progress and signs in
  global.localStorage.setItem(
    'khmerProgress_v2',
    JSON.stringify({
      version: 2,
      lessons: {
        'l1-1': { lessonId: 'l1-1', completed: true, bestWpm: 60, bestAccuracy: 99, masteryState: 'mastered' }
      }
    })
  );
  mockSb._setCurrentUser(userA);
  const resA = await PKCloudSync.reconcileOnSignIn(userA);
  assert.equal(resA.ok, true);

  // Verify User A's progress is in Supabase for User A
  const cloudRowsA = await mockSb.from('lesson_progress').select('*').eq('user_id', userA.id);
  assert.equal(cloudRowsA.data.length, 1);
  assert.equal(cloudRowsA.data[0].lesson_id, 'l1-1');

  // Now User B signs in on the same browser (even if User A's localStorage wasn't manually cleared)
  mockSb._setCurrentUser(userB);
  const resB = await PKCloudSync.reconcileOnSignIn(userB);
  assert.equal(resB.ok, true);

  // Verify User A's lesson was NOT uploaded into User B's cloud account!
  const cloudRowsB = await mockSb.from('lesson_progress').select('*').eq('user_id', userB.id);
  assert.equal(cloudRowsB.data.length, 0, 'User A local progress must NEVER leak into User B cloud account');
});

/* ============================================================
   4. Private File Sync & Validation Tests (`user-files` bucket)
   ============================================================ */
test('4.1 File validation enforces size limit, allowed MIME types, and sanitizes path traversal filenames', () => {
  assert.equal(PKCloudSync.sanitizeFileName('../../../etc/passwd'), 'passwd');
  assert.equal(PKCloudSync.sanitizeFileName('my backup (2026).json'), 'my_backup_2026_.json');

  const validJsonFile = { name: 'snapshot.json', size: 1024, type: 'application/json' };
  assert.equal(PKCloudSync.validateFileForUpload(validJsonFile).ok, true);

  const oversizedFile = { name: 'huge.png', size: 5 * 1024 * 1024, type: 'image/png' };
  const overRes = PKCloudSync.validateFileForUpload(oversizedFile);
  assert.equal(overRes.ok, false);
  assert.match(overRes.error, /2 MB/);

  const badMimeFile = { name: 'payload.exe', size: 512, type: 'application/x-msdownload' };
  const badRes = PKCloudSync.validateFileForUpload(badMimeFile);
  assert.equal(badRes.ok, false);
  assert.match(badRes.error, /Unsupported file type/);
});

test('4.2 Authenticated user can upload, list, download, and delete own private files, while User B is blocked', async () => {
  global.localStorage = createMockLocalStorage();
  const mockSb = createRlsEnforcedSupabaseMock();
  global.window = {
    localStorage: global.localStorage,
    PKSupabaseConfig: {
      isSupabaseConfigured: () => true,
      getSupabaseClient: () => mockSb
    }
  };

  const userA = { id: '11111111-1111-4111-8111-111111111111', email: 'usera@example.com' };
  const userB = { id: '22222222-2222-4222-8222-222222222222', email: 'userb@example.com' };

  mockSb._setCurrentUser(userA);
  const blobContent = new Blob([JSON.stringify({ hello: 'world' })], { type: 'application/json' });
  blobContent.name = 'backup.json';

  const upRes = await PKCloudSync.uploadUserFile(blobContent, { fileName: 'backup.json', category: 'backup' });
  assert.equal(upRes.ok, true);
  assert.ok(upRes.file.storage_path.startsWith(userA.id + '/'), 'Storage path must be scoped to user UUID');

  const listA = await PKCloudSync.listUserFiles();
  assert.equal(listA.ok, true);
  assert.equal(listA.files.length, 1);

  // User B signs in and attempts to list or download User A's file
  mockSb._setCurrentUser(userB);
  const listB = await PKCloudSync.listUserFiles();
  assert.equal(listB.files.length, 0, 'User B cannot list User A file metadata');

  const dlByB = await PKCloudSync.downloadUserFile(upRes.file);
  assert.equal(dlByB.ok, false, 'User B cannot download User A private storage object');

  // User A deletes own file
  mockSb._setCurrentUser(userA);
  const delRes = await PKCloudSync.deleteUserFile(upRes.file.id);
  assert.equal(delRes.ok, true);
  const listAfterDel = await PKCloudSync.listUserFiles();
  assert.equal(listAfterDel.files.length, 0);
});

test('4.3 Cloud Backup Snapshot creation and restoration merges progress and settings accurately', async () => {
  global.localStorage = createMockLocalStorage();
  const mockSb = createRlsEnforcedSupabaseMock();
  global.window = {
    localStorage: global.localStorage,
    PKSupabaseConfig: {
      isSupabaseConfigured: () => true,
      getSupabaseClient: () => mockSb
    }
  };

  const userA = { id: '11111111-1111-4111-8111-111111111111', email: 'usera@example.com' };
  mockSb._setCurrentUser(userA);

  global.localStorage.setItem('khmerTheme', 'angkor');
  global.localStorage.setItem(
    'khmerProgress_v2',
    JSON.stringify({
      version: 2,
      lessons: {
        'l2-1': { lessonId: 'l2-1', completed: true, bestWpm: 64, bestAccuracy: 98, masteryState: 'mastered', starsEarned: 3 }
      }
    })
  );

  const snapRes = await PKCloudSync.createCloudBackupSnapshot();
  assert.equal(snapRes.ok, true);
  assert.ok(snapRes.file.id);

  // Simulate device wipe and restore from snapshot
  global.localStorage.clear();
  assert.equal(global.localStorage.getItem('khmerTheme'), null);

  const restoreRes = await PKCloudSync.restoreCloudBackupSnapshot(snapRes.file.id);
  assert.equal(restoreRes.ok, true);
  assert.equal(global.localStorage.getItem('khmerTheme'), 'angkor');
  const restoredProg = JSON.parse(global.localStorage.getItem('khmerProgress_v2'));
  assert.equal(restoredProg.lessons['l2-1'].bestWpm, 64);
  assert.equal(restoredProg.lessons['l2-1'].completed, true);
});

test('4.4 Account Deletion removes user profile, settings, lesson progress, file metadata, and private storage objects', async () => {
  global.localStorage = createMockLocalStorage();
  const mockSb = createRlsEnforcedSupabaseMock();
  global.window = {
    localStorage: global.localStorage,
    PKSupabaseConfig: {
      isSupabaseConfigured: () => true,
      getSupabaseClient: () => mockSb
    }
  };

  const userA = { id: '11111111-1111-4111-8111-111111111111', email: 'usera@example.com' };
  mockSb._setCurrentUser(userA);

  await mockSb.from('user_settings').upsert({ user_id: userA.id, settings: { values: { khmerTheme: 'obsidian' } } });
  await mockSb.from('lesson_progress').upsert({
    user_id: userA.id,
    lesson_id: 'l1-1',
    progress: { completed: true, bestWpm: 50 }
  });
  await PKCloudSync.createCloudBackupSnapshot();

  assert.equal(mockSb._db.user_settings.has(userA.id), true);
  assert.equal(mockSb._db.storage_objects.size, 1);

  const delAccRes = await PKCloudSync.deleteAccountAndCloudData();
  assert.equal(delAccRes.ok, true);
  assert.equal(mockSb._db.user_settings.has(userA.id), false);
  assert.equal(mockSb._db.storage_objects.size, 0);
});

/* ============================================================
   5. Curriculum & Progress Engine Regression Tests
   ============================================================ */
test('5.1 All 3 curricula (Khmer Standard, Khmer NiDA, English) remain intact with 218 lessons', () => {
  const stdRaw = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/curriculum/standard/lessons.json'), 'utf8'));
  const nidaRaw = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/curriculum/nida/lessons.json'), 'utf8'));
  const enRaw = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/curriculum/english/lessons.json'), 'utf8'));

  const stdLessons = Array.isArray(stdRaw) ? stdRaw : stdRaw.lessons;
  const nidaLessons = Array.isArray(nidaRaw) ? nidaRaw : nidaRaw.lessons;
  const enLessons = Array.isArray(enRaw) ? enRaw : enRaw.lessons;

  assert.equal(stdLessons.length, 77, 'Khmer Standard curriculum must have 77 lessons');
  assert.equal(nidaLessons.length, 77, 'Khmer NiDA curriculum must have 77 lessons');
  assert.equal(enLessons.length, 64, 'English curriculum must have 64 lessons');
});

test('5.2 PK_PROGRESS records lesson attempts locally and automatically queues Cloud Sync', () => {
  global.localStorage = createMockLocalStorage();
  let queuedLessonId = null;
  let queuedRecord = null;

  global.window = {
    localStorage: global.localStorage,
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {},
    PKCloudSync: {
      queueLessonProgressSync(id, rec) {
        queuedLessonId = id;
        queuedRecord = rec;
      }
    }
  };
  global.document = {
    addEventListener() {}
  };

  delete require.cache[require.resolve(path.join(ROOT, 'js', 'progress.js'))];
  require(path.join(ROOT, 'js', 'progress.js'));

  const res = global.window.PK_PROGRESS.recordLessonAttempt({
    layoutId: 'standard',
    lessonId: 'standard-L00-01',
    wpm: 48,
    accuracy: 97,
    timeSec: 25
  });

  assert.ok(res && res.lesson);
  assert.equal(res.lesson.completed, true);
  assert.equal(res.lesson.bestWpm, 48);
  assert.equal(queuedLessonId, 'standard:standard-L00-01');
  assert.equal(queuedRecord.bestWpm, 48);
});

/* ============================================================
   6. Authentication Provider Flows (Registration, Sign In, Recovery, No Fake Fallback)
   ============================================================ */
test('6.1 AuthProvider returns normal user errors for Sign In / Sign Up and enforces requireCloud when requested', async () => {
  global.localStorage = createMockLocalStorage();
  global.document = {
    readyState: 'complete',
    getElementById: () => null,
    querySelectorAll: () => [],
    addEventListener() {},
    documentElement: { classList: { contains: () => false } }
  };
  global.window = {
    localStorage: global.localStorage,
    addEventListener() {},
    PKSupabaseConfig: {
      isSupabaseConfigured: () => false,
      getSupabaseSetupError: () => 'Missing VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      getSupabaseClient: () => null,
      getAuthRedirectUrl: () => 'https://phanaach4889.github.io/PK-Khmer-Type/'
    }
  };

  delete require.cache[require.resolve(path.join(ROOT, 'js', 'storage.js'))];
  require(path.join(ROOT, 'js', 'storage.js'));

  // 1. Explicit requireCloud flag reports CONFIG_MISSING for diagnostic callers
  const cloudCheck = await global.window.AuthProvider.signIn({
    email: 'phanna@example.com',
    password: 'StrongPassword123!',
    requireCloud: true
  });
  assert.equal(cloudCheck.ok, false);
  assert.equal(cloudCheck.code, 'CONFIG_MISSING');

  // 2. Normal user signing in before creating an account gets a clear normal-user error
  const notFoundRes = await global.window.AuthProvider.signIn({
    identifier: 'unknown@example.com',
    password: 'StrongPassword123!'
  });
  assert.equal(notFoundRes.ok, false);
  assert.equal(notFoundRes.code, 'ACCOUNT_NOT_FOUND');
  assert.match(notFoundRes.error, /No account found/i);

  // 3. Normal user signs up, tests wrong password error, and signs in with email or username
  const signUpRes = await global.window.AuthProvider.signUp({
    username: 'Phanna',
    email: 'phanna@example.com',
    password: 'StrongPassword123!'
  });
  assert.equal(signUpRes.ok, true);
  assert.equal(signUpRes.user.username, 'Phanna');

  const wrongPwRes = await global.window.AuthProvider.signIn({
    identifier: 'phanna@example.com',
    password: 'WrongPassword!'
  });
  assert.equal(wrongPwRes.ok, false);
  assert.equal(wrongPwRes.code, 'INVALID_PASSWORD');
  assert.match(wrongPwRes.error, /Incorrect password/i);

  const validSignIn = await global.window.AuthProvider.signIn({
    identifier: 'Phanna',
    password: 'StrongPassword123!'
  });
  assert.equal(validSignIn.ok, true);
  assert.equal(validSignIn.user.email, 'phanna@example.com');
});

test('6.2 AuthProvider handles Registration, Email Verification Pending, Duplicate Email, Sign In, Invalid Credentials, Password Reset, and Password Update', async () => {
  global.localStorage = createMockLocalStorage();
  const registeredAccounts = new Map();
  let activeSession = null;
  let lastResetEmail = null;

  const mockAuthClient = {
    from() {
      return {
        upsert: async () => ({ data: null, error: null }),
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: { display_name: 'Phanna' }, error: null })
          })
        })
      };
    },
    auth: {
      async signUp({ email, password, options }) {
        if (registeredAccounts.has(email)) {
          // Simulate Supabase obfuscated duplicate email response (empty identities)
          return {
            data: { user: { id: 'dup-id', email, identities: [] }, session: null },
            error: null
          };
        }
        const userRecord = {
          id: '33333333-3333-4333-8333-333333333333',
          email,
          password,
          confirmed: false,
          user_metadata: (options && options.data) || {},
          identities: [{ id: 'ident-1' }]
        };
        registeredAccounts.set(email, userRecord);
        // Simulate email confirmation required (user returned, session is null)
        return {
          data: { user: userRecord, session: null },
          error: null
        };
      },
      async signInWithPassword({ email, password }) {
        const acc = registeredAccounts.get(email);
        if (!acc || acc.password !== password) {
          return { data: { user: null, session: null }, error: new Error('Invalid login credentials') };
        }
        if (!acc.confirmed) {
          return { data: { user: null, session: null }, error: new Error('Email not confirmed') };
        }
        activeSession = { user: acc, access_token: 'jwt-token' };
        return { data: { user: acc, session: activeSession }, error: null };
      },
      async resetPasswordForEmail(email) {
        lastResetEmail = email;
        return { data: {}, error: null };
      },
      async updateUser({ password }) {
        if (!activeSession) return { data: null, error: new Error('Not authenticated') };
        activeSession.user.password = password;
        return { data: { user: activeSession.user }, error: null };
      },
      async getSession() {
        return { data: { session: activeSession }, error: null };
      },
      async signOut() {
        activeSession = null;
        return { error: null };
      }
    }
  };

  global.window = {
    localStorage: global.localStorage,
    addEventListener() {},
    PKSupabaseConfig: {
      isSupabaseConfigured: () => true,
      getSupabaseSetupError: () => '',
      getSupabaseClient: () => mockAuthClient,
      getAuthRedirectUrl: () => 'https://phanaach4889.github.io/PK-Khmer-Type/'
    }
  };

  delete require.cache[require.resolve(path.join(ROOT, 'js', 'storage.js'))];
  require(path.join(ROOT, 'js', 'storage.js'));
  const AuthProvider = global.window.AuthProvider;

  // 1. Register new user -> confirmationRequired = true
  const regRes = await AuthProvider.signUp({
    username: 'Phanna',
    email: 'phanna@example.com',
    password: 'InitialPassword123!'
  });
  assert.equal(regRes.ok, true);
  assert.equal(regRes.confirmationRequired, true);

  // 2. Duplicate registration -> rejected clearly
  const dupRes = await AuthProvider.signUp({
    username: 'Phanna2',
    email: 'phanna@example.com',
    password: 'InitialPassword123!'
  });
  assert.equal(dupRes.ok, false);
  assert.equal(dupRes.code, 'DUPLICATE_EMAIL');

  // 3. Sign in before confirming email -> EMAIL_NOT_CONFIRMED
  const unconfSignIn = await AuthProvider.signIn({
    email: 'phanna@example.com',
    password: 'InitialPassword123!'
  });
  assert.equal(unconfSignIn.ok, false);
  assert.equal(unconfSignIn.code, 'EMAIL_NOT_CONFIRMED');

  // 4. Confirm email & test invalid password
  registeredAccounts.get('phanna@example.com').confirmed = true;
  const badPwRes = await AuthProvider.signIn({
    email: 'phanna@example.com',
    password: 'WrongPassword!'
  });
  assert.equal(badPwRes.ok, false);
  assert.match(badPwRes.error, /Invalid email or password/i);

  // 5. Valid sign-in
  const validSignIn = await AuthProvider.signIn({
    email: 'phanna@example.com',
    password: 'InitialPassword123!'
  });
  assert.equal(validSignIn.ok, true);
  assert.equal(validSignIn.user.email, 'phanna@example.com');

  // 6. Password reset request & password update
  const resetRes = await AuthProvider.requestPasswordReset({ email: 'phanna@example.com' });
  assert.equal(resetRes.ok, true);
  assert.equal(lastResetEmail, 'phanna@example.com');

  const updatePwRes = await AuthProvider.updatePassword({ password: 'UpdatedPassword456!' });
  assert.equal(updatePwRes.ok, true);

  // 7. Sign out & verify raw password was never stored in localStorage
  const signOutRes = await AuthProvider.signOut();
  assert.equal(signOutRes.ok, true);
  const lsDump = JSON.stringify(global.localStorage._dump());
  assert.equal(lsDump.includes('InitialPassword123!'), false, 'Raw password must never be stored in localStorage');
  assert.equal(lsDump.includes('UpdatedPassword456!'), false, 'Updated password must never be stored in localStorage');
});



