/* ============================================================
   PK Khmer Type — Storage, Authentication & Progress Persistence
   ============================================================ */

const AuthProvider = (function(){
  const USERS_KEY = 'khmerAuthUsers';     // { [emailLower]: {username, email, salt, hash, createdAt} }
  const SESSION_KEY = 'khmerAuthSession'; // localStorage: {email} — persists until explicit sign out
                                           // (survives refresh, back/forward, and closing the tab/browser)

  function loadUsers(){
    try{ return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); }
    catch(e){ return {}; }
  }
  function saveUsers(users){
    try{ localStorage.setItem(USERS_KEY, JSON.stringify(users)); }catch(e){}
  }

  function bufToHex(buf){
    return Array.from(new Uint8Array(buf)).map(b=> b.toString(16).padStart(2,'0')).join('');
  }
  async function sha256Hex(text){
    if(window.crypto && window.crypto.subtle){
      const data = new TextEncoder().encode(text);
      const digest = await window.crypto.subtle.digest('SHA-256', data);
      return bufToHex(digest);
    }
    // Extremely small fallback so the demo still runs if subtle crypto is
    // unavailable (e.g. very old browser / non-https context). Not secure —
    // a real backend must never rely on this path.
    let h = 0;
    for(let i=0;i<text.length;i++){ h = (Math.imul(31,h) + text.charCodeAt(i)) | 0; }
    return 'fallback' + Math.abs(h).toString(16);
  }
  function randomSalt(){
    const arr = new Uint8Array(16);
    if(window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(arr);
    else for(let i=0;i<arr.length;i++) arr[i] = Math.floor(Math.random()*256);
    return bufToHex(arr.buffer);
  }
  async function hashPassword(password, salt){
    return sha256Hex(salt + ':' + password);
  }

  /* ---- random per-account avatar generation ----
     Every new sign-up gets its own randomly-generated avatar (a colorful
     gradient badge with a random icon), instead of everyone sharing the
     same picture. It's seeded so a given account keeps the same avatar
     across sessions unless the person uploads their own. */
  function seededRng(seed){
    let h = 1779033703 ^ seed.length;
    for(let i=0;i<seed.length;i++){
      h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function(){
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      h ^= h >>> 16;
      return (h >>> 0) / 4294967296;
    };
  }
  const AVATAR_PALETTES = [
    ['#ffd166','#2d6cb3'], ['#2dd4a7','#2d6cb3'], ['#ff3b56','#a13d47'],
    ['#5fd694','#238a5a'], ['#b98af0','#6b3fb0'], ['#ff8a5c','#e63e8c'],
    ['#63d6c9','#268f83'], ['#ffe066','#ff9f1c'],
  ];
  const AVATAR_ICON_KEYS = ['user', 'star', 'flame', 'zap', 'crown', 'castle', 'flag', 'trophy', 'target', 'key', 'sword', 'award'];
  function generateAvatarDataUri(seed){
    const rng = seededRng(String(seed || Math.random()));
    const [c1,c2] = AVATAR_PALETTES[Math.floor(rng()*AVATAR_PALETTES.length)];
    const iconKey = AVATAR_ICON_KEYS[Math.floor(rng()*AVATAR_ICON_KEYS.length)];
    const iconSvg = PK_ICONS[iconKey] || PK_ICONS.user;
    const angle = Math.floor(rng()*360);
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

  function publicUser(record){
    return { username: record.username, email: record.email, createdAt: record.createdAt || null, avatar: record.avatar || null };
  }

  const LocalAuthProvider = {
    async signUp({username, email, password}){
      const users = loadUsers();
      const key = email.trim().toLowerCase();
      if(users[key]){
        return { ok:false, error:'An account with that email already exists.' };
      }
      const usernameTaken = Object.values(users).some(u=> u.username.toLowerCase() === username.trim().toLowerCase());
      if(usernameTaken){
        return { ok:false, error:'That username is already taken.' };
      }
      const salt = randomSalt();
      const hash = await hashPassword(password, salt);
      const avatar = generateAvatarDataUri(key + ':' + Date.now() + ':' + Math.random());
      users[key] = { username: username.trim(), email: email.trim(), salt, hash, createdAt: Date.now(), avatar };
      saveUsers(users);
      try{ localStorage.setItem(SESSION_KEY, JSON.stringify({ email: users[key].email })); }catch(e){}
      return { ok:true, user: publicUser(users[key]) };
    },

    async updateAvatar({email, avatar}){
      const users = loadUsers();
      const key = email.trim().toLowerCase();
      if(!users[key]) return { ok:false, error:'No account found.' };
      users[key].avatar = avatar;
      saveUsers(users);
      return { ok:true, user: publicUser(users[key]) };
    },

    async signIn({identifier, password}){
      const users = loadUsers();
      const idLower = identifier.trim().toLowerCase();
      const record = users[idLower] || Object.values(users).find(u=> u.username.toLowerCase() === idLower);
      if(!record){
        return { ok:false, error:'No account found for that email or username.' };
      }
      const hash = await hashPassword(password, record.salt);
      if(hash !== record.hash){
        return { ok:false, error:'Incorrect password. Please try again.' };
      }
      // Accounts created before per-user avatars existed won't have one yet —
      // give them a random one now instead of falling back to a shared image.
      if(!record.avatar){
        record.avatar = generateAvatarDataUri(record.email.toLowerCase() + ':' + record.createdAt);
        saveUsers(users);
      }
      // Session is written to localStorage (not sessionStorage), so it survives
      // page refreshes, back/forward navigation, and closing/reopening the tab —
      // the user stays signed in until they explicitly sign out.
      try{ localStorage.setItem(SESSION_KEY, JSON.stringify({ email: record.email })); }catch(e){}
      return { ok:true, user: publicUser(record) };
    },

    async signOut(){
      try{ localStorage.removeItem(SESSION_KEY); }catch(e){}
      return { ok:true };
    },

    async requestPasswordReset({email}){
      const users = loadUsers();
      const key = email.trim().toLowerCase();
      // Always resolve the same way whether or not the account exists —
      // a real backend should do the same, so this UI never leaks which
      // emails are registered.
      void users[key];
      return { ok:true };
    },

    async getCurrentUser(){
      const users = loadUsers();
      let session = null;
      try{ session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }catch(e){}
      if(!session || !session.email) return null;
      const key = session.email.trim().toLowerCase();
      const record = users[key];
      if(!record) return null;
      if(!record.avatar){
        record.avatar = generateAvatarDataUri(key + ':' + record.createdAt);
        saveUsers(users);
      }
      return publicUser(record);
    },
  };

  return LocalAuthProvider;
})();


/* =====================================================================
   PER-ACCOUNT PROGRESS
   Lesson scores, Temple Trial best, race personal bests, and overall
   practice totals are tied to whichever account is signed in — not
   shared globally. Signing back into an account restores exactly what
   that account left off with; signing into a *different* (or brand
   new) account starts that account's progress from scratch; signing
   out snapshots the current account's progress and then blanks the
   live keys, so the app looks like nothing has ever been typed until
   someone signs back in.

   Left OUT of this (kept global/shared, same for every account):
   - App settings (theme, sound, accessibility toggles, etc.) — these
     are treated as a browser/device preference, not personal progress.
   - The display name + avatar shown in the profile card, and the
     Race leaderboard (a shared local high-score table by nickname).
   ===================================================================== */
const AccountProgress = (function(){
  const STORE_KEY = 'khmerAccountProgress'; // { [emailLower]: { [storageKey]: value } }

  function isProgressKey(key){
    if(key === 'khmerTrialBest') return true;
    if(key === 'khmerGlobalStats') return true;
    if(key === 'khmerTrackingData_v1') return true;
    if(key === 'khmerReviewData_v1') return true;
    if(key === 'khmerProgress_v2' || key === 'khmerProgress_v1') return true;
    if(key.indexOf('khmerLessonBest_') === 0) return true;
    if(/^khmerRaceBest[A-Z]/.test(key)) return true;
    return false;
  }

  function loadStore(){
    try{ return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); }
    catch(e){ return {}; }
  }
  function saveStore(store){
    try{ localStorage.setItem(STORE_KEY, JSON.stringify(store)); }catch(e){}
  }

  function clearLiveProgressKeys(){
    try{
      Object.keys(localStorage).forEach(k=>{ if(isProgressKey(k)) localStorage.removeItem(k); });
    }catch(e){}
  }

  /* Snapshots whatever progress is currently live in localStorage into
     this account's slot, then blanks the live keys. Call on sign-out. */
  function snapshotAndClear(email){
    if(!email) return;
    const key = email.trim().toLowerCase();
    const snapshot = {};
    try{
      Object.keys(localStorage).forEach(k=>{
        if(isProgressKey(k)) snapshot[k] = localStorage.getItem(k);
      });
    }catch(e){}
    const store = loadStore();
    store[key] = snapshot;
    saveStore(store);
    clearLiveProgressKeys();
  }

  /* Blanks the live keys, then replays this account's saved snapshot
     (if any) back into localStorage. Call right after sign-in. A new
     account with no snapshot yet simply ends up blank. */
  function restore(email){
    clearLiveProgressKeys();
    if(!email) return;
    const key = email.trim().toLowerCase();
    const store = loadStore();
    const snapshot = store[key];
    if(!snapshot) return;
    try{
      Object.keys(snapshot).forEach(k=>{ if(isProgressKey(k)) localStorage.setItem(k, snapshot[k]); });
    }catch(e){}
  }

  return { snapshotAndClear, restore };
})();

(function(){

  const authOpenBtn = document.getElementById('authOpenBtn');
  const authAccountChip = document.getElementById('authAccountChip');
  const authChipAvatar = document.getElementById('authChipAvatar');
  const authChipName = document.getElementById('authChipName');
  const authModal = document.getElementById('authModal');
  const authCard = document.getElementById('authCard');
  const authCloseBtn = document.getElementById('authCloseBtn');
  const authModalTitleText = document.getElementById('authModalTitleText');

  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');
  const forgotForm = document.getElementById('forgotForm');
  const accountPanel = document.getElementById('accountPanel');
  const allAuthPanels = [signInForm, signUpForm, forgotForm, accountPanel];

  const authTabs = document.getElementById('authTabs');
  const authTabSignIn = document.getElementById('authTabSignIn');
  const authTabSignUp = document.getElementById('authTabSignUp');

  function showAuthPanel(panel, title){
    allAuthPanels.forEach(p=> p.hidden = (p !== panel));
    authModalTitleText.textContent = title;

    if(panel === signInForm || panel === signUpForm){
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

    const firstInput = panel.querySelector('input:not([type="checkbox"])');
    if(firstInput) requestAnimationFrame(()=> firstInput.focus());

    panel.querySelectorAll(':scope > .auth-field, :scope > .auth-row-between, :scope > .auth-checkbox')
      .forEach((el, i)=> el.style.animationDelay = (i * 0.05) + 's');
  }

  authTabSignIn.addEventListener('click', ()=>{ if(!signInForm.hidden) return; showAuthPanel(signInForm, 'Sign In'); });
  authTabSignUp.addEventListener('click', ()=>{ if(!signUpForm.hidden) return; showAuthPanel(signUpForm, 'Sign Up'); });

  function clearFieldError(fieldEl, errorEl){
    fieldEl.closest('.auth-field')?.classList.remove('has-error');
    if(errorEl) errorEl.textContent = '';
  }
  function setFieldError(fieldEl, errorEl, message){
    fieldEl.closest('.auth-field')?.classList.add('has-error');
    if(errorEl) errorEl.textContent = message;
  }
  function setFormError(el, message){
    if(!message){ el.hidden = true; el.textContent = ''; return; }
    el.hidden = false;
    el.textContent = message;
  }
  function setSubmitLoading(btn, loading){
    btn.classList.toggle('is-loading', loading);
    btn.disabled = loading;
  }
  function shakeForm(form){
    form.classList.remove('auth-shake');
    void form.offsetWidth; // force reflow so the animation restarts every time
    form.classList.add('auth-shake');
    form.addEventListener('animationend', ()=> form.classList.remove('auth-shake'), { once:true });
  }
  async function flashSuccess(btn, label){
    const labelEl = btn.querySelector('.auth-submit-label');
    const original = labelEl.textContent;
    btn.classList.add('is-success');
    labelEl.textContent = label;
    await new Promise(r=> setTimeout(r, 480));
    btn.classList.remove('is-success');
    labelEl.textContent = original;
  }

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ---- stricter email checking (client-side only — no backend means we
     can't send a real confirmation email or call a verification API, so
     this focuses on rejecting obviously malformed / fake addresses) ---- */

  // Known disposable / temp-mail domains. Not exhaustive, but covers the
  // most common throwaway-inbox services people use to dodge signup.
  const DISPOSABLE_EMAIL_DOMAINS = new Set([
    'mailinator.com','guerrillamail.com','guerrillamail.info','guerrillamail.biz',
    'guerrillamail.de','guerrillamail.net','sharklasers.com','grr.la',
    'temp-mail.org','tempmail.com','tempmail.net','tempmailo.com','10minutemail.com',
    '10minutemail.net','20minutemail.com','throwawaymail.com','trashmail.com',
    'trashmail.net','yopmail.com','yopmail.net','yopmail.fr','moakt.com',
    'getnada.com','maildrop.cc','dispostable.com','fakeinbox.com','mytemp.email',
    'mohmal.com','emailondeck.com','tempinbox.com','spamgourmet.com',
    'mailnesia.com','mintemail.com','mail-temp.com','tempr.email','tmpmail.org',
    'tmpmail.net','tmail.ws','discard.email','discardmail.com','fakemail.net',
    'inboxbear.com','burnermail.io','mail.tm','nowmymail.com','emlpro.com'
  ]);

  // Structural checks for the big providers, where signup rules are public.
  // A regex can't prove a mailbox exists, but it can catch names that
  // violate the provider's own username rules (i.e. can never be real).
  const PROVIDER_LOCAL_RULES = {
    'gmail.com': /^[a-z0-9](?:\.?[a-z0-9]){5,29}$/i,      // 6–30 chars, no leading/trailing/double dots, letters+digits only
    'googlemail.com': /^[a-z0-9](?:\.?[a-z0-9]){5,29}$/i,
    'outlook.com': /^[a-z0-9][a-z0-9._-]{0,63}$/i,
    'hotmail.com': /^[a-z0-9][a-z0-9._-]{0,63}$/i,
    'live.com': /^[a-z0-9][a-z0-9._-]{0,63}$/i,
    'yahoo.com': /^[a-z][a-z0-9._-]{3,31}$/i,
    'icloud.com': /^[a-z][a-z0-9._-]{2,19}$/i,
  };

  function checkEmailQuality(rawEmail){
    const email = (rawEmail || '').trim();

    if(!EMAIL_RE.test(email)){
      return { ok:false, reason:'Enter a valid email address.' };
    }
    // Reject shapes that are syntactically "valid enough" for the loose
    // regex above but can never be a real deliverable address.
    if(/\.\./.test(email) || /^\.|\.@|@\.|\.$/.test(email)){
      return { ok:false, reason:'Email address has an invalid dot placement.' };
    }

    const at = email.lastIndexOf('@');
    const local = email.slice(0, at);
    const domain = email.slice(at + 1).toLowerCase();

    if(local.length > 64 || domain.length > 253){
      return { ok:false, reason:'Email address is too long.' };
    }
    if(!/^[a-z]{2,24}$/i.test(domain.split('.').pop())){
      return { ok:false, reason:'Email domain looks invalid.' };
    }

    if(DISPOSABLE_EMAIL_DOMAINS.has(domain)){
      return { ok:false, reason:'Temporary / disposable email addresses aren\u2019t allowed. Please use a real inbox.' };
    }

    const localRule = PROVIDER_LOCAL_RULES[domain];
    if(localRule && !localRule.test(local)){
      return { ok:false, reason:`That doesn\u2019t look like a real ${domain} address \u2014 check the spelling.` };
    }

    return { ok:true };
  }

  /* ---------- cursor spotlight glow on the card ---------- */
  authCard.addEventListener('mousemove', e=>{
    const rect = authCard.getBoundingClientRect();
    authCard.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%');
    authCard.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + '%');
  });
  authCard.addEventListener('mouseleave', ()=>{
    authCard.style.setProperty('--mx', '50%');
    authCard.style.setProperty('--my', '15%');
  });

  /* ---------- show/hide password ---------- */
  document.querySelectorAll('.auth-toggle-pw').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const target = document.getElementById(btn.dataset.target);
      if(!target) return;
      const show = target.type === 'password';
      target.type = show ? 'text' : 'password';
      btn.setAttribute('aria-pressed', show ? 'true' : 'false');
      btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      btn.innerHTML = show ? pkIcon('eye-off', 14) : pkIcon('eye', 14);
    });
  });

  /* ---------- password strength (Sign Up only) ---------- */
  const authPasswordStrengthLabel = document.getElementById('authPasswordStrengthLabel');
  const authStrengthBars = [
    document.getElementById('authBar1'),
    document.getElementById('authBar2'),
    document.getElementById('authBar3'),
    document.getElementById('authBar4'),
  ];
  function passwordStrength(pw){
    let score = 0;
    if(pw.length >= 8) score++;
    if(pw.length >= 12) score++;
    if(/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if(/\d/.test(pw)) score++;
    if(/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 4); // 0..4
  }
  const STRENGTH_META = [
    { label:'—',      cls:'',               bars:0 },
    { label:'Weak',   cls:'strength-weak',  bars:1 },
    { label:'Fair',   cls:'strength-fair',  bars:2 },
    { label:'Good',   cls:'strength-good',  bars:3 },
    { label:'Strong', cls:'strength-strong',bars:4 },
  ];
  const BAR_CLASSES = { 1:'lit-weak', 2:'lit-fair', 3:'lit-good', 4:'lit-strong' };
  function updateStrengthUI(score){
    const meta = STRENGTH_META[score];
    authStrengthBars.forEach((bar, i) => {
      bar.className = 'auth-strength-bar' + (i < meta.bars ? ' ' + BAR_CLASSES[score] : '');
    });
    authPasswordStrengthLabel.className = 'auth-strength-label' + (meta.cls ? ' ' + meta.cls : '');
    authPasswordStrengthLabel.innerHTML = `Strength: <b>${meta.label}</b>`;
  }
  updateStrengthUI(0);
  document.getElementById('signUpPassword').addEventListener('input', e=>{
    const pw = e.target.value;
    updateStrengthUI(pw ? Math.max(passwordStrength(pw), 1) : 0);
  });

  /* ---------- open / close / switch ---------- */
  async function refreshAuthButtonState(){
    const user = await AuthProvider.getCurrentUser();
    if(user){
      authOpenBtn.hidden = true;
      authAccountChip.hidden = false;
      const _chipImg = document.createElement('img');
      _chipImg.src = user.avatar || window.DEFAULT_AVATAR; _chipImg.alt = '';
      authChipAvatar.textContent = '';
      authChipAvatar.appendChild(_chipImg);
      authChipName.textContent = user.username;
    } else {
      authOpenBtn.hidden = false;
      authAccountChip.hidden = true;
    }
    return user;
  }

  function formatJoinDate(ts){
    if(!ts) return 'this session';
    try{
      return new Date(ts).toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
    }catch(e){ return '—'; }
  }

  const ACCOUNT_RANKS = [
    { min:0,  name:'Novice Scribe' },
    { min:5,  name:'Apprentice Scribe' },
    { min:12, name:'Temple Scribe' },
    { min:22, name:'Keeper of Letters' },
    { min:35, name:'Master Calligrapher' },
  ];
  function rankForCount(n, total){
    let r = ACCOUNT_RANKS[0], idx = 0;
    for(let i=0;i<ACCOUNT_RANKS.length;i++){ if(n >= ACCOUNT_RANKS[i].min){ r = ACCOUNT_RANKS[i]; idx = i; } }
    const next = ACCOUNT_RANKS[idx+1] || null;
    return { name: r.name, next };
  }

  function populateAccountPanel(user){
    document.getElementById('authAccountName').textContent = user.username;
    document.getElementById('authAccountEmail').textContent = user.email;
    document.getElementById('authAccountJoined').textContent = formatJoinDate(user.createdAt);
    const _accAv = document.getElementById('authAccountAvatar');
    const _accImg = document.createElement('img');
    _accImg.src = user.avatar || window.DEFAULT_AVATAR; _accImg.alt = '';
    _accAv.textContent = '';
    _accAv.appendChild(_accImg);

    // Pull live progress stats computed elsewhere in the app (lessons,
    // streak, WPM, trial/race bests) so the account panel reflects real
    // typing progress rather than just profile fields.
    const snap = (typeof window.getAccountSnapshot === 'function') ? window.getAccountSnapshot() : null;
    const grid = document.getElementById('accountStatsGrid');
    const rankLabel = document.getElementById('authAccountRank');
    const xpFill = document.getElementById('accXpFill');
    const xpLabel = document.getElementById('accXpLabel');

    if(snap){
      const rank = rankForCount(snap.lessonsMastered, snap.totalLessons);
      rankLabel.textContent = rank.name;
      if(rank.next){
        const span = rank.next.min - (ACCOUNT_RANKS.find(r=>r.name===rank.name)?.min || 0);
        const into = snap.lessonsMastered - (ACCOUNT_RANKS.find(r=>r.name===rank.name)?.min || 0);
        const pct = span > 0 ? Math.max(4, Math.min(100, Math.round((into/span)*100))) : 100;
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
        [pkIcon('calendar', 16), snap.daysPracticed, 'Days Practiced'],
      ];
      grid.innerHTML = tiles.map(([icon,val,label],i)=>
        `<div class="stat-tile" style="animation-delay:${i*45}ms">
          <div class="stat-tile-icon">${icon}</div>
          <div class="stat-tile-val">${val}</div>
          <div class="stat-tile-label">${label}</div>
        </div>`
      ).join('');
    } else {
      rankLabel.textContent = 'Novice Scribe';
      xpFill.style.width = '4%';
      xpLabel.textContent = 'Start a lesson to begin earning rank';
      grid.innerHTML = '';
    }
  }

  async function openAccountModal(){
    authModal.hidden = false;
    const user = await AuthProvider.getCurrentUser();
    if(user){
      populateAccountPanel(user);
      authCard.classList.add('is-account');
      showAuthPanel(accountPanel, 'Your Account');
    } else {
      authCard.classList.remove('is-account');
      showAuthPanel(signInForm, 'Sign In');
    }
    authCloseBtn.focus();
  }

  /* ---- let a signed-in person change their own account avatar ---- */
  const accAvatarEditBtn = document.getElementById('accAvatarEditBtn');
  const accAvatarInput = document.getElementById('accAvatarInput');
  accAvatarEditBtn.addEventListener('click', ()=> accAvatarInput.click());
  accAvatarInput.addEventListener('change', ()=>{
    const file = accAvatarInput.files && accAvatarInput.files[0];
    if(!file) return;
    const img = new Image();
    const reader = new FileReader();
    reader.onload = ()=>{
      img.onload = async ()=>{
        const size = 160;
        const canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d');
        const scale = Math.max(size / img.width, size / img.height);
        const w = img.width * scale, h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        const user = await AuthProvider.getCurrentUser();
        if(!user) return;
        const result = await AuthProvider.updateAvatar({ email: user.email, avatar: dataUrl });
        if(result.ok){
          const _accAv = document.getElementById('authAccountAvatar');
          _accAv.textContent = '';
          const _accImg = document.createElement('img');
          _accImg.src = dataUrl; _accImg.alt = '';
          _accAv.appendChild(_accImg);
          refreshAuthButtonState();
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
    accAvatarInput.value = '';
  });

  document.getElementById('accountViewStatsBtn').addEventListener('click', ()=>{
    authModal.hidden = true;
    const btn = document.getElementById('statsOpenBtn');
    if(btn) btn.click();
  });
  document.getElementById('accountSettingsBtn').addEventListener('click', ()=>{
    authModal.hidden = true;
    const btn = document.getElementById('settingsOpenBtn');
    if(btn) btn.click();
  });
  authOpenBtn.addEventListener('click', openAccountModal);
  authAccountChip.addEventListener('click', openAccountModal);
  authCloseBtn.addEventListener('click', ()=> authModal.hidden = true);
  authModal.addEventListener('click', e=>{ if(e.target === authModal) authModal.hidden = true; });
  authModal.addEventListener('keydown', e=>{ if(e.key === 'Escape') authModal.hidden = true; });

  document.getElementById('gotoSignUpBtn').addEventListener('click', ()=> showAuthPanel(signUpForm, 'Sign Up'));
  document.getElementById('gotoSignInBtn').addEventListener('click', ()=> showAuthPanel(signInForm, 'Sign In'));
  document.getElementById('forgotPasswordLink').addEventListener('click', ()=> showAuthPanel(forgotForm, 'Reset Password'));
  document.getElementById('backToSignInBtn').addEventListener('click', ()=> showAuthPanel(signInForm, 'Sign In'));

  /* ---------- Sign In ---------- */
  signInForm.addEventListener('submit', async e=>{
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
    if(!identifierEl.value.trim()){
      setFieldError(identifierEl, identifierErr, 'Enter your email or username.');
      valid = false;
    }
    if(!passwordEl.value){
      setFieldError(passwordEl, passwordErr, 'Enter your password.');
      valid = false;
    }
    if(!valid){ shakeForm(signInForm); return; }

    const submitBtn = document.getElementById('signInSubmitBtn');
    setSubmitLoading(submitBtn, true);
    const result = await AuthProvider.signIn({
      identifier: identifierEl.value,
      password: passwordEl.value,
    });
    setSubmitLoading(submitBtn, false);

    if(!result.ok){
      setFormError(formErr, result.error);
      shakeForm(signInForm);
      return;
    }
    await flashSuccess(submitBtn, 'Success!');
    AccountProgress.restore(result.user.email);
    try{
      sessionStorage.setItem('khmerPostAuthToast', JSON.stringify(
        { icon: pkIcon('check', 18), title:'Signed in', sub:`Welcome back, ${result.user.username}!` }
      ));
    }catch(e){}
    location.reload();
  });

  /* ---------- Sign Up ---------- */
  signUpForm.addEventListener('submit', async e=>{
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

    [usernameEl, emailEl, passwordEl, confirmEl].forEach((el, i)=>
      clearFieldError(el, [usernameErr, emailErr, passwordErr, confirmErr][i]));
    termsErr.textContent = '';
    setFormError(formErr, '');

    let valid = true;
    const username = usernameEl.value.trim();
    if(username.length < 3){
      setFieldError(usernameEl, usernameErr, 'Username must be at least 3 characters.');
      valid = false;
    } else if(!/^[A-Za-z0-9_\u1780-\u17FF]+$/.test(username)){
      setFieldError(usernameEl, usernameErr, 'Use only letters, numbers, and underscores.');
      valid = false;
    }

    const email = emailEl.value.trim();
    const emailCheck = checkEmailQuality(email);
    if(!emailCheck.ok){
      setFieldError(emailEl, emailErr, emailCheck.reason);
      valid = false;
    }

    const password = passwordEl.value;
    if(password.length < 8){
      setFieldError(passwordEl, passwordErr, 'Password must be at least 8 characters.');
      valid = false;
    }

    if(confirmEl.value !== password || !confirmEl.value){
      setFieldError(confirmEl, confirmErr, 'Passwords do not match.');
      valid = false;
    }

    if(!termsEl.checked){
      termsErr.textContent = 'You must agree to the Terms & Conditions to continue.';
      valid = false;
    }

    if(!valid){ shakeForm(signUpForm); return; }

    const submitBtn = document.getElementById('signUpSubmitBtn');
    setSubmitLoading(submitBtn, true);
    const result = await AuthProvider.signUp({ username, email, password });
    setSubmitLoading(submitBtn, false);

    if(!result.ok){
      setFormError(formErr, result.error);
      shakeForm(signUpForm);
      return;
    }
    await flashSuccess(submitBtn, 'Welcome!');
    signUpForm.reset();
    updateStrengthUI(0);
    AccountProgress.restore(result.user.email);
    try{
      sessionStorage.setItem('khmerPostAuthToast', JSON.stringify(
        { icon: pkIcon('star', 18), title:'Welcome!', sub:`Signed in as ${result.user.username}. Happy typing!` }
      ));
    }catch(e){}
    authModal.hidden = true;
    location.reload();
  });

  /* ---------- Forgot password ---------- */
  forgotForm.addEventListener('submit', async e=>{
    e.preventDefault();
    const emailEl = document.getElementById('forgotEmail');
    const emailErr = document.getElementById('forgotEmailError');
    const formErr = document.getElementById('forgotFormError');
    const noteEl = document.getElementById('forgotFormNote');
    clearFieldError(emailEl, emailErr);
    setFormError(formErr, '');
    noteEl.hidden = true;

    const forgotEmailCheck = checkEmailQuality(emailEl.value.trim());
    if(!forgotEmailCheck.ok){
      setFieldError(emailEl, emailErr, forgotEmailCheck.reason);
      return;
    }

    const submitBtn = document.getElementById('forgotSubmitBtn');
    setSubmitLoading(submitBtn, true);
    await AuthProvider.requestPasswordReset({ email: emailEl.value.trim() });
    setSubmitLoading(submitBtn, false);

    noteEl.hidden = false;
    noteEl.textContent = 'If an account exists for that email, a reset link would be sent here. (This demo has no email backend — connect a real AuthProvider to enable this.)';
    forgotForm.reset();
  });

  /* ---------- Sign out ---------- */
  document.getElementById('signOutBtn').addEventListener('click', async ()=>{
    const outgoingUser = await AuthProvider.getCurrentUser();
    if(outgoingUser) AccountProgress.snapshotAndClear(outgoingUser.email);
    await AuthProvider.signOut();
    try{
      sessionStorage.setItem('khmerPostAuthToast', JSON.stringify(
        { icon: pkIcon('user', 18), title:'Signed out', sub:'Come back soon!' }
      ));
    }catch(e){}
    location.reload();
  });

  /* ---------- Terms & Conditions (custom modal, replaces native alert) ---------- */
  const termsModal = document.getElementById('termsModal');
  const termsCloseBtn = document.getElementById('termsCloseBtn');
  const termsAckBtn = document.getElementById('termsAckBtn');
  function openTermsModal(){
    termsModal.hidden = false;
    requestAnimationFrame(()=> termsAckBtn.focus());
  }
  function closeTermsModal(){ termsModal.hidden = true; }
  document.getElementById('authTermsLink').addEventListener('click', openTermsModal);
  termsCloseBtn.addEventListener('click', closeTermsModal);
  termsAckBtn.addEventListener('click', ()=>{
    document.getElementById('signUpTerms').checked = true;
    closeTermsModal();
  });
  termsModal.addEventListener('click', e=>{ if(e.target === termsModal) closeTermsModal(); });
  termsModal.addEventListener('keydown', e=>{ if(e.key === 'Escape') closeTermsModal(); });

  refreshAuthButtonState();

  try{
    const queuedToast = sessionStorage.getItem('khmerPostAuthToast');
    if(queuedToast){
      sessionStorage.removeItem('khmerPostAuthToast');
      const t = JSON.parse(queuedToast);
      showToast(t.icon, t.title, t.sub);
    }
  }catch(e){}

  // Some browsers restore a page from the back/forward cache (bfcache)
  // without re-running scripts from scratch. Re-checking on 'pageshow'
  // guarantees the signed-in state is always reflected correctly after
  // using the browser's Back/Forward buttons.
  window.addEventListener('pageshow', ()=>{ refreshAuthButtonState(); });
})();


function initStorageActions(){
  /* ---------- export / import progress backup ---------- */
  document.getElementById('exportProgressBtn').addEventListener('click', ()=>{
    try{
      const data = {};
      Object.keys(localStorage).forEach(k=>{ if(k.startsWith('khmer')) data[k] = localStorage.getItem(k); });
      const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'khmer-keyboard-progress.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }catch(e){}
  });
  const importProgressInput = document.getElementById('importProgressInput');
  document.getElementById('importProgressBtn').addEventListener('click', ()=> importProgressInput.click());
  importProgressInput.addEventListener('change', ()=>{
    const file = importProgressInput.files && importProgressInput.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = async ()=>{
      try{
        const data = JSON.parse(reader.result);
        const ok = await templeConfirm(
          'This will overwrite your current progress and settings with the imported backup.',
          { title:'Restore backup?', confirmLabel:'Restore', icon: pkIcon('scroll', 24) }
        );
        if(!ok) return;
        Object.keys(data).forEach(k=>{ if(k.startsWith('khmer')) localStorage.setItem(k, data[k]); });
        location.reload();
      }catch(e){
        alert('That file could not be read as a valid backup.');
      }
    };
    reader.readAsText(file);
    importProgressInput.value = '';
  });

  /* ---------- reset progress ---------- */
  document.getElementById('resetProgressBtn').addEventListener('click', async ()=>{
    const ok = await templeConfirm(
      'This will permanently erase all lesson scores, Temple Trial records, and practice statistics.',
      { title:'Erase all progress?', danger:true, confirmLabel:'Yes, erase it' }
    );
    if(!ok) return;
    try{
      Object.keys(localStorage).forEach(k=>{
        if(k.startsWith('khmer') && k !== 'khmerProfile') localStorage.removeItem(k);
      });
    }catch(e){}
    location.reload();
  });

}
if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", initStorageActions);
} else {
  initStorageActions();
}
