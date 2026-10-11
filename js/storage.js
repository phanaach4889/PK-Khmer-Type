/* ============================================================
   PK Khmer Type — Storage, Supabase Authentication & Cloud Sync UI
   ============================================================ */

/* Global Physics-Based Modal Dismissal Utility */
function closeModalAnimated(modalEl, onClosed) {
  if (!modalEl || modalEl.hidden) {
    if (typeof onClosed === 'function') onClosed();
    return;
  }
  if (
    document.documentElement.classList.contains('performance-mode') ||
    document.documentElement.classList.contains('reduce-motion') ||
    document.documentElement.classList.contains('anim-mode-off')
  ) {
    modalEl.classList.remove('is-closing');
    modalEl.hidden = true;
    if (typeof onClosed === 'function') onClosed();
    return;
  }
  if (modalEl.classList.contains('is-closing')) return;
  modalEl.classList.add('is-closing');
  let settled = false;
  const finalize = () => {
    if (settled) return;
    settled = true;
    modalEl.classList.remove('is-closing');
    modalEl.hidden = true;
    if (typeof onClosed === 'function') onClosed();
  };
  const onEnd = (e) => {
    if (e.target === modalEl) finalize();
  };
  modalEl.addEventListener('animationend', onEnd, { once: true });
  setTimeout(finalize, 230);
}
window.closeModalAnimated = closeModalAnimated;

/* ============================================================
   Deterministic Per-Account SVG Avatar Generator
   ============================================================ */
(function initAvatarGenerator() {
  function seededRng(seed) {
    let h = 1779033703 ^ seed.length;
    for (let i = 0; i < seed.length; i++) {
      h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      h ^= h >>> 16;
      return (h >>> 0) / 4294967296;
    };
  }

  const AVATAR_PALETTES = [
    ['#ffd166', '#2d6cb3'],
    ['#2dd4a7', '#2d6cb3'],
    ['#ff3b56', '#a13d47'],
    ['#5fd694', '#238a5a'],
    ['#b98af0', '#6b3fb0'],
    ['#ff8a5c', '#e63e8c'],
    ['#63d6c9', '#268f83'],
    ['#ffe066', '#ff9f1c']
  ];
  const AVATAR_ICON_KEYS = [
    'user', 'star', 'flame', 'zap', 'crown', 'castle',
    'flag', 'trophy', 'target', 'key', 'sword', 'award'
  ];

  function generateAvatarDataUri(seed) {
    const rng = seededRng(String(seed || Math.random()));
    const [c1, c2] = AVATAR_PALETTES[Math.floor(rng() * AVATAR_PALETTES.length)];
    const iconKey = AVATAR_ICON_KEYS[Math.floor(rng() * AVATAR_ICON_KEYS.length)];
    const iconsMap = typeof PK_ICONS !== 'undefined' ? PK_ICONS : {};
    const iconSvg = iconsMap[iconKey] || iconsMap.user || '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>';
    const angle = Math.floor(rng() * 360);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="g" gradientTransform="rotate(${angle})">
          <stop offset="0%" stop-color="${c1}"/>
          <stop offset="100%" stop-color="${c2}"/>
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="32" fill="url(#g)"/>
      <g transform="translate(40, 40) scale(3.333)" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        ${iconSvg}
      </g>
    </svg>`;
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  }

  window.generateAvatarDataUri = generateAvatarDataUri;
})();

/* ============================================================
   Hybrid Cloud + Local AuthProvider (Normal User Errors Only)
   ============================================================ */
const AuthProvider = (function () {
  const AVATAR_CACHE_PREFIX = 'pk_user_avatar_';
  const USERS_KEY = 'khmerAuthUsers';
  const SESSION_KEY = 'khmerAuthSession';
  let pendingRecoveryEmail = null;

  function loadLocalUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || '{}') || {};
    } catch (e) {
      return {};
    }
  }

  function saveLocalUsers(users) {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (e) {}
  }

  function bufToHex(buf) {
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async function sha256Hex(text) {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle && typeof TextEncoder !== 'undefined') {
      const data = new TextEncoder().encode(text);
      const digest = await window.crypto.subtle.digest('SHA-256', data);
      return bufToHex(digest);
    }
    let h1 = 0xdeadbeef ^ text.length;
    let h2 = 0x41c6ce57 ^ text.length;
    for (let i = 0; i < text.length; i++) {
      const ch = text.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
  }

  function randomSalt() {
    const arr = new Uint8Array(16);
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(arr);
    } else {
      for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
    }
    return bufToHex(arr.buffer);
  }

  async function hashPassword(password, salt) {
    return sha256Hex(salt + ':' + String(password));
  }

  function generateUserUuid(seedStr) {
    if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    let s = String(seedStr || '') + ':' + Date.now() + ':' + Math.random();
    let hex = '';
    for (let i = 0; i < 32; i++) {
      const c = (s.charCodeAt(i % s.length) + i * 17 + Math.floor(Math.random() * 16)) & 0xf;
      hex += c.toString(16);
    }
    return (
      hex.slice(0, 8) + '-' +
      hex.slice(8, 12) + '-4' +
      hex.slice(13, 16) + '-a' +
      hex.slice(17, 20) + '-' +
      hex.slice(20, 32)
    );
  }

  function formatLocalUser(record) {
    if (!record) return null;
    let cachedAvatar = null;
    try {
      if (record.id) cachedAvatar = localStorage.getItem(AVATAR_CACHE_PREFIX + record.id);
    } catch (e) {}
    const avatar =
      cachedAvatar ||
      record.avatar ||
      (typeof window.generateAvatarDataUri === 'function'
        ? window.generateAvatarDataUri(record.id || record.email)
        : null);
    return {
      id: record.id,
      username: record.username,
      email: record.email,
      createdAt: record.createdAt || null,
      emailConfirmedAt: record.createdAt || null,
      avatar: avatar
    };
  }

  function getClientOrError() {
    if (!window.PKSupabaseConfig || typeof window.PKSupabaseConfig.getSupabaseClient !== 'function') {
      return {
        client: null,
        error: 'Cloud service is not configured.'
      };
    }
    if (!window.PKSupabaseConfig.isSupabaseConfigured()) {
      return {
        client: null,
        error: window.PKSupabaseConfig.getSupabaseSetupError() || 'Cloud service is not configured.'
      };
    }
    const client = window.PKSupabaseConfig.getSupabaseClient();
    if (!client) {
      return {
        client: null,
        error: window.PKSupabaseConfig.getSupabaseSetupError() || 'Unable to initialize cloud client.'
      };
    }
    return { client, error: null };
  }

  function formatSupabaseUser(sbUser, profileRow) {
    if (!sbUser) return null;
    const meta = sbUser.user_metadata || {};
    const email = sbUser.email || '';
    const displayName =
      (profileRow && profileRow.display_name) ||
      meta.display_name ||
      meta.username ||
      (email ? email.split('@')[0] : 'Scribe');
    let cachedAvatar = null;
    try {
      cachedAvatar = localStorage.getItem(AVATAR_CACHE_PREFIX + sbUser.id);
    } catch (e) {}
    const avatar =
      cachedAvatar ||
      meta.avatar_data_uri ||
      (typeof window.generateAvatarDataUri === 'function'
        ? window.generateAvatarDataUri(sbUser.id || email)
        : null);

    return {
      id: sbUser.id,
      username: displayName,
      email: email,
      createdAt: sbUser.created_at || null,
      emailConfirmedAt: sbUser.email_confirmed_at || sbUser.confirmed_at || null,
      avatar: avatar
    };
  }

  function normalizeAuthError(err, fallbackMsg) {
    if (!err) return fallbackMsg || 'Unable to sign in. Please try again.';
    const raw = String(err.message || err.error_description || err || '').trim();
    const lower = raw.toLowerCase();
    if (lower.includes('invalid login credentials') || lower.includes('invalid email or password')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (lower.includes('email not confirmed')) {
      return 'Your email address has not been confirmed yet. Please check your inbox for the verification link.';
    }
    if (lower.includes('user already registered') || lower.includes('already been registered')) {
      return 'An account with this email address already exists. Please sign in instead.';
    }
    if (lower.includes('rate limit') || lower.includes('too many requests') || lower.includes('security purposes')) {
      return 'Too many attempts in a short period. Please wait a moment and try again.';
    }
    if (lower.includes('password should be at least')) {
      return 'Password must be at least 8 characters.';
    }
    if (lower.includes('same_password') || lower.includes('different from the old password')) {
      return 'New password must be different from your current password.';
    }
    return raw || fallbackMsg || 'Unable to complete request. Please try again.';
  }

  return {
    isConfigured() {
      return Boolean(
        window.PKSupabaseConfig &&
        typeof window.PKSupabaseConfig.isSupabaseConfigured === 'function' &&
        window.PKSupabaseConfig.isSupabaseConfigured()
      );
    },

    getSetupError() {
      if (!window.PKSupabaseConfig || typeof window.PKSupabaseConfig.getSupabaseSetupError !== 'function') {
        return 'Supabase configuration is unavailable.';
      }
      return window.PKSupabaseConfig.getSupabaseSetupError();
    },

    async signUp({ username, email, password, requireCloud }) {
      const cleanEmail = String(email || '').trim().toLowerCase();
      const cleanName = String(username || '').trim().slice(0, 64) || cleanEmail.split('@')[0];
      const { client, error: cfgErr } = getClientOrError();

      if (!client) {
        if (requireCloud) return { ok: false, code: 'CONFIG_MISSING', error: cfgErr };

        const users = loadLocalUsers();
        if (users[cleanEmail]) {
          return {
            ok: false,
            code: 'DUPLICATE_EMAIL',
            error: 'An account with this email address already exists. Please sign in instead.'
          };
        }
        const nameTaken = Object.values(users).some(
          (u) => u && String(u.username || '').toLowerCase() === cleanName.toLowerCase()
        );
        if (nameTaken) {
          return {
            ok: false,
            code: 'USERNAME_TAKEN',
            error: 'That display name is already taken. Please choose another.'
          };
        }

        const salt = randomSalt();
        const hash = await hashPassword(password, salt);
        const uid = generateUserUuid(cleanEmail);
        const nowIso = new Date().toISOString();
        const avatar =
          typeof window.generateAvatarDataUri === 'function'
            ? window.generateAvatarDataUri(uid + ':' + cleanEmail)
            : null;

        const record = {
          id: uid,
          username: cleanName,
          email: cleanEmail,
          salt,
          hash,
          createdAt: nowIso,
          avatar
        };
        users[cleanEmail] = record;
        saveLocalUsers(users);
        try {
          localStorage.setItem(SESSION_KEY, JSON.stringify({ id: uid, email: cleanEmail }));
        } catch (e) {}

        const formatted = formatLocalUser(record);
        return {
          ok: true,
          confirmationRequired: false,
          email: cleanEmail,
          user: formatted,
          rawUser: { id: uid, email: cleanEmail, user_metadata: { display_name: cleanName } },
          session: { user: formatted }
        };
      }

      const redirectTo = window.PKSupabaseConfig.getAuthRedirectUrl();

      try {
        const { data, error } = await client.auth.signUp({
          email: cleanEmail,
          password: String(password),
          options: {
            emailRedirectTo: redirectTo,
            data: {
              display_name: cleanName
            }
          }
        });

        if (error) {
          return { ok: false, error: normalizeAuthError(error, 'Could not create account.') };
        }

        if (data && data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          return {
            ok: false,
            code: 'DUPLICATE_EMAIL',
            error: 'An account with this email address already exists. Please sign in or reset your password.'
          };
        }

        if (!data || !data.user) {
          return { ok: false, error: 'Could not create account. Please try again.' };
        }

        if (data.session) {
          try {
            await client.from('profiles').upsert(
              {
                id: data.user.id,
                display_name: cleanName,
                updated_at: new Date().toISOString()
              },
              { onConflict: 'id' }
            );
          } catch (profileErr) {}
        }

        const confirmationRequired = !data.session;
        return {
          ok: true,
          confirmationRequired,
          email: cleanEmail,
          user: formatSupabaseUser(data.user),
          session: data.session || null
        };
      } catch (err) {
        return { ok: false, error: normalizeAuthError(err, 'Unable to connect. Please check your internet connection.') };
      }
    },

    async resendVerificationEmail({ email }) {
      const cleanEmail = String(email || '').trim().toLowerCase();
      if (!cleanEmail) return { ok: false, error: 'Please enter a valid email address.' };
      const { client } = getClientOrError();
      if (!client) return { ok: true };
      try {
        const { error } = await client.auth.resend({
          type: 'signup',
          email: cleanEmail,
          options: {
            emailRedirectTo: window.PKSupabaseConfig.getAuthRedirectUrl()
          }
        });
        if (error) return { ok: false, error: normalizeAuthError(error, 'Could not resend verification email.') };
        return { ok: true };
      } catch (err) {
        return { ok: false, error: normalizeAuthError(err, 'Could not resend verification email.') };
      }
    },

    async signIn({ email, identifier, password, requireCloud }) {
      const rawId = String(email || identifier || '').trim();
      const idLower = rawId.toLowerCase();
      const { client, error: cfgErr } = getClientOrError();

      if (!client) {
        if (requireCloud) return { ok: false, code: 'CONFIG_MISSING', error: cfgErr };

        const users = loadLocalUsers();
        const record =
          users[idLower] ||
          Object.values(users).find(
            (u) => u && String(u.username || '').toLowerCase() === idLower
          );
        if (!record) {
          return {
            ok: false,
            code: 'ACCOUNT_NOT_FOUND',
            error: 'No account found for that email or username. Please sign up first.'
          };
        }

        const hash = await hashPassword(password, record.salt);
        if (hash !== record.hash) {
          return {
            ok: false,
            code: 'INVALID_PASSWORD',
            error: 'Incorrect password. Please try again.'
          };
        }

        if (!record.id) {
          record.id = generateUserUuid(record.email);
          saveLocalUsers(users);
        }
        if (!record.avatar && typeof window.generateAvatarDataUri === 'function') {
          record.avatar = window.generateAvatarDataUri(record.id + ':' + record.email);
          saveLocalUsers(users);
        }

        try {
          localStorage.setItem(SESSION_KEY, JSON.stringify({ id: record.id, email: record.email }));
        } catch (e) {}

        const formatted = formatLocalUser(record);
        return {
          ok: true,
          user: formatted,
          rawUser: { id: record.id, email: record.email, user_metadata: { display_name: record.username } },
          session: { user: formatted }
        };
      }

      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: idLower,
          password: String(password)
        });
        if (error) {
          const isUnconfirmed = String(error.message || '').toLowerCase().includes('email not confirmed');
          return {
            ok: false,
            code: isUnconfirmed ? 'EMAIL_NOT_CONFIRMED' : 'AUTH_ERROR',
            email: idLower,
            error: normalizeAuthError(error, 'Incorrect email or password. Please try again.')
          };
        }
        if (!data || !data.user || !data.session) {
          return { ok: false, error: 'Incorrect email or password. Please try again.' };
        }

        let profileRow = null;
        try {
          const { data: prof } = await client
            .from('profiles')
            .select('id, display_name, created_at, updated_at')
            .eq('id', data.user.id)
            .maybeSingle();
          profileRow = prof || null;
        } catch (e) {}

        return {
          ok: true,
          user: formatSupabaseUser(data.user, profileRow),
          rawUser: data.user,
          session: data.session
        };
      } catch (err) {
        return { ok: false, error: normalizeAuthError(err, 'Unable to sign in right now. Please try again.') };
      }
    },

    async signOut() {
      try {
        localStorage.removeItem(SESSION_KEY);
      } catch (e) {}
      const { client } = getClientOrError();
      if (!client) return { ok: true };
      try {
        const { error } = await client.auth.signOut();
        if (error) return { ok: false, error: normalizeAuthError(error, 'Failed to sign out.') };
        return { ok: true };
      } catch (err) {
        return { ok: false, error: normalizeAuthError(err, 'Failed to sign out.') };
      }
    },

    async requestPasswordReset({ email, requireCloud }) {
      const cleanEmail = String(email || '').trim().toLowerCase();
      const { client, error: cfgErr } = getClientOrError();

      if (!client) {
        if (requireCloud) return { ok: false, code: 'CONFIG_MISSING', error: cfgErr };
        const users = loadLocalUsers();
        const record = users[cleanEmail];
        if (!record) {
          return {
            ok: false,
            code: 'ACCOUNT_NOT_FOUND',
            error: 'No account found with that email address. Please check your email or sign up.'
          };
        }
        pendingRecoveryEmail = cleanEmail;
        return { ok: true, localDirectReset: true, email: cleanEmail };
      }

      try {
        const { error } = await client.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: window.PKSupabaseConfig.getAuthRedirectUrl()
        });
        if (error) {
          return { ok: false, error: normalizeAuthError(error, 'Could not send password reset email.') };
        }
        return { ok: true };
      } catch (err) {
        return { ok: false, error: normalizeAuthError(err, 'Could not send password reset email.') };
      }
    },

    async updatePassword({ password, requireCloud }) {
      const { client, error: cfgErr } = getClientOrError();

      if (!client) {
        if (requireCloud) return { ok: false, code: 'CONFIG_MISSING', error: cfgErr };
        const users = loadLocalUsers();
        let targetEmail = pendingRecoveryEmail;
        if (!targetEmail) {
          try {
            const sess = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
            if (sess && sess.email) targetEmail = String(sess.email).trim().toLowerCase();
          } catch (e) {}
        }
        if (!targetEmail || !users[targetEmail]) {
          return { ok: false, error: 'Please sign in or enter your email on Forgot Password first.' };
        }
        const record = users[targetEmail];
        const newSalt = randomSalt();
        const newHash = await hashPassword(password, newSalt);
        record.salt = newSalt;
        record.hash = newHash;
        if (!record.id) record.id = generateUserUuid(targetEmail);
        saveLocalUsers(users);
        pendingRecoveryEmail = null;
        try {
          localStorage.setItem(SESSION_KEY, JSON.stringify({ id: record.id, email: record.email }));
        } catch (e) {}
        return { ok: true, user: formatLocalUser(record) };
      }

      try {
        const { data, error } = await client.auth.updateUser({
          password: String(password)
        });
        if (error) {
          return { ok: false, error: normalizeAuthError(error, 'Could not update password.') };
        }
        return { ok: true, user: data && data.user ? formatSupabaseUser(data.user) : null };
      } catch (err) {
        return { ok: false, error: normalizeAuthError(err, 'Could not update password.') };
      }
    },

    async updateAvatar({ avatarDataUrl, fileBlob }) {
      const { client } = getClientOrError();
      if (!client) {
        const users = loadLocalUsers();
        let sess = null;
        try {
          sess = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
        } catch (e) {}
        if (!sess || !sess.email) {
          return { ok: false, error: 'Please sign in to update your profile picture.' };
        }
        const key = String(sess.email).trim().toLowerCase();
        const record = users[key];
        if (!record) return { ok: false, error: 'Account not found.' };
        record.avatar = avatarDataUrl;
        saveLocalUsers(users);
        try {
          if (record.id) localStorage.setItem(AVATAR_CACHE_PREFIX + record.id, avatarDataUrl);
        } catch (e) {}
        if (fileBlob && window.PKCloudSync && typeof window.PKCloudSync.uploadUserFile === 'function') {
          try {
            const avatarFile = new File([fileBlob], 'avatar.jpg', { type: 'image/jpeg' });
            await window.PKCloudSync.uploadUserFile(avatarFile, { category: 'avatar' });
          } catch (_e) {}
        }
        return { ok: true, user: formatLocalUser(record) };
      }

      try {
        const { data: userData, error: userErr } = await client.auth.getUser();
        if (userErr || !userData || !userData.user) {
          return { ok: false, error: 'Please sign in to update your profile picture.' };
        }
        const userId = userData.user.id;
        try {
          localStorage.setItem(AVATAR_CACHE_PREFIX + userId, avatarDataUrl);
        } catch (e) {}

        let storagePath = null;
        if (fileBlob && window.PKCloudSync && typeof window.PKCloudSync.uploadUserFile === 'function') {
          const avatarFile = new File([fileBlob], 'avatar.jpg', { type: 'image/jpeg' });
          const upRes = await window.PKCloudSync.uploadUserFile(avatarFile, { category: 'avatar' });
          if (upRes && upRes.ok && upRes.file) {
            storagePath = upRes.file.storage_path;
          }
        }

        await client.auth.updateUser({
          data: {
            avatar_storage_path: storagePath || undefined
          }
        });

        return { ok: true, user: formatSupabaseUser(userData.user) };
      } catch (err) {
        return { ok: false, error: normalizeAuthError(err, 'Could not update profile picture.') };
      }
    },

    async getCurrentUser() {
      const { client } = getClientOrError();
      if (!client) {
        try {
          const sess = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
          if (!sess || !sess.email) return null;
          const users = loadLocalUsers();
          const key = String(sess.email).trim().toLowerCase();
          const record = users[key];
          if (!record) return null;
          if (!record.id) {
            record.id = generateUserUuid(record.email);
            saveLocalUsers(users);
          }
          if (!record.avatar && typeof window.generateAvatarDataUri === 'function') {
            record.avatar = window.generateAvatarDataUri(record.id + ':' + record.email);
            saveLocalUsers(users);
          }
          return formatLocalUser(record);
        } catch (e) {
          return null;
        }
      }
      try {
        const { data: sessionData } = await client.auth.getSession();
        const session = sessionData && sessionData.session;
        if (!session || !session.user) return null;
        return formatSupabaseUser(session.user);
      } catch (e) {
        return null;
      }
    },

    async getCurrentRawUser() {
      const { client } = getClientOrError();
      if (!client) {
        const u = await this.getCurrentUser();
        return u ? { id: u.id, email: u.email, user_metadata: { display_name: u.username } } : null;
      }
      try {
        const { data: sessionData } = await client.auth.getSession();
        return (sessionData && sessionData.session && sessionData.session.user) || null;
      } catch (e) {
        return null;
      }
    }
  };
})();
window.AuthProvider = AuthProvider;

/* =====================================================================
   PER-ACCOUNT LOCAL SNAPSHOT ISOLATION
   ===================================================================== */
function isProgressKey(key) {
  if (!key || typeof key !== 'string') return false;
  if (key === 'khmerTrialBest') return true;
  if (key === 'khmerGlobalStats') return true;
  if (key === 'khmerTrackingData_v1') return true;
  if (key === 'khmerReviewData_v1') return true;
  if (key === 'khmerProgress_v2' || key === 'khmerProgress_v1') return true;
  if (key.indexOf('khmerLessonBest_') === 0) return true;
  if (/^khmerRaceBest[A-Z]/.test(key)) return true;
  if (key === 'pk_adaptive_state_v1' || key.startsWith('pk_adaptive_')) return true;
  return false;
}
if (typeof window !== 'undefined') window.isProgressKey = isProgressKey;

const AccountProgress = (function () {
  const STORE_KEY = 'khmerAccountProgress';

  function loadStore() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }
  function saveStore(store) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
    } catch (e) {}
  }

  function clearLiveProgressKeys() {
    try {
      Object.keys(localStorage).forEach((k) => {
        if (isProgressKey(k)) localStorage.removeItem(k);
      });
    } catch (e) {}
  }

  function snapshotAndClear(accountIdOrEmail) {
    if (!accountIdOrEmail) {
      clearLiveProgressKeys();
      return;
    }
    const key = String(accountIdOrEmail).trim().toLowerCase();
    const snapshot = {};
    try {
      Object.keys(localStorage).forEach((k) => {
        if (isProgressKey(k)) snapshot[k] = localStorage.getItem(k);
      });
    } catch (e) {}
    const store = loadStore();
    store[key] = snapshot;
    saveStore(store);
    clearLiveProgressKeys();
  }

  function restore(accountIdOrEmail) {
    if (!accountIdOrEmail) return;
    const key = String(accountIdOrEmail).trim().toLowerCase();
    const store = loadStore();
    const snapshot = store[key];
    if (!snapshot) return;
    try {
      Object.keys(snapshot).forEach((k) => {
        if (isProgressKey(k) && !localStorage.getItem(k)) {
          localStorage.setItem(k, snapshot[k]);
        }
      });
    } catch (e) {}
  }

  function clearAccountSnapshot(accountIdOrEmail) {
    if (!accountIdOrEmail) return;
    const key = String(accountIdOrEmail).trim().toLowerCase();
    const store = loadStore();
    delete store[key];
    saveStore(store);
  }

  return { snapshotAndClear, restore, clearAccountSnapshot, clearLiveProgressKeys };
})();
window.AccountProgress = AccountProgress;

/* ============================================================
   Authentication, Cloud Sync & Personal File Manager UI
   ============================================================ */
(function initAuthAndCloudSyncUI() {
  const authOpenBtn = document.getElementById('authOpenBtn');
  const authAccountChip = document.getElementById('authAccountChip');
  const authChipAvatar = document.getElementById('authChipAvatar');
  const authChipName = document.getElementById('authChipName');
  const cloudSyncStatusBadge = document.getElementById('cloudSyncStatusBadge');
  const cloudSyncStatusLabel = document.getElementById('cloudSyncStatusLabel');

  const authModal = document.getElementById('authModal');
  const authCard = document.getElementById('authCard');
  const authCloseBtn = document.getElementById('authCloseBtn');
  const authModalTitleText = document.getElementById('authModalTitleText');
  const supabaseConfigBanner = document.getElementById('supabaseConfigBanner');
  const supabaseConfigBannerText = document.getElementById('supabaseConfigBannerText');

  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');
  const forgotForm = document.getElementById('forgotForm');
  const recoveryForm = document.getElementById('recoveryForm');
  const verifyEmailPanel = document.getElementById('verifyEmailPanel');
  const accountPanel = document.getElementById('accountPanel');
  const allAuthPanels = [
    signInForm,
    signUpForm,
    forgotForm,
    recoveryForm,
    verifyEmailPanel,
    accountPanel
  ].filter(Boolean);

  const authTabs = document.getElementById('authTabs');
  const authTabSignIn = document.getElementById('authTabSignIn');
  const authTabSignUp = document.getElementById('authTabSignUp');

  if (!authModal || !signInForm || !signUpForm) return;

  let pendingVerifyEmail = '';
  let hasReconciledInitialSession = false;

  let loggedSetupHintOnce = false;
  function updateConfigBanner() {
    if (!supabaseConfigBanner) return;
    supabaseConfigBanner.hidden = true;
    if (!AuthProvider.isConfigured() && !loggedSetupHintOnce) {
      loggedSetupHintOnce = true;
      if (typeof console !== 'undefined' && console.info) {
        console.info('[PK Khmer Type] ' + AuthProvider.getSetupError());
      }
    }
  }

  function showAuthPanel(panel, title) {
    updateConfigBanner();
    allAuthPanels.forEach((p) => {
      if (p) p.hidden = p !== panel;
    });
    if (authModalTitleText && title) {
      authModalTitleText.textContent = title;
    }

    if (panel === accountPanel) {
      authCard.classList.add('is-account');
    } else {
      authCard.classList.remove('is-account');
    }

    if (panel === signInForm || panel === signUpForm) {
      authTabs.hidden = false;
      const onSignUp = panel === signUpForm;
      authTabs.classList.toggle('on-signup', onSignUp);
      authTabSignIn.classList.toggle('active', !onSignUp);
      authTabSignUp.classList.toggle('active', onSignUp);
      authTabSignIn.setAttribute('aria-selected', String(!onSignUp));
      authTabSignUp.setAttribute('aria-selected', String(onSignUp));
    } else {
      authTabs.hidden = true;
    }

    const firstInput = panel ? panel.querySelector('input:not([type="checkbox"]):not([type="file"])') : null;
    if (firstInput) requestAnimationFrame(() => firstInput.focus());

    if (panel) {
      panel
        .querySelectorAll(':scope > .auth-field, :scope > .auth-row-between, :scope > .auth-checkbox')
        .forEach((el, i) => {
          el.style.animationDelay = i * 0.05 + 's';
        });
    }
  }

  authTabSignIn.addEventListener('click', () => {
    if (!signInForm.hidden) return;
    showAuthPanel(signInForm, 'Sign In');
  });
  authTabSignUp.addEventListener('click', () => {
    if (!signUpForm.hidden) return;
    showAuthPanel(signUpForm, 'Sign Up');
  });

  function clearFieldError(fieldEl, errorEl) {
    if (fieldEl) fieldEl.closest('.auth-field')?.classList.remove('has-error');
    if (errorEl) errorEl.textContent = '';
  }
  function setFieldError(fieldEl, errorEl, message) {
    if (fieldEl) fieldEl.closest('.auth-field')?.classList.add('has-error');
    if (errorEl) errorEl.textContent = message;
  }
  function setFormError(el, message) {
    if (!el) return;
    if (!message) {
      el.hidden = true;
      el.textContent = '';
      return;
    }
    el.hidden = false;
    el.textContent = message;
  }
  function setSubmitLoading(btn, loading) {
    if (!btn) return;
    btn.classList.toggle('is-loading', loading);
    btn.disabled = loading;
  }
  function shakeForm(form) {
    if (!form) return;
    form.classList.remove('auth-shake');
    void form.offsetWidth;
    form.classList.add('auth-shake');
    form.addEventListener('animationend', () => form.classList.remove('auth-shake'), { once: true });
  }
  async function flashSuccess(btn, label) {
    if (!btn) return;
    const labelEl = btn.querySelector('.auth-submit-label');
    if (!labelEl) return;
    const original = labelEl.textContent;
    btn.classList.add('is-success');
    labelEl.textContent = label;
    await new Promise((r) => setTimeout(r, 480));
    btn.classList.remove('is-success');
    labelEl.textContent = original;
  }

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const DISPOSABLE_EMAIL_DOMAINS = new Set([
    'mailinator.com', 'guerrillamail.com', 'guerrillamail.info', 'guerrillamail.biz',
    'guerrillamail.de', 'guerrillamail.net', 'sharklasers.com', 'grr.la',
    'temp-mail.org', 'tempmail.com', 'tempmail.net', 'tempmailo.com', '10minutemail.com',
    '10minutemail.net', '20minutemail.com', 'throwawaymail.com', 'trashmail.com',
    'trashmail.net', 'yopmail.com', 'yopmail.net', 'yopmail.fr', 'moakt.com',
    'getnada.com', 'maildrop.cc', 'dispostable.com', 'fakeinbox.com', 'mytemp.email'
  ]);

  function checkEmailQuality(rawEmail) {
    const email = (rawEmail || '').trim();
    if (!EMAIL_RE.test(email)) {
      return { ok: false, reason: 'Enter a valid email address.' };
    }
    if (/\.\./.test(email) || /^\.|\.@|@\.|\.$/.test(email)) {
      return { ok: false, reason: 'Email address has an invalid dot placement.' };
    }
    const at = email.lastIndexOf('@');
    const local = email.slice(0, at);
    const domain = email.slice(at + 1).toLowerCase();
    if (local.length > 64 || domain.length > 253) {
      return { ok: false, reason: 'Email address is too long.' };
    }
    if (!/^[a-z]{2,24}$/i.test(domain.split('.').pop())) {
      return { ok: false, reason: 'Email domain looks invalid.' };
    }
    if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
      return { ok: false, reason: 'Temporary or disposable email addresses are not allowed.' };
    }
    return { ok: true };
  }

  /* ---------- Cursor spotlight glow on the card ---------- */
  authCard.addEventListener('mousemove', (e) => {
    const rect = authCard.getBoundingClientRect();
    authCard.style.setProperty('--mx', (((e.clientX - rect.left) / rect.width) * 100).toFixed(1) + '%');
    authCard.style.setProperty('--my', (((e.clientY - rect.top) / rect.height) * 100).toFixed(1) + '%');
  });
  authCard.addEventListener('mouseleave', () => {
    authCard.style.setProperty('--mx', '50%');
    authCard.style.setProperty('--my', '15%');
  });

  /* ---------- Show / hide password ---------- */
  document.querySelectorAll('.auth-toggle-pw').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const show = target.type === 'password';
      target.type = show ? 'text' : 'password';
      btn.setAttribute('aria-pressed', show ? 'true' : 'false');
      btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      if (typeof pkIcon === 'function') {
        btn.innerHTML = show ? pkIcon('eye-off', 14) : pkIcon('eye', 14);
      }
    });
  });

  /* ---------- Password strength (Sign Up) ---------- */
  const authPasswordStrengthLabel = document.getElementById('authPasswordStrengthLabel');
  const authStrengthBars = [
    document.getElementById('authBar1'),
    document.getElementById('authBar2'),
    document.getElementById('authBar3'),
    document.getElementById('authBar4')
  ];
  function passwordStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 4);
  }
  const STRENGTH_META = [
    { label: '—', cls: '', bars: 0 },
    { label: 'Weak', cls: 'strength-weak', bars: 1 },
    { label: 'Fair', cls: 'strength-fair', bars: 2 },
    { label: 'Good', cls: 'strength-good', bars: 3 },
    { label: 'Strong', cls: 'strength-strong', bars: 4 }
  ];
  const BAR_CLASSES = { 1: 'lit-weak', 2: 'lit-fair', 3: 'lit-good', 4: 'lit-strong' };
  function updateStrengthUI(score) {
    const meta = STRENGTH_META[score];
    authStrengthBars.forEach((bar, i) => {
      if (bar) bar.className = 'auth-strength-bar' + (i < meta.bars ? ' ' + BAR_CLASSES[score] : '');
    });
    if (authPasswordStrengthLabel) {
      authPasswordStrengthLabel.className = 'auth-strength-label' + (meta.cls ? ' ' + meta.cls : '');
      authPasswordStrengthLabel.innerHTML = `Strength: <b>${meta.label}</b>`;
    }
  }
  updateStrengthUI(0);
  const signUpPasswordInput = document.getElementById('signUpPassword');
  if (signUpPasswordInput) {
    signUpPasswordInput.addEventListener('input', (e) => {
      const pw = e.target.value;
      updateStrengthUI(pw ? Math.max(passwordStrength(pw), 1) : 0);
    });
  }

  /* ---------- Cloud Sync Status Badge ---------- */
  function updateSyncStatusUI(state) {
    if (!state && window.PKCloudSync && typeof window.PKCloudSync.getSyncState === 'function') {
      state = window.PKCloudSync.getSyncState();
    }
    if (!state) return;

    const accSessionStatusText = document.getElementById('accSessionStatusText');
    const accSyncTimeText = document.getElementById('accSyncTimeText');

    const statusLabels = {
      idle: 'Saved',
      syncing: 'Syncing...',
      synced: 'Synced',
      offline: 'Offline (Saved)',
      error: 'Saved Locally',
      unconfigured: 'Saved'
    };

    if (cloudSyncStatusBadge && cloudSyncStatusLabel) {
      cloudSyncStatusBadge.dataset.status = state.status === 'unconfigured' ? 'synced' : (state.status || 'synced');
      const pendingSuffix = state.pendingCount > 0 ? ` (${state.pendingCount})` : '';
      cloudSyncStatusLabel.textContent = (statusLabels[state.status] || 'Synced') + pendingSuffix;
    }

    if (accSessionStatusText) {
      if (state.status === 'offline') {
        accSessionStatusText.textContent = 'Offline — Progress saved on this device';
      } else if (state.status === 'syncing') {
        accSessionStatusText.textContent = 'Saving your progress...';
      } else {
        accSessionStatusText.textContent = 'Account Active & Synced';
      }
    }

    if (accSyncTimeText) {
      if (state.lastSyncedAt) {
        try {
          const dt = new Date(state.lastSyncedAt);
          accSyncTimeText.textContent = 'Last saved: ' + dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
          accSyncTimeText.textContent = 'Saved just now';
        }
      } else {
        accSyncTimeText.textContent = 'Up to date';
      }
    }
  }

  if (window.PKCloudSync && typeof window.PKCloudSync.onSyncStateChange === 'function') {
    window.PKCloudSync.onSyncStateChange(updateSyncStatusUI);
  }

  /* ---------- Refresh Topbar Auth Button State ---------- */
  async function refreshAuthButtonState() {
    updateConfigBanner();
    const user = await AuthProvider.getCurrentUser();
    if (user) {
      authOpenBtn.hidden = true;
      authAccountChip.hidden = false;
      const chipImg = document.createElement('img');
      chipImg.src = user.avatar || window.DEFAULT_AVATAR;
      chipImg.alt = '';
      authChipAvatar.textContent = '';
      authChipAvatar.appendChild(chipImg);
      authChipName.textContent = user.username;
      if (cloudSyncStatusBadge) cloudSyncStatusBadge.hidden = false;
      updateSyncStatusUI();
    } else {
      authOpenBtn.hidden = false;
      authAccountChip.hidden = true;
      if (cloudSyncStatusBadge) cloudSyncStatusBadge.hidden = true;
    }
    return user;
  }

  function formatJoinDate(ts) {
    if (!ts) return 'this session';
    try {
      return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return '—';
    }
  }

  const ACCOUNT_RANKS = [
    { min: 0, name: 'Novice Scribe' },
    { min: 5, name: 'Apprentice Scribe' },
    { min: 12, name: 'Temple Scribe' },
    { min: 22, name: 'Keeper of Letters' },
    { min: 35, name: 'Master Calligrapher' }
  ];
  function rankForCount(n) {
    let r = ACCOUNT_RANKS[0];
    let idx = 0;
    for (let i = 0; i < ACCOUNT_RANKS.length; i++) {
      if (n >= ACCOUNT_RANKS[i].min) {
        r = ACCOUNT_RANKS[i];
        idx = i;
      }
    }
    const next = ACCOUNT_RANKS[idx + 1] || null;
    return { name: r.name, next };
  }

  /* ---------- Render Cloud Files List in Account Panel ---------- */
  async function refreshCloudFilesList() {
    const listEl = document.getElementById('accCloudFilesList');
    if (!listEl) return;
    if (!window.PKCloudSync || typeof window.PKCloudSync.listUserFiles !== 'function') {
      listEl.innerHTML = '<div class="acc-cloud-files-empty">Cloud storage module unavailable.</div>';
      return;
    }

    listEl.innerHTML = '<div class="acc-cloud-files-empty">Loading private cloud files...</div>';
    const res = await window.PKCloudSync.listUserFiles();
    if (!res.ok) {
      listEl.innerHTML = `<div class="acc-cloud-files-empty">${res.error || 'Could not load cloud files.'}</div>`;
      return;
    }
    const files = res.files || [];
    if (files.length === 0) {
      listEl.innerHTML = '<div class="acc-cloud-files-empty">No cloud files yet. Click "Save Snapshot" to store an encrypted cloud backup or upload a personal file.</div>';
      return;
    }

    listEl.innerHTML = files
      .map((f) => {
        const kb = Math.max(1, Math.round((Number(f.size_bytes) || 0) / 1024));
        const dateStr = f.updated_at ? new Date(f.updated_at).toLocaleDateString() : '';
        const isJsonBackup = String(f.file_name || '').toLowerCase().endsWith('.json') || f.mime_type === 'application/json';
        const safeName = String(f.file_name || 'file').replace(/[<>&"]/g, '');
        return `<div class="acc-cloud-file-item" data-file-id="${f.id}">
          <div class="acc-cloud-file-meta">
            <span class="acc-cloud-file-name" title="${safeName}">${safeName}</span>
            <span class="acc-cloud-file-sub">${kb} KB · ${dateStr}</span>
          </div>
          <div class="acc-cloud-file-btns">
            ${isJsonBackup ? `<button type="button" class="acc-file-act-btn restore" data-action="restore" data-id="${f.id}" title="Restore backup snapshot">Restore</button>` : ''}
            <button type="button" class="acc-file-act-btn" data-action="download" data-id="${f.id}" title="Download file">Download</button>
            <button type="button" class="acc-file-act-btn danger" data-action="delete" data-id="${f.id}" title="Delete from cloud">Delete</button>
          </div>
        </div>`;
      })
      .join('');

    listEl.querySelectorAll('.acc-file-act-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const action = btn.dataset.action;
        const fileId = btn.dataset.id;
        const fileRecord = files.find((item) => item.id === fileId);
        if (!fileRecord) return;

        if (action === 'restore') {
          const confirmed = typeof templeConfirm === 'function'
            ? await templeConfirm(
                `Restore cloud snapshot "${fileRecord.file_name}" and merge it with your current progress and settings?`,
                { title: 'Restore Cloud Snapshot?', confirmLabel: 'Restore Snapshot' }
              )
            : confirm(`Restore cloud snapshot "${fileRecord.file_name}"?`);
          if (!confirmed) return;
          btn.disabled = true;
          const restoreRes = await window.PKCloudSync.restoreCloudBackupSnapshot(fileRecord.id);
          btn.disabled = false;
          if (!restoreRes.ok) {
            if (typeof showToast === 'function') showToast(pkIcon('zap', 18), 'Restore failed', restoreRes.error);
            return;
          }
          if (typeof showToast === 'function') {
            showToast(pkIcon('check', 18), 'Snapshot Restored', 'Reloading your synchronized workspace...');
          }
          setTimeout(() => location.reload(), 500);
        } else if (action === 'download') {
          btn.disabled = true;
          const dlRes = await window.PKCloudSync.downloadUserFile(fileRecord);
          btn.disabled = false;
          if (!dlRes.ok || !dlRes.blob) {
            if (typeof showToast === 'function') showToast(pkIcon('zap', 18), 'Download failed', dlRes.error || 'Could not download file.');
            return;
          }
          const url = URL.createObjectURL(dlRes.blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileRecord.file_name || 'cloud-file';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else if (action === 'delete') {
          const confirmed = typeof templeConfirm === 'function'
            ? await templeConfirm(
                `Permanently delete "${fileRecord.file_name}" from your private cloud storage?`,
                { title: 'Delete Cloud File?', danger: true, confirmLabel: 'Delete' }
              )
            : confirm(`Delete "${fileRecord.file_name}"?`);
          if (!confirmed) return;
          btn.disabled = true;
          const delRes = await window.PKCloudSync.deleteUserFile(fileRecord.id);
          if (!delRes.ok) {
            btn.disabled = false;
            if (typeof showToast === 'function') showToast(pkIcon('zap', 18), 'Delete failed', delRes.error || 'Could not delete file.');
            return;
          }
          await refreshCloudFilesList();
        }
      });
    });
  }

  function populateAccountPanel(user) {
    document.getElementById('authAccountName').textContent = user.username;
    document.getElementById('authAccountEmail').textContent = user.email;
    document.getElementById('authAccountJoined').textContent = formatJoinDate(user.createdAt);
    const accAv = document.getElementById('authAccountAvatar');
    const accImg = document.createElement('img');
    accImg.src = user.avatar || window.DEFAULT_AVATAR;
    accImg.alt = '';
    accAv.textContent = '';
    accAv.appendChild(accImg);

    updateSyncStatusUI();
    refreshCloudFilesList();

    const snap = typeof window.getAccountSnapshot === 'function' ? window.getAccountSnapshot() : null;
    const grid = document.getElementById('accountStatsGrid');
    const rankLabel = document.getElementById('authAccountRank');
    const xpFill = document.getElementById('accXpFill');
    const xpLabel = document.getElementById('accXpLabel');

    if (snap) {
      const rank = rankForCount(snap.lessonsMastered, snap.totalLessons);
      rankLabel.textContent = rank.name;
      if (rank.next) {
        const span = rank.next.min - (ACCOUNT_RANKS.find((r) => r.name === rank.name)?.min || 0);
        const into = snap.lessonsMastered - (ACCOUNT_RANKS.find((r) => r.name === rank.name)?.min || 0);
        const pct = span > 0 ? Math.max(4, Math.min(100, Math.round((into / span) * 100))) : 100;
        xpFill.style.width = pct + '%';
        xpLabel.innerHTML = `${snap.lessonsMastered} mastered — <b>${rank.next.min - snap.lessonsMastered}</b> more to ${rank.next.name}`;
      } else {
        xpFill.style.width = '100%';
        xpLabel.textContent = `${snap.lessonsMastered} lessons mastered — top rank reached`;
      }

      const tiles = [
        [pkIcon('scroll', 16), snap.lessonsMastered + '/' + snap.totalLessons, 'Lessons Mastered'],
        [pkIcon('zap', 16), snap.bestWpm, 'Best WPM'],
        [pkIcon('flame', 16), snap.streak, 'Day Streak'],
        [pkIcon('castle', 16), snap.trialBest, 'Temple Trial Best'],
        [pkIcon('flag', 16), snap.raceBestWpm, 'Race Best WPM'],
        [pkIcon('target', 16), snap.accuracy + '%', 'Avg Accuracy'],
        [pkIcon('edit', 16), snap.totalChars, 'Total Characters'],
        [pkIcon('timer', 16), snap.practiceMinutes + 'm', 'Practice Time'],
        [pkIcon('calendar', 16), snap.daysPracticed, 'Days Practiced']
      ];
      grid.innerHTML = tiles
        .map(
          ([icon, val, label], i) =>
            `<div class="stat-tile" style="animation-delay:${i * 45}ms">
          <div class="stat-tile-icon">${icon}</div>
          <div class="stat-tile-val">${val}</div>
          <div class="stat-tile-label">${label}</div>
        </div>`
        )
        .join('');
    } else {
      rankLabel.textContent = 'Novice Scribe';
      xpFill.style.width = '4%';
      xpLabel.textContent = 'Start a lesson to begin earning rank';
      grid.innerHTML = '';
    }
  }

  async function openAccountModal() {
    authModal.hidden = false;
    updateConfigBanner();
    const user = await AuthProvider.getCurrentUser();
    if (user) {
      populateAccountPanel(user);
      showAuthPanel(accountPanel, 'Your Account');
    } else {
      showAuthPanel(signInForm, 'Sign In');
    }
    authCloseBtn.focus();
  }

  /* ---------- Avatar Upload (Local + Private Cloud Storage) ---------- */
  const accAvatarEditBtn = document.getElementById('accAvatarEditBtn');
  const accAvatarInput = document.getElementById('accAvatarInput');
  if (accAvatarEditBtn && accAvatarInput) {
    accAvatarEditBtn.addEventListener('click', () => accAvatarInput.click());
    accAvatarInput.addEventListener('change', () => {
      const file = accAvatarInput.files && accAvatarInput.files[0];
      if (!file) return;
      const img = new Image();
      const reader = new FileReader();
      reader.onload = () => {
        img.onload = async () => {
          const size = 160;
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          const scale = Math.max(size / img.width, size / img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          canvas.toBlob(async (blob) => {
            const result = await AuthProvider.updateAvatar({ avatarDataUrl: dataUrl, fileBlob: blob });
            if (result.ok) {
              const accAv = document.getElementById('authAccountAvatar');
              accAv.textContent = '';
              const accImg = document.createElement('img');
              accImg.src = dataUrl;
              accImg.alt = '';
              accAv.appendChild(accImg);
              await refreshAuthButtonState();
              await refreshCloudFilesList();
            }
          }, 'image/jpeg', 0.85);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
      accAvatarInput.value = '';
    });
  }

  /* ---------- Account Panel Cloud Sync & File Buttons ---------- */
  const accSyncNowBtn = document.getElementById('accSyncNowBtn');
  if (accSyncNowBtn) {
    accSyncNowBtn.addEventListener('click', async () => {
      if (!window.PKCloudSync) return;
      accSyncNowBtn.disabled = true;
      await window.PKCloudSync.syncAllNow();
      accSyncNowBtn.disabled = false;
      const user = await AuthProvider.getCurrentUser();
      if (user) populateAccountPanel(user);
    });
  }

  const accCreateCloudBackupBtn = document.getElementById('accCreateCloudBackupBtn');
  if (accCreateCloudBackupBtn) {
    accCreateCloudBackupBtn.addEventListener('click', async () => {
      if (!window.PKCloudSync) return;
      accCreateCloudBackupBtn.disabled = true;
      const res = await window.PKCloudSync.createCloudBackupSnapshot();
      accCreateCloudBackupBtn.disabled = false;
      if (!res.ok) {
        if (typeof showToast === 'function') showToast(pkIcon('zap', 18), 'Snapshot Failed', res.error || 'Could not save snapshot.');
        return;
      }
      if (typeof showToast === 'function') {
        showToast(pkIcon('check', 18), 'Cloud Snapshot Saved', 'Encrypted backup stored in your private user-files bucket.');
      }
      await refreshCloudFilesList();
    });
  }

  const accUploadCloudFileBtn = document.getElementById('accUploadCloudFileBtn');
  const accUploadCloudFileInput =
    document.getElementById('accCloudFileInput') ||
    document.getElementById('accUploadCloudFileInput');
  if (accUploadCloudFileBtn && accUploadCloudFileInput) {
    accUploadCloudFileBtn.addEventListener('click', () => accUploadCloudFileInput.click());
    accUploadCloudFileInput.addEventListener('change', async () => {
      const file = accUploadCloudFileInput.files && accUploadCloudFileInput.files[0];
      accUploadCloudFileInput.value = '';
      if (!file || !window.PKCloudSync) return;
      accUploadCloudFileBtn.disabled = true;
      const res = await window.PKCloudSync.uploadUserFile(file, { category: 'personal' });
      accUploadCloudFileBtn.disabled = false;
      if (!res.ok) {
        if (typeof showToast === 'function') showToast(pkIcon('zap', 18), 'Upload Failed', res.error || 'Could not upload file.');
        return;
      }
      if (typeof showToast === 'function') {
        showToast(pkIcon('check', 18), 'File Saved', `"${file.name}" saved to your personal files.`);
      }
      await refreshCloudFilesList();
    });
  }

  const accChangePasswordBtn = document.getElementById('accChangePasswordBtn');
  if (accChangePasswordBtn && recoveryForm) {
    accChangePasswordBtn.addEventListener('click', () => {
      showAuthPanel(recoveryForm, 'Update Password');
    });
  }

  const recoveryCancelBtn = document.getElementById('recoveryCancelBtn');
  if (recoveryCancelBtn) {
    recoveryCancelBtn.addEventListener('click', async () => {
      const user = await AuthProvider.getCurrentUser();
      if (user) {
        showAuthPanel(accountPanel, 'Your Account');
      } else {
        showAuthPanel(signInForm, 'Sign In');
      }
    });
  }

  const deleteAccountBtn = document.getElementById('deleteAccountBtn');
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', async () => {
      const user = await AuthProvider.getCurrentUser();
      if (!user) return;
      const confirmed = typeof templeConfirm === 'function'
        ? await templeConfirm(
            `Permanently delete your account (${user.email}) and erase all saved progress, settings, and personal files? This action cannot be undone.`,
            { title: 'Delete Your Account?', danger: true, confirmLabel: 'Yes, Delete My Account' }
          )
        : confirm(`Permanently delete your account (${user.email}) and all saved data?`);
      if (!confirmed) return;

      deleteAccountBtn.disabled = true;
      let res = { ok: false, error: 'Could not delete account. Please try again.' };
      if (window.PKCloudSync && typeof window.PKCloudSync.deleteAccountAndCloudData === 'function') {
        res = await window.PKCloudSync.deleteAccountAndCloudData();
      }
      deleteAccountBtn.disabled = false;

      if (!res.ok) {
        if (typeof showToast === 'function') {
          showToast(pkIcon('zap', 18), 'Could Not Delete Account', res.error || 'Please try again.');
        }
        return;
      }

      AccountProgress.clearAccountSnapshot(user.id);
      AccountProgress.clearAccountSnapshot(user.email);
      AccountProgress.clearLiveProgressKeys();

      try {
        sessionStorage.setItem(
          'khmerPostAuthToast',
          JSON.stringify({
            icon: pkIcon('check', 18),
            title: 'Account Deleted',
            sub: 'Your account and saved data have been permanently removed.'
          })
        );
      } catch (e) {}
      location.reload();
    });
  }

  document.getElementById('accountViewStatsBtn').addEventListener('click', () => {
    authModal.hidden = true;
    const btn = document.getElementById('statsOpenBtn');
    if (btn) btn.click();
  });
  document.getElementById('accountSettingsBtn').addEventListener('click', () => {
    authModal.hidden = true;
    const btn = document.getElementById('settingsOpenBtn');
    if (btn) btn.click();
  });

  authOpenBtn.addEventListener('click', openAccountModal);
  authAccountChip.addEventListener('click', openAccountModal);
  if (cloudSyncStatusBadge) {
    cloudSyncStatusBadge.addEventListener('click', openAccountModal);
  }

  function closeAuthModal() {
    closeModalAnimated(authModal);
  }
  authCloseBtn.addEventListener('click', closeAuthModal);
  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) closeAuthModal();
  });
  authModal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAuthModal();
  });

  document.getElementById('gotoSignUpBtn').addEventListener('click', () => showAuthPanel(signUpForm, 'Sign Up'));
  document.getElementById('gotoSignInBtn').addEventListener('click', () => showAuthPanel(signInForm, 'Sign In'));
  document.getElementById('forgotPasswordLink').addEventListener('click', () => showAuthPanel(forgotForm, 'Reset Password'));
  document.getElementById('backToSignInBtn').addEventListener('click', () => showAuthPanel(signInForm, 'Sign In'));

  const verifyBackToSignInBtn = document.getElementById('verifyBackToSignInBtn');
  if (verifyBackToSignInBtn) {
    verifyBackToSignInBtn.addEventListener('click', () => showAuthPanel(signInForm, 'Sign In'));
  }

  const resendVerifyEmailBtn = document.getElementById('resendVerifyEmailBtn');
  if (resendVerifyEmailBtn) {
    resendVerifyEmailBtn.addEventListener('click', async () => {
      const noteEl = document.getElementById('verifyEmailNote') || document.getElementById('verifyEmailResendNote');
      if (!pendingVerifyEmail) return;
      setSubmitLoading(resendVerifyEmailBtn, true);
      const res = await AuthProvider.resendVerificationEmail({ email: pendingVerifyEmail });
      setSubmitLoading(resendVerifyEmailBtn, false);
      if (noteEl) {
        noteEl.hidden = false;
        noteEl.textContent = res.ok
          ? `Verification link resent to ${pendingVerifyEmail}. Check your inbox and spam folder.`
          : res.error || 'Could not resend verification email.';
      }
    });
  }

  /* ---------- Sign In Submit ---------- */
  signInForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const identifierEl = document.getElementById('signInIdentifier');
    const passwordEl = document.getElementById('signInPassword');
    const identifierErr = document.getElementById('signInIdentifierError');
    const passwordErr = document.getElementById('signInPasswordError');
    const formErr = document.getElementById('signInFormError');
    clearFieldError(identifierEl, identifierErr);
    clearFieldError(passwordEl, passwordErr);
    setFormError(formErr, '');

    let valid = true;
    const rawIdentifier = identifierEl.value.trim();
    if (!rawIdentifier) {
      setFieldError(identifierEl, identifierErr, 'Please enter your email or username.');
      valid = false;
    } else if (rawIdentifier.includes('@') && !EMAIL_RE.test(rawIdentifier)) {
      setFieldError(identifierEl, identifierErr, 'Please enter a valid email address.');
      valid = false;
    } else if (rawIdentifier.length < 2) {
      setFieldError(identifierEl, identifierErr, 'Please enter a valid email or username.');
      valid = false;
    }
    if (!passwordEl.value) {
      setFieldError(passwordEl, passwordErr, 'Please enter your password.');
      valid = false;
    }
    if (!valid) {
      shakeForm(signInForm);
      return;
    }

    const submitBtn = document.getElementById('signInSubmitBtn');
    setSubmitLoading(submitBtn, true);
    const result = await AuthProvider.signIn({
      email: rawIdentifier,
      identifier: rawIdentifier,
      password: passwordEl.value
    });
    passwordEl.value = '';
    setSubmitLoading(submitBtn, false);

    if (!result.ok) {
      if (result.code === 'EMAIL_NOT_CONFIRMED' && verifyEmailPanel) {
        pendingVerifyEmail = rawIdentifier;
        const addrEl = document.getElementById('verifyEmailTarget') || document.getElementById('verifyEmailAddress');
        if (addrEl) addrEl.textContent = rawIdentifier;
        showAuthPanel(verifyEmailPanel, 'Verify Your Email');
        return;
      }
      setFormError(formErr, result.error || 'Incorrect email or password. Please try again.');
      shakeForm(signInForm);
      return;
    }

    await flashSuccess(submitBtn, 'Success!');
    AccountProgress.restore(result.user.id || result.user.email);
    if (window.PKCloudSync && typeof window.PKCloudSync.reconcileOnSignIn === 'function') {
      await window.PKCloudSync.reconcileOnSignIn(result.rawUser || result.user);
    }

    try {
      sessionStorage.setItem(
        'khmerPostAuthToast',
        JSON.stringify({
          icon: pkIcon('check', 18),
          title: 'Signed In',
          sub: `Welcome back, ${result.user.username}!`
        })
      );
    } catch (err) {}
    location.reload();
  });

  /* ---------- Sign Up Submit ---------- */
  signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usernameEl = document.getElementById('signUpUsername');
    const emailEl = document.getElementById('signUpEmail');
    const passwordEl = document.getElementById('signUpPassword');
    const confirmEl = document.getElementById('signUpConfirmPassword');
    const termsEl = document.getElementById('signUpTerms');
    const usernameErr = document.getElementById('signUpUsernameError');
    const emailErr = document.getElementById('signUpEmailError');
    const passwordErr = document.getElementById('signUpPasswordError');
    const confirmErr = document.getElementById('signUpConfirmError');
    const termsErr = document.getElementById('signUpTermsError');
    const formErr = document.getElementById('signUpFormError');

    [usernameEl, emailEl, passwordEl, confirmEl].forEach((el, i) =>
      clearFieldError(el, [usernameErr, emailErr, passwordErr, confirmErr][i])
    );
    termsErr.textContent = '';
    setFormError(formErr, '');

    let valid = true;
    const username = usernameEl.value.trim();
    if (username.length < 2) {
      setFieldError(usernameEl, usernameErr, 'Display name must be at least 2 characters.');
      valid = false;
    } else if (!/^[A-Za-z0-9_\-\s\u1780-\u17FF]+$/.test(username)) {
      setFieldError(usernameEl, usernameErr, 'Use only letters, numbers, spaces, hyphens, and underscores.');
      valid = false;
    }

    const email = emailEl.value.trim();
    const emailCheck = checkEmailQuality(email);
    if (!emailCheck.ok) {
      setFieldError(emailEl, emailErr, emailCheck.reason);
      valid = false;
    }

    const password = passwordEl.value;
    if (password.length < 8) {
      setFieldError(passwordEl, passwordErr, 'Password must be at least 8 characters.');
      valid = false;
    }

    if (confirmEl.value !== password || !confirmEl.value) {
      setFieldError(confirmEl, confirmErr, 'Passwords do not match.');
      valid = false;
    }

    if (!termsEl.checked) {
      termsErr.textContent = 'Please agree to the Terms & Conditions to continue.';
      valid = false;
    }

    if (!valid) {
      shakeForm(signUpForm);
      return;
    }

    const submitBtn = document.getElementById('signUpSubmitBtn');
    setSubmitLoading(submitBtn, true);
    const result = await AuthProvider.signUp({ username, email, password });
    passwordEl.value = '';
    confirmEl.value = '';
    setSubmitLoading(submitBtn, false);

    if (!result.ok) {
      setFormError(formErr, result.error || 'Could not create account. Please try again.');
      shakeForm(signUpForm);
      return;
    }

    signUpForm.reset();
    updateStrengthUI(0);

    if (result.confirmationRequired && verifyEmailPanel) {
      pendingVerifyEmail = result.email;
      const addrEl = document.getElementById('verifyEmailTarget') || document.getElementById('verifyEmailAddress');
      if (addrEl) addrEl.textContent = result.email;
      const noteEl = document.getElementById('verifyEmailNote') || document.getElementById('verifyEmailResendNote');
      if (noteEl) noteEl.hidden = true;
      showAuthPanel(verifyEmailPanel, 'Check Your Email');
      return;
    }

    await flashSuccess(submitBtn, 'Welcome!');
    AccountProgress.restore(result.user.id || result.user.email);
    if (window.PKCloudSync && typeof window.PKCloudSync.reconcileOnSignIn === 'function' && result.user) {
      await window.PKCloudSync.reconcileOnSignIn({ id: result.user.id, email: result.user.email });
    }
    try {
      sessionStorage.setItem(
        'khmerPostAuthToast',
        JSON.stringify({
          icon: pkIcon('star', 18),
          title: 'Welcome!',
          sub: `Signed in as ${result.user.username}. Happy typing!`
        })
      );
    } catch (err) {}
    authModal.hidden = true;
    location.reload();
  });

  /* ---------- Forgot Password Submit ---------- */
  forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailEl = document.getElementById('forgotEmail');
    const emailErr = document.getElementById('forgotEmailError');
    const formErr = document.getElementById('forgotFormError');
    const noteEl = document.getElementById('forgotFormNote');
    clearFieldError(emailEl, emailErr);
    setFormError(formErr, '');
    noteEl.hidden = true;

    const forgotEmailCheck = checkEmailQuality(emailEl.value.trim());
    if (!forgotEmailCheck.ok) {
      setFieldError(emailEl, emailErr, forgotEmailCheck.reason);
      return;
    }

    const submitBtn = document.getElementById('forgotSubmitBtn');
    setSubmitLoading(submitBtn, true);
    const res = await AuthProvider.requestPasswordReset({ email: emailEl.value.trim() });
    setSubmitLoading(submitBtn, false);

    if (!res.ok) {
      setFormError(formErr, res.error || 'No account found with that email address.');
      shakeForm(forgotForm);
      return;
    }

    forgotForm.reset();
    if (res.localDirectReset && recoveryForm) {
      showAuthPanel(recoveryForm, 'Set New Password');
      return;
    }

    noteEl.hidden = false;
    noteEl.textContent =
      'We sent a password reset link to your email address. Click the link in your email to set a new password.';
  });

  /* ---------- Password Recovery / Update Password Submit ---------- */
  if (recoveryForm) {
    recoveryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPwEl = document.getElementById('recoveryNewPassword');
      const confirmPwEl = document.getElementById('recoveryConfirmPassword');
      const newPwErr = document.getElementById('recoveryNewPasswordError');
      const confirmPwErr =
        document.getElementById('recoveryConfirmPasswordError') ||
        document.getElementById('recoveryConfirmError');
      const formErr = document.getElementById('recoveryFormError');
      const noteEl = document.getElementById('recoveryFormNote');

      clearFieldError(newPwEl, newPwErr);
      clearFieldError(confirmPwEl, confirmPwErr);
      setFormError(formErr, '');
      if (noteEl) noteEl.hidden = true;

      let valid = true;
      const newPassword = newPwEl.value;
      if (!newPassword || newPassword.length < 8) {
        setFieldError(newPwEl, newPwErr, 'New password must be at least 8 characters.');
        valid = false;
      }
      if (confirmPwEl.value !== newPassword || !confirmPwEl.value) {
        setFieldError(confirmPwEl, confirmPwErr, 'Passwords do not match.');
        valid = false;
      }
      if (!valid) {
        shakeForm(recoveryForm);
        return;
      }

      const submitBtn = document.getElementById('recoverySubmitBtn');
      setSubmitLoading(submitBtn, true);
      const res = await AuthProvider.updatePassword({ password: newPassword });
      newPwEl.value = '';
      confirmPwEl.value = '';
      setSubmitLoading(submitBtn, false);

      if (!res.ok) {
        setFormError(formErr, res.error || 'Could not update password. Please try again.');
        shakeForm(recoveryForm);
        return;
      }

      await flashSuccess(submitBtn, 'Updated!');
      recoveryForm.reset();
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      }
      if (typeof showToast === 'function') {
        showToast(pkIcon('check', 18), 'Password Updated', 'Your new password has been saved.');
      }
      await refreshAuthButtonState();
      const user = await AuthProvider.getCurrentUser();
      if (user) {
        populateAccountPanel(user);
        showAuthPanel(accountPanel, 'Your Account');
      } else {
        showAuthPanel(signInForm, 'Sign In');
      }
    });
  }

  /* ---------- Sign Out ---------- */
  document.getElementById('signOutBtn').addEventListener('click', async () => {
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) signOutBtn.disabled = true;

    const outgoingUser = await AuthProvider.getCurrentUser();
    if (window.PKCloudSync && typeof window.PKCloudSync.flushOfflineQueue === 'function') {
      try {
        await window.PKCloudSync.flushOfflineQueue();
      } catch (e) {}
    }
    if (outgoingUser) {
      AccountProgress.snapshotAndClear(outgoingUser.id);
    } else {
      AccountProgress.clearLiveProgressKeys();
    }
    if (window.PKCloudSync && typeof window.PKCloudSync.clearStateOnSignOut === 'function') {
      await window.PKCloudSync.clearStateOnSignOut();
    }
    await AuthProvider.signOut();

    try {
      sessionStorage.setItem(
        'khmerPostAuthToast',
        JSON.stringify({
          icon: pkIcon('user', 18),
          title: 'Signed Out',
          sub: 'Your progress is safely synced to the cloud.'
        })
      );
    } catch (e) {}
    location.reload();
  });

  /* ---------- Terms & Conditions Modal ---------- */
  const termsModal = document.getElementById('termsModal');
  const termsCloseBtn = document.getElementById('termsCloseBtn');
  const termsAckBtn = document.getElementById('termsAckBtn');
  function openTermsModal() {
    termsModal.hidden = false;
    requestAnimationFrame(() => termsAckBtn.focus());
  }
  function closeTermsModal() {
    closeModalAnimated(termsModal);
  }
  document.getElementById('authTermsLink').addEventListener('click', openTermsModal);
  termsCloseBtn.addEventListener('click', closeTermsModal);
  termsAckBtn.addEventListener('click', () => {
    document.getElementById('signUpTerms').checked = true;
    closeTermsModal();
  });
  termsModal.addEventListener('click', (e) => {
    if (e.target === termsModal) closeTermsModal();
  });
  termsModal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeTermsModal();
  });

  /* ---------- Supabase Auth State Listener & Recovery URL Detection ---------- */
  function checkUrlForRecoveryOrAuthCallback() {
    const hash = String(window.location.hash || '');
    const search = String(window.location.search || '');
    if (hash.includes('type=recovery') || search.includes('type=recovery')) {
      authModal.hidden = false;
      showAuthPanel(recoveryForm, 'Set New Password');
      return true;
    }
    return false;
  }

  async function bootstrapAuthSession() {
    const openedRecovery = checkUrlForRecoveryOrAuthCallback();
    const rawUser = await AuthProvider.getCurrentRawUser();
    if (rawUser && !hasReconciledInitialSession) {
      hasReconciledInitialSession = true;
      AccountProgress.restore(rawUser.id);
      if (window.PKCloudSync && typeof window.PKCloudSync.reconcileOnSignIn === 'function') {
        await window.PKCloudSync.reconcileOnSignIn(rawUser);
      }
    }
    await refreshAuthButtonState();

    const sb = window.PKSupabaseConfig && window.PKSupabaseConfig.getSupabaseClient();
    if (sb && sb.auth && typeof sb.auth.onAuthStateChange === 'function') {
      sb.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY' && recoveryForm) {
          authModal.hidden = false;
          showAuthPanel(recoveryForm, 'Set New Password');
          return;
        }
        if (event === 'SIGNED_IN' && session && session.user && !hasReconciledInitialSession) {
          hasReconciledInitialSession = true;
          AccountProgress.restore(session.user.id);
          if (window.PKCloudSync && typeof window.PKCloudSync.reconcileOnSignIn === 'function') {
            await window.PKCloudSync.reconcileOnSignIn(session.user);
          }
          await refreshAuthButtonState();
        } else if (event === 'SIGNED_OUT') {
          hasReconciledInitialSession = false;
          await refreshAuthButtonState();
        } else if (event === 'USER_UPDATED') {
          await refreshAuthButtonState();
        }
      });
    }
    void openedRecovery;
  }

  bootstrapAuthSession();

  try {
    const queuedToast = sessionStorage.getItem('khmerPostAuthToast');
    if (queuedToast) {
      sessionStorage.removeItem('khmerPostAuthToast');
      const t = JSON.parse(queuedToast);
      if (typeof showToast === 'function') showToast(t.icon, t.title, t.sub);
    }
  } catch (e) {}

  window.addEventListener('pageshow', () => {
    refreshAuthButtonState();
  });
})();

/* ============================================================
   Settings Modal — Local Export / Import / Reset Progress Actions
   ============================================================ */
function initStorageActions() {
  const exportBtn = document.getElementById('exportProgressBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      try {
        const data = {};
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith('khmer') || k.startsWith('pk_') || k.startsWith('kk_')) {
            data[k] = localStorage.getItem(k);
          }
        });
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'khmer-keyboard-progress.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (e) {}
    });
  }

  const importProgressInput = document.getElementById('importProgressInput');
  const importProgressBtn = document.getElementById('importProgressBtn');
  if (importProgressBtn && importProgressInput) {
    importProgressBtn.addEventListener('click', () => importProgressInput.click());
    importProgressInput.addEventListener('change', () => {
      const file = importProgressInput.files && importProgressInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const data = JSON.parse(reader.result);
          const ok = await templeConfirm(
            'This will overwrite your current progress and settings with the imported backup.',
            { title: 'Restore backup?', confirmLabel: 'Restore', icon: pkIcon('scroll', 24) }
          );
          if (!ok) return;
          Object.keys(data).forEach((k) => {
            if (k.startsWith('khmer') || k.startsWith('pk_') || k.startsWith('kk_')) {
              localStorage.setItem(k, data[k]);
            }
          });
          if (window.PKCloudSync && typeof window.PKCloudSync.syncAllNow === 'function') {
            await window.PKCloudSync.syncAllNow();
          }
          location.reload();
        } catch (e) {
          alert('That file could not be read as a valid backup.');
        }
      };
      reader.readAsText(file);
      importProgressInput.value = '';
    });
  }

  /* ---------- Reset Progress ---------- */
  const resetProgressBtn = document.getElementById('resetProgressBtn');
  if (resetProgressBtn) {
    resetProgressBtn.addEventListener('click', async () => {
      const ok = await templeConfirm(
        'This will permanently erase all lesson scores, Temple Trial records, practice statistics, and Adaptive Practice progress.',
        { title: 'Erase all progress?', danger: true, confirmLabel: 'Yes, erase it' }
      );
      if (!ok) return;
      try {
        if (typeof window !== 'undefined') {
          window.__isResettingProgress = true;
          if (typeof window.executeLessonExit === 'function') {
            try {
              window.executeLessonExit();
            } catch (e) {}
          }
          if (typeof window.clearActiveLessonSession === 'function') {
            try {
              window.clearActiveLessonSession();
            } catch (e) {}
          }
        }
        if (
          typeof window !== 'undefined' &&
          window.PK_ADAPTIVE &&
          typeof window.PK_ADAPTIVE.resetAdaptiveState === 'function'
        ) {
          window.PK_ADAPTIVE.resetAdaptiveState();
        }
        if (
          typeof window !== 'undefined' &&
          window.PK_PROGRESS &&
          typeof window.PK_PROGRESS.resetAll === 'function'
        ) {
          window.PK_PROGRESS.resetAll();
        }
        if (
          typeof window !== 'undefined' &&
          window.PK_TRACKER &&
          typeof window.PK_TRACKER.resetAll === 'function'
        ) {
          window.PK_TRACKER.resetAll();
        }
        if (
          typeof window !== 'undefined' &&
          window.PK_REVIEW &&
          typeof window.PK_REVIEW.resetAll === 'function'
        ) {
          window.PK_REVIEW.resetAll();
        }

        // Also clear cloud lesson_progress if signed in
        const sb = window.PKSupabaseConfig && window.PKSupabaseConfig.getSupabaseClient();
        const user = await AuthProvider.getCurrentUser();
        if (user) {
          AccountProgress.clearAccountSnapshot(user.id);
          AccountProgress.clearAccountSnapshot(user.email);
          if (sb) {
            try {
              await sb.from('lesson_progress').delete().eq('user_id', user.id);
            } catch (e) {}
          }
        }

        Object.keys(localStorage).forEach((k) => {
          if (
            (k.startsWith('khmer') || k.startsWith('pk_') || isProgressKey(k)) &&
            k !== 'khmerProfile' &&
            k !== 'khmerAccounts' &&
            k !== 'khmerActiveSession' &&
            k !== 'pk_cloud_owner_user_id'
          ) {
            localStorage.removeItem(k);
          }
        });
      } catch (e) {
        console.error('Reset all progress error:', e);
      }
      location.reload();
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStorageActions);
} else {
  initStorageActions();
}
