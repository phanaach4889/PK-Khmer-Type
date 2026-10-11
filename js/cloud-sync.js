/* ============================================================================
 * PK Khmer Type — Local-First Cloud Synchronization & Private File Sync Service
 *
 * Responsibilities:
 * 1. Local-first persistence with IndexedDB offline operation queue (pk_cloud_sync_db)
 * 2. Initial sign-in reconciliation with cross-account isolation & safe progress merge
 * 3. Deterministic conflict resolution for lesson_progress and user_settings
 * 4. Private file synchronization (Supabase Storage bucket 'user-files' + public.user_files)
 *    for Custom Avatars, Custom Studio Wallpapers, and Cloud Backup Snapshots
 * 5. Real-time sync state machine ('anonymous', 'unconfigured', 'syncing', 'synced', 'offline', 'error')
 * ============================================================================ */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(root);
  } else {
    root.PKCloudSync = factory(root);
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : this, function (root) {
  "use strict";

  var IDB_NAME = "pk_cloud_sync_db";
  var IDB_VERSION = 1;
  var QUEUE_STORE = "sync_queue";
  var FILES_STORE = "local_files";
  var META_STORE = "sync_meta";

  var LS_LAST_OWNER = "pk_cloud_owner_user_id";
  var LS_LAST_SYNC_AT = "pk_cloud_last_sync_at";
  var LS_SETTINGS_TIMESTAMPS = "pk_settings_updated_at_map";
  var LS_QUEUE_FALLBACK = "pk_cloud_sync_queue_fallback_v1";

  var MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB max
  var ALLOWED_MIME_TYPES = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
    "application/json",
    "text/plain"
  ];
  var ALLOWED_FILE_CATEGORIES = ["avatar", "wallpaper", "backup", "document", "personal"];

  var ALLOWED_SETTING_KEYS = [
    "khmerTheme",
    "khmerKeyLayout",
    "khmerSoundOn",
    "khmerFontSize",
    "khmerSettingTheme",
    "khmerSettingPerformanceMode",
    "khmerSettingAnimationMode",
    "khmerSettingReducedMotion",
    "khmerSettingLargeText",
    "khmerSettingSound",
    "khmerSettingHands",
    "khmerSettingHandsOpacity",
    "khmerSettingHandColorPreset",
    "khmerSettingHandColorCustomL",
    "khmerSettingHandColorCustomR",
    "khmerSettingAccent",
    "khmerSettingKhmerFont",
    "khmerSettingShiftPreview",
    "khmerSettingKeyHighlight",
    "khmerSettingHighContrast",
    "khmerSettingCompactKeys",
    "khmerSettingKeyFx",
    "khmerSettingMotes",
    "khmerSettingTorches",
    "khmerSettingScanlines",
    "khmerSettingFocusMode",
    "khmerSettingSideDocks",
    "khmerSettingDyslexiaSpacing",
    "khmerSettingSwitchProfile",
    "khmerSettingSoundVolume",
    "khmerSettingChime",
    "khmerSettingAmbienceVolume",
    "khmerSettingReticle",
    "khmerSettingShockwave",
    "khmerSettingLayerHover",
    "khmerSettingStrictMode",
    "khmerSettingAutoAdvance",
    "khmerSettingLiveStatsHud",
    "khmerSettingTargetWpm",
    "khmerCustomWallpaperBlur",
    "khmerCustomWallpaperDim",
    "khmerCustomWallpaperUrl",
    "khmerCustomWallpaperFileId",
    "khmerAvatarFileId",
    "khmerLayout",
    "kk_site_lang",
    "pk_unlock_all_lessons",
    "khmerUnlockAll",
    "khmerCursorInspector"
  ];

  var FORBIDDEN_KEY_PATTERN = /(password|secret|service_role|private_key|is_admin|admin|role|jwt|token)/i;
  var LESSON_ID_PATTERN = /^[A-Za-z0-9_:\-\.]{1,128}$/;

  var MASTERY_RANK = {
    unstarted: 0,
    locked: 0,
    unlocked: 1,
    practicing: 2,
    in_progress: 2,
    proficient: 3,
    mastered: 4
  };

  var RANK_TO_STATE = {
    0: "unstarted",
    1: "practicing",
    2: "practicing",
    3: "proficient",
    4: "mastered"
  };

  /* ---------- Pure Helpers & Deterministic Merge Logic ---------- */

  function isValidUuid(str) {
    return typeof str === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
  }

  function generateUuid() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function sanitizeFileName(rawName) {
    var base = String(rawName || "file")
      .replace(/^.*[\\\/]/, "")
      .replace(/\.\.+/g, ".")
      .replace(/[^A-Za-z0-9._-]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^[_.-]+/, "");
    if (!base) base = "file";
    if (base.length > 100) {
      var extIdx = base.lastIndexOf(".");
      if (extIdx > 0 && base.length - extIdx <= 10) {
        var ext = base.slice(extIdx);
        base = base.slice(0, 100 - ext.length) + ext;
      } else {
        base = base.slice(0, 100);
      }
    }
    return base;
  }

  function buildScopedStoragePath(userId, fileId, rawFileName) {
    if (!isValidUuid(userId)) {
      throw new Error("Invalid authenticated user UUID for storage path.");
    }
    var safeId = isValidUuid(fileId) ? fileId : generateUuid();
    var safeName = sanitizeFileName(rawFileName);
    return userId + "/" + safeId + "-" + safeName;
  }

  function validateFileForUpload(fileInfo) {
    if (!fileInfo || typeof fileInfo !== "object") {
      return { ok: false, valid: false, error: "No file provided." };
    }
    var size = Number(fileInfo.size !== undefined ? fileInfo.size : fileInfo.size_bytes);
    var mime = String(fileInfo.type || fileInfo.mime_type || "").toLowerCase().trim();
    var name = String(fileInfo.name || fileInfo.file_name || "").trim();
    var category = String(fileInfo.category || fileInfo.file_category || "backup").toLowerCase().trim();
    if (category === "personal") category = "document";

    if (!name) {
      return { ok: false, valid: false, error: "Filename is required." };
    }
    if (name.indexOf("..") !== -1 || name.indexOf("/") !== -1 || name.indexOf("\\") !== -1) {
      return { ok: false, valid: false, error: "Filename contains invalid path characters." };
    }
    if (!Number.isFinite(size) || size <= 0) {
      return { ok: false, valid: false, error: "File cannot be empty." };
    }
    var maxBytes = 2 * 1024 * 1024; // 2 MB limit matching user-files bucket constraint
    if (size > maxBytes) {
      return {
        ok: false,
        valid: false,
        error: "File exceeds maximum allowed size of " + Math.round(maxBytes / (1024 * 1024)) + " MB."
      };
    }
    if (ALLOWED_MIME_TYPES.indexOf(mime) === -1) {
      return {
        ok: false,
        valid: false,
        error: "Unsupported file type '" + (mime || "unknown") + "'. Allowed: PNG, JPEG, WebP, GIF, JSON, TXT."
      };
    }
    if (ALLOWED_FILE_CATEGORIES.indexOf(category) === -1) {
      return {
        ok: false,
        valid: false,
        error: "Invalid file category '" + category + "'."
      };
    }
    return {
      ok: true,
      valid: true,
      safeName: sanitizeFileName(name),
      mimeType: mime,
      sizeBytes: size,
      category: category
    };
  }

  function validateSettingsPayload(settings) {
    if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
      return { valid: false, error: "Settings payload must be a plain object." };
    }
    var sanitized = {};
    var keys = Object.keys(settings);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (FORBIDDEN_KEY_PATTERN.test(k)) {
        return { valid: false, error: "Forbidden privileged key in settings: " + k };
      }
      if (k === "_meta" || k === "_updatedAtByKey") {
        if (settings[k] && typeof settings[k] === "object" && !Array.isArray(settings[k])) {
          sanitized[k] = settings[k];
        }
        continue;
      }
      if (ALLOWED_SETTING_KEYS.indexOf(k) !== -1 || k.indexOf("khmerSetting") === 0) {
        var val = settings[k];
        if (val === null || typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
          var strVal = val === null ? "" : String(val);
          // Never sync raw Base64 data URLs inside user_settings JSONB
          if (strVal.indexOf("data:") === 0 || strVal.length > 2048) {
            continue;
          }
          sanitized[k] = strVal;
        }
      }
    }
    var serialized = JSON.stringify(sanitized);
    if (serialized.length > 60000) {
      return { valid: false, error: "Settings payload exceeds 60 KB limit." };
    }
    return { valid: true, settings: sanitized };
  }

  function validateLessonId(lessonId, validLessonSet) {
    if (typeof lessonId !== "string" || !LESSON_ID_PATTERN.test(lessonId)) {
      return false;
    }
    if (lessonId.indexOf("_meta:") === 0) {
      return (
        lessonId === "_meta:course_telemetry" ||
        lessonId === "_meta:adaptive_state" ||
        lessonId === "_meta:tracker_review"
      );
    }
    if (validLessonSet && validLessonSet instanceof Set && validLessonSet.size > 0) {
      var rawId = lessonId.indexOf(":") !== -1 ? lessonId.split(":").slice(1).join(":") : lessonId;
      return validLessonSet.has(lessonId) || validLessonSet.has(rawId);
    }
    return true;
  }

  function parseTimestampMs(val) {
    if (!val) return 0;
    if (typeof val === "number") return val;
    var parsed = Date.parse(String(val));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  /**
   * Per-key conflict resolution for user settings.
   * Compares _updatedAtByKey / timestamps per individual setting key so changes
   * to different settings on different devices merge cleanly without overwriting.
   */
  function mergeSettings(localSettings, remoteSettings) {
    var rawLoc = localSettings || {};
    var rawRem = remoteSettings || {};
    var locSource = (rawLoc.values && typeof rawLoc.values === "object") ? rawLoc.values : rawLoc;
    var remSource = (rawRem.values && typeof rawRem.values === "object") ? rawRem.values : rawRem;

    var localCheck = validateSettingsPayload(locSource);
    var remoteCheck = validateSettingsPayload(remSource);
    var loc = localCheck.valid ? localCheck.settings : {};
    var rem = remoteCheck.valid ? remoteCheck.settings : {};

    var locMap = (rawLoc._updatedAtByKey && typeof rawLoc._updatedAtByKey === "object")
      ? rawLoc._updatedAtByKey
      : ((rawLoc.timestamps && typeof rawLoc.timestamps === "object") ? rawLoc.timestamps : {});
    var remMap = (rawRem._updatedAtByKey && typeof rawRem._updatedAtByKey === "object")
      ? rawRem._updatedAtByKey
      : ((rawRem.timestamps && typeof rawRem.timestamps === "object") ? rawRem.timestamps : {});
    var locDefaultTs = parseTimestampMs((rawLoc._meta && rawLoc._meta.updatedAt) || rawLoc.updatedAt);
    var remDefaultTs = parseTimestampMs((rawRem._meta && rawRem._meta.updatedAt) || rawRem.updatedAt);

    var merged = {};
    var mergedTsMap = {};
    var allKeys = new Set(Object.keys(loc).concat(Object.keys(rem)));

    allKeys.forEach(function (k) {
      if (k === "_meta" || k === "_updatedAtByKey" || k === "values" || k === "timestamps") return;
      var hasLoc = Object.prototype.hasOwnProperty.call(loc, k) && loc[k] !== "";
      var hasRem = Object.prototype.hasOwnProperty.call(rem, k) && rem[k] !== "";

      if (hasLoc && !hasRem) {
        merged[k] = loc[k];
        mergedTsMap[k] = parseTimestampMs(locMap[k]) || locDefaultTs || Date.now();
      } else if (!hasLoc && hasRem) {
        merged[k] = rem[k];
        mergedTsMap[k] = parseTimestampMs(remMap[k]) || remDefaultTs || Date.now();
      } else if (hasLoc && hasRem) {
        var lTs = locMap[k] !== undefined ? parseTimestampMs(locMap[k]) : locDefaultTs;
        var rTs = remMap[k] !== undefined ? parseTimestampMs(remMap[k]) : remDefaultTs;
        if (rTs > lTs) {
          merged[k] = rem[k];
          mergedTsMap[k] = rTs;
        } else {
          merged[k] = loc[k];
          mergedTsMap[k] = lTs || rTs || Date.now();
        }
      }
    });

    var valuesCopy = Object.assign({}, merged);
    merged._updatedAtByKey = mergedTsMap;
    merged.timestamps = mergedTsMap;
    merged.values = valuesCopy;
    merged._meta = {
      updatedAt: Math.max(locDefaultTs, remDefaultTs, Date.now()),
      schemaVersion: 2
    };
    return merged;
  }

  function minIso(a, b) {
    if (!a) return b || null;
    if (!b) return a || null;
    return String(a) < String(b) ? a : b;
  }

  function maxIso(a, b) {
    if (!a) return b || null;
    if (!b) return a || null;
    return String(a) > String(b) ? a : b;
  }

  /**
   * Deterministic monotonic merge for a single lesson progress record.
   * Ensures completed/mastered lessons are never regressed and highest WPM/accuracy/attempts win.
   */
  function mergeLessonRecord(localRec, remoteRec) {
    if (!localRec && !remoteRec) return {};
    if (!localRec) return JSON.parse(JSON.stringify(remoteRec));
    if (!remoteRec) return JSON.parse(JSON.stringify(localRec));

    var l = localRec || {};
    var r = remoteRec || {};

    var completed = Boolean(l.completed || r.completed);
    var started = Boolean(l.started || r.started || completed || Number(l.totalAttempts || l.attempts || 0) > 0 || Number(r.totalAttempts || r.attempts || 0) > 0);
    var mastered = Boolean(
      l.mastered ||
      r.mastered ||
      l.masteryState === "mastered" ||
      r.masteryState === "mastered"
    );

    var lStateRank = MASTERY_RANK[l.masteryState] !== undefined ? MASTERY_RANK[l.masteryState] : (l.completed ? 3 : (l.started ? 2 : 0));
    var rStateRank = MASTERY_RANK[r.masteryState] !== undefined ? MASTERY_RANK[r.masteryState] : (r.completed ? 3 : (r.started ? 2 : 0));
    var bestRank = mastered ? 4 : Math.max(lStateRank, rStateRank, completed ? 3 : (started ? 2 : 0));
    var masteryState = RANK_TO_STATE[bestRank] || "unstarted";

    var starsEarned = Math.max(Number(l.starsEarned || 0), Number(r.starsEarned || 0));
    var bestWpm = Math.max(Number(l.bestWpm || l.wpm || 0), Number(r.bestWpm || r.wpm || 0));
    var bestAccuracy = Math.max(Number(l.bestAccuracy || l.accuracy || 0), Number(r.bestAccuracy || r.accuracy || 0));
    var attempts = Math.max(
      Number(l.totalAttempts || l.attempts || 0),
      Number(r.totalAttempts || r.attempts || 0)
    );
    var completionCount = Math.max(
      Number(l.completionCount || (l.completed ? 1 : 0)),
      Number(r.completionCount || (r.completed ? 1 : 0))
    );
    var totalTypingUnits = Math.max(Number(l.totalTypingUnits || 0), Number(r.totalTypingUnits || 0));
    var totalMistakes = Math.max(Number(l.totalMistakes || 0), Number(r.totalMistakes || 0));
    var totalCorrections = Math.max(Number(l.totalCorrections || 0), Number(r.totalCorrections || 0));
    var activeTypingTimeMs = Math.max(Number(l.activeTypingTimeMs || 0), Number(r.activeTypingTimeMs || 0));

    var lPrac = l.lastPracticedAt || l.updatedAt || (l.mostRecentAttempt && l.mostRecentAttempt.timestamp ? new Date(l.mostRecentAttempt.timestamp).toISOString() : null);
    var rPrac = r.lastPracticedAt || r.updatedAt || (r.mostRecentAttempt && r.mostRecentAttempt.timestamp ? new Date(r.mostRecentAttempt.timestamp).toISOString() : null);
    var newerIsRemote = rPrac && (!lPrac || String(rPrac) > String(lPrac));

    var mergedExercises = {};
    var lEx = (l.exercises && typeof l.exercises === "object") ? l.exercises : {};
    var rEx = (r.exercises && typeof r.exercises === "object") ? r.exercises : {};
    var exKeys = new Set(Object.keys(lEx).concat(Object.keys(rEx)));
    exKeys.forEach(function (exIdx) {
      var le = lEx[exIdx];
      var re = rEx[exIdx];
      if (le && !re) {
        mergedExercises[exIdx] = Object.assign({}, le);
      } else if (!le && re) {
        mergedExercises[exIdx] = Object.assign({}, re);
      } else if (le && re) {
        mergedExercises[exIdx] = {
          id: String(le.id || re.id || exIdx),
          type: String(le.type || re.type || "drill"),
          attempts: Math.max(Number(le.attempts || 0), Number(re.attempts || 0)),
          completions: Math.max(Number(le.completions || (le.completed ? 1 : 0)), Number(re.completions || (re.completed ? 1 : 0))),
          bestWpm: Math.max(Number(le.bestWpm || 0), Number(re.bestWpm || 0)),
          bestAccuracy: Math.max(Number(le.bestAccuracy || 0), Number(re.bestAccuracy || 0)),
          mistakes: Math.max(Number(le.mistakes || 0), Number(re.mistakes || 0)),
          activeTimeMs: Math.max(Number(le.activeTimeMs || 0), Number(re.activeTimeMs || 0)),
          lastWpm: newerIsRemote ? Number(re.lastWpm || le.lastWpm || 0) : Number(le.lastWpm || re.lastWpm || 0),
          lastAccuracy: newerIsRemote ? Number(re.lastAccuracy || le.lastAccuracy || 0) : Number(le.lastAccuracy || re.lastAccuracy || 0),
          completed: Boolean(le.completed || re.completed || Number(le.completions || 0) > 0 || Number(re.completions || 0) > 0),
          lastAttempt: newerIsRemote ? (re.lastAttempt || le.lastAttempt || null) : (le.lastAttempt || re.lastAttempt || null),
          lastPracticedAt: maxIso(le.lastPracticedAt, re.lastPracticedAt)
        };
      }
    });

    var rawId = l.id || r.id || l.lessonId || r.lessonId || "";
    var bestAttempt = l.bestAttempt || r.bestAttempt || null;
    if (l.bestAttempt && r.bestAttempt) {
      bestAttempt = Number(r.bestAttempt.wpm || 0) > Number(l.bestAttempt.wpm || 0) ? r.bestAttempt : l.bestAttempt;
    }

    return {
      id: String(rawId),
      lessonId: String(rawId),
      courseId: l.courseId || r.courseId || "standard",
      levelId: l.levelId || r.levelId || "",
      started: started,
      completed: completed,
      mastered: mastered,
      starsEarned: starsEarned,
      completionCount: completionCount,
      totalAttempts: attempts,
      attempts: attempts,
      masteryState: masteryState,
      bestWpm: bestWpm,
      bestAccuracy: bestAccuracy,
      wpm: bestWpm,
      accuracy: bestAccuracy,
      totalTypingUnits: totalTypingUnits,
      totalMistakes: totalMistakes,
      totalCorrections: totalCorrections,
      activeTypingTimeMs: activeTypingTimeMs,
      lastWpm: newerIsRemote ? Number(r.lastWpm || l.lastWpm || bestWpm) : Number(l.lastWpm || r.lastWpm || bestWpm),
      lastAccuracy: newerIsRemote ? Number(r.lastAccuracy || l.lastAccuracy || bestAccuracy) : Number(l.lastAccuracy || r.lastAccuracy || bestAccuracy),
      mostRecentAttempt: newerIsRemote ? (r.mostRecentAttempt || l.mostRecentAttempt || null) : (l.mostRecentAttempt || r.mostRecentAttempt || null),
      bestAttempt: bestAttempt,
      recentAttempts: newerIsRemote
        ? (Array.isArray(r.recentAttempts) && r.recentAttempts.length ? r.recentAttempts : (l.recentAttempts || []))
        : (Array.isArray(l.recentAttempts) && l.recentAttempts.length ? l.recentAttempts : (r.recentAttempts || [])),
      firstCompletedAt: minIso(l.firstCompletedAt, r.firstCompletedAt),
      lastPracticedAt: maxIso(lPrac, rPrac) || new Date().toISOString(),
      exercises: mergedExercises
    };
  }

  /**
   * Reconciles a map of local lesson records and remote lesson rows.
   * Returns { mergedMap, toUpsertRemote }
   */
  function reconcileLessonProgressMaps(localMap, remoteRows) {
    var loc = localMap || {};
    var remByLessonId = {};
    (remoteRows || []).forEach(function (row) {
      if (row && row.lesson_id && row.progress && typeof row.progress === "object") {
        remByLessonId[row.lesson_id] = row.progress;
      }
    });

    var mergedMap = {};
    var toUpsertRemote = [];
    var allLessonIds = new Set(Object.keys(loc).concat(Object.keys(remByLessonId)));

    allLessonIds.forEach(function (lessonId) {
      if (!validateLessonId(lessonId)) return;
      var lRec = loc[lessonId];
      var rRec = remByLessonId[lessonId];

      if (lessonId.indexOf("_meta:") === 0) {
        // For _meta records, merge sub-objects or pick newer timestamp
        var lMetaTs = (lRec && Number(lRec._updatedAt)) || 0;
        var rMetaTs = (rRec && Number(rRec._updatedAt)) || 0;
        if (lRec && !rRec) {
          mergedMap[lessonId] = lRec;
          toUpsertRemote.push({ lesson_id: lessonId, progress: lRec });
        } else if (!lRec && rRec) {
          mergedMap[lessonId] = rRec;
        } else if (lRec && rRec) {
          var combined = mergeMetaTelemetry(lessonId, lRec, rRec);
          mergedMap[lessonId] = combined;
          if (lMetaTs >= rMetaTs) {
            toUpsertRemote.push({ lesson_id: lessonId, progress: combined });
          }
        }
        return;
      }

      var merged = mergeLessonRecord(lRec, rRec);
      mergedMap[lessonId] = merged;

      if (!rRec) {
        toUpsertRemote.push({ lesson_id: lessonId, progress: merged });
      } else if (lRec) {
        var rChanged =
          Boolean(merged.completed) !== Boolean(rRec.completed) ||
          Boolean(merged.mastered) !== Boolean(rRec.mastered) ||
          Number(merged.bestWpm || 0) > Number(rRec.bestWpm || rRec.wpm || 0) ||
          Number(merged.bestAccuracy || 0) > Number(rRec.bestAccuracy || rRec.accuracy || 0) ||
          Number(merged.attempts || 0) > Number(rRec.attempts || 0);
        if (rChanged) {
          toUpsertRemote.push({ lesson_id: lessonId, progress: merged });
        }
      }
    });

    return {
      mergedMap: mergedMap,
      toUpsertRemote: toUpsertRemote
    };
  }

  function mergeMetaTelemetry(metaId, localMeta, remoteMeta) {
    if (!localMeta) return remoteMeta;
    if (!remoteMeta) return localMeta;
    var lTs = Number(localMeta._updatedAt || 0);
    var rTs = Number(remoteMeta._updatedAt || 0);

    if (metaId === "_meta:tracker_review") {
      var lGlobals = (localMeta.globalStats && typeof localMeta.globalStats === "object") ? localMeta.globalStats : {};
      var rGlobals = (remoteMeta.globalStats && typeof remoteMeta.globalStats === "object") ? remoteMeta.globalStats : {};
      var mergedGlobals = {
        keys: Math.max(Number(lGlobals.keys || 0), Number(rGlobals.keys || 0)),
        totalKeys: Math.max(Number(lGlobals.totalKeys || 0), Number(rGlobals.totalKeys || 0)),
        bestWpm: Math.max(Number(lGlobals.bestWpm || 0), Number(rGlobals.bestWpm || 0)),
        sessions: Math.max(Number(lGlobals.sessions || 0), Number(rGlobals.sessions || 0))
      };
      var mergedTrialBest = Math.max(Number(localMeta.trialBest || 0), Number(remoteMeta.trialBest || 0));
      var newer = rTs > lTs ? remoteMeta : localMeta;
      return Object.assign({}, newer, {
        globalStats: mergedGlobals,
        trialBest: mergedTrialBest,
        _updatedAt: Math.max(lTs, rTs, Date.now())
      });
    }

    return rTs > lTs ? remoteMeta : localMeta;
  }

  /* ---------- IndexedDB Queue & Local File Blob Store ---------- */

  var idbPromise = null;
  var memoryQueueFallback = [];
  var memoryFilesFallback = {};

  function openSyncDatabase() {
    if (typeof indexedDB === "undefined" || !indexedDB) {
      return Promise.resolve(null);
    }
    if (idbPromise) return idbPromise;

    idbPromise = new Promise(function (resolve) {
      try {
        var req = indexedDB.open(IDB_NAME, IDB_VERSION);
        req.onupgradeneeded = function (e) {
          var db = e.target.result;
          if (!db.objectStoreNames.contains(QUEUE_STORE)) {
            db.createObjectStore(QUEUE_STORE, { keyPath: "id" });
          }
          if (!db.objectStoreNames.contains(FILES_STORE)) {
            db.createObjectStore(FILES_STORE, { keyPath: "key" });
          }
          if (!db.objectStoreNames.contains(META_STORE)) {
            db.createObjectStore(META_STORE, { keyPath: "key" });
          }
        };
        req.onsuccess = function (e) {
          resolve(e.target.result);
        };
        req.onerror = function () {
          resolve(null);
        };
      } catch (_err) {
        resolve(null);
      }
    });
    return idbPromise;
  }

  function loadFallbackQueue() {
    try {
      if (typeof localStorage !== "undefined") {
        var raw = localStorage.getItem(LS_QUEUE_FALLBACK);
        if (raw) {
          var parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch (_e) {}
    return memoryQueueFallback.slice();
  }

  function saveFallbackQueue(list) {
    memoryQueueFallback = list.slice();
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(LS_QUEUE_FALLBACK, JSON.stringify(list));
      }
    } catch (_e) {}
  }

  async function getQueuedOperations(userId) {
    var db = await openSyncDatabase();
    var all = [];
    if (db) {
      all = await new Promise(function (resolve) {
        try {
          var tx = db.transaction(QUEUE_STORE, "readonly");
          var store = tx.objectStore(QUEUE_STORE);
          var req = store.getAll();
          req.onsuccess = function () {
            resolve(Array.isArray(req.result) ? req.result : []);
          };
          req.onerror = function () {
            resolve(loadFallbackQueue());
          };
        } catch (_e) {
          resolve(loadFallbackQueue());
        }
      });
    } else {
      all = loadFallbackQueue();
    }
    all.sort(function (a, b) {
      return Number(a.createdAt || 0) - Number(b.createdAt || 0);
    });
    if (userId) {
      return all.filter(function (item) {
        return item && item.userId === userId;
      });
    }
    return all;
  }

  async function enqueueSyncOperation(op) {
    if (!op || !op.userId || !op.type) return null;
    var dedupeKey = op.userId + "::" + op.type + "::" + (op.targetKey || "default");
    var existing = await getQueuedOperations();
    var existingItem = null;
    for (var i = 0; i < existing.length; i++) {
      if (existing[i].dedupeKey === dedupeKey) {
        existingItem = existing[i];
        break;
      }
    }

    var mergedPayload = op.payload;
    if (existingItem && op.type === "upsert_lesson" && existingItem.payload && op.payload) {
      mergedPayload = {
        lesson_id: op.payload.lesson_id,
        progress: mergeLessonRecord(existingItem.payload.progress, op.payload.progress)
      };
    } else if (existingItem && op.type === "upsert_settings" && existingItem.payload && op.payload) {
      mergedPayload = mergeSettings(existingItem.payload, op.payload);
    }

    var record = {
      id: existingItem ? existingItem.id : generateUuid(),
      dedupeKey: dedupeKey,
      userId: op.userId,
      type: op.type,
      targetKey: op.targetKey || "default",
      payload: mergedPayload,
      createdAt: existingItem ? existingItem.createdAt : Date.now(),
      updatedAt: Date.now(),
      attempts: existingItem ? existingItem.attempts : 0,
      lastError: null
    };

    var db = await openSyncDatabase();
    if (db) {
      await new Promise(function (resolve) {
        try {
          var tx = db.transaction(QUEUE_STORE, "readwrite");
          tx.objectStore(QUEUE_STORE).put(record);
          tx.oncomplete = function () { resolve(true); };
          tx.onerror = function () { resolve(false); };
        } catch (_e) {
          resolve(false);
        }
      });
    }
    // Mirror in fallback queue as well for environments without IndexedDB
    var fb = existing.filter(function (it) { return it.id !== record.id; });
    fb.push(record);
    saveFallbackQueue(fb);
    return record;
  }

  async function removeQueuedOperation(id) {
    var db = await openSyncDatabase();
    if (db) {
      await new Promise(function (resolve) {
        try {
          var tx = db.transaction(QUEUE_STORE, "readwrite");
          tx.objectStore(QUEUE_STORE).delete(id);
          tx.oncomplete = function () { resolve(true); };
          tx.onerror = function () { resolve(false); };
        } catch (_e) {
          resolve(false);
        }
      });
    }
    var fb = loadFallbackQueue().filter(function (it) { return it.id !== id; });
    saveFallbackQueue(fb);
  }

  async function clearUserQueue(userId) {
    var items = await getQueuedOperations(userId);
    for (var i = 0; i < items.length; i++) {
      await removeQueuedOperation(items[i].id);
    }
  }

  async function saveLocalFileCache(key, dataObj) {
    var record = Object.assign({ key: key, updatedAt: Date.now() }, dataObj);
    memoryFilesFallback[key] = record;
    var db = await openSyncDatabase();
    if (!db) return record;
    return new Promise(function (resolve) {
      try {
        var tx = db.transaction(FILES_STORE, "readwrite");
        tx.objectStore(FILES_STORE).put(record);
        tx.oncomplete = function () { resolve(record); };
        tx.onerror = function () { resolve(record); };
      } catch (_e) {
        resolve(record);
      }
    });
  }

  async function getLocalFileCache(key) {
    var db = await openSyncDatabase();
    if (db) {
      var res = await new Promise(function (resolve) {
        try {
          var tx = db.transaction(FILES_STORE, "readonly");
          var req = tx.objectStore(FILES_STORE).get(key);
          req.onsuccess = function () { resolve(req.result || null); };
          req.onerror = function () { resolve(null); };
        } catch (_e) {
          resolve(null);
        }
      });
      if (res) return res;
    }
    return memoryFilesFallback[key] || null;
  }

  async function deleteLocalFileCache(key) {
    delete memoryFilesFallback[key];
    var db = await openSyncDatabase();
    if (!db) return;
    return new Promise(function (resolve) {
      try {
        var tx = db.transaction(FILES_STORE, "readwrite");
        tx.objectStore(FILES_STORE).delete(key);
        tx.oncomplete = function () { resolve(true); };
        tx.onerror = function () { resolve(false); };
      } catch (_e) {
        resolve(false);
      }
    });
  }

  /* ---------- Local Storage Readers & Writers ---------- */

  function collectLocalSettingsSnapshot() {
    if (typeof localStorage === "undefined") return {};
    var out = {};
    var tsMap = {};
    try {
      tsMap = JSON.parse(localStorage.getItem(LS_SETTINGS_TIMESTAMPS) || "{}") || {};
    } catch (_e) {
      tsMap = {};
    }

    for (var i = 0; i < ALLOWED_SETTING_KEYS.length; i++) {
      var k = ALLOWED_SETTING_KEYS[i];
      try {
        var v = localStorage.getItem(k);
        if (v !== null && v.indexOf("data:") !== 0 && v.length <= 2048) {
          out[k] = v;
        }
      } catch (_e) {}
    }

    out._updatedAtByKey = tsMap;
    out._meta = {
      updatedAt: Date.now(),
      schemaVersion: 2
    };
    return out;
  }

  function applySettingsSnapshotToLocal(settingsObj) {
    if (typeof localStorage === "undefined" || !settingsObj || typeof settingsObj !== "object") return;
    var check = validateSettingsPayload(settingsObj);
    if (!check.valid) return;
    var clean = check.settings;

    Object.keys(clean).forEach(function (k) {
      if (k === "_meta" || k === "_updatedAtByKey") return;
      try {
        localStorage.setItem(k, String(clean[k]));
      } catch (_e) {}
    });

    if (clean._updatedAtByKey && typeof clean._updatedAtByKey === "object") {
      try {
        localStorage.setItem(LS_SETTINGS_TIMESTAMPS, JSON.stringify(clean._updatedAtByKey));
      } catch (_e) {}
    }

    // Notify live UI components to refresh settings immediately
    if (typeof root !== "undefined" && typeof root.dispatchEvent === "function" && typeof CustomEvent === "function") {
      try {
        root.dispatchEvent(new CustomEvent("pkCloudSettingsApplied", { detail: { settings: clean } }));
      } catch (_e) {}
    }
  }

  function collectLocalLessonProgressMap() {
    var map = {};
    if (typeof localStorage === "undefined") return map;

    var winObj = (typeof window !== "undefined" && window) ? window : root;

    // 1. Collect structured v2 progress from PK_PROGRESS or khmerProgress_v2
    var v2Data = null;
    try {
      if (winObj && winObj.PK_PROGRESS && typeof winObj.PK_PROGRESS.exportData === "function") {
        v2Data = winObj.PK_PROGRESS.exportData();
      } else {
        var rawV2 = localStorage.getItem("khmerProgress_v2");
        if (rawV2) v2Data = JSON.parse(rawV2);
      }
    } catch (_e) {}

    if (v2Data && v2Data.courses && typeof v2Data.courses === "object") {
      var courseTelemetry = { courses: {}, _updatedAt: Date.now() };
      ["standard", "nida", "english"].forEach(function (courseId) {
        var c = v2Data.courses[courseId];
        if (!c || typeof c !== "object") return;
        var lessons = c.lessons || {};
        Object.keys(lessons).forEach(function (lid) {
          var rec = lessons[lid];
          if (!rec || typeof rec !== "object") return;
          var scopedId = courseId + ":" + lid;
          if (validateLessonId(scopedId)) {
            map[scopedId] = Object.assign({}, rec, { lessonId: lid, courseId: courseId });
          }
        });
        courseTelemetry.courses[courseId] = {
          levels: c.levels || {},
          keys: c.keys || {},
          characters: c.characters || {},
          fingers: c.fingers || {},
          history: Array.isArray(c.history) ? c.history.slice(-80) : [],
          currentLessonId: c.currentLessonId || null,
          totalTypingTimeSec: Number(c.totalTypingTimeSec || 0),
          totalTypingUnits: Number(c.totalTypingUnits || 0),
          totalMistakes: Number(c.totalMistakes || 0)
        };
      });
      map["_meta:course_telemetry"] = courseTelemetry;
    } else if (v2Data && v2Data.lessons && typeof v2Data.lessons === "object") {
      Object.keys(v2Data.lessons).forEach(function (lid) {
        var rec = v2Data.lessons[lid];
        if (!rec || typeof rec !== "object") return;
        if (validateLessonId(lid)) {
          map[lid] = Object.assign({}, rec, { lessonId: lid });
        }
      });
    }

    // 2. Collect legacy khmerLessonBest_<id> keys
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i) || "";
        if (k.indexOf("khmerLessonBest_") === 0) {
          var lid = k.slice("khmerLessonBest_".length);
          if (!lid) continue;
          var bestObj = JSON.parse(localStorage.getItem(k) || "null");
          if (bestObj && typeof bestObj === "object") {
            var scopedKey = lid.indexOf(":") !== -1 ? lid : "standard:" + lid;
            if (validateLessonId(scopedKey)) {
              var converted = {
                lessonId: lid,
                courseId: "standard",
                completed: true,
                mastered: Boolean(bestObj.mastered || Number(bestObj.accuracy || 0) >= 85),
                masteryState: (bestObj.mastered || Number(bestObj.accuracy || 0) >= 85) ? "mastered" : "in_progress",
                bestWpm: Number(bestObj.wpm || bestObj.bestWpm || 0),
                bestAccuracy: Number(bestObj.accuracy || bestObj.bestAccuracy || 0),
                wpm: Number(bestObj.wpm || bestObj.bestWpm || 0),
                accuracy: Number(bestObj.accuracy || bestObj.bestAccuracy || 0),
                attempts: Number(bestObj.attempts || 1),
                lastPracticedAt: bestObj.updatedAt || new Date().toISOString()
              };
              map[scopedKey] = map[scopedKey] ? mergeLessonRecord(map[scopedKey], converted) : converted;
            }
          }
        }
      }
    } catch (_e) {}

    // 3. Collect adaptive practice state
    try {
      var rawAdaptive = localStorage.getItem("pk_adaptive_state_v1");
      if (rawAdaptive) {
        var parsedAdaptive = JSON.parse(rawAdaptive);
        if (parsedAdaptive && typeof parsedAdaptive === "object") {
          map["_meta:adaptive_state"] = {
            state: parsedAdaptive,
            _updatedAt: Date.now()
          };
        }
      }
    } catch (_e) {}

    // 4. Collect tracker, review, global stats, and trial best
    try {
      var globalStats = JSON.parse(localStorage.getItem("khmerGlobalStats") || "null");
      var trialBest = Number(localStorage.getItem("khmerTrialBest") || 0);
      var trackingData = JSON.parse(localStorage.getItem("khmerTrackingData_v1") || "null");
      var reviewData = JSON.parse(localStorage.getItem("khmerReviewData_v1") || "null");
      if (globalStats || trialBest > 0 || trackingData || reviewData) {
        map["_meta:tracker_review"] = {
          globalStats: globalStats || {},
          trialBest: trialBest,
          trackingData: trackingData || null,
          reviewData: reviewData || null,
          _updatedAt: Date.now()
        };
      }
    } catch (_e) {}

    return map;
  }

  function hasNonEmptyLocalProgress() {
    var map = collectLocalLessonProgressMap();
    var keys = Object.keys(map);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (k.indexOf("_meta:") !== 0) return true;
    }
    return false;
  }

  function clearLocalProgressForAccountSwitch() {
    if (typeof localStorage === "undefined") return;
    var winObj = (typeof window !== "undefined" && window) ? window : root;
    try {
      var toRemove = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i) || "";
        if (
          k === "khmerProgress_v2" ||
          k === "khmerLessonStats" ||
          k === "khmerGlobalStats" ||
          k === "khmerTrialBest" ||
          k === "khmerTrackingData_v1" ||
          k === "khmerReviewData_v1" ||
          k === "pk_adaptive_state_v1" ||
          k.indexOf("khmerLessonBest_") === 0 ||
          k.indexOf("khmerRaceBest") === 0
        ) {
          toRemove.push(k);
        }
      }
      toRemove.forEach(function (k) { localStorage.removeItem(k); });
      if (winObj && winObj.PK_PROGRESS && typeof winObj.PK_PROGRESS.resetAll === "function") {
        winObj.PK_PROGRESS.resetAll();
      }
    } catch (_e) {}
  }

  function applyMergedLessonProgressToLocal(mergedMap) {
    if (typeof localStorage === "undefined" || !mergedMap || typeof mergedMap !== "object") return;

    var winObj = (typeof window !== "undefined" && window) ? window : root;
    var v2Data = null;
    try {
      if (winObj && winObj.PK_PROGRESS && typeof winObj.PK_PROGRESS.exportData === "function") {
        v2Data = winObj.PK_PROGRESS.exportData();
      } else {
        v2Data = JSON.parse(localStorage.getItem("khmerProgress_v2") || "null");
      }
    } catch (_e) {}

    if (!v2Data || typeof v2Data !== "object" || !v2Data.courses) {
      v2Data = {
        schemaVersion: 2,
        updatedAt: new Date().toISOString(),
        lessons: {},
        courses: {
          standard: { courseId: "standard", lessons: {}, levels: {}, keys: {}, characters: {}, fingers: {}, history: [], currentLessonId: null, totalTypingTimeSec: 0, totalTypingUnits: 0, totalMistakes: 0 },
          nida: { courseId: "nida", lessons: {}, levels: {}, keys: {}, characters: {}, fingers: {}, history: [], currentLessonId: null, totalTypingTimeSec: 0, totalTypingUnits: 0, totalMistakes: 0 },
          english: { courseId: "english", lessons: {}, levels: {}, keys: {}, characters: {}, fingers: {}, history: [], currentLessonId: null, totalTypingTimeSec: 0, totalTypingUnits: 0, totalMistakes: 0 }
        }
      };
    }
    if (!v2Data.lessons || typeof v2Data.lessons !== "object") {
      v2Data.lessons = {};
    }

    var telemetry = mergedMap["_meta:course_telemetry"];
    if (telemetry && telemetry.courses && typeof telemetry.courses === "object") {
      ["standard", "nida", "english"].forEach(function (cid) {
        var tc = telemetry.courses[cid];
        if (!tc || !v2Data.courses[cid]) return;
        v2Data.courses[cid].levels = Object.assign({}, v2Data.courses[cid].levels || {}, tc.levels || {});
        v2Data.courses[cid].keys = Object.assign({}, v2Data.courses[cid].keys || {}, tc.keys || {});
        v2Data.courses[cid].characters = Object.assign({}, v2Data.courses[cid].characters || {}, tc.characters || {});
        v2Data.courses[cid].fingers = Object.assign({}, v2Data.courses[cid].fingers || {}, tc.fingers || {});
        if (Array.isArray(tc.history) && tc.history.length > (v2Data.courses[cid].history || []).length) {
          v2Data.courses[cid].history = tc.history;
        }
        v2Data.courses[cid].totalTypingTimeSec = Math.max(Number(v2Data.courses[cid].totalTypingTimeSec || 0), Number(tc.totalTypingTimeSec || 0));
        v2Data.courses[cid].totalTypingUnits = Math.max(Number(v2Data.courses[cid].totalTypingUnits || 0), Number(tc.totalTypingUnits || 0));
        v2Data.courses[cid].totalMistakes = Math.max(Number(v2Data.courses[cid].totalMistakes || 0), Number(tc.totalTypingTimeSec || 0));
      });
    }

    Object.keys(mergedMap).forEach(function (scopedKey) {
      if (scopedKey.indexOf("_meta:") === 0) return;
      var rec = mergedMap[scopedKey];
      if (!rec || typeof rec !== "object") return;

      var courseId = rec.courseId || "standard";
      var rawLessonId = rec.lessonId || scopedKey;
      if (scopedKey.indexOf(":") !== -1) {
        var parts = scopedKey.split(":");
        courseId = parts[0] || "standard";
        rawLessonId = parts.slice(1).join(":");
      }
      if (!v2Data.courses[courseId]) {
        courseId = "standard";
      }
      var normalizedRec = Object.assign({}, rec, {
        lessonId: rawLessonId
      });
      v2Data.courses[courseId].lessons[rawLessonId] = normalizedRec;
      v2Data.lessons[rawLessonId] = normalizedRec;
      v2Data.lessons[scopedKey] = normalizedRec;

      // Mirror into legacy khmerLessonBest_<id> for UI compatibility
      if (rec.completed || rec.mastered || Number(rec.bestWpm || 0) > 0) {
        try {
          localStorage.setItem(
            "khmerLessonBest_" + rawLessonId,
            JSON.stringify({
              wpm: Number(rec.bestWpm || rec.wpm || 0),
              accuracy: Number(rec.bestAccuracy || rec.accuracy || 0),
              mastered: Boolean(rec.mastered || rec.masteryState === "mastered"),
              attempts: Number(rec.attempts || 1),
              updatedAt: rec.lastPracticedAt || new Date().toISOString()
            })
          );
        } catch (_e) {}
      }
    });

    try {
      localStorage.setItem("khmerProgress_v2", JSON.stringify(v2Data));
      if (winObj && winObj.PK_PROGRESS && typeof winObj.PK_PROGRESS.importData === "function") {
        winObj.PK_PROGRESS.importData(v2Data, { replace: true });
      }
    } catch (_e) {}

    var adaptiveMeta = mergedMap["_meta:adaptive_state"];
    if (adaptiveMeta && adaptiveMeta.state && typeof adaptiveMeta.state === "object") {
      try {
        localStorage.setItem("pk_adaptive_state_v1", JSON.stringify(adaptiveMeta.state));
      } catch (_e) {}
    }

    var trackerMeta = mergedMap["_meta:tracker_review"];
    if (trackerMeta && typeof trackerMeta === "object") {
      try {
        if (trackerMeta.globalStats) {
          localStorage.setItem("khmerGlobalStats", JSON.stringify(trackerMeta.globalStats));
        }
        if (Number(trackerMeta.trialBest || 0) > 0) {
          localStorage.setItem("khmerTrialBest", String(trackerMeta.trialBest));
        }
        if (trackerMeta.trackingData) {
          localStorage.setItem("khmerTrackingData_v1", JSON.stringify(trackerMeta.trackingData));
        }
        if (trackerMeta.reviewData) {
          localStorage.setItem("khmerReviewData_v1", JSON.stringify(trackerMeta.reviewData));
        }
      } catch (_e) {}
    }

    if (typeof root !== "undefined" && typeof root.dispatchEvent === "function" && typeof CustomEvent === "function") {
      try {
        root.dispatchEvent(new CustomEvent("pkCloudProgressApplied", { detail: { progressMap: mergedMap } }));
      } catch (_e) {}
    }
  }

  /* ---------- Sync Engine State Machine ---------- */

  var syncState = {
    status: "anonymous", // 'unconfigured' | 'anonymous' | 'syncing' | 'synced' | 'offline' | 'error'
    lastSyncedAt: null,
    queuedCount: 0,
    errorMessage: null,
    userId: null,
    email: null
  };

  var stateListeners = [];
  var retryTimer = null;
  var debounceSettingsTimer = null;
  var debounceProgressTimer = null;
  var activeFlushPromise = null;

  function getSyncState() {
    return Object.assign({}, syncState);
  }

  function setSyncState(patch) {
    Object.assign(syncState, patch);
    for (var i = 0; i < stateListeners.length; i++) {
      try {
        stateListeners[i](getSyncState());
      } catch (_e) {}
    }
    if (typeof root !== "undefined" && typeof root.dispatchEvent === "function" && typeof CustomEvent === "function") {
      try {
        root.dispatchEvent(new CustomEvent("pkSyncStatusChanged", { detail: getSyncState() }));
      } catch (_e) {}
    }
  }

  function onSyncStateChange(fn) {
    if (typeof fn === "function") {
      stateListeners.push(fn);
      fn(getSyncState());
    }
    return function unsubscribe() {
      stateListeners = stateListeners.filter(function (cb) { return cb !== fn; });
    };
  }

  function isBrowserOnline() {
    if (typeof navigator !== "undefined" && typeof navigator.onLine === "boolean") {
      return navigator.onLine;
    }
    return true;
  }

  function resolveSupabaseClient(customClient) {
    if (customClient) return customClient;
    var winObj = (typeof window !== "undefined" && window) ? window : null;
    if (winObj && winObj.PKSupabaseConfig && typeof winObj.PKSupabaseConfig.getSupabaseClient === "function") {
      return winObj.PKSupabaseConfig.getSupabaseClient();
    }
    if (root && root.PKSupabaseConfig && typeof root.PKSupabaseConfig.getSupabaseClient === "function") {
      return root.PKSupabaseConfig.getSupabaseClient();
    }
    return null;
  }

  async function getAuthenticatedUser(customClient) {
    var client = resolveSupabaseClient(customClient);
    if (client && client.auth) {
      try {
        var res = await client.auth.getUser();
        if (res && res.data && res.data.user && isValidUuid(res.data.user.id)) {
          return res.data.user;
        }
      } catch (_e) {}
      return null;
    }
    // Seamless local account session support when running without cloud keys
    try {
      if (typeof localStorage !== "undefined") {
        var rawSess = localStorage.getItem("khmerAuthSession");
        if (rawSess) {
          var sess = JSON.parse(rawSess);
          if (sess && sess.email) {
            var users = JSON.parse(localStorage.getItem("khmerAuthUsers") || "{}");
            var rec = users[String(sess.email).trim().toLowerCase()];
            if (rec && isValidUuid(rec.id)) {
              return {
                id: rec.id,
                email: rec.email,
                user_metadata: { display_name: rec.username }
              };
            }
          }
        }
      }
    } catch (_e2) {}
    return null;
  }

  /* ---------- Queue Execution & Exponential Backoff ---------- */

  async function executeSingleQueuedOp(client, user, op) {
    if (!user || op.userId !== user.id) {
      throw new Error("Queue operation ownership mismatch.");
    }
    if (op.type === "upsert_settings") {
      var check = validateSettingsPayload(op.payload);
      if (!check.valid) throw new Error(check.error);
      var res1 = await client
        .from("user_settings")
        .upsert(
          {
            user_id: user.id,
            settings: check.settings,
            updated_at: new Date().toISOString()
          },
          { onConflict: "user_id" }
        );
      if (res1 && res1.error) throw new Error(res1.error.message || "Failed to sync settings.");
      return true;
    }

    if (op.type === "upsert_lesson") {
      var lid = op.payload && op.payload.lesson_id;
      var prog = op.payload && op.payload.progress;
      if (!validateLessonId(lid)) throw new Error("Invalid lesson_id: " + lid);
      var res2 = await client
        .from("lesson_progress")
        .upsert(
          {
            user_id: user.id,
            lesson_id: lid,
            progress: prog || {},
            updated_at: new Date().toISOString()
          },
          { onConflict: "user_id,lesson_id" }
        );
      if (res2 && res2.error) throw new Error(res2.error.message || "Failed to sync lesson progress.");
      return true;
    }

    if (op.type === "update_profile") {
      var displayName = op.payload && op.payload.display_name ? String(op.payload.display_name).trim().slice(0, 64) : null;
      var patch = {
        id: user.id,
        display_name: displayName,
        updated_at: new Date().toISOString()
      };
      if (op.payload && op.payload.avatar_storage_path !== undefined) {
        patch.avatar_storage_path = op.payload.avatar_storage_path;
      }
      var res3 = await client.from("profiles").upsert(patch, { onConflict: "id" });
      if (res3 && res3.error) throw new Error(res3.error.message || "Failed to update profile.");
      return true;
    }

    return true;
  }

  function scheduleQueueRetry(attemptCount, customClient) {
    if (retryTimer) clearTimeout(retryTimer);
    if (attemptCount > 6) return;
    var delayMs = Math.min(60000, 1000 * Math.pow(2, Math.max(0, attemptCount - 1)));
    retryTimer = setTimeout(function () {
      flushOfflineQueue({ client: customClient });
    }, delayMs);
  }

  async function flushOfflineQueue(options) {
    var opts = options || {};
    if (activeFlushPromise) return activeFlushPromise;

    activeFlushPromise = (async function () {
      var client = resolveSupabaseClient(opts.client);
      var user = opts.user || (await getAuthenticatedUser(client));
      if (!user) {
        setSyncState({ status: "anonymous", userId: null, email: null, queuedCount: 0 });
        return { ok: false, error: "Please sign in to continue." };
      }

      if (!client) {
        await clearUserQueue(user.id);
        var nowLocalIso = new Date().toISOString();
        try {
          if (typeof localStorage !== "undefined") localStorage.setItem(LS_LAST_SYNC_AT, nowLocalIso);
        } catch (_e) {}
        setSyncState({
          status: "synced",
          userId: user.id,
          email: user.email || null,
          queuedCount: 0,
          lastSyncedAt: nowLocalIso,
          errorMessage: null
        });
        return { ok: true, flushed: 0, localMode: true };
      }

      var pending = await getQueuedOperations(user.id);
      if (pending.length === 0) {
        var lastAt = (typeof localStorage !== "undefined" && localStorage.getItem(LS_LAST_SYNC_AT)) || syncState.lastSyncedAt;
        setSyncState({
          status: isBrowserOnline() ? "synced" : "offline",
          userId: user.id,
          email: user.email || null,
          queuedCount: 0,
          lastSyncedAt: lastAt || new Date().toISOString(),
          errorMessage: null
        });
        return { ok: true, flushed: 0 };
      }

      if (!isBrowserOnline()) {
        setSyncState({
          status: "offline",
          userId: user.id,
          email: user.email || null,
          queuedCount: pending.length,
          errorMessage: "Offline — changes saved locally and queued for sync."
        });
        return { ok: false, offline: true, queuedCount: pending.length };
      }

      setSyncState({
        status: "syncing",
        userId: user.id,
        email: user.email || null,
        queuedCount: pending.length,
        errorMessage: null
      });

      var flushedCount = 0;
      var maxAttemptsSeen = 0;
      var lastErr = null;

      for (var i = 0; i < pending.length; i++) {
        var item = pending[i];
        try {
          await executeSingleQueuedOp(client, user, item);
          await removeQueuedOperation(item.id);
          flushedCount++;
        } catch (err) {
          lastErr = err && err.message ? err.message : "Cloud sync error.";
          item.attempts = Number(item.attempts || 0) + 1;
          item.lastError = lastErr;
          maxAttemptsSeen = Math.max(maxAttemptsSeen, item.attempts);
          await enqueueSyncOperation(item);
        }
      }

      var remaining = await getQueuedOperations(user.id);
      if (remaining.length === 0) {
        var nowIso = new Date().toISOString();
        try {
          if (typeof localStorage !== "undefined") localStorage.setItem(LS_LAST_SYNC_AT, nowIso);
        } catch (_e) {}
        setSyncState({
          status: "synced",
          userId: user.id,
          email: user.email || null,
          queuedCount: 0,
          lastSyncedAt: nowIso,
          errorMessage: null
        });
        return { ok: true, flushed: flushedCount };
      } else {
        setSyncState({
          status: isBrowserOnline() ? "error" : "offline",
          userId: user.id,
          email: user.email || null,
          queuedCount: remaining.length,
          errorMessage: lastErr || "Some changes could not be synchronized."
        });
        if (isBrowserOnline()) {
          scheduleQueueRetry(maxAttemptsSeen, client);
        }
        return { ok: false, flushed: flushedCount, queuedCount: remaining.length, error: lastErr };
      }
    })();

    try {
      return await activeFlushPromise;
    } finally {
      activeFlushPromise = null;
    }
  }

  /* ---------- Initial Sign-In Reconciliation ---------- */

  /**
   * Performs full bidirectional reconciliation when a user signs in or restores a session.
   * Prevents cross-account local data leakage if another user previously used this browser.
   */
  async function reconcileOnSignIn(options) {
    var opts = options || {};
    if (opts && isValidUuid(opts.id) && !opts.user && !opts.client) {
      opts = { user: opts };
    }
    var client = resolveSupabaseClient(opts.client);
    var user = opts.user || (await getAuthenticatedUser(client));
    if (!user || !isValidUuid(user.id)) {
      setSyncState({ status: "anonymous", userId: null, email: null });
      return { ok: false, error: "Please sign in to continue." };
    }

    if (!client) {
      var nowLocal = new Date().toISOString();
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(LS_LAST_OWNER, user.id);
          localStorage.setItem(LS_LAST_SYNC_AT, nowLocal);
        }
      } catch (_e) {}
      setSyncState({
        status: "synced",
        userId: user.id,
        email: user.email || null,
        queuedCount: 0,
        lastSyncedAt: nowLocal,
        errorMessage: null
      });
      return { ok: true, localMode: true };
    }

    var previousOwnerId = null;
    try {
      if (typeof localStorage !== "undefined") {
        previousOwnerId = localStorage.getItem(LS_LAST_OWNER);
      }
    } catch (_e) {}

    // Cross-account isolation guard:
    // If local data on this browser belonged to a DIFFERENT authenticated user,
    // do not silently merge User A's progress into User B's account!
    var isDifferentPreviousOwner = Boolean(previousOwnerId && previousOwnerId !== user.id);
    if (isDifferentPreviousOwner && hasNonEmptyLocalProgress()) {
      var shouldImportForeignLocal = false;
      if (typeof opts.onCrossAccountConflict === "function") {
        shouldImportForeignLocal = Boolean(await opts.onCrossAccountConflict({
          previousUserId: previousOwnerId,
          newUserId: user.id,
          newUserEmail: user.email
        }));
      }
      if (!shouldImportForeignLocal) {
        clearLocalProgressForAccountSwitch();
        await clearUserQueue(previousOwnerId);
      }
    }

    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(LS_LAST_OWNER, user.id);
      }
    } catch (_e) {}

    if (!isBrowserOnline()) {
      var offlineQueue = await getQueuedOperations(user.id);
      setSyncState({
        status: "offline",
        userId: user.id,
        email: user.email || null,
        queuedCount: offlineQueue.length,
        errorMessage: "Offline — working from local storage."
      });
      return { ok: false, offline: true };
    }

    setSyncState({
      status: "syncing",
      userId: user.id,
      email: user.email || null,
      errorMessage: null
    });

    try {
      // 1. Flush any queued operations specifically belonging to this user first
      await flushOfflineQueue({ client: client, user: user });

      // 2. Fetch remote profile, settings, and lesson progress in parallel
      var results = await Promise.all([
        client.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        client.from("user_settings").select("*").eq("user_id", user.id).maybeSingle(),
        client.from("lesson_progress").select("*").eq("user_id", user.id)
      ]);

      var profRes = results[0];
      var setRes = results[1];
      var progRes = results[2];

      if (profRes.error) throw new Error(profRes.error.message || "Failed to load cloud profile.");
      if (setRes.error) throw new Error(setRes.error.message || "Failed to load cloud settings.");
      if (progRes.error) throw new Error(progRes.error.message || "Failed to load cloud lesson progress.");

      // 3. Ensure profile row exists
      var profile = profRes.data;
      var desiredDisplayName =
        (profile && profile.display_name) ||
        (user.user_metadata && (user.user_metadata.display_name || user.user_metadata.username)) ||
        (user.email ? user.email.split("@")[0] : "Learner");

      if (!profile) {
        var newProfRow = {
          id: user.id,
          display_name: String(desiredDisplayName).slice(0, 64),
          updated_at: new Date().toISOString()
        };
        var insProf = await client
          .from("profiles")
          .upsert(newProfRow, { onConflict: "id" });
        if (!insProf || !insProf.error) {
          profile = newProfRow;
        }
      }

      // 4. Reconcile user_settings
      var localSettings = isDifferentPreviousOwner ? {} : collectLocalSettingsSnapshot();
      var remoteSettings = (setRes.data && setRes.data.settings) || {};
      var mergedSettings = mergeSettings(localSettings, remoteSettings);
      applySettingsSnapshotToLocal(mergedSettings);

      await client.from("user_settings").upsert(
        {
          user_id: user.id,
          settings: mergedSettings,
          updated_at: new Date().toISOString()
        },
        { onConflict: "user_id" }
      );

      // 5. Reconcile lesson_progress
      var localProgressMap = isDifferentPreviousOwner ? {} : collectLocalLessonProgressMap();
      var remoteProgressRows = Array.isArray(progRes.data) ? progRes.data : [];
      var reconciled = reconcileLessonProgressMaps(localProgressMap, remoteProgressRows);

      applyMergedLessonProgressToLocal(reconciled.mergedMap);

      if (reconciled.toUpsertRemote.length > 0) {
        var batchRows = reconciled.toUpsertRemote.map(function (item) {
          return {
            user_id: user.id,
            lesson_id: item.lesson_id,
            progress: item.progress,
            updated_at: new Date().toISOString()
          };
        });
        var upRes = await client
          .from("lesson_progress")
          .upsert(batchRows, { onConflict: "user_id,lesson_id" });
        if (upRes.error) throw new Error(upRes.error.message || "Failed to push merged lesson progress.");
      }

      var nowIso = new Date().toISOString();
      try {
        if (typeof localStorage !== "undefined") localStorage.setItem(LS_LAST_SYNC_AT, nowIso);
      } catch (_e) {}

      var remainingQueue = await getQueuedOperations(user.id);
      setSyncState({
        status: "synced",
        userId: user.id,
        email: user.email || null,
        queuedCount: remainingQueue.length,
        lastSyncedAt: nowIso,
        errorMessage: null
      });

      return {
        ok: true,
        profile: profile,
        settings: mergedSettings,
        lessonCount: Object.keys(reconciled.mergedMap).length,
        pushedLessons: reconciled.toUpsertRemote.length
      };
    } catch (err) {
      var msg = err && err.message ? err.message : "Cloud reconciliation failed.";
      var q = await getQueuedOperations(user.id);
      setSyncState({
        status: isBrowserOnline() ? "error" : "offline",
        userId: user.id,
        email: user.email || null,
        queuedCount: q.length,
        errorMessage: msg
      });
      return { ok: false, error: msg };
    }
  }

  /* ---------- Ongoing Local-First Mutation Hooks ---------- */

  function recordLocalSettingTimestamp(key) {
    if (typeof localStorage === "undefined" || !key) return;
    try {
      var map = JSON.parse(localStorage.getItem(LS_SETTINGS_TIMESTAMPS) || "{}") || {};
      map[key] = Date.now();
      localStorage.setItem(LS_SETTINGS_TIMESTAMPS, JSON.stringify(map));
    } catch (_e) {}
  }

  async function queueSettingsSync(customSettings, options) {
    var opts = options || {};
    var client = resolveSupabaseClient(opts.client);
    var user = opts.user || (await getAuthenticatedUser(client));
    if (!user) return { queued: false, reason: "anonymous" };

    var snapshot = customSettings || collectLocalSettingsSnapshot();
    var check = validateSettingsPayload(snapshot);
    if (!check.valid) return { queued: false, error: check.error };

    await enqueueSyncOperation({
      userId: user.id,
      type: "upsert_settings",
      targetKey: "settings",
      payload: check.settings
    });

    if (opts.immediate) {
      return await flushOfflineQueue({ client: client, user: user });
    }

    if (debounceSettingsTimer) clearTimeout(debounceSettingsTimer);
    debounceSettingsTimer = setTimeout(function () {
      flushOfflineQueue({ client: client, user: user });
    }, 650);

    return { queued: true };
  }

  async function queueLessonProgressSync(lessonId, progressObj, options) {
    var opts = options || {};
    var client = resolveSupabaseClient(opts.client);
    var user = opts.user || (await getAuthenticatedUser(client));
    if (!user) return { queued: false, reason: "anonymous" };

    if (!validateLessonId(lessonId)) {
      return { queued: false, error: "Invalid lesson_id: " + lessonId };
    }

    await enqueueSyncOperation({
      userId: user.id,
      type: "upsert_lesson",
      targetKey: lessonId,
      payload: {
        lesson_id: lessonId,
        progress: progressObj || {}
      }
    });

    if (opts.immediate) {
      return await flushOfflineQueue({ client: client, user: user });
    }

    if (debounceProgressTimer) clearTimeout(debounceProgressTimer);
    debounceProgressTimer = setTimeout(function () {
      flushOfflineQueue({ client: client, user: user });
    }, 500);

    return { queued: true };
  }

  async function syncAllLocalNow(options) {
    var opts = options || {};
    var client = resolveSupabaseClient(opts.client);
    var user = opts.user || (await getAuthenticatedUser(client));
    if (!user) return { ok: false, error: "Sign in to synchronize with the cloud." };

    var settingsSnap = collectLocalSettingsSnapshot();
    await enqueueSyncOperation({
      userId: user.id,
      type: "upsert_settings",
      targetKey: "settings",
      payload: settingsSnap
    });

    var progMap = collectLocalLessonProgressMap();
    var lessonIds = Object.keys(progMap);
    for (var i = 0; i < lessonIds.length; i++) {
      var lid = lessonIds[i];
      if (!validateLessonId(lid)) continue;
      await enqueueSyncOperation({
        userId: user.id,
        type: "upsert_lesson",
        targetKey: lid,
        payload: {
          lesson_id: lid,
          progress: progMap[lid]
        }
      });
    }

    return await flushOfflineQueue({ client: client, user: user });
  }

  /* ---------- Private Cloud File Synchronization ('user-files' bucket) ---------- */

  var LS_LOCAL_FILES_INDEX = "pk_local_user_files_v1";

  function loadLocalFilesIndex() {
    try {
      if (typeof localStorage !== "undefined") {
        return JSON.parse(localStorage.getItem(LS_LOCAL_FILES_INDEX) || "{}") || {};
      }
    } catch (_e) {}
    return {};
  }

  function saveLocalFilesIndex(idx) {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(LS_LOCAL_FILES_INDEX, JSON.stringify(idx));
      }
    } catch (_e) {}
  }

  async function blobToTextOrBase64(fileOrBlob) {
    if (!fileOrBlob) return "";
    if (typeof fileOrBlob === "string") return fileOrBlob;
    if (typeof fileOrBlob.text === "function") {
      try {
        return await fileOrBlob.text();
      } catch (_e) {}
    }
    if (typeof Buffer !== "undefined" && Buffer.isBuffer(fileOrBlob)) {
      return fileOrBlob.toString("utf8");
    }
    return String(fileOrBlob);
  }

  async function uploadUserFile(fileOrBlob, meta, options) {
    try {
      var opts = options || {};
      var client = resolveSupabaseClient(opts.client);
      var user = opts.user || (await getAuthenticatedUser(client));
      if (!user || !isValidUuid(user.id)) {
        return { ok: false, error: "Please sign in to upload personal files." };
      }

      var fileName = (meta && meta.fileName) || (fileOrBlob && fileOrBlob.name) || "file.json";
      var mimeType = (meta && meta.mimeType) || (fileOrBlob && fileOrBlob.type) || "application/json";
      var sizeBytes = (meta && meta.sizeBytes !== undefined) ? meta.sizeBytes : (fileOrBlob && fileOrBlob.size !== undefined ? fileOrBlob.size : 0);
      var category = (meta && meta.category) || "backup";

      var check = validateFileForUpload({
        name: fileName,
        type: mimeType,
        size: sizeBytes,
        category: category
      });
      if (!check.valid) {
        return { ok: false, error: check.error };
      }

      var fileId = (meta && isValidUuid(meta.id)) ? meta.id : generateUuid();
      var storagePath = buildScopedStoragePath(user.id, fileId, check.safeName);
      var nowIso = new Date().toISOString();
      var metaRow = {
        id: fileId,
        user_id: user.id,
        storage_path: storagePath,
        file_name: check.safeName,
        file_category: check.category,
        mime_type: check.mimeType,
        size_bytes: check.sizeBytes,
        created_at: nowIso,
        updated_at: nowIso
      };

      // If singleton category (avatar or wallpaper), clean up previous files in that category first
      if (check.category === "avatar" || check.category === "wallpaper") {
        try {
          var existingRes = await listUserFiles({ category: check.category, client: client, user: user });
          var existingFiles = Array.isArray(existingRes) ? existingRes : (existingRes.files || []);
          for (var i = 0; i < existingFiles.length; i++) {
            await deleteUserFile(existingFiles[i].id, { client: client, user: user });
          }
        } catch (_cleanupErr) {}
      }

      if (!client) {
        var contentStr = await blobToTextOrBase64(fileOrBlob);
        await saveLocalFileCache("cloud_file_" + fileId, {
          metadata: metaRow,
          content: contentStr
        });
        var idx = loadLocalFilesIndex();
        if (!Array.isArray(idx[user.id])) idx[user.id] = [];
        idx[user.id] = idx[user.id].filter(function (f) { return f.id !== fileId; });
        idx[user.id].unshift(metaRow);
        saveLocalFilesIndex(idx);
        return Object.assign({ ok: true, file: metaRow }, metaRow);
      }

      // 1. Upload binary object to private 'user-files' bucket
      var upStorage = await client.storage
        .from("user-files")
        .upload(storagePath, fileOrBlob, {
          contentType: check.mimeType,
          upsert: false
        });

      if (upStorage && upStorage.error) {
        return { ok: false, error: upStorage.error.message || "Failed to upload file." };
      }

      // 2. Insert/Upsert metadata record in public.user_files
      var tbl = client.from("user_files");
      var dbOp = typeof tbl.insert === "function" ? tbl.insert(metaRow) : tbl.upsert(metaRow, { onConflict: "id" });
      var dbIns = (dbOp && typeof dbOp.select === "function")
        ? await dbOp.select("*").single()
        : await dbOp;

      if (dbIns && dbIns.error) {
        try {
          await client.storage.from("user-files").remove([storagePath]);
        } catch (_rbErr) {}
        return { ok: false, error: dbIns.error.message || "Failed to save file metadata." };
      }

      var savedFile = (dbIns && dbIns.data && !Array.isArray(dbIns.data)) ? dbIns.data : metaRow;
      return Object.assign({ ok: true, file: savedFile }, savedFile);
    } catch (err) {
      return { ok: false, error: (err && err.message) || "Failed to upload file." };
    }
  }

  async function listUserFiles(options) {
    try {
      var opts = options || {};
      var client = resolveSupabaseClient(opts.client);
      var user = opts.user || (await getAuthenticatedUser(client));
      if (!user || !isValidUuid(user.id)) {
        var anonArr = [];
        anonArr.ok = true;
        anonArr.files = [];
        return anonArr;
      }

      if (!client) {
        var idx = loadLocalFilesIndex();
        var userFiles = Array.isArray(idx[user.id]) ? idx[user.id].slice() : [];
        if (opts.category) {
          userFiles = userFiles.filter(function (f) { return f.file_category === opts.category; });
        }
        userFiles.ok = true;
        userFiles.files = userFiles;
        return userFiles;
      }

      var query = client
        .from("user_files")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (opts.category) {
        query = query.eq("file_category", opts.category);
      }

      var res = await query;
      if (res && res.error) {
        var errArr = [];
        errArr.ok = false;
        errArr.files = [];
        errArr.error = res.error.message || "Failed to list files.";
        return errArr;
      }
      var files = Array.isArray(res && res.data) ? res.data.slice() : [];
      files.ok = true;
      files.files = files;
      return files;
    } catch (err) {
      var catchArr = [];
      catchArr.ok = false;
      catchArr.files = [];
      catchArr.error = (err && err.message) || "Failed to list files.";
      return catchArr;
    }
  }

  async function downloadUserFile(fileIdOrRecord, options) {
    try {
      var opts = options || {};
      var client = resolveSupabaseClient(opts.client);
      var user = opts.user || (await getAuthenticatedUser(client));
      if (!user || !isValidUuid(user.id)) {
        return { ok: false, error: "Please sign in to download your files." };
      }

      if (!client) {
        var idx = loadLocalFilesIndex();
        var userFiles = Array.isArray(idx[user.id]) ? idx[user.id] : [];
        var targetId = typeof fileIdOrRecord === "string" ? fileIdOrRecord : (fileIdOrRecord && fileIdOrRecord.id);
        var localMeta = userFiles.find(function (f) { return f.id === targetId; }) || (typeof fileIdOrRecord === "object" ? fileIdOrRecord : null);
        if (!localMeta || localMeta.user_id !== user.id) {
          return { ok: false, error: "File not found or access denied." };
        }
        var cached = await getLocalFileCache("cloud_file_" + localMeta.id);
        var content = (cached && cached.content !== undefined) ? cached.content : "";
        var localBlob = typeof Blob === "function"
          ? new Blob([content], { type: localMeta.mime_type || "application/json" })
          : Buffer.from(String(content), "utf8");
        return {
          ok: true,
          metadata: localMeta,
          blob: localBlob
        };
      }

      var record = null;
      if (typeof fileIdOrRecord === "string") {
        var res = await client
          .from("user_files")
          .select("*")
          .eq("id", fileIdOrRecord)
          .eq("user_id", user.id);
        var rows = (res && Array.isArray(res.data)) ? res.data : (res && res.data ? [res.data] : []);
        if ((res && res.error) || rows.length === 0) {
          return { ok: false, error: "File not found or access denied." };
        }
        record = rows[0];
      } else if (fileIdOrRecord && typeof fileIdOrRecord === "object") {
        record = fileIdOrRecord;
      }

      if (!record || record.user_id !== user.id || String(record.storage_path || "").indexOf(user.id + "/") !== 0) {
        return { ok: false, error: "Security violation: cannot access another user's private storage path." };
      }

      var dl = await client.storage.from("user-files").download(record.storage_path);
      if (!dl || dl.error || !dl.data) {
        return { ok: false, error: (dl && dl.error && dl.error.message) || "Failed to download file." };
      }

      return {
        ok: true,
        metadata: record,
        blob: dl.data
      };
    } catch (err) {
      return { ok: false, error: (err && err.message) || "Failed to download file." };
    }
  }

  async function deleteUserFile(fileIdOrRecord, options) {
    try {
      var opts = options || {};
      var client = resolveSupabaseClient(opts.client);
      var user = opts.user || (await getAuthenticatedUser(client));
      if (!user || !isValidUuid(user.id)) {
        return { ok: false, error: "Please sign in to delete your files." };
      }

      if (!client) {
        var idx = loadLocalFilesIndex();
        var userFiles = Array.isArray(idx[user.id]) ? idx[user.id] : [];
        var targetId = typeof fileIdOrRecord === "string" ? fileIdOrRecord : (fileIdOrRecord && fileIdOrRecord.id);
        var found = userFiles.find(function (f) { return f.id === targetId; });
        if (!found) return { ok: false, deleted: false, error: "File not found." };
        idx[user.id] = userFiles.filter(function (f) { return f.id !== targetId; });
        saveLocalFilesIndex(idx);
        await deleteLocalFileCache("cloud_file_" + targetId);
        return { ok: true, deleted: true, id: targetId };
      }

      var record = null;
      if (typeof fileIdOrRecord === "string") {
        var res = await client
          .from("user_files")
          .select("*")
          .eq("id", fileIdOrRecord)
          .eq("user_id", user.id);
        var rows = (res && Array.isArray(res.data)) ? res.data : (res && res.data ? [res.data] : []);
        if (res && res.error) return { ok: false, error: res.error.message };
        record = rows[0] || null;
      } else if (fileIdOrRecord && typeof fileIdOrRecord === "object") {
        record = fileIdOrRecord;
      }

      if (!record) return { ok: false, deleted: false, error: "File not found." };
      if (record.user_id !== user.id || String(record.storage_path || "").indexOf(user.id + "/") !== 0) {
        return { ok: false, error: "Security violation: cannot delete another user's file." };
      }

      var stDel = await client.storage.from("user-files").remove([record.storage_path]);
      if (stDel && stDel.error) {
        return { ok: false, error: stDel.error.message || "Failed to remove file from storage bucket." };
      }

      var dbDel = await client
        .from("user_files")
        .delete()
        .eq("id", record.id)
        .eq("user_id", user.id);

      if (dbDel && dbDel.error) {
        return { ok: false, error: dbDel.error.message || "Failed to remove file metadata." };
      }

      await deleteLocalFileCache("cloud_file_" + record.id);
      return { ok: true, deleted: true, id: record.id };
    } catch (err) {
      return { ok: false, error: (err && err.message) || "Failed to delete file." };
    }
  }

  async function createCloudBackupSnapshot(options) {
    try {
      var opts = options || {};
      var client = resolveSupabaseClient(opts.client);
      var user = opts.user || (await getAuthenticatedUser(client));
      if (!user) return { ok: false, error: "Please sign in to save a backup snapshot." };

      var snapshot = {
        app: "PK Khmer Type",
        version: "2.4.0",
        createdAt: new Date().toISOString(),
        userId: user.id,
        settings: collectLocalSettingsSnapshot(),
        lessonProgress: collectLocalLessonProgressMap()
      };

      var jsonStr = JSON.stringify(snapshot, null, 2);
      var dateTag = snapshot.createdAt.slice(0, 10);
      var fileName = "pk-khmer-backup-" + dateTag + ".json";
      var blob = typeof Blob === "function"
        ? new Blob([jsonStr], { type: "application/json" })
        : Buffer.from(jsonStr, "utf8");
      var sizeBytes = typeof blob.size === "number" ? blob.size : Buffer.byteLength(jsonStr, "utf8");

      return await uploadUserFile(
        blob,
        {
          fileName: fileName,
          mimeType: "application/json",
          sizeBytes: sizeBytes,
          category: "backup"
        },
        { client: client, user: user }
      );
    } catch (err) {
      return { ok: false, error: (err && err.message) || "Failed to create backup snapshot." };
    }
  }

  async function restoreCloudBackupSnapshot(fileId, options) {
    try {
      var opts = options || {};
      var dl = await downloadUserFile(fileId, opts);
      if (!dl || !dl.ok) {
        return { ok: false, error: (dl && dl.error) || "Could not load backup snapshot." };
      }
      var text = "";
      if (dl.blob && typeof dl.blob.text === "function") {
        text = await dl.blob.text();
      } else if (typeof Buffer !== "undefined" && Buffer.isBuffer(dl.blob)) {
        text = dl.blob.toString("utf8");
      } else {
        text = String(dl.blob || "");
      }

      var parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== "object") {
        return { ok: false, error: "Invalid backup snapshot format." };
      }

      if (parsed.settings && typeof parsed.settings === "object") {
        var mergedSet = mergeSettings(collectLocalSettingsSnapshot(), parsed.settings);
        applySettingsSnapshotToLocal(mergedSet);
      }
      if (parsed.lessonProgress && typeof parsed.lessonProgress === "object") {
        var curMap = collectLocalLessonProgressMap();
        var fakeRows = Object.keys(parsed.lessonProgress).map(function (lid) {
          return { lesson_id: lid, progress: parsed.lessonProgress[lid] };
        });
        var rec = reconcileLessonProgressMaps(curMap, fakeRows);
        applyMergedLessonProgressToLocal(rec.mergedMap);
      }

      await syncAllLocalNow(opts);
      return { ok: true, restored: true, metadata: dl.metadata };
    } catch (err) {
      return { ok: false, error: (err && err.message) || "Failed to restore backup snapshot." };
    }
  }

  /* ---------- Safe Account & Private Cloud Data Deletion ---------- */

  async function clearStateOnSignOut() {
    var uid = syncState.userId;
    if (uid) {
      await clearUserQueue(uid);
    }
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(LS_LAST_OWNER);
        localStorage.removeItem(LS_LAST_SYNC_AT);
      }
    } catch (_e) {}
    setSyncState({
      status: "anonymous",
      userId: null,
      email: null,
      queuedCount: 0,
      lastSyncedAt: null,
      errorMessage: null
    });
    return { ok: true };
  }

  async function deleteAccountAndCloudData(options) {
    try {
      var opts = options || {};
      var client = resolveSupabaseClient(opts.client);
      var user = opts.user || (await getAuthenticatedUser(client));
      if (!user || !isValidUuid(user.id)) {
        return { ok: false, error: "You must be signed in to delete your account." };
      }

      if (!client) {
        var idx = loadLocalFilesIndex();
        var uFiles = Array.isArray(idx[user.id]) ? idx[user.id] : [];
        for (var i = 0; i < uFiles.length; i++) {
          await deleteLocalFileCache("cloud_file_" + uFiles[i].id);
        }
        delete idx[user.id];
        saveLocalFilesIndex(idx);
        try {
          if (typeof localStorage !== "undefined") {
            var usersMap = JSON.parse(localStorage.getItem("khmerAuthUsers") || "{}");
            if (user.email) {
              delete usersMap[String(user.email).trim().toLowerCase()];
            }
            Object.keys(usersMap).forEach(function (k) {
              if (usersMap[k] && usersMap[k].id === user.id) delete usersMap[k];
            });
            localStorage.setItem("khmerAuthUsers", JSON.stringify(usersMap));
            localStorage.removeItem("khmerAuthSession");
          }
        } catch (_e) {}
        await clearStateOnSignOut();
        if (opts.clearLocalData) {
          clearLocalProgressForAccountSwitch();
        }
        return { ok: true, deleted: true };
      }

      // 1. Delete all user files in storage bucket 'user-files' via Storage API first
      try {
        var filesRes = await listUserFiles({ client: client, user: user });
        var files = Array.isArray(filesRes) ? filesRes : (filesRes.files || []);
        if (files.length > 0) {
          var paths = files.map(function (f) { return f.storage_path; }).filter(Boolean);
          if (paths.length > 0) {
            await client.storage.from("user-files").remove(paths);
          }
        }
      } catch (_storageErr) {}

      // 2. Call atomic SECURITY DEFINER RPC public.delete_own_account()
      var rpcRes = await client.rpc("delete_own_account");
      if (rpcRes && rpcRes.error) {
        await client.from("user_files").delete().eq("user_id", user.id);
        await client.from("lesson_progress").delete().eq("user_id", user.id);
        await client.from("user_settings").delete().eq("user_id", user.id);
        await client.from("profiles").delete().eq("id", user.id);
        return { ok: false, error: rpcRes.error.message || "Could not complete account deletion." };
      }

      // 3. Clear local queue, owner marker, and optionally local progress
      await clearStateOnSignOut();

      if (opts.clearLocalData) {
        clearLocalProgressForAccountSwitch();
      }

      try {
        await client.auth.signOut();
      } catch (_soErr) {}

      return { ok: true, deleted: true };
    } catch (err) {
      return { ok: false, error: (err && err.message) || "Failed to delete account." };
    }
  }

  /* ---------- Browser Event Listeners ---------- */

  if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
    window.addEventListener("online", function () {
      flushOfflineQueue();
    });
    window.addEventListener("offline", function () {
      if (syncState.userId) {
        getQueuedOperations(syncState.userId).then(function (q) {
          setSyncState({
            status: "offline",
            queuedCount: q.length,
            errorMessage: "Offline — changes are saved locally and will sync when reconnected."
          });
        });
      }
    });
  }

  return {
    ALLOWED_SETTING_KEYS: ALLOWED_SETTING_KEYS,
    ALLOWED_MIME_TYPES: ALLOWED_MIME_TYPES,
    MAX_FILE_SIZE_BYTES: MAX_FILE_SIZE_BYTES,
    isValidUuid: isValidUuid,
    sanitizeFileName: sanitizeFileName,
    buildScopedStoragePath: buildScopedStoragePath,
    validateFileForUpload: validateFileForUpload,
    validateSettingsPayload: validateSettingsPayload,
    validateLessonId: validateLessonId,
    mergeSettings: mergeSettings,
    mergeLessonRecord: mergeLessonRecord,
    reconcileLessonProgressMaps: reconcileLessonProgressMaps,
    collectLocalSettingsSnapshot: collectLocalSettingsSnapshot,
    applySettingsSnapshotToLocal: applySettingsSnapshotToLocal,
    collectLocalLessonProgressMap: collectLocalLessonProgressMap,
    applyMergedLessonProgressToLocal: applyMergedLessonProgressToLocal,
    clearLocalProgressForAccountSwitch: clearLocalProgressForAccountSwitch,
    recordLocalSettingTimestamp: recordLocalSettingTimestamp,
    getQueuedOperations: getQueuedOperations,
    enqueueSyncOperation: enqueueSyncOperation,
    removeQueuedOperation: removeQueuedOperation,
    clearUserQueue: clearUserQueue,
    saveLocalFileCache: saveLocalFileCache,
    getLocalFileCache: getLocalFileCache,
    deleteLocalFileCache: deleteLocalFileCache,
    getSyncState: getSyncState,
    onSyncStateChange: onSyncStateChange,
    flushOfflineQueue: flushOfflineQueue,
    reconcileOnSignIn: reconcileOnSignIn,
    queueSettingsSync: queueSettingsSync,
    queueLessonProgressSync: queueLessonProgressSync,
    syncAllLocalNow: syncAllLocalNow,
    syncAllNow: syncAllLocalNow,
    clearStateOnSignOut: clearStateOnSignOut,
    uploadUserFile: uploadUserFile,
    listUserFiles: listUserFiles,
    downloadUserFile: downloadUserFile,
    deleteUserFile: deleteUserFile,
    createCloudBackupSnapshot: createCloudBackupSnapshot,
    restoreCloudBackupSnapshot: restoreCloudBackupSnapshot,
    deleteAccountAndCloudData: deleteAccountAndCloudData
  };
});
