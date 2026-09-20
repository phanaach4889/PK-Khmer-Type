/* ============================================================
   PK Khmer Type — Temple Trial & Typing Race Modes
   ============================================================ */

/* ---------- temple trial ---------- */
var WORD_BANK = window.WORD_BANK || ['អាវ','តា','យាយ','មាន','ខាន','បាន','ចាន','តារា','កាច'];
/* English word pool, used in place of WORD_BANK whenever the English
   (US) layout is selected — Temple Trial and the Typing Race should
   drill the language that's actually on the keys, not always Khmer. */
var WORD_BANK_EN = window.WORD_BANK_EN || ['cat','dog','sun','run','desk','lamp','fish','bird','tree','king','fast','slow','jump','walk','hand','word','type','game','song','play'];
function currentWordBank(){
  return currentLayoutId === 'english' ? WORD_BANK_EN : WORD_BANK;
}
let trialActive = false;
let trialWordChars = [];
let trialIndex = 0;
let streak = 0;
let best = 0;
try{ best = parseInt(localStorage.getItem('khmerTrialBest') || '0', 10) || 0; }catch(e){}

const trialPanel = document.getElementById('trialPanel');
const trialWordEl = document.getElementById('trialWord');
const streakValEl = document.getElementById('streakVal');
const bestValEl = document.getElementById('bestVal');
const trialToggle = document.getElementById('trialToggle');

function updateStatsDisplay(){
  streakValEl.textContent = streak;
  bestValEl.textContent = best;
  boardWrap.classList.remove('heat-1','heat-2','heat-3');
  if(streak >= 10) boardWrap.classList.add('heat-3');
  else if(streak >= 6) boardWrap.classList.add('heat-2');
  else if(streak >= 3) boardWrap.classList.add('heat-1');
}

function pickWord(){
  const bank = currentWordBank();
  const prev = trialWordChars.join('');
  let w;
  do{ w = bank[Math.floor(Math.random()*bank.length)]; } while(bank.length > 1 && w === prev);
  return w;
}

function renderTrialWord(){
  trialWordEl.innerHTML = '';
  trialWordChars.forEach((ch,i)=>{
    const s = document.createElement('span');
    s.className = 'tw-char' + (i < trialIndex ? ' done' : (i === trialIndex ? ' current' : ''));
    s.textContent = ch;
    trialWordEl.appendChild(s);
  });
}

function newTrialWord(){
  trialWordChars = Array.from(pickWord());
  trialIndex = 0;
  renderTrialWord();
}

function startTrial(){
  if(typeof lessonActive !== 'undefined' && lessonActive) exitLesson();
  if(typeof raceMode !== 'undefined' && raceMode) exitRaceMode();
  trialActive = true;
  trialPanel.hidden = false;
  boardWrap.classList.add('trial-active');
  trialToggle.classList.add('on');
  clearText();
  newTrialWord();
  updateStatsDisplay();
}
function stopTrial(){
  trialActive = false;
  trialPanel.hidden = true;
  boardWrap.classList.remove('trial-active');
  trialToggle.classList.remove('on');
}
trialToggle.addEventListener('click', ()=>{
  if(trialActive) stopTrial(); else startTrial();
});

function celebrateWord(){
  const rect = boardWrap.getBoundingClientRect();
  const bursts = streak >= 10 ? 7 : (streak >= 6 ? 6 : 4);
  const color = heatColor();
  for(let i=0;i<bursts;i++){
    setTimeout(()=> emberBurst(boardWrap, {
      clientX: rect.left + rect.width*(0.25 + Math.random()*0.5),
      clientY: rect.top + rect.height*(0.3 + Math.random()*0.3)
    }, 10, color), i*80);
  }
  playChime();
}


function trialHandleChar(val, el){
  if(!trialActive || !val) return;
  const expected = trialWordChars[trialIndex];
  if(val === expected){
    insertText(val);
    recordKeystroke(true);
    trialIndex++;
    if(el){ el.classList.add('correct'); setTimeout(()=> el.classList.remove('correct'), 260); }
    emberBurst(el, null, 6, heatColor());
    runeRing(el);
    renderTrialWord();
    if(trialIndex >= trialWordChars.length){
      streak++;
      let isNewBest = false;
      if(streak > best){
        best = streak;
        isNewBest = true;
        try{ localStorage.setItem('khmerTrialBest', String(best)); }catch(e){}
      }
      updateStatsDisplay();
      checkStreakAchievement(streak);
      celebrateWord();
      if(isNewBest && streak > 1) triggerRecordCelebration();
      setTimeout(()=>{ clearText(); newTrialWord(); }, 950);
    }
  } else {
    streak = 0;
    recordKeystroke(false);
    updateStatsDisplay();
    if(el){ el.classList.add('wrong'); setTimeout(()=> el.classList.remove('wrong'), 300); }
    const cur = trialWordEl.querySelector('.tw-char.current');
    if(cur){ cur.classList.add('shake'); setTimeout(()=> cur.classList.remove('shake'), 300); }
  }
}

/* ---------- lesson course generator ----------
   Everything below reads characters straight from the standard-layout
   KEY() definitions above (ROW1..ROW5) — the single source of truth for
   the keyboard mapping. No Khmer glyphs are invented here; we only decide
   *which keys*, in *what order*, and *how many at once* to teach. */


const RACE_DIFFICULTIES = ['easy','medium','hard','expert'];
const RACE_LENGTHS = ['15','30','60','text'];

const racePanel = document.getElementById('racePanel');
const raceSetupEl = document.getElementById('raceSetup');
const raceLiveEl = document.getElementById('raceLive');
const raceToggle = document.getElementById('raceToggle');
const raceDifficultyRow = document.getElementById('raceDifficultyRow');
const raceLengthRow = document.getElementById('raceLengthRow');
const raceSetupBestEl = document.getElementById('raceSetupBest');
const raceStartBtn = document.getElementById('raceStartBtn');
const raceDifficultyLabelEl = document.getElementById('raceDifficultyLabel');
const raceWpmValEl = document.getElementById('raceWpmVal');
const raceAccValEl = document.getElementById('raceAccVal');
const raceTimeValEl = document.getElementById('raceTimeVal');
const raceMistakesValEl = document.getElementById('raceMistakesVal');
const raceTrackFillEl = document.getElementById('raceTrackFill');
const raceTrackPctEl = document.getElementById('raceTrackPct');
const raceTextEl = document.getElementById('raceText');
const raceCountdownEl = document.getElementById('raceCountdown');
const raceExitLiveBtn = document.getElementById('raceExitLiveBtn');
const raceNameInput = document.getElementById('raceNameInput');
const raceLeaderboardBtn = document.getElementById('raceLeaderboardBtn');
const raceLeaderboardBackBtn = document.getElementById('raceLeaderboardBackBtn');
const raceLeaderboardPanel = document.getElementById('raceLeaderboardPanel');
const raceLbDifficultyTabs = document.getElementById('raceLbDifficultyTabs');
const raceLbLengthTabs = document.getElementById('raceLbLengthTabs');
const raceLbList = document.getElementById('raceLbList');

let raceMode = false;          // true whenever the race panel is open (setup or live)
let raceActive = false;        // true only during live typing (countdown finished, not yet complete)
let raceCountingDown = false;
let raceDifficulty = 'easy';
let raceLength = '30';
let raceChars = [];            // characters to type, drawn from the same KEY_BY_ID/word data as lessons
let raceLayers = [];
let raceKeyIds = [];
let raceIndex = 0;
let raceMistakes = 0;
let raceCorrectTotal = 0;
let raceStartTime = 0;
let raceTimerId = null;
let raceCountdownTimer = null;
let raceTimeLimitId = null;
let raceLastStreakCorrect = 0;
let raceLbDifficulty = 'easy';
let raceLbLength = '30';

/* racer nickname — pre-filled from the site's local profile name (if set),
   overridable per race, remembered for next time */
function getRaceName(){
  let name = '';
  try{ name = (raceNameInput.value || '').trim(); }catch(e){}
  if(name) return name.slice(0, 18);
  try{
    const p = JSON.parse(localStorage.getItem('khmerProfile') || 'null');
    if(p && p.name) return String(p.name).trim().slice(0, 18);
  }catch(e){}
  try{
    const saved = localStorage.getItem('khmerRaceLastName');
    if(saved) return saved.slice(0, 18);
  }catch(e){}
  return 'Racer';
}
function initRaceNameInput(){
  let prefill = '';
  try{ prefill = localStorage.getItem('khmerRaceLastName') || ''; }catch(e){}
  if(!prefill){
    try{
      const p = JSON.parse(localStorage.getItem('khmerProfile') || 'null');
      if(p && p.name) prefill = p.name;
    }catch(e){}
  }
  raceNameInput.value = prefill;
}
function saveRaceName(name){
  try{ localStorage.setItem('khmerRaceLastName', name); }catch(e){}
}

/* leaderboard — stored per difficulty+length key, each entry keyed by
   nickname (case-insensitive), keeping every racer's own best score */
function raceLeaderboardKey(difficulty, length){
  const cap = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  return 'khmerRaceLeaderboard' + cap + (length === 'text' ? 'Text' : length);
}
function loadRaceLeaderboard(difficulty, length){
  try{
    const raw = localStorage.getItem(raceLeaderboardKey(difficulty, length));
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  }catch(e){ return []; }
}
function saveRaceLeaderboard(difficulty, length, list){
  try{ localStorage.setItem(raceLeaderboardKey(difficulty, length), JSON.stringify(list)); }catch(e){}
}
/* Records this run's score into the leaderboard for its difficulty+length.
   Each nickname keeps only their own best entry (case-insensitive match). */
function submitRaceToLeaderboard(name, difficulty, length, {wpm, accuracy, score}){
  const list = loadRaceLeaderboard(difficulty, length);
  const key = name.toLowerCase();
  const existingIdx = list.findIndex(e=> e.name.toLowerCase() === key);
  if(existingIdx === -1){
    list.push({name, wpm, accuracy, score});
  } else if(score > list[existingIdx].score){
    list[existingIdx] = {name, wpm, accuracy, score};
  }
  list.sort((a,b)=> b.score - a.score);
  saveRaceLeaderboard(difficulty, length, list.slice(0, 50));
}

function raceLengthLabel(length){
  return length === 'text' ? 'Full Text' : length + 's';
}

function renderRaceLeaderboard(){
  setRacePill(raceLbDifficultyTabs, 'lbDifficulty', raceLbDifficulty);
  setRacePill(raceLbLengthTabs, 'lbLength', raceLbLength);
  const list = loadRaceLeaderboard(raceLbDifficulty, raceLbLength);
  if(!list.length){
    raceLbList.innerHTML = '<li class="race-lb-empty">No racers yet for '
      + raceLbDifficulty.charAt(0).toUpperCase() + raceLbDifficulty.slice(1)
      + ' · ' + raceLengthLabel(raceLbLength) + '. Be the first!</li>';
    return;
  }
  raceLbList.innerHTML = list.map((e,i)=>
    `<li class="race-lb-row${i===0 ? ' rank-1' : ''}" style="animation-delay:${i*35}ms">
      <span class="race-lb-rank">${i===0 ? pkIcon('crown', 14) : i===1 ? pkIcon('award', 14) : i===2 ? pkIcon('star', 14) : (i+1)}</span>
      <span class="race-lb-name">${escapeHtml(e.name)}</span>
      <span class="race-lb-score"><b>${e.score}</b> · ${e.wpm} WPM · ${e.accuracy}%</span>
    </li>`
  ).join('');
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, ch=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

raceLbDifficultyTabs.querySelectorAll('.race-pill').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    raceLbDifficulty = btn.dataset.lbDifficulty;
    renderRaceLeaderboard();
  });
});
raceLbLengthTabs.querySelectorAll('.race-pill').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    raceLbLength = btn.dataset.lbLength;
    renderRaceLeaderboard();
  });
});
raceLeaderboardBtn.addEventListener('click', ()=>{
  raceLbDifficulty = raceDifficulty;
  raceLbLength = raceLength === 'text' ? 'text' : raceLength;
  raceSetupEl.hidden = true;
  raceLeaderboardPanel.hidden = false;
  renderRaceLeaderboard();
});
raceLeaderboardBackBtn.addEventListener('click', ()=>{
  raceLeaderboardPanel.hidden = true;
  raceSetupEl.hidden = false;
});

function raceBestKey(difficulty, length){
  const cap = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  return 'khmerRaceBest' + cap + (length === 'text' ? 'Text' : length);
}
function getRaceBest(difficulty, length){
  try{
    const raw = localStorage.getItem(raceBestKey(difficulty, length));
    return raw ? JSON.parse(raw) : null;
  }catch(e){ return null; }
}
function saveRaceBest(difficulty, length, record){
  try{ localStorage.setItem(raceBestKey(difficulty, length), JSON.stringify(record)); }catch(e){}
}

/* Build a race text pool for a given difficulty from the same character
   data every lesson draws from (KEY_BY_ID via entriesFromIds), plus the
   shared WORD_BANK for word-based difficulties — no separate data source. */
function raceHomeRowIds(){
  return ['f','g','h','j','d','k','s','l','a','semicolon','quote'];
}
/* The key table + word bank the race pulls from depends entirely on
   the layout currently selected in the layout strip, so the Khmer
   Keyboard Layout, Khmer NiDA Keyboard, and English ⇄ Khmer each
   produce genuinely different race text — not the same Khmer
   paragraph rendered on three different key pictures. */
function raceKeyTable(){
  return (currentLayoutId==='nida') ? KEY_BY_ID_NIDA
    : (currentLayoutId==='english') ? KEY_BY_ID_EN
    : KEY_BY_ID;
}
function raceBuildEntries(difficulty){
  const home = raceHomeRowIds();
  const table = raceKeyTable();
  const bank = currentWordBank();
  if(difficulty === 'easy'){
    // short words + simple home-row characters
    const words = seqWords(bank.slice(0, Math.max(3, Math.ceil(bank.length/2))), table);
    return words.length ? words : seqRandom(entriesFromIds(home,'base',table), 20);
  }
  if(difficulty === 'medium'){
    const words = seqWords(bank, table);
    const extra = seqRandom(entriesFromIds(home,'base',table).concat(entriesFromIds(home,'shift',table)), 16);
    return words.concat(extra);
  }
  if(difficulty === 'hard'){
    const allBaseShift = Object.keys(table)
      .map(id=> [entriesFromIds([id],'base',table)[0], entriesFromIds([id],'shift',table)[0]])
      .flat().filter(Boolean);
    return seqWords(bank, table).concat(seqRandom(allBaseShift, 40));
  }
  // expert — long text across the full keyboard, all layers
  const allLayers = ['base','shift','ctrl','altgr'];
  const fullPool = [];
  Object.keys(table).forEach(id=>{
    allLayers.forEach(layer=>{
      const e = entriesFromIds([id], layer, table)[0];
      if(e) fullPool.push(e);
    });
  });
  return seqWords(bank, table).concat(seqRandom(fullPool, 60));
}

function raceGenerateText(){
  const table = raceKeyTable();
  const entries = raceBuildEntries(raceDifficulty);
  const m = materialize(entries.length ? entries : seqRandom(entriesFromIds(raceHomeRowIds(),'base',table), 20));
  raceChars = m.chars;
  raceLayers = m.layers;
  raceKeyIds = m.keyIds;
}

function raceScore(wpm, accuracy, mistakes){
  // accuracy dominates: a fast, sloppy race must never outscore a
  // slightly slower, accurate one.
  const accFactor = Math.pow(accuracy/100, 2.2);
  const raw = wpm * accFactor - mistakes * 0.5;
  return Math.max(0, Math.round(raw));
}

function updateRaceSetupBest(){
  const rec = getRaceBest(raceDifficulty, raceLength);
  raceSetupBestEl.textContent = rec
    ? `Best — WPM ${rec.wpm} · Accuracy ${rec.accuracy}% · Score ${rec.score}`
    : 'No record yet for this difficulty & length';
}

function setRacePill(row, attr, value){
  row.querySelectorAll('.race-pill').forEach(btn=>{
    const on = btn.dataset[attr] === value;
    btn.setAttribute('aria-checked', on ? 'true' : 'false');
  });
}

raceDifficultyRow.querySelectorAll('.race-pill').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    raceDifficulty = btn.dataset.difficulty;
    setRacePill(raceDifficultyRow, 'difficulty', raceDifficulty);
    updateRaceSetupBest();
  });
});
raceLengthRow.querySelectorAll('.race-pill').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    raceLength = btn.dataset.length;
    setRacePill(raceLengthRow, 'length', raceLength);
    updateRaceSetupBest();
  });
});

function raceRenderText(){
  raceTextEl.innerHTML = '';
  raceChars.forEach((ch,i)=>{
    const s = document.createElement('span');
    s.className = 'race-char' + (i < raceIndex ? ' correct' : (i === raceIndex ? ' current' : ''));
    s.textContent = ch;
    raceTextEl.appendChild(s);
  });
}

function raceUpdateKeyHighlight(){
  if(highlightedKeyId && keyEls[highlightedKeyId]){
    keyEls[highlightedKeyId].classList.remove('lesson-target');
  }
  highlightedKeyId = null;
  if(!raceActive || raceIndex >= raceKeyIds.length){ setActiveFinger(null); return; }
  const id = raceKeyIds[raceIndex];
  const layer = raceLayers[raceIndex] || 'base';
  if(lockedLayer !== layer){ lockedLayer = layer; render(); }
  if(id && keyEls[id]){
    highlightedKeyId = id;
    keyEls[id].classList.add('lesson-target');
  }
  setActiveFinger(id, layer);
}

function raceElapsedSeconds(){
  return (Date.now() - raceStartTime) / 1000;
}

function raceCurrentStats(){
  const attempts = raceCorrectTotal + raceMistakes;
  const accuracy = attempts > 0 ? Math.round((raceCorrectTotal/attempts)*100) : 100;
  const minutes = Math.max(raceElapsedSeconds()/60, 1/600);
  const wpm = Math.round((raceCorrectTotal/5)/minutes);
  return {accuracy, wpm};
}

function raceUpdateHud(){
  const {accuracy, wpm} = raceCurrentStats();
  raceWpmValEl.textContent = wpm;
  raceAccValEl.textContent = accuracy + '%';
  raceTimeValEl.textContent = raceElapsedSeconds().toFixed(1) + 's';
  raceMistakesValEl.textContent = raceMistakes;
  const pct = raceChars.length ? Math.min(100, Math.round((raceIndex/raceChars.length)*100)) : 0;
  raceTrackFillEl.style.width = pct + '%';
  raceTrackPctEl.textContent = pct + '%';
  raceTrackFillEl.classList.toggle('race-fast', wpm >= 40);
}

function raceTick(){
  if(!raceActive) return;
  raceUpdateHud();
  if(raceLength !== 'text'){
    const limit = parseInt(raceLength, 10);
    const remaining = limit - raceElapsedSeconds();
    if(remaining <= 0){
      raceFinish(true);
      return;
    }
  }
  raceTimerId = requestAnimationFrame(raceTick);
}

function raceEmberBurst(count){
  const rect = raceTextEl.getBoundingClientRect();
  for(let i=0;i<count;i++){
    const e = document.createElement('div');
    e.className = 'race-ember';
    const x = rect.width/2 + (Math.random()-0.5)*rect.width*0.6;
    const y = rect.height/2 + (Math.random()-0.5)*10;
    e.style.left = x+'px';
    e.style.top = y+'px';
    e.style.setProperty('--dx', ((Math.random()-0.5)*24).toFixed(1)+'px');
    e.style.setProperty('--dy', (-(20+Math.random()*24)).toFixed(1)+'px');
    raceTextEl.appendChild(e);
    setTimeout(()=>{ if(e.parentNode) e.remove(); }, 620);
  }
}

function raceHandleChar(val, el){
  if(!raceActive || !val) return;
  const expected = raceChars[raceIndex];
  if(val === expected){
    recordKeystroke(true);
    raceCorrectTotal++;
    raceIndex++;
    raceLastStreakCorrect++;
    if(el){ el.classList.add('correct'); setTimeout(()=> el.classList.remove('correct'), 260); }
    emberBurst(el, null, raceLastStreakCorrect >= 8 ? 8 : 4, raceLastStreakCorrect >= 8 ? '#ff9d4d' : null);
    runeRing(el);
    if(raceLastStreakCorrect > 0 && raceLastStreakCorrect % 6 === 0) raceEmberBurst(6);
    raceRenderText();
    raceUpdateKeyHighlight();
    raceUpdateHud();
    if(raceIndex >= raceChars.length){
      raceFinish(false);
    }
  } else {
    raceMistakes++;
    raceLastStreakCorrect = 0;
    recordKeystroke(false);
    if(el){ el.classList.add('wrong'); setTimeout(()=> el.classList.remove('wrong'), 300); }
    const cur = raceTextEl.querySelector('.race-char.current');
    if(cur){
      cur.classList.add('wrong');
      setTimeout(()=> cur.classList.remove('wrong'), 320);
    }
    raceTextEl.classList.remove('shake'); void raceTextEl.offsetWidth; raceTextEl.classList.add('shake');
    setTimeout(()=> raceTextEl.classList.remove('shake'), 300);
    raceUpdateHud();
  }
}

function raceOpenSetup(){
  raceSetupEl.hidden = false;
  raceLiveEl.hidden = true;
  raceLeaderboardPanel.hidden = true;
  updateRaceSetupBest();
}

function raceReset(){
  cancelAnimationFrame(raceTimerId);
  clearTimeout(raceCountdownTimer);
  raceActive = false;
  raceCountingDown = false;
  raceIndex = 0;
  raceMistakes = 0;
  raceCorrectTotal = 0;
  raceLastStreakCorrect = 0;
  raceCountdownEl.hidden = true;
  raceCountdownEl.classList.remove('pulse');
}

function enterRaceMode(){
  if(raceMode) return;
  if(trialActive) stopTrial();
  if(lessonActive) exitLesson();
  raceMode = true;
  racePanel.hidden = false;
  raceToggle.classList.add('on');
  raceToggle.innerHTML = pkIcon('close', 14) + ' Exit Race';
  raceToggle.setAttribute('aria-pressed','true');
  setRacePill(raceDifficultyRow, 'difficulty', raceDifficulty);
  setRacePill(raceLengthRow, 'length', raceLength);
  initRaceNameInput();
  raceOpenSetup();
  requestAnimationFrame(()=>{
    racePanel.scrollIntoView({ behavior:'smooth', block:'center' });
  });
}

function exitRaceMode(){
  if(!raceMode) return;
  raceReset();
  raceMode = false;
  racePanel.hidden = true;
  raceToggle.classList.remove('on');
  raceToggle.innerHTML = pkIcon('flag', 14) + ' Typing Race';
  raceToggle.setAttribute('aria-pressed','false');
  lockedLayer = null;
  render();
  if(highlightedKeyId && keyEls[highlightedKeyId]){
    keyEls[highlightedKeyId].classList.remove('lesson-target');
  }
  highlightedKeyId = null;
  setActiveFinger(null);
  const existing = document.querySelector('.race-result-overlay');
  if(existing) existing.remove();
}

raceToggle.addEventListener('click', ()=>{
  if(raceMode) exitRaceMode(); else enterRaceMode();
});
raceExitLiveBtn.addEventListener('click', exitRaceMode);

function raceRunCountdown(cb){
  if(raceCountingDown) return; // guard against repeated clicks starting multiple timers
  raceCountingDown = true;
  raceSetupEl.hidden = true;
  raceLiveEl.hidden = false;
  raceCountdownEl.hidden = false;
  let n = 3;
  raceCountdownEl.textContent = String(n);
  raceCountdownEl.classList.remove('pulse'); void raceCountdownEl.offsetWidth; raceCountdownEl.classList.add('pulse');
  raceCountdownTimer = setInterval(()=>{
    n--;
    if(n > 0){
      raceCountdownEl.textContent = String(n);
    } else if(n === 0){
      raceCountdownEl.textContent = 'GO!';
    } else {
      clearInterval(raceCountdownTimer);
      raceCountdownEl.hidden = true;
      raceCountingDown = false;
      cb();
      return;
    }
    raceCountdownEl.classList.remove('pulse'); void raceCountdownEl.offsetWidth; raceCountdownEl.classList.add('pulse');
  }, 700);
}

function startRace(){
  if(raceActive || raceCountingDown) return; // never start multiple race timers
  raceGenerateText();
  raceIndex = 0;
  raceMistakes = 0;
  raceCorrectTotal = 0;
  raceLastStreakCorrect = 0;
  raceDifficultyLabelEl.textContent = raceDifficulty.charAt(0).toUpperCase() + raceDifficulty.slice(1)
    + (raceLength === 'text' ? ' · Full Text' : ' · ' + raceLength + 's');
  raceRenderText();
  raceUpdateHud();
  raceRunCountdown(()=>{
    raceActive = true;
    raceStartTime = Date.now();
    lockedLayer = raceLayers[0] || 'base';
    render();
    raceUpdateKeyHighlight();
    raceTick();
    boardWrap.focus && boardWrap.focus();
  });
}
raceStartBtn.addEventListener('click', startRace);

function raceFinish(timedOut){
  if(!raceActive) return;
  raceActive = false;
  cancelAnimationFrame(raceTimerId);
  const elapsed = raceElapsedSeconds();
  const {accuracy, wpm} = raceCurrentStats();
  const score = raceScore(wpm, accuracy, raceMistakes);
  const charsTyped = raceCorrectTotal;

  lockedLayer = null;
  render();
  if(highlightedKeyId && keyEls[highlightedKeyId]){
    keyEls[highlightedKeyId].classList.remove('lesson-target');
  }
  highlightedKeyId = null;
  setActiveFinger(null);

  const prevBest = getRaceBest(raceDifficulty, raceLength);
  const isNewBest = !prevBest || score > prevBest.score;
  const record = {
    wpm: isNewBest ? wpm : Math.max(wpm, prevBest.wpm),
    accuracy: isNewBest ? accuracy : Math.max(accuracy, prevBest.accuracy),
    time: isNewBest ? elapsed : Math.min(elapsed, prevBest.time ?? elapsed),
    score: isNewBest ? score : prevBest.score,
    races: (prevBest ? prevBest.races : 0) + 1,
  };
  saveRaceBest(raceDifficulty, raceLength, record);

  const racerName = getRaceName();
  saveRaceName(racerName);
  submitRaceToLeaderboard(racerName, raceDifficulty, raceLength, {wpm, accuracy, score});
  const lbList = loadRaceLeaderboard(raceDifficulty, raceLength);
  const rank = lbList.findIndex(e=> e.name.toLowerCase() === racerName.toLowerCase()) + 1;

  const rect = boardWrap.getBoundingClientRect();
  for(let i=0;i<6;i++){
    setTimeout(()=> emberBurst(boardWrap, {
      clientX: rect.left + rect.width*(0.25 + Math.random()*0.5),
      clientY: rect.top + rect.height*(0.3 + Math.random()*0.3)
    }, 10, '#ffd166'), i*80);
  }
  playChime();
  confettiBurst(rect.left + rect.width/2, rect.top + rect.height*0.3, accuracy === 100 ? 34 : 22);
  if(isNewBest) triggerRecordCelebration();

  showRaceResults({wpm, accuracy, elapsed, charsTyped, mistakes:raceMistakes, score, isNewBest, timedOut, racerName, rank, lbTotal: lbList.length});
  achievementOnce('race-'+raceDifficulty+'-'+raceLength, pkIcon('flag', 20), 'Race complete!', 'Finished a ' + raceDifficulty + ' race');
}

function showRaceResults({wpm, accuracy, elapsed, charsTyped, mistakes, score, isNewBest, racerName, rank, lbTotal}){
  const overlay = document.createElement('div');
  overlay.className = 'race-result-overlay';
  overlay.innerHTML = `
    <div class="race-result-card">
      <div class="race-badge">${pkIcon('trophy', 38)}</div>
      <h2>RACE COMPLETE!</h2>
      <p class="race-pb" style="color:var(--ink-dim); text-transform:none; letter-spacing:0;">
        ${escapeHtml(racerName)} — Rank <b style="color:var(--gold-bright)">#${rank}</b> of ${lbTotal} on this leaderboard
      </p>
      ${isNewBest ? '<p class="race-pb">' + pkIcon('zap', 14) + ' New Personal Best!</p>' : ''}
      <div class="race-result-grid">
        <div><b>${wpm}</b><span>WPM</span></div>
        <div><b>${accuracy}%</b><span>Accuracy</span></div>
        <div><b>${elapsed.toFixed(1)}s</b><span>Time</span></div>
        <div><b>${charsTyped}</b><span>Characters</span></div>
        <div><b>${mistakes}</b><span>Mistakes</span></div>
        <div><b>${score}</b><span>Score</span></div>
      </div>
      <div class="race-result-actions">
        <button class="race-again primary">${pkIcon('reset', 14)} Race Again</button>
        <button class="race-view-leaderboard">${pkIcon('trophy', 14)} Leaderboard</button>
        <button class="race-change-difficulty">${pkIcon('settings', 14)} Change Difficulty</button>
        <button class="race-exit">Exit Race</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  overlay.querySelector('.race-again').addEventListener('click', ()=>{
    overlay.remove();
    raceLiveEl.hidden = false;
    raceSetupEl.hidden = true;
    startRace();
  });
  overlay.querySelector('.race-view-leaderboard').addEventListener('click', ()=>{
    overlay.remove();
    raceReset();
    raceLbDifficulty = raceDifficulty;
    raceLbLength = raceLength;
    raceSetupEl.hidden = true;
    raceLiveEl.hidden = true;
    raceLeaderboardPanel.hidden = false;
    renderRaceLeaderboard();
  });
  overlay.querySelector('.race-change-difficulty').addEventListener('click', ()=>{
    overlay.remove();
    raceReset();
    raceOpenSetup();
  });
  overlay.querySelector('.race-exit').addEventListener('click', ()=>{
    overlay.remove();
    exitRaceMode();
  });
}

setRacePill(raceDifficultyRow, 'difficulty', raceDifficulty);
setRacePill(raceLengthRow, 'length', raceLength);

/* ---------- course builder ----------
   Builds the full 8-level progression. Level 1 starts with the home row anchor keys
   F and J (Left Index F = ថ, Right Index J = ញ), then D and K (Middle fingers = ដ & ក),
   then reach keys G and H (ង & ហ), S and L (ស & ល), pinky keys A, ;, ' (ា, ះ, ់),
   culminating in real Khmer home-row words! Every lesson features rich examples. */

function applyTypingContentData(data){
  if(!data) return;
  if(data.WORD_BANK) WORD_BANK.length = 0, WORD_BANK.push(...data.WORD_BANK);
  if(data.WORD_BANK_EN) WORD_BANK_EN.length = 0, WORD_BANK_EN.push(...data.WORD_BANK_EN);
}
