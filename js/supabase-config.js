/* ============================================================================
 * PK Khmer Type — Supabase Environment Validation & Reusable Client Singleton
 * Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from Vite / runtime env,
 * validates configuration (rejecting service_role/secret keys), and creates a
 * single reusable @supabase/supabase-js client.
 * ============================================================================ */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(root);
  } else {
    root.PKSupabaseConfig = factory(root);
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : this, function (root) {
  "use strict";

  var cachedClient = null;
  var cachedClientKey = "";

  function readRawEnv(overrides, secondArgKey) {
    if (typeof overrides === "string" || typeof secondArgKey === "string") {
      return {
        url: String(overrides || "").trim(),
        anonKey: String(secondArgKey || "").trim()
      };
    }
    var src = overrides || {};
    var winObj = (typeof window !== "undefined" && window) ? window : root;
    var viteWin = (winObj && (winObj.__PK_SUPABASE_ENV__ || winObj.__PK_VITE_ENV__)) || {};
    var nodeEnv = (typeof process !== "undefined" && process && process.env) ? process.env : {};

    var url =
      src.VITE_SUPABASE_URL !== undefined ? src.VITE_SUPABASE_URL :
      viteWin.VITE_SUPABASE_URL !== undefined ? viteWin.VITE_SUPABASE_URL :
      nodeEnv.VITE_SUPABASE_URL !== undefined ? nodeEnv.VITE_SUPABASE_URL :
      "";

    var anonKey =
      src.VITE_SUPABASE_ANON_KEY !== undefined ? src.VITE_SUPABASE_ANON_KEY :
      viteWin.VITE_SUPABASE_ANON_KEY !== undefined ? viteWin.VITE_SUPABASE_ANON_KEY :
      nodeEnv.VITE_SUPABASE_ANON_KEY !== undefined ? nodeEnv.VITE_SUPABASE_ANON_KEY :
      "";

    return {
      url: String(url || "").trim(),
      anonKey: String(anonKey || "").trim()
    };
  }

  /**
   * Validates VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
   * Explicitly rejects service_role / secret keys in frontend configuration.
   */
  function validateSupabaseConfig(customEnvOrUrl, maybeAnonKey) {
    var raw = readRawEnv(customEnvOrUrl, maybeAnonKey);
    var url = raw.url;
    var anonKey = raw.anonKey;
    var errors = [];

    if (!url || /your-project-ref\.supabase\.co/i.test(url)) {
      errors.push("Missing or placeholder VITE_SUPABASE_URL environment variable.");
    } else {
      try {
        var parsed = new URL(url);
        var isLocal = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
        if (parsed.protocol !== "https:" && !(isLocal && parsed.protocol === "http:")) {
          errors.push("VITE_SUPABASE_URL must use https:// (or http://localhost for local development).");
        }
      } catch (_e) {
        errors.push("VITE_SUPABASE_URL is not a valid URL.");
      }
    }

    if (!anonKey || /^your-(anon|publishable)-key/i.test(anonKey)) {
      errors.push("Missing or placeholder VITE_SUPABASE_ANON_KEY environment variable.");
    } else {
      if (anonKey.indexOf("sb_secret_") === 0 || /service_role/i.test(anonKey)) {
        errors.push("SECURITY ERROR: VITE_SUPABASE_ANON_KEY contains a secret or service_role key. Never expose privileged keys in frontend code.");
      } else if (anonKey.length < 20) {
        errors.push("VITE_SUPABASE_ANON_KEY appears truncated or invalid.");
      } else if (anonKey.split(".").length === 3) {
        try {
          var part = anonKey.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
          var jsonStr = typeof Buffer !== "undefined"
            ? Buffer.from(part, "base64").toString("utf8")
            : (typeof atob === "function" ? atob(part) : "");
          if (jsonStr) {
            var payload = JSON.parse(jsonStr);
            if (payload && payload.role && payload.role !== "anon" && payload.role !== "authenticated") {
              errors.push("SECURITY ERROR: JWT role '" + payload.role + "' is not permitted in frontend configuration. Use only the public anon or publishable key.");
            }
          }
        } catch (_jwtErr) {}
      }
    }

    var errJoined = errors.join(" ");
    var setupMessage = errors.length > 0
      ? "Supabase Cloud Sync is not configured (" + errJoined + "). Copy .env.example to .env.local, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, and run npm run build."
      : "";

    return {
      valid: errors.length === 0,
      configured: Boolean(url && anonKey && errors.length === 0),
      url: url ? url.replace(/\/+$/, "") : "",
      anonKey: anonKey,
      errors: errors,
      error: errJoined,
      setupMessage: setupMessage
    };
  }

  function isSupabaseConfigured(customEnv) {
    return validateSupabaseConfig(customEnv).configured;
  }

  function getSupabaseSetupError(customEnv) {
    return validateSupabaseConfig(customEnv).setupMessage;
  }

  /**
   * Computes the full redirect URL preserving GitHub Pages / Vite base path (/PK-Khmer-Type/).
   */
  function getAuthRedirectUrl(queryOrHash) {
    if (typeof window === "undefined" || !window.location) {
      return "https://phanaach4889.github.io/PK-Khmer-Type/" + (queryOrHash || "");
    }
    var origin = window.location.origin;
    var pathname = window.location.pathname || "/";
    var baseDir = pathname.replace(/\/(index|dashboard)\.html$/i, "/");
    if (!baseDir.endsWith("/")) {
      baseDir += "/";
    }
    return origin + baseDir + (queryOrHash || "");
  }

  function resolveCreateClientFn() {
    var winObj = (typeof window !== "undefined" && window) ? window : root;
    if (winObj && winObj.supabase && typeof winObj.supabase.createClient === "function") {
      return winObj.supabase.createClient;
    }
    if (root && root.supabase && typeof root.supabase.createClient === "function") {
      return root.supabase.createClient;
    }
    if (typeof require === "function") {
      try {
        var mod = require("@supabase/supabase-js");
        if (mod && typeof mod.createClient === "function") {
          return mod.createClient;
        }
      } catch (_e) {}
    }
    return null;
  }

  /**
   * Returns the single reusable Supabase client instance, or null if not configured.
   */
  function getSupabaseClient(options) {
    var opts = options || {};
    var check = validateSupabaseConfig(opts.env);
    if (!check.valid) {
      return null;
    }

    var keySig = check.url + "::" + check.anonKey;
    if (cachedClient && cachedClientKey === keySig && !opts.forceNew) {
      return cachedClient;
    }

    var createClient = opts.createClient || resolveCreateClientFn();
    if (typeof createClient !== "function") {
      return null;
    }

    var clientOpts = {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: typeof window !== "undefined",
        storageKey: "pk_khmer_type_supabase_auth"
      }
    };
    if (opts.authStorage) {
      clientOpts.auth.storage = opts.authStorage;
    }
    if (opts.customFetch) {
      clientOpts.global = { fetch: opts.customFetch };
    }

    cachedClient = createClient(check.url, check.anonKey, clientOpts);
    cachedClientKey = keySig;
    return cachedClient;
  }

  function resetClientForTesting() {
    cachedClient = null;
    cachedClientKey = "";
  }

  return {
    readRawEnv: readRawEnv,
    validateSupabaseConfig: validateSupabaseConfig,
    isSupabaseConfigured: isSupabaseConfigured,
    getSupabaseSetupError: getSupabaseSetupError,
    getAuthRedirectUrl: getAuthRedirectUrl,
    getSupabaseClient: getSupabaseClient,
    resetClientForTesting: resetClientForTesting
  };
});
