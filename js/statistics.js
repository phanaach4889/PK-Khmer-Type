/* ============================================================
   PK Khmer Type — Statistics, Achievements & Leaderboards
   ============================================================ */

/* ---------- achievement toasts ---------- */
const toastStack = document.getElementById('toastStack');
const seenAchievements = new Set();
function showToast(icon, title, sub){
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span class="toast-icon">${icon}</span><div><div class="toast-title">${title}</div>${sub ? `<div class="toast-sub">${sub}</div>` : ''}</div>`;
  toastStack.appendChild(t);
  setTimeout(()=>{ if(t.parentNode) t.remove(); }, 2600);
}
function achievementOnce(key, icon, title, sub){
  if(seenAchievements.has(key)) return;
  seenAchievements.add(key);
  showToast(icon, title, sub);
}


/* ---------- confetti ---------- */
const CONFETTI_COLORS = ['#ffd166','#ff9d2e','#4a84c4','#c8474c','#eaffda'];
function confettiBurst(cx, cy, count){
  count = count || 26;
  for(let i=0;i<count;i++){
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.background = CONFETTI_COLORS[Math.floor(Math.random()*CONFETTI_COLORS.length)];
    p.style.left = cx + 'px';
    p.style.top = cy + 'px';
    const angle = Math.random()*Math.PI*2;
    const dist = 60 + Math.random()*220;
    const dx = Math.cos(angle)*dist;
    const dy = Math.sin(angle)*dist*0.6 - 40 - Math.random()*80;
    const rot = (Math.random()*720 - 360).toFixed(0);
    const dur = 900 + Math.random()*700;
    document.body.appendChild(p);
    const anim = p.animate([
      { transform:'translate(0,0) rotate(0deg)', opacity:1 },
      { transform:`translate(${dx*0.6}px, ${dy}px) rotate(${rot*0.5}deg)`, opacity:1, offset:0.45 },
      { transform:`translate(${dx}px, ${dy + 260}px) rotate(${rot}deg)`, opacity:0 }
    ], { duration:dur, easing:'cubic-bezier(.2,.6,.3,1)' });
    anim.onfinish = ()=> p.remove();
  }
}


function triggerRecordCelebration(){
  const flash = document.createElement('div');
  flash.className = 'record-flash';
  document.body.appendChild(flash);
  setTimeout(()=>{ if(flash.parentNode) flash.remove(); }, 970);

  const pop = document.createElement('div');
  pop.className = 'record-pop';
  pop.innerHTML = pkIcon('zap', 18) + ' New Best!';
  document.body.appendChild(pop);
  setTimeout(()=>{ if(pop.parentNode) pop.remove(); }, 1400);

  confettiBurst(window.innerWidth/2, window.innerHeight*0.4, 30);
}


/* ---------- saved lesson stats (persist in localStorage & only track in lessons) ---------- */
const LS_LESSON_STATS = 'khmerLessonStats';

function loadSavedLessonStats(){
  try {
    const raw = localStorage.getItem(LS_LESSON_STATS);
    if(raw){
      const parsed = JSON.parse(raw);
      if(parsed && typeof parsed.keys === 'number') return parsed;
    }
  } catch(e){}

  // Check legacy totals so existing count (like 534 from user's screen) is preserved!
  let legacyKeys = 0;
  let legacyBestWpm = 0;
  try {
    const leg = JSON.parse(localStorage.getItem('khmerGlobalStats') || '{}');
    if(leg && leg.keys) legacyKeys = leg.keys;
    if(leg && leg.bestWpm) legacyBestWpm = leg.bestWpm;
  } catch(e){}

  return {
    keys: legacyKeys || 0,
    correct: legacyKeys || 0,
    wrong: 0,
    bestWpm: legacyBestWpm || 0,
    wpm: legacyBestWpm || 0,
    accuracy: 100
  };
}

let savedLessonStats = loadSavedLessonStats();
window.savedLessonStats = savedLessonStats;

function saveLessonStats(){
  try {
    localStorage.setItem(LS_LESSON_STATS, JSON.stringify(savedLessonStats));
  } catch(e){}
}

const statKeysEl = document.getElementById('statKeys');
const statAccuracyEl = document.getElementById('statAccuracy');
const statWpmEl = document.getElementById('statWpm');
const statMasteryEl = document.getElementById('statMastery');

function bump(el){
  if(!el) return;
  el.classList.remove('bump');
  void el.offsetWidth;
  el.classList.add('bump');
}

function updateLessonStatsUI(){
  if(statKeysEl){
    statKeysEl.textContent = savedLessonStats.keys;
    bump(statKeysEl);
  }
  if(statAccuracyEl){
    statAccuracyEl.textContent = (savedLessonStats.accuracy || 100) + '%';
  }
  if(statWpmEl){
    statWpmEl.textContent = savedLessonStats.wpm || savedLessonStats.bestWpm || 0;
  }

  const gk = document.getElementById('gStatKeys'); if(gk) gk.textContent = savedLessonStats.keys;
  const ga = document.getElementById('gStatAcc'); if(ga) ga.textContent = (savedLessonStats.accuracy || 100) + '%';
  const gw = document.getElementById('gStatWpm'); if(gw) gw.textContent = savedLessonStats.wpm || savedLessonStats.bestWpm || 0;
}

// Initial display on startup so saved values (e.g. 534) appear immediately
updateLessonStatsUI();

function recordKeystroke(correct){
  // ONLY track and go up when learning lessons!
  if(typeof lessonActive === 'undefined' || !lessonActive) return;

  savedLessonStats.keys++;
  if(correct) savedLessonStats.correct++;
  else savedLessonStats.wrong++;

  const attempts = savedLessonStats.correct + savedLessonStats.wrong;
  const acc = attempts > 0 ? Math.round((savedLessonStats.correct / attempts) * 100) : 100;
  savedLessonStats.accuracy = acc;

  // Calculate live lesson WPM
  if(typeof lessonStartTime !== 'undefined' && lessonStartTime > 0){
    const elapsedMin = (Date.now() - lessonStartTime) / 60000;
    if(elapsedMin >= 0.04){
      const typedCount = (typeof lessonIndex === 'number' ? lessonIndex : 1);
      const liveWpm = Math.min(180, Math.round((typedCount / 5) / elapsedMin));
      if(liveWpm > 0){
        savedLessonStats.wpm = liveWpm;
        if(liveWpm > (savedLessonStats.bestWpm || 0)){
          savedLessonStats.bestWpm = liveWpm;
        }
      }
    }
  }

  saveLessonStats();
  updateLessonStatsUI();

  [25,100,250,500,1000,2500].forEach(m=>{
    if(savedLessonStats.keys === m) achievementOnce('keys-'+m, pkIcon('flame', 20), `${m} keys typed!`, 'Keep the momentum going');
  });
}

function recordLessonBackspace(){
  if(typeof lessonActive === 'undefined' || !lessonActive) return;
  if(savedLessonStats.keys > 0) savedLessonStats.keys--;
  if(savedLessonStats.correct > 0) savedLessonStats.correct--;

  const attempts = savedLessonStats.correct + savedLessonStats.wrong;
  const acc = attempts > 0 ? Math.round((savedLessonStats.correct / attempts) * 100) : 100;
  savedLessonStats.accuracy = acc;

  saveLessonStats();
  updateLessonStatsUI();
}

window.recordLessonBackspace = recordLessonBackspace;

function updateMasteryStat(){
  const total = LESSONS.length;
  const done = LESSONS.filter(l=>{ const b = getLessonBest(l.id); return b && b.mastered; }).length;
  statMasteryEl.textContent = done + '/' + total;
  bump(statMasteryEl);
  const gm = document.getElementById('gStatMastery'); if(gm) gm.textContent = done + '/' + total;
  if(done === total) achievementOnce('all-lessons', pkIcon('crown', 20), 'Temple Master!', 'All ' + total + ' lessons mastered');
  else if(done === Math.ceil(total/2)) achievementOnce('half-lessons', pkIcon('castle', 20), 'Halfway there', done + ' of ' + total + ' lessons mastered');
}

function checkStreakAchievement(s){
  [5,10,15,20,30].forEach(m=>{
    if(s === m) achievementOnce('streak-'+m, pkIcon('zap', 20), `${m}-word streak!`, 'The temple trial heats up');
  });
}


function initStatisticsDashboard(){
  /* ---------- global (all-time) stats tracking ---------- */
  function loadTotals(){
    try{ return JSON.parse(safeGet(LS.totals, 'null')) || { keys:0, correct:0, seconds:0, bestWpm:0, days:[] }; }
    catch(e){ return { keys:0, correct:0, seconds:0, bestWpm:0, days:[] }; }
  }
  const totals = loadTotals();
  const today = new Date().toISOString().slice(0,10);
  if(!totals.days.includes(today)) totals.days.push(today);

  const origRecordKeystroke = recordKeystroke;
  recordKeystroke = function(correct){
    if(typeof lessonActive === 'undefined' || !lessonActive) return;
    origRecordKeystroke(correct);
    totals.keys = savedLessonStats.keys;
    totals.correct = savedLessonStats.correct;
    const wpmNow = parseInt(statWpmEl.textContent, 10) || 0;
    if(wpmNow > totals.bestWpm) totals.bestWpm = wpmNow;
    safeSet(LS.totals, JSON.stringify(totals));
  };
  setInterval(()=>{ totals.seconds += 5; safeSet(LS.totals, JSON.stringify(totals)); }, 5000);

  function currentStreakDays(days){
    const set = new Set(days);
    let streak = 0;
    let d = new Date();
    while(true){
      const key = d.toISOString().slice(0,10);
      if(set.has(key)){ streak++; d.setDate(d.getDate()-1); }
      else break;
    }
    return streak;
  }

  /* ---------- statistics dashboard ---------- */
  const statsModal = document.getElementById('statsModal');
  const statsGrid = document.getElementById('statsGrid');
  const statsLessonBars = document.getElementById('statsLessonBars');
  /* Exposes a snapshot of the learner's real progress stats (lessons,
     streak, WPM, trial/race bests) for use outside this closure — the
     account panel in the auth modal reads this to show live progress. */
  window.getAccountSnapshot = function(){
    const t = loadTotals();
    const acc = t.keys > 0 ? Math.round((t.correct / t.keys) * 100) : 100;
    const streak = currentStreakDays(t.days);
    const lessonsMastered = LESSONS.filter(l=>{ const b = getLessonBest(l.id); return b && b.mastered; }).length;
    let trialBest = 0;
    try{ trialBest = parseInt(localStorage.getItem('khmerTrialBest') || '0', 10) || 0; }catch(e){}
    let raceBestWpm = 0;
    RACE_DIFFICULTIES.forEach(d=>{
      RACE_LENGTHS.forEach(len=>{
        const rec = getRaceBest(d, len);
        if(rec && rec.wpm > raceBestWpm) raceBestWpm = rec.wpm;
      });
    });
    return {
      lessonsMastered, totalLessons: LESSONS.length,
      streak, trialBest, raceBestWpm,
      bestWpm: t.bestWpm, accuracy: acc,
      totalChars: t.keys, practiceMinutes: Math.round(t.seconds / 60), daysPracticed: t.days.length,
    };
  };

  /* ---------- lessons leaderboard ----------
     Uses Firestore when FIREBASE_CONFIG (near the top of the file)
     has been filled in, so everyone who visits shares one board.
     Falls back automatically to a per-device localStorage board
     when Firebase isn't configured or a request fails, so the
     feature always works even with zero setup. */
  const LESSONS_LB_KEY = 'khmerLessonsLeaderboard';
  const LESSONS_LB_NAME_KEY = 'khmerLessonsLbName';
  const LESSONS_LB_COLLECTION = 'lessons_leaderboard';

  function lbSlug(name){
    return (name || '').trim().toLowerCase().replace(/[^a-z0-9_\-]+/g, '_').slice(0, 60) || 'anon';
  }
  function loadLessonsLeaderboardLocal(){
    try{
      const raw = localStorage.getItem(LESSONS_LB_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    }catch(e){ return []; }
  }
  function saveLessonsLeaderboardLocal(list){
    try{ localStorage.setItem(LESSONS_LB_KEY, JSON.stringify(list)); }catch(e){}
  }
  function upsertLessonsLeaderboardLocal(name, mastered, total){
    const trimmed = (name || '').trim();
    if(!trimmed) return;
    const list = loadLessonsLeaderboardLocal();
    const key = trimmed.toLowerCase();
    const idx = list.findIndex(e=> e.name.toLowerCase() === key);
    const entry = {name: trimmed, mastered, total, updatedAt: Date.now()};
    if(idx === -1) list.push(entry); else list[idx] = entry;
    list.sort((a,b)=> b.mastered - a.mastered || a.name.localeCompare(b.name));
    saveLessonsLeaderboardLocal(list.slice(0, 50));
  }

  async function loadLessonsLeaderboardRemote(){
    const snap = await fbDb.collection(LESSONS_LB_COLLECTION).orderBy('mastered', 'desc').limit(50).get();
    return snap.docs.map(d=> d.data());
  }
  async function upsertLessonsLeaderboardRemote(name, mastered, total){
    const trimmed = (name || '').trim();
    if(!trimmed) return;
    await fbDb.collection(LESSONS_LB_COLLECTION).doc(lbSlug(trimmed)).set({
      name: trimmed.slice(0, 24), mastered, total,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, {merge:true});
  }

  async function loadLessonsLeaderboard(){
    if(window.fbEnabled){
      try{ return await loadLessonsLeaderboardRemote(); }
      catch(e){ /* fall through to local */ }
    }
    return loadLessonsLeaderboardLocal();
  }
  async function upsertLessonsLeaderboard(name, mastered, total){
    if(window.fbEnabled){
      try{ await upsertLessonsLeaderboardRemote(name, mastered, total); return; }
      catch(e){ /* fall through to local */ }
    }
    upsertLessonsLeaderboardLocal(name, mastered, total);
  }

  const lessonsLbSubtitle = document.getElementById('lessonsLbSubtitle');
  if(lessonsLbSubtitle){
    const isKm = document.documentElement.classList.contains('site-km-mode');
    if(window.fbEnabled){
      lessonsLbSubtitle.setAttribute('data-en', 'A shared leaderboard — everyone who visits can see this.');
      lessonsLbSubtitle.setAttribute('data-km', 'តារាងអ្នកឈ្នះរួម — អ្នកទស្សនាទាំងអស់អាចមើលឃើញ។');
    } else {
      lessonsLbSubtitle.setAttribute('data-en', 'See who has mastered the most lessons on this device.');
      lessonsLbSubtitle.setAttribute('data-km', 'មើលថាអ្នកណាបានស្ទាត់ជំនាញមេរៀនច្រើនជាងគេនៅលើឧបករណ៍នេះ។');
    }
    lessonsLbSubtitle.textContent = lessonsLbSubtitle.getAttribute(isKm ? 'data-km' : 'data-en');
  }

  let lessonsLbLoadToken = 0;
  async function renderLessonsLeaderboard(){
    const listEl = document.getElementById('lessonsLbList');
    if(!listEl) return;
    const myToken = ++lessonsLbLoadToken;
    listEl.innerHTML = `<li class="race-lb-empty i18n-t" data-en="Loading…" data-km="កំពុងផ្ទុក…">Loading…</li>`;
    let list = [];
    try{ list = await loadLessonsLeaderboard(); }catch(e){ list = []; }
    if(myToken !== lessonsLbLoadToken) return; // a newer render started; drop this stale one
    if(!list.length){
      listEl.innerHTML = `<li class="race-lb-empty i18n-t" data-en="No one on the board yet — save your score to be first!" data-km="មិនទាន់មានអ្នកនៅលើតារាងនេះទេ — រក្សាទុកពិន្ទុរបស់អ្នកជាមុនគេ!">No one on the board yet — save your score to be first!</li>`;
      return;
    }
    listEl.innerHTML = list.map((e,i)=>
      `<li class="race-lb-row${i===0 ? ' rank-1' : ''}" style="animation-delay:${i*35}ms">
        <span class="race-lb-rank">${i===0 ? pkIcon('crown', 14) : i===1 ? pkIcon('award', 14) : i===2 ? pkIcon('star', 14) : (i+1)}</span>
        <span class="race-lb-name">${escapeHtml(e.name || '')}</span>
        <span class="race-lb-score"><b>${e.mastered || 0}</b>/${e.total || 0} mastered</span>
      </li>`
    ).join('');
  }

  function renderStats(){
    const t = loadTotals();
    const acc = t.keys > 0 ? Math.round((t.correct / t.keys) * 100) : 100;
    const mins = Math.round(t.seconds / 60);
    const streak = currentStreakDays(t.days);
    const lessonsMastered = LESSONS.filter(l=>{ const b = getLessonBest(l.id); return b && b.mastered; }).length;
    let trialBest = 0;
    try{ trialBest = parseInt(localStorage.getItem('khmerTrialBest') || '0', 10) || 0; }catch(e){}

    let raceBestWpmOverall = 0;
    RACE_DIFFICULTIES.forEach(d=>{
      RACE_LENGTHS.forEach(len=>{
        const rec = getRaceBest(d, len);
        if(rec && rec.wpm > raceBestWpmOverall) raceBestWpmOverall = rec.wpm;
      });
    });

    const overallPct = LESSONS.length ? Math.round((lessonsMastered / LESSONS.length) * 100) : 0;
    const R = 29, C = 2 * Math.PI * R;
    const statsHero = document.getElementById('statsHero');
    statsHero.innerHTML = `
      <div class="stats-ring-wrap">
        <svg viewBox="0 0 74 74">
          <defs><linearGradient id="statsRingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="var(--gold)"/><stop offset="100%" stop-color="var(--gold-bright)"/>
          </linearGradient></defs>
          <circle class="stats-ring-track" cx="37" cy="37" r="${R}"/>
          <circle class="stats-ring-fill" cx="37" cy="37" r="${R}"
            stroke-dasharray="${C}" stroke-dashoffset="${C}"/>
        </svg>
        <div class="stats-ring-label">${overallPct}%</div>
      </div>
      <div class="stats-hero-text">
        <p class="stats-hero-title">${lessonsMastered} of ${LESSONS.length} lessons mastered</p>
        <div class="stats-hero-sub">Best run: <b>${t.bestWpm} WPM</b> · <b>${acc}%</b> accuracy</div>
      </div>
      <div class="stats-hero-streak">${pkIcon('flame', 15)} ${streak}-day streak</div>`;
    requestAnimationFrame(()=>{
      const fill = statsHero.querySelector('.stats-ring-fill');
      if(fill) fill.style.strokeDashoffset = String(C - (overallPct/100)*C);
    });

    const tiles = [
      [pkIcon('edit', 22), t.keys, 'Total Characters'],
      [pkIcon('target', 22), acc + '%', 'Avg Accuracy'],
      [pkIcon('zap', 22), t.bestWpm, 'Best WPM'],
      [pkIcon('timer', 22), mins + 'm', 'Practice Time'],
      [pkIcon('scroll', 22), lessonsMastered + '/' + LESSONS.length, 'Lessons Mastered'],
      [pkIcon('flame', 22), streak, 'Day Streak'],
      [pkIcon('castle', 22), trialBest, 'Temple Trial Best'],
      [pkIcon('flag', 22), raceBestWpmOverall, 'Race Best WPM'],
      [pkIcon('calendar', 22), t.days.length, 'Days Practiced'],
    ];
    statsGrid.innerHTML = tiles.map(([icon,val,label],i)=>
      `<div class="stat-tile" style="animation-delay:${i*45}ms">
        <div class="stat-tile-icon">${icon}</div>
        <div class="stat-tile-val">${val}</div>
        <div class="stat-tile-label">${label}</div>
      </div>`
    ).join('');

    const byLevel = {};
    LESSONS.forEach(l=>{ (byLevel[l.level] = byLevel[l.level]||[]).push(l); });
    statsLessonBars.innerHTML = LEVELS.map((lv,i)=>{
      const ls = byLevel[lv.id] || [];
      const done = ls.filter(l=>{ const b = getLessonBest(l.id); return b && b.mastered; }).length;
      const pct = ls.length ? Math.round((done/ls.length)*100) : 0;
      const name = (lv.title.split('·')[1] || lv.title).trim();
      const complete = pct >= 100 ? ' is-complete' : '';
      return `<div class="stats-bar-row${complete}" style="animation-delay:${i*55}ms">
        <span class="stats-bar-num">${complete ? pkIcon("check", 12) : lv.id}</span>
        <span class="stats-bar-name">${name}</span>
        <div class="stats-bar-track"><div class="stats-bar-fill" style="width:${pct}%"></div></div>
        <span class="stats-bar-pct">${pct}%</span></div>`;
    }).join('');

    const statsRaceRecords = document.getElementById('statsRaceRecords');
    const lengthLabels = {'15':'15s','30':'30s','60':'60s','text':'Full text'};
    const anyRaceRecord = RACE_DIFFICULTIES.some(d=> RACE_LENGTHS.some(len=> getRaceBest(d, len)));
    if(!anyRaceRecord){
      statsRaceRecords.innerHTML = `<div class="race-record-empty">No races completed yet — try ${pkIcon('flag', 14)} Typing Race!</div>`;
    } else {
      statsRaceRecords.innerHTML = RACE_DIFFICULTIES.map((d,i)=>{
        const rows = RACE_LENGTHS.map(len=>{
          const rec = getRaceBest(d, len);
          const tag = lengthLabels[len];
          if(!rec) return `<div class="race-record-length-row"><span class="rr-tag">${tag}</span><span class="race-record-none">— no record —</span></div>`;
          return `<div class="race-record-length-row"><span class="rr-tag">${tag}</span><span><b>${rec.wpm}</b> WPM · ${rec.accuracy}% · Score ${rec.score}</span></div>`;
        }).join('');
        const totalRaces = RACE_LENGTHS.reduce((sum,len)=>{ const r = getRaceBest(d,len); return sum + (r ? r.races : 0); }, 0);
        const diffLabel = d.charAt(0).toUpperCase() + d.slice(1);
        return `<div class="race-record-card" style="animation-delay:${i*55}ms">
          <div class="race-record-card-head">
            <span class="race-record-diff">${diffLabel}</span>
            <span class="race-record-races">${totalRaces} race${totalRaces===1?'':'s'}</span>
          </div>
          <div class="race-record-lengths">${rows}</div>
        </div>`;
      }).join('');
    }

    renderLessonsLeaderboard();
    const savedLbName = (function(){ try{ return localStorage.getItem(LESSONS_LB_NAME_KEY) || ''; }catch(e){ return ''; } })();
    const lessonsLbNameInput = document.getElementById('lessonsLbNameInput');
    if(lessonsLbNameInput && !lessonsLbNameInput.value) lessonsLbNameInput.value = savedLbName;
    if(savedLbName){
      upsertLessonsLeaderboard(savedLbName, lessonsMastered, LESSONS.length).then(renderLessonsLeaderboard);
    }
  }

  const lessonsLbSaveBtn = document.getElementById('lessonsLbSaveBtn');
  if(lessonsLbSaveBtn){
    lessonsLbSaveBtn.addEventListener('click', ()=>{
      const input = document.getElementById('lessonsLbNameInput');
      const name = (input && input.value || '').trim();
      if(!name){ if(input) input.focus(); return; }
      try{ localStorage.setItem(LESSONS_LB_NAME_KEY, name); }catch(e){}
      const lessonsMastered = LESSONS.filter(l=>{ const b = getLessonBest(l.id); return b && b.mastered; }).length;
      lessonsLbSaveBtn.disabled = true;
      upsertLessonsLeaderboard(name, lessonsMastered, LESSONS.length)
        .then(renderLessonsLeaderboard)
        .finally(()=>{ lessonsLbSaveBtn.disabled = false; bump(lessonsLbSaveBtn); });
    });
  }

  const statsOpenBtn = document.getElementById('statsOpenBtn');
  const statsCloseBtn = document.getElementById('statsCloseBtn');
  statsOpenBtn.addEventListener('click', ()=>{ renderStats(); statsModal.hidden = false; statsCloseBtn.focus(); });
  statsCloseBtn.addEventListener('click', ()=> statsModal.hidden = true);
  statsModal.addEventListener('click', e=>{ if(e.target === statsModal) statsModal.hidden = true; });


  /* =====================================================================
     LOCAL PROFILE (name + avatar, saved in this browser only)
     ===================================================================== */
  const PROFILE_KEY = 'khmerProfile';
  window.DEFAULT_AVATAR = (typeof window.generateAvatarDataUri === 'function') ? window.generateAvatarDataUri('phanna_kurosaki_default') : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%232563eb"/><circle cx="50" cy="38" r="18" fill="white"/><ellipse cx="50" cy="78" rx="28" ry="18" fill="white"/></svg>';
  function loadProfile(){
    try{ const p = JSON.parse(safeGet(PROFILE_KEY, 'null')) || { name:'Phanna Kurosaki', avatar:null };
      if(!p.avatar) p.avatar = window.DEFAULT_AVATAR;
      return p;
    }
    catch(e){ return { name:'Phanna Kurosaki', avatar: window.DEFAULT_AVATAR }; }
  }
  function saveProfile(p){ safeSet(PROFILE_KEY, JSON.stringify(p)); }
  let profile = loadProfile();

  function initials(name){
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if(!parts.length) return '?';
    return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
  }

  const profileAvatarImg = document.getElementById('profileAvatarImg');
  const profileAvatarFallback = document.getElementById('profileAvatarFallback');
  const profileAvatarInput = document.getElementById('profileAvatarInput');
  const profileNameDisplay = document.getElementById('profileNameDisplay');
  const profileSubstats = document.getElementById('profileSubstats');
  const profileStatsGrid = document.getElementById('profileStatsGrid');

  function refreshAvatarUI(){
    if(profile.avatar){
      profileAvatarImg.src = profile.avatar;
      profileAvatarImg.hidden = false;
      profileAvatarFallback.style.display = 'none';
    } else {
      profileAvatarImg.hidden = true;
      profileAvatarFallback.style.display = 'inline';
      profileAvatarFallback.textContent = initials(profile.name);
    }
  }

  const RANKS = [
    { min:0,  name:'Novice Scribe' },
    { min:5,  name:'Apprentice Scribe' },
    { min:12, name:'Temple Scribe' },
    { min:22, name:'Keeper of Letters' },
    { min:35, name:'Master Calligrapher' },
    { min:(typeof LESSONS !== "undefined" ? LESSONS.length : 60), name:'Khmer Sage' },
  ];
  function rankForMastered(n){
    let r = RANKS[0].name;
    for(const tier of RANKS){ if(n >= tier.min) r = tier.name; }
    return r;
  }
  const ROMAN = ['I','II','III','IV','V','VI'];
  function rankInfo(n){
    let idx = 0;
    for(let i=0;i<RANKS.length;i++){ if(n >= RANKS[i].min) idx = i; }
    return { idx, name: RANKS[idx].name, next: RANKS[idx+1] || null };
  }

  function refreshProfileUI(){
    profileNameDisplay.textContent = profile.name || 'Phanna Kurosaki';
    profileNameDisplay.setAttribute('data-text', profile.name || 'Phanna Kurosaki');
    refreshAvatarUI();

    const layoutCount = document.querySelectorAll('#layoutStrip .layout-pill').length || 3;
    profileSubstats.textContent = `• ${(typeof TOTAL_LESSONS_ALL_LAYOUTS !== "undefined" ? TOTAL_LESSONS_ALL_LAYOUTS : 86)} lessons shipped · ${layoutCount} layouts live`;

    const xpFill = document.getElementById('profileXpFill');
    const xpLabel = document.getElementById('profileXpLabel');
    const ROADMAP_PCT = 82;
    const ROADMAP_NEXT = 'race mode polish';
    if(xpFill){
      xpFill.style.width = ROADMAP_PCT + '%';
    }
    if(xpLabel){
      xpLabel.innerHTML = `<b>${ROADMAP_PCT}%</b> toward v1.0 — ${ROADMAP_NEXT} next`;
    }
    profileSidebar.classList.add('tier-5');

    const tiles = [
      [TOTAL_LESSONS_ALL_LAYOUTS, 'Lessons Crafted', pkIcon('book', 20), '#ffd166'],
      [layoutCount, 'Layouts Designed', pkIcon('keyboard', 20), '#2dd4a7'],
      ['100%', 'Solo-Built', pkIcon('tool', 20), '#ff5a70'],
      ['2026', 'Founder Since', pkIcon('crown', 20), '#ffd166'],
      ['0', 'Ads', pkIcon('ban', 20), '#5fd694'],
      ['24/7', 'Actively Building', pkIcon('zap', 20), '#5fd694', true],
    ];
    profileStatsGrid.innerHTML = tiles.map(([val,label,icon,accent,live],i)=>
      `<div class="stat-tile" style="--tile-accent:${accent};--tile-delay:${(i*0.06).toFixed(2)}s">${live ? '<span class="stat-tile-live" aria-hidden="true"></span>' : ''}<div class="stat-tile-icon">${icon}</div><div class="stat-tile-val">${val}</div><div class="stat-tile-label">${label}</div></div>`
    ).join('');
  }

  /* -- profile expand/collapse -- */
  const profileSidebar = document.getElementById('profileSidebar');
  function setProfileExpanded(on){
    profileSidebar.classList.toggle('collapsed', !on);
    profileSidebar.classList.toggle('expanded', on);
    profileSidebar.setAttribute('aria-expanded', String(on));
  }
  profileSidebar.addEventListener('click', (e)=>{
    if(e.target.closest('button, input, #profileCredit')) return;
    setProfileExpanded(profileSidebar.classList.contains('collapsed'));
  });
  profileSidebar.addEventListener('keydown', (e)=>{
    if(e.target !== profileSidebar) return;
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      setProfileExpanded(profileSidebar.classList.contains('collapsed'));
    }
  });

  /* -- subtle 3D tilt parallax on mouse move -- */
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!prefersReducedMotion && window.matchMedia && window.matchMedia('(hover: hover)').matches){
    profileSidebar.addEventListener('mousemove', (e)=>{
      const r = profileSidebar.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const tiltX = (px - 0.5) * 6;
      const tiltY = (0.5 - py) * 6;
      profileSidebar.style.setProperty('--tiltX', tiltX.toFixed(2) + 'deg');
      profileSidebar.style.setProperty('--tiltY', tiltY.toFixed(2) + 'deg');
    });
    profileSidebar.addEventListener('mouseleave', ()=>{
      profileSidebar.style.setProperty('--tiltX', '0deg');
      profileSidebar.style.setProperty('--tiltY', '0deg');
    });
  }

  /* -- edit avatar (resized client-side, stored as a data URL) -- */
  profileAvatarInput.addEventListener('change', ()=>{
    const file = profileAvatarInput.files && profileAvatarInput.files[0];
    if(!file) return;
    const img = new Image();
    const reader = new FileReader();
    reader.onload = ()=>{
      img.onload = ()=>{
        const size = 160;
        const canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d');
        const scale = Math.max(size / img.width, size / img.height);
        const w = img.width * scale, h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        profile.avatar = canvas.toDataURL('image/jpeg', 0.85);
        saveProfile(profile);
        refreshProfileUI();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  /* -- translate founder credit to Khmer -- */
  const profileCredit = document.getElementById('profileCredit');
  if(profileCredit){
    const enText = profileCredit.getAttribute('data-en');
    const kmText = profileCredit.getAttribute('data-km');
    const toggleEl = document.createElement('span');
    toggleEl.className = 'profile-credit-toggle';
    toggleEl.setAttribute('aria-hidden', 'true');
    function renderCredit(){
      const isKm = profileCredit.classList.contains('is-km');
      profileCredit.firstChild.textContent = isKm ? kmText : enText;
      toggleEl.textContent = isKm ? 'English' : 'ភាសាខ្មែរ';
    }
    profileCredit.textContent = enText;
    profileCredit.appendChild(toggleEl);
    profileCredit.setAttribute('lang', 'en');
    function toggleCreditLang(){
      profileCredit.classList.toggle('is-km');
      const isKm = profileCredit.classList.contains('is-km');
      profileCredit.setAttribute('lang', isKm ? 'km' : 'en');
      profileCredit.setAttribute('aria-label', isKm ? 'Click to switch back to English' : 'Click to translate to Khmer');
      renderCredit();
    }
    profileCredit.addEventListener('click', (e)=>{ e.stopPropagation(); toggleCreditLang(); });
    profileCredit.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggleCreditLang(); }
    });
    renderCredit();
  }

  refreshProfileUI();
}

if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", initStatisticsDashboard);
} else {
  initStatisticsDashboard();
}
