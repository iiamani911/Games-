/* =========================================================
   Kanz — family game platform (main app)
   ========================================================= */
'use strict';

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const R = () => Math.random();
const rpick = arr => arr[Math.floor(Math.random()*arr.length)];
const L = () => S.lang;
const loc = obj => obj[L()] || obj.ar;              // pick the current-language field of a {ar,en} object

/* =========================================================
   State + storage
   ========================================================= */
const KEY = 'kanz-platform-v2', OLD_KEY = 'family-treasure-hunt-v1';
const S = {
  lang:'ar', sound:true, voice:true,
  players:[], selected:[],
  settings:{ mode:'team', diff:'player', length:2, timer:0 },
  seen:[], profiles:{}
};

function defaultPlayers(){ return DEFAULT_NAMES.map((name,i) => ({ id:'d'+i, name, level:'medium', avatar:AVATARS[i%AVATARS.length], color:COLORS[i%COLORS.length] })); }
function load(){
  let data = null;
  try{ data = JSON.parse(localStorage.getItem(KEY)); }catch(e){}
  if(!data){
    let old = null; try{ old = JSON.parse(localStorage.getItem(OLD_KEY)); }catch(e){}
    if(old && Array.isArray(old.players)) data = { players:old.players, selected:old.selected, settings:old.settings, seen:[] };
  }
  data = data || {};
  if(['ar','en'].includes(data.lang)) S.lang = data.lang;
  else S.lang = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'ar';   // Arabic first; ?lang=en opens in English
  if(typeof data.sound === 'boolean') S.sound = data.sound;
  if(typeof data.voice === 'boolean') S.voice = data.voice;
  S.players = Array.isArray(data.players) && data.players.length ? data.players.filter(p => p && p.id && p.name) : defaultPlayers();
  S.players.forEach(p => {
    if(!['easy','medium','hard'].includes(p.level)) p.level = 'medium';
    if(p.id === 'd1' && p.name === 'جد' && !S.players.some(x => x.name === 'جودي')) p.name = 'جودي';
    p.avatar = p.avatar || AVATARS[0]; p.color = p.color || COLORS[0];
  });
  S.selected = Array.isArray(data.selected) ? data.selected.filter(id => S.players.some(p => p.id === id)) : S.players.map(p => p.id);
  if(data.settings) Object.assign(S.settings, data.settings);
  if(![1,2,3].includes(S.settings.length)) S.settings.length = 2;
  S.seen = Array.isArray(data.seen) ? data.seen : [];
  S.profiles = data.profiles && typeof data.profiles === 'object' ? data.profiles : {};
}
function save(){
  try{ localStorage.setItem(KEY, JSON.stringify({ lang:S.lang, sound:S.sound, voice:S.voice, players:S.players, selected:S.selected, settings:S.settings, seen:S.seen, profiles:S.profiles })); }catch(e){}
}
const getPlayer = id => S.players.find(p => p.id === id);
const selectedPlayers = () => S.selected.map(getPlayer).filter(Boolean);
function prof(pid){
  const p = S.profiles[pid] = S.profiles[pid] || {};
  p.xp = p.xp || 0; p.coins = p.coins || 0; p.owned = p.owned || []; p.ach = p.ach || [];
  p.daily = p.daily || { last:null, streak:0, hist:{} };
  p.snackBest = p.snackBest || 0; p.food = p.food || {}; p.games = p.games || 0; p.wins = p.wins || 0; p.healthyDays = p.healthyDays || 0;
  return p;
}

/* =========================================================
   Dates, levels, rewards
   ========================================================= */
function dateKey(d){ d = d || new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function yesterdayKey(){ const d = new Date(); d.setDate(d.getDate()-1); return dateKey(d); }
function dailyNumber(){ const a = new Date(2026,0,1), b = new Date(); b.setHours(0,0,0,0); return Math.round((b - a)/86400000) + 1; }
const levelOf = xp => Math.floor(Math.sqrt(xp/40)) + 1;
const xpFor = lv => 40*(lv-1)*(lv-1);
function titleOf(lv){ let t = TITLES[0]; TITLES.forEach(x => { if(lv >= x[0]) t = x; }); return L()==='ar' ? t[1] : t[2]; }

function award(pid, xp, coins){
  const p = prof(pid), before = levelOf(p.xp);
  p.xp += xp; p.coins += coins;
  const after = levelOf(p.xp);
  if(after > before){
    const pl = getPlayer(pid);
    toast(`⬆️ ${esc(pl ? pl.name : '')} — ${t('levelUp',{n:after})} (${titleOf(after)})`);
    Snd.sfx.level();
    if(after >= 5) ach(pid,'level5');
  }
  save();
}
function ach(pid, id){
  const p = prof(pid); if(p.ach.includes(id)) return;
  p.ach.push(id); save();
  const a = ACHIEVEMENTS.find(x => x.id === id), pl = getPlayer(pid);
  if(a && pl) setTimeout(() => { toast(`${a.icon} ${esc(pl.name)}: ${t('newBadge')} «${esc(loc(a)[0])}»`); Snd.sfx.coin(); }, 700);
}

/* =========================================================
   Feedback helpers: toast, bubble, modal, confetti, share
   ========================================================= */
function toast(html, actionLabel, action, ms){
  let box = $('#toasts'); if(!box){ box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
  const el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role','status');
  el.innerHTML = `<span>${html}</span>`;
  if(actionLabel){ const b = document.createElement('button'); b.className = 'btn btn-gold btn-sm'; b.textContent = actionLabel; b.onclick = () => { action(); el.remove(); }; el.appendChild(b); }
  box.appendChild(el);
  setTimeout(() => el.remove(), ms || (actionLabel ? 6000 : 3000));
}
let bubbleTimer = null;
function say(type, mood, prefix){
  const text = rpick(PHRASES[type][L()]);
  const b = $('#bubble');
  b.className = 'bubble show ' + (mood || 'happy');
  b.querySelector('.face').textContent = mood === 'sad' ? '😢' : mood === 'calm' ? '🙂' : '🤩';
  b.querySelector('.txt').textContent = (prefix ? prefix + ' ' : '') + text;
  clearTimeout(bubbleTimer); bubbleTimer = setTimeout(() => b.classList.remove('show'), 2600);
  Snd.speak((prefix ? prefix + ' ' : '') + text, mood);
}
function modal(title, bodyHTML, buttons){
  const bg = document.createElement('div'); bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><h3>${title}</h3><div class="modal-body">${bodyHTML||''}</div><div class="acts"></div></div>`;
  const acts = bg.querySelector('.acts');
  const close = () => { bg.remove(); document.removeEventListener('keydown', onKey); };
  const cancel = buttons[buttons.length-1];
  buttons.forEach(([label, cls, fn]) => { const b = document.createElement('button'); b.className = 'btn ' + cls; b.textContent = label; b.onclick = () => { close(); if(fn) fn(); }; acts.appendChild(b); });
  const onKey = e => { if(e.key === 'Escape'){ close(); if(cancel[2]) cancel[2](); } };
  document.addEventListener('keydown', onKey);
  bg.addEventListener('click', e => { if(e.target === bg){ close(); if(cancel[2]) cancel[2](); } });
  document.body.appendChild(bg); acts.firstChild.focus();
}

const cvs = document.getElementById('confetti'), cctx = cvs.getContext('2d');
let parts = [], confettiOn = false;
function resizeCanvas(){ cvs.width = innerWidth * devicePixelRatio; cvs.height = innerHeight * devicePixelRatio; }
addEventListener('resize', resizeCanvas); resizeCanvas();
function confetti(n, o){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  o = o || {}; const W = cvs.width, H = cvs.height, dpr = devicePixelRatio;
  const cols = o.colors || ['#f7c948','#ff6b6b','#2ee59d','#4cc9f0','#a78bfa','#ff7eb3','#ffffff'];
  for(let i=0;i<n;i++) parts.push({ x: o.x!=null ? o.x*W : R()*W, y: o.y!=null ? o.y*H : -20*dpr, vx:(R()-.5)*(o.spread||14)*dpr, vy:(o.y!=null ? -(R()*14+6) : R()*3+2)*dpr,
    s:(R()*7+5)*dpr, r:R()*6, vr:(R()-.5)*.3, c:rpick(cols), life:0, round:R()<.3 });
  if(!confettiOn){ confettiOn = true; requestAnimationFrame(stepConfetti); }
}
function stepConfetti(){
  cctx.clearRect(0,0,cvs.width,cvs.height);
  parts.forEach(p => { p.life++; p.vy += .25*devicePixelRatio; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
    cctx.save(); cctx.translate(p.x,p.y); cctx.rotate(p.r); cctx.fillStyle = p.c;
    if(p.round){ cctx.beginPath(); cctx.arc(0,0,p.s/2,0,Math.PI*2); cctx.fill(); } else cctx.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);
    cctx.restore(); });
  parts = parts.filter(p => p.y < cvs.height + 40 && p.life < 400);
  if(parts.length) requestAnimationFrame(stepConfetti); else { confettiOn = false; cctx.clearRect(0,0,cvs.width,cvs.height); }
}

function appUrl(){ return /^https?:/.test(location.protocol) ? location.href.split('#')[0].split('?')[0] : ''; }
async function share(text){
  const url = appUrl();
  const full = url ? `${text}\n${url}` : text;
  try{
    if(navigator.share){ await navigator.share({ title:t('appName'), text: url ? text : full, url: url || undefined }); return; }
  }catch(e){ if(e && e.name === 'AbortError') return; }
  try{ await navigator.clipboard.writeText(full); toast('📋 ' + t('copied')); }
  catch(e){ modal(t('shareTitle'), `<textarea class="share-box" readonly>${esc(full)}</textarea>`, [[t('close'),'btn-gold']]); }
}

/* =========================================================
   Router
   ========================================================= */
let screen = 'home', screenArg = null, timers = [];
function clearTimers(){ timers.forEach(clearInterval); timers = []; if(QV && QV.tid){ clearInterval(QV.tid); QV.tid = null; } }
function go(name, arg){
  if(name !== screen) window.scrollTo({ top:0 });
  screen = name; screenArg = arg;
  render();
}
function render(){
  clearTimers();
  document.documentElement.lang = L();
  document.documentElement.dir = L() === 'ar' ? 'rtl' : 'ltr';
  document.title = t('docTitle');
  const fn = SCREENS[screen] || SCREENS.home;
  $('#app').innerHTML = `<div class="screen">${fn(screenArg)}</div>`;
  const after = AFTER[screen]; if(after) after(screenArg);
}

const backIcon = () => L()==='ar' ? '→' : '←';
function topbar(title, opts){
  opts = opts || {};
  return `<header class="topbar">
    ${opts.noBack ? '<span class="tb-gap"></span>' : `<button class="btn btn-ghost icon-btn" data-act="${opts.backAct || 'home'}" aria-label="${t('back')}">${opts.backIcon || backIcon()}</button>`}
    <div class="ttl">${title}</div>
    <div class="tb-right">${opts.right || ''}${soundBtns()}</div>
  </header>`;
}
const soundBtns = () => `<button class="btn btn-ghost icon-btn" data-act="toggleSound" aria-pressed="${S.sound}" aria-label="${t('sound')}" title="${t('sound')}">${S.sound ? '🔊' : '🔇'}</button>
  <button class="btn btn-ghost icon-btn" data-act="toggleVoice" aria-pressed="${S.voice}" aria-label="${t('voice')}" title="${t('voice')}">${S.voice ? '🗣️' : '🤐'}</button>`;
function refreshSoundBtns(){
  $$('[data-act="toggleSound"]').forEach(b => { b.textContent = S.sound ? '🔊' : '🔇'; b.setAttribute('aria-pressed', S.sound); });
  $$('[data-act="toggleVoice"]').forEach(b => { b.textContent = S.voice ? '🗣️' : '🤐'; b.setAttribute('aria-pressed', S.voice); });
}
const av = (p, cls) => `<span class="av ${cls||''}" style="background:${esc(p.color)}">${esc(p.avatar)}</span>`;

/* =========================================================
   Screens
   ========================================================= */
const SCREENS = {}, AFTER = {};

/* ---------- HOME ---------- */
SCREENS.home = () => {
  const sel = selectedPlayers();
  const today = dateKey();
  const dailyDone = sel.filter(p => prof(p.id).daily.hist[today]).length;
  const foodScores = sel.map(p => foodScore(p.id)).filter(x => x.score != null);
  const famHealth = foodScores.length ? Math.round(foodScores.reduce((a,b) => a + b.score, 0) / foodScores.length) : null;
  const top = [...S.players].sort((a,b) => prof(b.id).xp - prof(a.id).xp)[0];
  const installable = !isStandalone();
  return `
  <header class="topbar home-bar">
    <button class="btn btn-ghost lang-btn" data-act="toggleLang" aria-label="${t('switchLang')}">🌐 ${t('otherLang')}</button>
    <div class="tb-right">${installable ? `<button class="btn btn-ghost icon-btn" data-act="install" aria-label="${t('install')}" title="${t('install')}">📲</button>` : ''}${soundBtns()}</div>
  </header>
  <section class="hero">
    <div class="logo">🗺️</div>
    <h1>${t('appName')}</h1>
    <p>${t('tagline')}</p>
  </section>

  <div class="family card">
    <div class="fam-avs">${sel.slice(0,10).map(p => av(p,'sm')).join('')}${sel.length > 10 ? `<span class="more">+${sel.length-10}</span>` : ''}${!sel.length ? `<span class="muted">${t('noPlayers')}</span>` : ''}</div>
    <button class="btn btn-ghost btn-sm" data-act="players">👥 ${t('managePlayers')} (${sel.length})</button>
  </div>

  <div class="hub">
    <button class="tile tile-hero" data-act="advSetup">
      <span class="t-ico">🗺️</span>
      <span class="t-body"><b>${t('advTitle')}</b><small>${t('advDesc')}</small></span>
      <span class="t-cta">${t('play')} ${L()==='ar'?'◀':'▶'}</span>
    </button>
    <button class="tile tile-daily" data-act="dailyPick">
      <span class="t-ico">📅</span>
      <span class="t-body"><b>${t('dailyTitle')} #${dailyNumber()}</b><small>${dailyDone ? t('dailyDoneCount',{n:dailyDone}) : t('dailyDesc')}</small></span>
      <span class="t-badge">${t('newToday')}</span>
    </button>
    <button class="tile tile-snack" data-act="snackPick">
      <span class="t-ico">🍔🥦</span>
      <span class="t-body"><b>${t('snackTitle')}</b><small>${t('snackDesc')}</small></span>
    </button>
    <button class="tile tile-food" data-act="food">
      <span class="t-ico">🥗</span>
      <span class="t-body"><b>${t('foodTitle')}</b><small>${famHealth != null ? t('famHealth',{n:famHealth}) : t('foodDesc')}</small></span>
    </button>
    <button class="tile tile-trophy" data-act="trophies">
      <span class="t-ico">🏆</span>
      <span class="t-body"><b>${t('trophyTitle')}</b><small>${top && prof(top.id).xp ? t('topPlayer',{name:esc(top.name), lv:levelOf(prof(top.id).xp)}) : t('trophyDesc')}</small></span>
    </button>
  </div>

  <div class="card invite">
    <div><b>📣 ${t('inviteTitle')}</b><div class="muted">${t('inviteDesc')}</div></div>
    <button class="btn btn-gold" data-act="invite">${t('shareApp')}</button>
  </div>
  <footer class="foot muted">${t('footer')}</footer>`;
};

/* ---------- PLAYERS ---------- */
SCREENS.players = () => {
  const perPlayer = S.settings.diff === 'player';
  const cards = S.players.map(p => {
    const on = S.selected.includes(p.id);
    return `<div class="player ${on?'on':''}" data-act="togglePlayer" data-id="${esc(p.id)}" role="checkbox" aria-checked="${on}" tabindex="0" aria-label="${esc(p.name)}">
      <span class="check">${on?'✓':''}</span>
      <button class="rm" data-act="removePlayer" data-id="${esc(p.id)}" aria-label="${t('remove')} ${esc(p.name)}">✕</button>
      ${av(p)}
      <div class="nm">${esc(p.name)}</div>
      <button class="lvl ${p.level}${perPlayer?'':' dim'}" data-act="cycleLevel" data-id="${esc(p.id)}" title="${t('levelTip')}">${lvLabel(p.level)}</button>
    </div>`;
  }).join('');
  return `${topbar('👥 ' + t('playersTitle'))}
  <div class="card">
    <div class="card-head">
      <span class="badge">${t('selectedOf',{a:S.selected.length,b:S.players.length})}</span>
      <div class="toolbar">
        <button class="btn btn-ghost btn-sm" data-act="selAll">${t('selectAll')}</button>
        <button class="btn btn-ghost btn-sm" data-act="selNone">${t('selectNone')}</button>
        <button class="btn btn-ghost btn-sm" data-act="restore">↺ ${t('restore')}</button>
      </div>
    </div>
    <p class="muted small">${t('playersHelp')}</p>
    <div class="players">${cards}</div>
    <form class="add-row" data-form="addPlayer">
      <input id="newName" type="text" maxlength="20" placeholder="${t('newPlayer')}" aria-label="${t('newPlayer')}" autocomplete="off">
      <button class="btn btn-mint" type="submit">➕ ${t('add')}</button>
    </form>
  </div>
  <div class="center"><button class="btn btn-gold btn-lg" data-act="home">✔ ${t('done')}</button></div>`;
};
const lvLabel = lv => ({easy:'🟢 ',medium:'🟡 ',hard:'🔴 '})[lv] + t(lv);

/* ---------- ADVENTURE SETUP ---------- */
SCREENS.advSetup = () => {
  const s = S.settings, n = selectedPlayers().length;
  const seg = (key, opts) => `<div class="seg" role="group">${opts.map(([v,label]) => `<button class="${String(s[key])===String(v)?'on':''}" data-act="setOpt" data-k="${key}" data-v="${v}" aria-pressed="${String(s[key])===String(v)}">${label}</button>`).join('')}</div>`;
  const plan = n ? planCounts(n) : null;
  return `${topbar('🗺️ ' + t('advTitle'))}
  <div class="card">
    <div class="card-head"><div class="card-title">👥 ${t('whoPlays')}</div><button class="btn btn-ghost btn-sm" data-act="players">${t('edit')}</button></div>
    <div class="fam-avs wrap">${selectedPlayers().map(p => `<span class="chip">${av(p,'xs')} ${esc(p.name)}</span>`).join('') || `<span class="muted">${t('noPlayers')}</span>`}</div>
  </div>
  <div class="card">
    <div class="card-title mb">🎮 ${t('modeTitle')}</div>
    <div class="modes">
      <button class="mode ${s.mode==='team'?'on':''}" data-act="setOpt" data-k="mode" data-v="team"><span class="mi">🤝</span><b>${t('teamMode')}</b><small>${t('teamDesc')}</small></button>
      <button class="mode ${s.mode==='solo'?'on':''}" data-act="setOpt" data-k="mode" data-v="solo"><span class="mi">🏆</span><b>${t('soloMode')}</b><small>${t('soloDesc')}</small></button>
    </div>
  </div>
  <div class="card settings">
    <label class="setting-label">📶 ${t('difficulty')}</label>
    ${seg('diff', [['player',t('perPlayer')],['easy',t('easy')],['medium',t('medium')],['hard',t('hard')],['progressive',t('progressive')]])}
    <div class="note">${t('diffNote_'+s.diff)}</div>
    <label class="setting-label">🧭 ${t('length')}</label>
    ${seg('length', [[1,t('short')],[2,t('normal')],[3,t('long')]])}
    <label class="setting-label">⏱️ ${t('timer')}</label>
    ${seg('timer', [[0,t('noTimer')],[60,t('seconds',{n:60})],[30,t('seconds',{n:30})]])}
  </div>
  <div class="card summary">
    <div class="txt">${n ? (s.mode==='solo' ? t('sumSolo',{n, q:qCount(plan.total), each:plan.total/n}) : t('sumTeam',{n, q:qCount(plan.total)})) : t('pickOne')}</div>
    <button class="btn btn-gold btn-lg" data-act="startAdv" ${n?'':'disabled'}>🚀 ${t('startAdv')}</button>
  </div>`;
};
function qCount(n){ if(L()==='en') return `${n} question${n===1?'':'s'}`; return n===1 ? 'سؤال واحد' : n===2 ? 'سؤالان' : n<=10 ? `${n} أسئلة` : `${n} سؤالاً`; }
function planCounts(n){
  const base = S.settings.length * STAGES.length;
  const total = S.settings.mode === 'solo' ? Math.ceil(base/n)*n : base;
  return { total, counts: STAGES.map((_,i) => Math.floor(total/STAGES.length) + (i < total % STAGES.length ? 1 : 0)) };
}

/* =========================================================
   QUESTION VIEW (shared by Adventure + Daily)
   ========================================================= */
let QV = null;
function qvStart(q, opts){
  QV = { q, opts, answered:false, hint:false, given:null, ok:false, fb:null, left: opts.timer || 0, tid:null,
         scr: q.type === 'scramble' ? { tiles:q.letters.map(ch => ({ ch, used:false })), slots:Array(q.letters.length).fill(null), locked:[] } : null,
         struck:null };
}
function qvWord(){ return QV.scr.slots.map(i => i == null ? '' : QV.scr.tiles[i].ch).join(''); }
function qvHTML(){
  const { q } = QV, A = QV.answered;
  let h = `<div class="qmeta"><span class="badge">${CATS[q.cat].icon} ${q.type==='scramble' ? t('scrambled') : loc(CATS[q.cat])}</span>${QV.opts.meta || ''}</div>
    <div class="qtext">${esc(q.q)}</div>`;
  if(q.clue) h += `<div class="clue">🔎 ${t('clue')}: ${esc(q.clue)}</div>`;
  if(q.seq) h += `<div class="seq" dir="${L()==='ar'?'rtl':'ltr'}">${q.seq.map((v,i) => `<span class="${i===q.seq.length-1?'q':''}">${esc(v)}</span>`).join('')}</div>`;
  if(q.type === 'mc'){
    const keys = L()==='ar' ? ['أ','ب','ج','د'] : ['A','B','C','D'];
    const emo = q.options.every(o => /\p{Extended_Pictographic}/u.test(o) && o.length <= 4);
    h += `<div class="opts">${q.options.map((o,i) => {
      let cls = 'opt' + (emo ? ' emoji' : '');
      if(A && o === q.answer) cls += ' right'; else if(A && o === QV.given) cls += ' wrong';
      if(QV.struck === o) cls += ' struck';
      return `<button class="${cls}" data-act="qopt" data-i="${i}" ${A || QV.struck===o ? 'disabled' : ''}><span class="k">${keys[i]}</span><span class="v">${esc(o)}</span></button>`;
    }).join('')}</div>`;
  } else {
    const sc = QV.scr, w = qvWord();
    h += `<div class="preview">${A ? (QV.ok ? esc(q.answer) : `${esc(w || '—')} ➜ ${esc(q.answer)}`) : esc(w || '…')}</div>
      <div class="slots" dir="${L()==='ar'?'rtl':'ltr'}">${sc.slots.map((ti,si) => `<button class="slot ${ti!=null?'filled':''} ${sc.locked.includes(si)?'locked':''} ${A ? (QV.ok?'right':'wrong') : ''}" data-act="qslot" data-i="${si}" ${A?'disabled':''}>${ti!=null ? esc(sc.tiles[ti].ch) : ''}</button>`).join('')}</div>
      <div class="tiles">${sc.tiles.map((tl,ti) => `<button class="ltile ${tl.used?'used':''}" data-act="qtile" data-i="${ti}" ${A||tl.used?'disabled':''}>${esc(tl.ch)}</button>`).join('')}</div>`;
  }
  if(QV.opts.timer) h += `<div class="timer ${QV.left<=10?'low':''}" id="qTimer"><span>⏱️</span><div class="progress"><i style="width:${QV.left/QV.opts.timer*100}%"></i></div><b>${QV.left}</b></div>`;
  if(QV.hint) h += `<div class="hint-box">💡 ${esc(q.hint || t('hintRemoved'))}${q.type==='mc' && q.hint ? ' ' + t('hintPlus') : ''}</div>`;
  if(!A){
    h += `<div class="q-actions"><button class="btn btn-ghost" data-act="qhint" ${QV.hint?'disabled':''}>💡 ${QV.hint ? t('hintUsed') : t('hint')}</button>`;
    if(q.type === 'scramble') h += `<div class="toolbar"><button class="btn btn-ghost" data-act="qclear">🧹 ${t('clear')}</button><button class="btn btn-mint" data-act="qcheck" ${QV.scr.slots.includes(null)?'disabled':''}>✔ ${t('check')}</button></div>`;
    h += `</div>`;
  } else {
    const fb = QV.fb;
    h += `<div class="feedback ${QV.ok?'good':'bad'}">
      <h3>${fb.title}</h3>
      ${!QV.ok ? `<div>${t('correctWas')}: «${esc(q.answer)}»</div>` : ''}
      ${q.ex ? `<div class="muted">📜 ${esc(q.ex)}</div>` : ''}
      <div class="row"><div class="pts ${QV.ok?'':'dim'}">${fb.pts}</div><button class="btn btn-gold" data-act="qnext" id="qNext">${fb.next}</button></div>
    </div>`;
  }
  return h;
}
function qvRender(){ const box = $('#qv'); if(box) box.innerHTML = qvHTML(); }
function qvMount(){
  qvRender();
  if(QV.opts.timer && !QV.answered){
    QV.tid = setInterval(() => {
      if(QV.answered || $('.modal-bg')) return;
      QV.left--;
      const tm = $('#qTimer');
      if(tm){ tm.querySelector('i').style.width = (QV.left/QV.opts.timer*100)+'%'; tm.querySelector('b').textContent = QV.left; tm.classList.toggle('low', QV.left <= 10); }
      if(QV.left <= 5 && QV.left > 0) Snd.sfx.tick();
      if(QV.left <= 0) qvAnswer(null, true);
    }, 1000);
  }
}
function qvAnswer(given, timedOut){
  if(!QV || QV.answered) return;
  QV.answered = true; QV.given = given; QV.ok = given === QV.q.answer;
  if(QV.tid){ clearInterval(QV.tid); QV.tid = null; }
  QV.fb = QV.opts.onAnswer({ ok:QV.ok, hint:QV.hint, timedOut:!!timedOut, q:QV.q });
  qvRender();
  setTimeout(() => { const n = $('#qNext'); if(n){ n.focus({preventScroll:true}); n.closest('.feedback').scrollIntoView({behavior:'smooth', block:'nearest'}); } }, 120);
}
const QV_ACTIONS = {
  qopt(d){ if(QV.answered) return; qvAnswer(QV.q.options[+d.i]); },
  qhint(){
    if(QV.answered || QV.hint) return; QV.hint = true; Snd.sfx.hint();
    if(QV.q.type === 'mc'){ const wrong = QV.q.options.filter(o => o !== QV.q.answer); QV.struck = rpick(wrong); }
    else {
      const sc = QV.scr, ch = Array.from(QV.q.answer)[0];
      if(sc.slots[0] != null){ sc.tiles[sc.slots[0]].used = false; sc.slots[0] = null; }
      const ti = sc.tiles.findIndex(x => !x.used && x.ch === ch);
      if(ti >= 0){ sc.slots[0] = ti; sc.tiles[ti].used = true; sc.locked.push(0); }
    }
    qvRender();
  },
  qtile(d){ const sc = QV.scr, tl = sc.tiles[+d.i]; if(QV.answered || tl.used) return; const si = sc.slots.indexOf(null); if(si < 0) return; sc.slots[si] = +d.i; tl.used = true; Snd.sfx.click(); qvRender(); if(!sc.slots.includes(null)){ const c = $('[data-act="qcheck"]'); if(c) c.focus({preventScroll:true}); } },
  qslot(d){ const sc = QV.scr, si = +d.i, ti = sc.slots[si]; if(QV.answered || ti == null || sc.locked.includes(si)) return; sc.tiles[ti].used = false; sc.slots[si] = null; Snd.sfx.click(); qvRender(); },
  qclear(){ const sc = QV.scr; sc.slots.forEach((ti,si) => { if(ti != null && !sc.locked.includes(si)){ sc.tiles[ti].used = false; sc.slots[si] = null; } }); Snd.sfx.click(); qvRender(); },
  qcheck(){ if(!QV.scr.slots.includes(null)) qvAnswer(qvWord()); },
  qnext(){ if(QV && QV.answered){ Snd.sfx.click(); QV.opts.onNext(); } }
};

/* =========================================================
   ADVENTURE
   ========================================================= */
let G = null;
function levelFor(pid){
  const d = S.settings.diff;
  if(d === 'player') return (getPlayer(pid) || {}).level || 'medium';
  if(d === 'progressive') return ['easy','easy','medium','medium','hard','hard'][G.stage];
  return d;
}
function startAdventure(){
  const ids = shuffle(selectedPlayers().map(p => p.id));
  if(!ids.length){ toast(t('pickOne')); return; }
  const { total, counts } = planCounts(ids.length);
  G = { mode:S.settings.mode, ids, total, counts, stage:0, q:0, turn:0, done:0, stageCorrect:0, cur:null,
        ctx:{ lang:L(), used:new Set(), seen:S.seen, names:ids.map(id => getPlayer(id).name) },
        stats:{}, team:{ pts:0, correct:0, answered:0, streak:0, best:0, gems:0 } };
  ids.forEach(id => G.stats[id] = { pts:0, correct:0, answered:0, hints:0, streak:0, best:0, cats:{} });
  Snd.sfx.stage(); save();
  go('map');
}

/* ---------- map ---------- */
const MAP_PTS = [[565,350],[480,300],[355,330],[230,270],[320,185],[470,140],[380,62],[140,78]];
function mapPts(){ return L()==='ar' ? MAP_PTS : MAP_PTS.map(([x,y]) => [620-x, y]); }
function segs(pts){
  const out = [];
  for(let i=0;i<pts.length-1;i++){
    const p0 = pts[i-1] || pts[i], p1 = pts[i], p2 = pts[i+1], p3 = pts[i+2] || p2;
    const c1 = [p1[0]+(p2[0]-p0[0])/6, p1[1]+(p2[1]-p0[1])/6], c2 = [p2[0]-(p3[0]-p1[0])/6, p2[1]-(p3[1]-p1[1])/6];
    out.push(` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1]}`);
  }
  return out;
}
function mapSVG(done, atTreasure){
  const P = mapPts(), sg = segs(P), M = `M${P[0][0]},${P[0][1]}`;
  const mx = x => L()==='ar' ? x : 620 - x;
  let nodes = '';
  STAGES.forEach((s,i) => {
    const [x,y] = P[i+1];
    const st = i < done || atTreasure ? 'done' : i === done ? 'cur' : 'todo';
    nodes += `<g class="${st==='cur'?'node-pulse':''}"><circle cx="${x}" cy="${y}" r="26" fill="${st==='done'?'#f7c948':st==='cur'?'#fffaf0':'#d8bf8a'}" stroke="#5a3712" stroke-width="3" ${st==='todo'?'opacity=".75"':''}/>
      <text x="${x}" y="${y+2}" font-size="26" text-anchor="middle" dominant-baseline="middle">${s.icon}</text></g>`;
    if(st === 'done') nodes += `<circle cx="${x+19}" cy="${y-19}" r="10" fill="#2ee59d" stroke="#0d5c3a" stroke-width="2"/><text x="${x+19}" y="${y-18}" font-size="12" font-weight="900" text-anchor="middle" dominant-baseline="middle" fill="#053">✓</text>`;
    nodes += `<text x="${x}" y="${y+42}" font-size="13.5" font-weight="900" text-anchor="middle" fill="#4a2c0a" style="paint-order:stroke" stroke="#f3e2b8" stroke-width="4">${esc(loc(s).name)}</text>`;
  });
  const [tx,ty] = P[7], ship = atTreasure ? P[7] : P[done];
  return `<svg viewBox="0 0 620 400" role="img" aria-label="${t('mapTitle')}">
    <defs><radialGradient id="parch" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#f8ebc8"/><stop offset=".7" stop-color="#ead09a"/><stop offset="1" stop-color="#c99c5a"/></radialGradient>
    <pattern id="waves" width="40" height="16" patternUnits="userSpaceOnUse"><path d="M0 8 Q10 2 20 8 T40 8" fill="none" stroke="#7aa6b8" stroke-width="1.5" opacity=".55"/></pattern></defs>
    <rect width="620" height="400" fill="url(#parch)"/><rect width="620" height="400" fill="url(#waves)" opacity=".35"/>
    <text x="${mx(300)}" y="235" font-size="24">🌴</text><text x="${mx(575)}" y="230" font-size="22">🌴</text><text x="${mx(120)}" y="210" font-size="24">⛰️</text>
    <text x="${mx(250)}" y="150" font-size="20">🌲</text><text x="${mx(30)}" y="380" font-size="28">🐙</text><text x="${mx(570)}" y="60" font-size="22">🦅</text>
    <g transform="translate(${mx(70)},310)" opacity=".85"><circle r="32" fill="none" stroke="#6b4a1f" stroke-width="2"/><path d="M0,-28 L6,0 L0,28 L-6,0 Z" fill="#8b1e1e"/><path d="M-28,0 L0,-6 L28,0 L0,6 Z" fill="#6b4a1f"/><text y="-36" font-size="12" font-weight="900" text-anchor="middle" fill="#4a2c0a">${L()==='ar'?'ش':'N'}</text></g>
    <path d="${M + sg.join('')}" fill="none" stroke="#7a4e21" stroke-width="4" stroke-dasharray="3 10" stroke-linecap="round" opacity=".7"/>
    <path d="${M + sg.slice(0, atTreasure ? sg.length : done).join('')}" fill="none" stroke="#c0392b" stroke-width="5" stroke-dasharray="12 9" stroke-linecap="round"/>
    <line x1="${tx-15}" y1="${ty-15}" x2="${tx+15}" y2="${ty+15}" stroke="#b3001b" stroke-width="7" stroke-linecap="round"/><line x1="${tx+15}" y1="${ty-15}" x2="${tx-15}" y2="${ty+15}" stroke="#b3001b" stroke-width="7" stroke-linecap="round"/>
    <text x="${tx}" y="${ty+38}" font-size="14" font-weight="900" text-anchor="middle" fill="#7a0010">${t('treasure')}</text>
    ${nodes}
    <text x="${ship[0]}" y="${ship[1]-30}" font-size="32" text-anchor="middle" dominant-baseline="middle">${atTreasure ? '💎' : '⛵'}</text>
  </svg>`;
}
SCREENS.map = () => {
  const s = STAGES[G.stage], ls = loc(s);
  const order = G.stage === 0 ? `<div class="muted mt">${G.mode==='team' ? t('orderTeam') : t('orderSolo')}</div>
    <div class="board mt-s">${G.ids.map((id,i) => { const p = getPlayer(id); return `<span class="sb">${esc(p.avatar)} ${i+1}. ${esc(p.name)}</span>`; }).join('')}</div>` : '';
  return `${topbar('🗺️ ' + t('mapTitle'), { backAct:'menu', backIcon:'☰' })}
  <div class="map-wrap">${mapSVG(G.stage, false)}</div>
  <div class="card mt">
    <p class="story">${G.stage === 0 ? t('heroes') + ' ' : ''}${esc(ls.story)}</p>
    <div class="stage-card"><div class="big">${s.icon}</div><div class="grow">
      <div class="muted b">${t('stageOf',{a:G.stage+1,b:STAGES.length})} • ${CATS[s.cat].icon} ${loc(CATS[s.cat])} • ${qCount(G.counts[G.stage])}</div>
      <h2>${esc(ls.name)}</h2><div class="muted">${esc(ls.desc)}</div></div></div>
    ${order}
    <div class="center mt"><button class="btn btn-gold btn-lg" data-act="goStage" id="goStage">⚔️ ${t('startChallenge')}</button></div>
  </div>
  <div class="card">${boardHTML()}</div>`;
};
AFTER.map = () => setTimeout(() => { const b = $('#goStage'); if(b) b.focus({preventScroll:true}); }, 200);

function boardHTML(curId){
  if(G.mode === 'team') return `<div class="card-title mb">🤝 ${t('teamProgress')}</div>
    <div class="team-meter"><span class="gems">💎</span><div class="progress"><i style="width:${G.team.gems/G.total*100}%"></i></div><b>${G.team.gems} / ${G.total}</b></div>
    <div class="stat-pills mt-s"><span class="badge">⭐ ${t('points')}: ${G.team.pts}</span><span class="badge">🔥 ${t('streak')}: ${G.team.streak}</span><span class="badge">🗺️ ${t('stageOf',{a:Math.min(G.stage+1,STAGES.length),b:STAGES.length})}</span></div>`;
  return `<div class="card-title mb">🏆 ${t('scoreboard')}</div><div class="board">${[...G.ids].sort((a,b) => G.stats[b].pts - G.stats[a].pts || G.stats[b].correct - G.stats[a].correct).map(id => {
    const p = getPlayer(id), s = G.stats[id];
    return `<span class="sb ${id===curId?'cur':''}">${esc(p.avatar)} ${esc(p.name)} <b class="p">${s.pts}</b>${s.streak>=2?' 🔥':''}</span>`; }).join('')}</div>`;
}

function advNextTurn(){
  const pid = G.ids[G.turn % G.ids.length], level = levelFor(pid);
  const q = makeQuestion(STAGES[G.stage].cat, level, G.ctx);
  G.cur = { pid, level };
  const holder = G.mode === 'team' ? G.team : G.stats[pid];
  qvStart(q, {
    timer: S.settings.timer,
    meta: holder.streak >= 2 ? `<span class="badge">🔥 ${t('streak')} ${holder.streak}</span>` : '',
    onAnswer: advOnAnswer,
    onNext: advAdvance
  });
  go('play');
}
SCREENS.play = () => {
  const s = STAGES[G.stage], p = getPlayer(G.cur.pid);
  return `${topbar(`${s.icon} ${esc(loc(s).name)}`, { backAct:'menu', backIcon:'☰', right:`<span class="badge">${G.q+1} / ${G.counts[G.stage]}</span>` })}
  <div class="progress"><i style="width:${G.done/G.total*100}%"></i></div>
  <div class="turn">${av(p)}<div class="grow"><div class="who">${t('turnOf',{name:esc(p.name)})}</div><div class="sub">${G.mode==='team' ? t('teamHelp') : t('soloHelp')}</div></div><span class="lvl ${G.cur.level}">${lvLabel(G.cur.level)}</span></div>
  <div class="card qcard" id="qv"></div>
  <div class="card" id="playBoard">${boardHTML(G.cur.pid)}</div>`;
};
AFTER.play = () => qvMount();

function advOnAnswer({ ok, hint, timedOut, q }){
  const pid = G.cur.pid, st = G.stats[pid], holder = G.mode === 'team' ? G.team : st, p = getPlayer(pid);
  st.answered++; if(G.mode === 'team') G.team.answered++;
  if(hint) st.hints++;
  let gained = 0, bonus = 0;
  if(ok){
    gained = hint ? 5 : 10;
    holder.streak++; if(holder.streak % 3 === 0) bonus = 5;
    holder.best = Math.max(holder.best || 0, holder.streak);
    st.correct++; st.cats[q.cat] = (st.cats[q.cat]||0) + 1; G.stageCorrect++;
    st.pts += gained + bonus;
    if(G.mode === 'team'){ G.team.pts += gained + bonus; G.team.correct++; G.team.gems++; }
    award(pid, 10 + bonus, 2); ach(pid,'first'); if(holder.streak >= 3) ach(pid,'streak');
    Snd.sfx.correct(); confetti(bonus ? 90 : 45, { x:.5, y:.55, spread:18 });
    if(bonus) say('streak','happy'); else say('correct','happy', rpick([p.name + (L()==='ar' ? '،' : ','), '']));
  } else {
    holder.streak = 0;
    Snd.sfx.wrong(); say('wrong','calm');
  }
  G.done++;
  const pb = $('#playBoard'); if(pb) pb.innerHTML = boardHTML(pid);
  const bar = $('.screen > .progress i'); if(bar) bar.style.width = (G.done/G.total*100)+'%';
  const last = G.q + 1 >= G.counts[G.stage];
  return {
    title: ok ? rpick(t('praise')) : timedOut ? '⏰ ' + t('timeUp') : rpick(t('comfort')),
    pts: ok ? `+${gained} ${G.mode==='team' ? t('forTeam') : t('pointsStar')}${bonus ? ` • +${bonus} ${t('streakBonus')}` : ''}` : t('noLoss'),
    next: last ? t('finishStage') + ' 🏁' : t('nextQ') + ' ' + (L()==='ar' ? '⬅' : '➡')
  };
}
function advAdvance(){
  G.q++; G.turn++;
  if(G.q >= G.counts[G.stage]) go('clear'); else advNextTurn();
}
SCREENS.clear = () => {
  const s = STAGES[G.stage], n = G.counts[G.stage], c = G.stageCorrect, last = G.stage >= STAGES.length-1;
  const lead = advLeaders();
  return `<div class="card center pad-xl">
    <div class="burst">${s.icon}</div>
    <h2 class="big-title">${c === n ? t('perfectStage',{name:esc(loc(s).name)}) : t('clearedStage',{name:esc(loc(s).name)})}</h2>
    <p class="muted">${t('pieceGot',{n:G.stage+1})} ${last ? t('mapComplete') : t('nextStage',{name:STAGES[G.stage+1].icon+' '+esc(loc(STAGES[G.stage+1]).name)})}</p>
    <div class="pieces">${STAGES.map((st,i) => `<span class="piece ${i<=G.stage?'got':''}">${i<=G.stage ? st.icon : '❔'}</span>`).join('')}</div>
    <div class="stat-pills center-flex"><span class="badge">✅ ${t('correctOf',{a:c,b:n})}</span>${G.mode==='team' ? `<span class="badge">💎 ${t('teamGems')}: ${G.team.gems}</span>` : `<span class="badge">👑 ${t('leading')}: ${lead.map(id => esc(getPlayer(id).name)).join(L()==='ar'?'، ':', ')}</span>`}</div>
    <div class="mt-l"><button class="btn btn-gold btn-lg" data-act="afterClear" id="clrNext">${last ? t('toTreasure') + ' 💎' : t('toMap') + ' 🗺️'}</button></div>
  </div>`;
};
AFTER.clear = () => { Snd.sfx.stage(); confetti(140); setTimeout(() => { const b = $('#clrNext'); if(b) b.focus({preventScroll:true}); }, 250); };
function advLeaders(){ const max = Math.max(...G.ids.map(id => G.stats[id].pts)); return G.ids.filter(id => G.stats[id].pts === max); }

/* ---------- final ---------- */
function teamTier(){
  const acc = G.team.answered ? G.team.correct / G.team.answered : 0;
  if(acc >= .8) return { name:t('tierLegend'), loot:['👑','💎','🪙','💍','🏆','💎','🪙'], text:t('tierLegendTxt'), grid:'👑' };
  if(acc >= .5) return { name:t('tierGems'), loot:['💎','🪙','💍','🪙','💎'], text:t('tierGemsTxt'), grid:'💎' };
  return { name:t('tierGold'), loot:['🪙','🗝️','⭐','🪙'], text:t('tierGoldTxt'), grid:'🪙' };
}
SCREENS.final = () => {
  const lead = advLeaders().map(id => esc(getPlayer(id).name));
  const sub = G.mode === 'team' ? t('finalTeamSub',{n:G.team.gems}) : (lead.length > 1 ? t('finalSoloTie',{names:lead.join(L()==='ar'?' و ':' & ')}) : t('finalSoloOne',{name:lead[0]}));
  return `<div class="card center pad-l clip">
    <h2 class="big-title" id="finTitle">💎 ${t('treasureGate')}</h2>
    <p class="muted">${sub}</p>
    <div class="chest-stage" id="chestStage"><div class="rays"></div><div class="chest"><div class="glow"></div><div class="lid"></div><div class="base"><div class="lock"></div></div></div><div id="lootBox"></div></div>
    <button class="btn btn-gold btn-lg" data-act="openChest" id="openChest">🔓 ${t('openChest')}</button>
    <div id="results" class="hidden"></div>
  </div>`;
};
AFTER.final = () => setTimeout(() => { const b = $('#openChest'); if(b) b.focus({preventScroll:true}); }, 250);

function finishAdventureRewards(){
  if(G.rewarded) return; G.rewarded = true;
  G.ids.forEach(id => { const p = prof(id); p.games++; award(id, 20, 5); if(G.done >= G.total) ach(id,'treasure'); });
  if(G.mode === 'solo' && G.ids.length > 1){ advLeaders().forEach(id => { prof(id).wins++; award(id, 0, 15); ach(id,'champion'); }); }
  save();
}
function openChest(){
  const st = $('#chestStage'); if(!st || st.classList.contains('opened')) return;
  $('#openChest').classList.add('hidden'); st.classList.add('opened');
  finishAdventureRewards();
  const loot = G.mode === 'team' ? teamTier().loot : ['👑','💎','🪙','🏆','💍','🪙'];
  $('#lootBox').innerHTML = loot.map((e,i) => { const dx = (i-(loot.length-1)/2)*46; return `<div class="loot" style="--dx:${dx}px;--dy:${-110-Math.floor(R()*40)}px;--r:${Math.floor(R()*50-25)}deg;animation-delay:${.35+i*.08}s">${e}</div>`; }).join('');
  Snd.sfx.fanfare(); setTimeout(() => say('win','happy'), 700);
  confetti(220); setTimeout(() => confetti(160, { x:.5, y:.5, spread:26 }), 500);
  setTimeout(renderResults, 900);
}
function medalsFor(id){
  const s = G.stats[id], out = [];
  const cats = Object.entries(s.cats).sort((a,b) => b[1]-a[1]);
  if(cats.length) out.push(CATS[cats[0][0]].icon + ' ' + t('medalOf',{cat:loc(CATS[cats[0][0]])}));
  if(G.mode === 'solo' && s.best >= 3) out.push('🔥 ' + t('medalStreak'));
  if(s.answered && s.correct === s.answered) out.push('🎯 ' + t('medalPerfect'));
  if(s.answered && !s.hints && s.correct) out.push('🦅 ' + t('medalNoHint'));
  if(!out.length) out.push('🧭 ' + t('medalBrave'));
  return out;
}
function renderResults(){
  const r = $('#results'); if(!r) return; r.classList.remove('hidden');
  let h = '', shareTxt = '';
  const order = [...G.ids].sort((a,b) => G.stats[b].pts - G.stats[a].pts || G.stats[b].correct - G.stats[a].correct);
  const rankOf = id => order.findIndex(x => G.stats[x].pts === G.stats[id].pts) + 1;
  const list = solo => `<div class="rank-list">${order.map(id => { const p = getPlayer(id), s = G.stats[id];
    return `<div class="rank"><span class="n">${solo ? rankOf(id) : '★'}</span><span class="a">${esc(p.avatar)}</span><div class="info"><b>${esc(p.name)}</b>
      <small>✅ ${t('correctOf',{a:s.correct,b:s.answered})}${s.hints ? ` • 💡 ${s.hints}` : ''}</small><div class="medals">${medalsFor(id).map(m => `<span class="medal">${m}</span>`).join('')}</div></div>
      <span class="score">${solo ? s.pts + ' ⭐' : '+' + s.pts}</span></div>`; }).join('')}</div>`;
  if(G.mode === 'team'){
    const tier = teamTier(), acc = Math.round(G.team.correct / Math.max(1,G.team.answered) * 100);
    $('#finTitle').textContent = '🎉 ' + t('treasureYours');
    h += `<div class="tier">${tier.name}</div><p class="muted">${tier.text}</p>
      <div class="stat-pills center-flex"><span class="badge">⭐ ${G.team.pts}</span><span class="badge">💎 ${G.team.gems}/${G.total}</span><span class="badge">🎯 ${acc}%</span>${G.team.best>=3?`<span class="badge">🔥 ${G.team.best}</span>`:''}</div>
      <h3 class="mt-l">🌟 ${t('teamHeroes')}</h3>${list(false)}`;
    shareTxt = t('shareAdvTeam',{tier:tier.name, gems:G.team.gems, total:G.total, acc});
  } else {
    const lead = advLeaders();
    $('#finTitle').textContent = lead.length > 1 ? '🤝 ' + t('sharedTreasure',{names:lead.map(id => getPlayer(id).name).join(L()==='ar'?' و ':' & ')}) : '👑 ' + t('treasureOf',{name:getPlayer(lead[0]).name});
    const top = order.slice(0,3), vis = top.length === 3 ? [top[1],top[0],top[2]] : top.length === 2 ? [top[1],top[0]] : top;
    h += `<p class="muted">${t('everyoneMedals')}</p><div class="podium">${vis.map(id => { const rk = rankOf(id), p = getPlayer(id);
      return `<div class="pod p${Math.min(rk,3)}">${av(p)}<div class="nm">${esc(p.name)}</div><div class="muted">${G.stats[id].pts} ⭐</div><div class="blk">${rk===1?'🥇':rk===2?'🥈':'🥉'}</div></div>`; }).join('')}</div>${list(true)}`;
    shareTxt = t('shareAdvSolo',{name:getPlayer(lead[0]).name, pts:G.stats[lead[0]].pts});
  }
  h += `<div class="end-actions">
    <button class="btn btn-gold btn-lg" data-act="startAdv">🔁 ${t('playAgain')}</button>
    <button class="btn btn-ghost btn-lg" data-act="players">👥 ${t('changePlayers')}</button>
    <button class="btn btn-mint btn-lg" data-act="shareText" data-text="${esc(shareTxt)}">📣 ${t('share')}</button>
    <button class="btn btn-ghost btn-lg" data-act="home">🏠 ${t('home')}</button></div>`;
  r.innerHTML = h;
  setTimeout(() => r.scrollIntoView({ behavior:'smooth', block:'start' }), 200);
}

/* =========================================================
   PLAYER PICKER (Daily + Snack)
   ========================================================= */
function pickerHTML(title, act, extra){
  const list = selectedPlayers().length ? selectedPlayers() : S.players;
  return `${topbar(title)}
  <div class="card"><div class="card-title mb">${t('whoPlaying')}</div>
  <div class="pick-grid">${list.map(p => `<button class="pick" data-act="${act}" data-id="${esc(p.id)}">${av(p)}<b>${esc(p.name)}</b><small>${extra ? extra(p) : ''}</small></button>`).join('')}</div></div>`;
}

/* =========================================================
   DAILY CHALLENGE
   ========================================================= */
let D = null;
function dailyQuestions(){
  const ctx = { lang:L(), used:new Set(), seen:null, names:[] };
  return withSeed(`kanz|${dateKey()}|${L()}`, () => CAT_ORDER.map(cat => makeQuestion(cat, 'medium', ctx)));
}
SCREENS.dailyPick = () => pickerHTML(`📅 ${t('dailyTitle')} #${dailyNumber()}`, 'dailyStart', p => {
  const d = prof(p.id).daily, res = d.hist[dateKey()];
  return res ? `✅ ${res.score}/6` : (d.streak && d.last === yesterdayKey() ? `🔥 ${d.streak}` : t('notYet'));
}) + `<p class="center muted small">${t('dailyRules')}</p>`;
function dailyStart(pid){
  const res = prof(pid).daily.hist[dateKey()];
  if(res){ D = { pid, done:true }; go('dailyResult'); return; }
  D = { pid, qs:dailyQuestions(), i:0, grid:[], score:0 };
  dailyNext();
}
function dailyNext(){
  const q = D.qs[D.i];
  qvStart(q, { timer:0, onAnswer:dailyOnAnswer, onNext:() => { D.i++; if(D.i >= D.qs.length) dailyFinish(); else dailyNext(); } });
  go('dailyPlay');
}
SCREENS.dailyPlay = () => {
  const p = getPlayer(D.pid);
  return `${topbar(`📅 ${t('dailyTitle')} #${dailyNumber()}`, { right:`<span class="badge">${D.i+1} / ${D.qs.length}</span>` })}
  <div class="daily-dots">${D.qs.map((_,i) => `<span class="${i < D.grid.length ? (D.grid[i]==='🟩'?'g':D.grid[i]==='🟨'?'y':'r') : i===D.i?'cur':''}"></span>`).join('')}</div>
  <div class="turn">${av(p)}<div class="grow"><div class="who">${esc(p.name)}</div><div class="sub">${t('dailySub')}</div></div></div>
  <div class="card qcard" id="qv"></div>`;
};
AFTER.dailyPlay = () => qvMount();
function dailyOnAnswer({ ok, hint }){
  D.grid.push(ok ? (hint ? '🟨' : '🟩') : '🟥');
  if(ok){ D.score++; Snd.sfx.correct(); confetti(40, { x:.5, y:.55 }); say('correct','happy'); } else { Snd.sfx.wrong(); say('wrong','calm'); }
  $$('.daily-dots span').forEach((s,i) => { if(i === D.grid.length-1){ s.className = ok ? (hint?'y':'g') : 'r'; } });
  const last = D.i + 1 >= D.qs.length;
  return { title: ok ? rpick(t('praise')) : rpick(t('comfort')), pts: ok ? (hint ? '🟨 ' + t('withHint') : '🟩 ' + t('perfectAnswer')) : '🟥', next: last ? t('seeResult') + ' 🏁' : t('nextQ') + ' ' + (L()==='ar' ? '⬅' : '➡') };
}
function dailyFinish(){
  const p = prof(D.pid), d = p.daily, today = dateKey();
  d.streak = d.last === yesterdayKey() ? d.streak + 1 : 1; d.last = today;
  d.hist[today] = { grid:D.grid.join(''), score:D.score };
  const keys = Object.keys(d.hist).sort(); while(keys.length > 60) delete d.hist[keys.shift()];
  award(D.pid, 5*D.score + 10, 10);
  ach(D.pid,'daily'); if(d.streak >= 3) ach(D.pid,'daily3'); if(D.score === 6) ach(D.pid,'perfect');
  save(); D.done = true;
  go('dailyResult');
}
SCREENS.dailyResult = () => {
  const pl = getPlayer(D.pid), d = prof(D.pid).daily, res = d.hist[dateKey()];
  const txt = t('dailyShare',{n:dailyNumber(), grid:res.grid, score:res.score, streak:d.streak});
  return `${topbar(`📅 ${t('dailyTitle')} #${dailyNumber()}`)}
  <div class="card center pad-l">
    ${av(pl,'lg')}
    <h2 class="big-title">${res.score === 6 ? t('dailyPerfect') : res.score >= 4 ? t('dailyGreat') : t('dailyGood')}</h2>
    <div class="grid-big">${esc(res.grid)}</div>
    <div class="stat-pills center-flex"><span class="badge">✅ ${res.score} / 6</span><span class="badge">🔥 ${t('streak')}: ${d.streak}</span><span class="badge">⏳ ${t('nextIn')} <b id="countdown"></b></span></div>
    <div class="end-actions">
      <button class="btn btn-mint btn-lg" data-act="shareText" data-text="${esc(txt)}">📣 ${t('shareResult')}</button>
      <button class="btn btn-ghost btn-lg" data-act="dailyPick">👥 ${t('anotherPlayer')}</button>
      <button class="btn btn-ghost btn-lg" data-act="home">🏠 ${t('home')}</button>
    </div>
  </div>`;
};
AFTER.dailyResult = () => {
  if(D && !D.celebrated && D.grid){ D.celebrated = true; Snd.sfx.fanfare(); confetti(120); }
  const tick = () => { const el = $('#countdown'); if(!el) return; const now = new Date(), m = new Date(now); m.setHours(24,0,0,0); const s = Math.max(0, Math.floor((m-now)/1000));
    el.textContent = `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s%3600/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; };
  tick(); timers.push(setInterval(tick, 1000));
};

/* =========================================================
   SNACK ATTACK (healthy-choice arcade)
   ========================================================= */
let SN = null;
const SNACK_TIME = 45;
SCREENS.snackPick = () => pickerHTML(`🍔🥦 ${t('snackTitle')}`, 'snackStart', p => `🏅 ${prof(p.id).snackBest}`) + `<div class="card"><b>${t('howToPlay')}</b><p class="muted">${t('snackRules')}</p></div>`;
function snackStart(pid){
  SN = { pid, score:0, energy:100, combo:0, left:SNACK_TIME, queue:shuffle(FOODS.concat(FOODS)), idx:0, busy:false, right:0, total:0, healthyEaten:0, junkEaten:0, over:false, msg:null };
  go('snackPlay');
}
SCREENS.snackPlay = () => {
  const f = SN.queue[SN.idx % SN.queue.length], p = getPlayer(SN.pid);
  return `${topbar(`🍔🥦 ${t('snackTitle')}`)}
  <div class="hud">
    <span class="badge">${av(p,'xs')} ${esc(p.name)}</span>
    <span class="badge big">⭐ <b id="snScore">${SN.score}</b></span>
    <span class="badge big">⏱️ <b id="snTime">${SN.left}</b></span>
    <span class="badge" id="snCombo">${SN.combo >= 2 ? '🔥 x' + SN.combo : ''}</span>
  </div>
  <div class="energy"><span>🔋 ${t('energy')}</span><div class="progress"><i id="snEnergy" style="width:${SN.energy}%"></i></div><b id="snEnergyN">${SN.energy}%</b></div>
  <div class="food-stage">
    <div class="food-card" id="foodCard"><div class="food-emoji">${f.e}</div><div class="food-name">${esc(loc({ar:f.ar,en:f.en}))}</div></div>
    <div class="food-msg" id="foodMsg">${t('snackAsk')}</div>
  </div>
  <div class="snack-btns">
    <button class="btn snack-eat" data-act="snackEat" id="snEat">😋 ${t('eat')}</button>
    <button class="btn snack-skip" data-act="snackSkip" id="snSkip">🙅 ${t('skip')}</button>
  </div>`;
};
AFTER.snackPlay = () => {
  timers.push(setInterval(() => {
    if(!SN || SN.over || $('.modal-bg')) return;
    SN.left--; const el = $('#snTime'); if(el) el.textContent = SN.left;
    if(SN.left <= 5 && SN.left > 0) Snd.sfx.tick();
    if(SN.left <= 0) snackEnd();
  }, 1000));
};
function snackChoose(eat){
  if(!SN || SN.busy || SN.over) return;
  SN.busy = true;
  const f = SN.queue[SN.idx % SN.queue.length], card = $('#foodCard'), msg = $('#foodMsg');
  const fact = L()==='ar' ? f.far : f.fen;
  let good;
  if(eat && f.ok){ good = true; SN.combo++; SN.score += 10 + Math.min(SN.combo-1, 5)*2; SN.energy = Math.min(100, SN.energy + 5); SN.healthyEaten++; Snd.sfx.yum(); say('healthy','happy'); card.classList.add('yum'); confetti(25, { x:.5, y:.45, colors:['#2ee59d','#a3f7bf','#f7c948'] }); }
  else if(eat && !f.ok){ good = false; SN.combo = 0; SN.energy = Math.max(0, SN.energy - 25); SN.junkEaten++; Snd.sfx.sad(); say('unhealthy','sad'); card.classList.add('yuck'); document.body.classList.add('sad-flash'); setTimeout(() => document.body.classList.remove('sad-flash'), 600); }
  else if(!eat && !f.ok){ good = true; SN.combo++; SN.score += 10 + Math.min(SN.combo-1, 5)*2; Snd.sfx.pop(); say('skipJunk','happy'); card.classList.add('toss'); }
  else { good = false; SN.combo = 0; SN.energy = Math.max(0, SN.energy - 5); Snd.sfx.wrong(); say('skipHealthy','calm'); card.classList.add('toss'); }
  SN.total++; if(good) SN.right++;
  msg.className = 'food-msg ' + (good ? 'good' : 'bad');
  msg.textContent = (f.ok ? '✅ ' : '⚠️ ') + fact;
  $('#snScore').textContent = SN.score;
  $('#snCombo').textContent = SN.combo >= 2 ? '🔥 x' + SN.combo : '';
  $('#snEnergy').style.width = SN.energy + '%'; $('#snEnergyN').textContent = SN.energy + '%';
  $('#snEnergy').parentElement.classList.toggle('low', SN.energy <= 30);
  $$('.snack-btns .btn').forEach(b => b.disabled = true);
  if(SN.energy <= 0){ setTimeout(() => snackEnd(true), 1100); return; }
  setTimeout(() => {
    if(!SN || SN.over || screen !== 'snackPlay') return;
    SN.idx++; SN.busy = false;
    const n = SN.queue[SN.idx % SN.queue.length];
    card.className = 'food-card pop-in';
    card.innerHTML = `<div class="food-emoji">${n.e}</div><div class="food-name">${esc(loc({ar:n.ar,en:n.en}))}</div>`;
    msg.className = 'food-msg'; msg.textContent = t('snackAsk');
    $$('.snack-btns .btn').forEach(b => b.disabled = false);
  }, 1300);
}
function snackEnd(crash){
  if(!SN || SN.over) return;
  SN.over = true; SN.crash = !!crash;
  const p = prof(SN.pid);
  SN.newBest = SN.score > p.snackBest;
  if(SN.newBest) p.snackBest = SN.score;
  award(SN.pid, Math.round(SN.score/2), Math.floor(SN.score/20));
  if(SN.score >= 150) ach(SN.pid,'plate');
  save();
  go('snackResult');
}
SCREENS.snackResult = () => {
  const p = getPlayer(SN.pid), acc = SN.total ? Math.round(SN.right/SN.total*100) : 0;
  const txt = t('snackShare',{score:SN.score, acc});
  return `${topbar(`🍔🥦 ${t('snackTitle')}`)}
  <div class="card center pad-l">
    <div class="burst">${SN.crash ? '🪫' : SN.junkEaten === 0 ? '🥦' : '🏁'}</div>
    <h2 class="big-title">${SN.crash ? t('energyCrash') : SN.newBest ? t('newBest') : t('roundOver')}</h2>
    <p class="muted">${SN.crash ? t('crashTip') : SN.junkEaten === 0 ? t('noJunk') : t('junkCount',{n:SN.junkEaten})}</p>
    <div class="stat-pills center-flex"><span class="badge big">⭐ ${SN.score}</span><span class="badge">🎯 ${acc}%</span><span class="badge">🥦 ${SN.healthyEaten}</span><span class="badge">🍩 ${SN.junkEaten}</span><span class="badge">🏅 ${t('best')}: ${prof(SN.pid).snackBest}</span></div>
    <div class="end-actions">
      <button class="btn btn-gold btn-lg" data-act="snackStart" data-id="${esc(p.id)}">🔁 ${t('playAgain')}</button>
      <button class="btn btn-mint btn-lg" data-act="shareText" data-text="${esc(txt)}">📣 ${t('share')}</button>
      <button class="btn btn-ghost btn-lg" data-act="snackPick">👥 ${t('anotherPlayer')}</button>
      <button class="btn btn-ghost btn-lg" data-act="home">🏠 ${t('home')}</button>
    </div>
  </div>`;
};
AFTER.snackResult = () => { if(SN.crash) { Snd.sfx.sad(); } else { Snd.sfx.fanfare(); confetti(SN.newBest ? 160 : 80); } };

/* =========================================================
   FOOD DIARY (real-life check-in)
   ========================================================= */
function foodDay(pid){ const p = prof(pid), k = dateKey(); p.food[k] = p.food[k] || { items:{}, bonus:false }; const keys = Object.keys(p.food).sort(); while(keys.length > 30) delete p.food[keys.shift()]; return p.food[k]; }
function foodScore(pid){
  const p = prof(pid), day = p.food[dateKey()]; if(!day) return { score:null, h:0, u:0 };
  let h = 0, u = 0; Object.entries(day.items).forEach(([id,n]) => { const f = FOODS.find(x => x.id === id); if(!f) return; if(f.ok) h += n; else u += n; });
  return { score: h+u ? Math.round(h/(h+u)*100) : null, h, u };
}
const faceOf = s => s == null ? '😶' : s >= 80 ? '🤩' : s >= 60 ? '🙂' : s >= 40 ? '😐' : '😟';
SCREENS.food = (pid) => {
  const list = selectedPlayers().length ? selectedPlayers() : S.players;
  pid = pid && getPlayer(pid) ? pid : list[0] && list[0].id;
  if(!pid) return `${topbar('🥗 ' + t('foodTitle'))}<div class="card">${t('noPlayers')}</div>`;
  screenArg = pid;
  const day = foodDay(pid), sc = foodScore(pid), p = getPlayer(pid);
  const tile = f => { const n = day.items[f.id] || 0;
    return `<div class="ftile ${f.ok?'ok':'junk'} ${n?'has':''}"><button class="fadd" data-act="foodAdd" data-f="${f.id}" aria-label="${esc(loc({ar:f.ar,en:f.en}))}"><span class="fe">${f.e}</span><span class="fn">${esc(loc({ar:f.ar,en:f.en}))}</span></button>${n ? `<span class="fcount">${n}</span><button class="fminus" data-act="foodRemove" data-f="${f.id}" aria-label="${t('remove')}">−</button>` : ''}</div>`; };
  return `${topbar('🥗 ' + t('foodTitle'))}
  <div class="tabs">${list.map(x => `<button class="tab ${x.id===pid?'on':''}" data-act="foodTab" data-id="${esc(x.id)}">${esc(x.avatar)} ${esc(x.name)}</button>`).join('')}</div>
  <div class="card food-head">
    <div class="ring" style="--p:${sc.score||0}"><span>${faceOf(sc.score)}</span></div>
    <div class="grow"><h3>${t('todayOf',{name:esc(p.name)})}</h3>
      <div class="muted">${sc.score == null ? t('foodEmpty') : t('foodSummary',{s:sc.score, h:sc.h, u:sc.u})}</div>
      ${day.bonus ? `<span class="badge ok-badge">🥦 ${t('healthyBonusDone')}</span>` : `<div class="muted small">🎁 ${t('healthyBonusHint')}</div>`}</div>
  </div>
  <h3 class="sec">💚 ${t('healthyFoods')}</h3><div class="food-grid">${FOODS.filter(f => f.ok).map(tile).join('')}</div>
  <h3 class="sec">⚠️ ${t('treatFoods')}</h3><div class="food-grid">${FOODS.filter(f => !f.ok).map(tile).join('')}</div>
  <div class="card mt"><div class="card-title mb">👨‍👩‍👧‍👦 ${t('familyBoard')}</div>
    <div class="rank-list">${list.map(x => { const s = foodScore(x.id); return `<div class="rank"><span class="a">${esc(x.avatar)}</span><div class="info"><b>${esc(x.name)}</b><div class="progress thin"><i style="width:${s.score||0}%"></i></div></div><span class="score">${faceOf(s.score)} ${s.score == null ? '—' : s.score + '%'}</span></div>`; }).join('')}</div>
  </div>`;
};
function foodAdd(fid){
  const pid = screenArg, f = FOODS.find(x => x.id === fid); if(!pid || !f) return;
  const day = foodDay(pid); day.items[fid] = (day.items[fid] || 0) + 1;
  if(f.ok){ Snd.sfx.yum(); say('healthy','happy'); }
  else { Snd.sfx.sad(); say('unhealthy','sad'); document.body.classList.add('sad-flash'); setTimeout(() => document.body.classList.remove('sad-flash'), 600); }
  const sc = foodScore(pid);
  if(!day.bonus && sc.h >= 4 && sc.score >= 75){
    day.bonus = true; prof(pid).healthyDays++; award(pid, 30, 20); ach(pid,'healthy');
    setTimeout(() => { toast('🥦 ' + t('healthyBonusGot')); Snd.sfx.coin(); confetti(120, { colors:['#2ee59d','#a3f7bf','#f7c948'] }); }, 400);
  }
  save(); const y = scrollY; render(); scrollTo(0, y);
}
function foodRemove(fid){
  const pid = screenArg, day = foodDay(pid); if(!day.items[fid]) return;
  day.items[fid]--; if(!day.items[fid]) delete day.items[fid];
  Snd.sfx.click(); save(); const y = scrollY; render(); scrollTo(0, y);
}

/* =========================================================
   TROPHY ROOM + PROFILE + SHOP
   ========================================================= */
SCREENS.trophies = () => {
  const order = [...S.players].sort((a,b) => prof(b.id).xp - prof(a.id).xp);
  return `${topbar('🏆 ' + t('trophyTitle'))}
  <div class="card"><div class="card-title mb">📈 ${t('leaderboard')}</div>
  <div class="rank-list">${order.map((p,i) => { const pr = prof(p.id), lv = levelOf(pr.xp);
    return `<button class="rank btn-row" data-act="profile" data-id="${esc(p.id)}"><span class="n">${i < 3 && pr.xp ? ['🥇','🥈','🥉'][i] : i+1}</span>${av(p,'sm')}<div class="info"><b>${esc(p.name)}</b><small>${t('levelN',{n:lv})} • ${titleOf(lv)} • 🏅 ${pr.ach.length}</small></div><span class="score">${pr.xp} XP<br><small>🪙 ${pr.coins}</small></span></button>`; }).join('')}</div></div>`;
};
SCREENS.profile = (pid) => {
  const p = getPlayer(pid); if(!p) return SCREENS.trophies();
  const pr = prof(pid), lv = levelOf(pr.xp), a = xpFor(lv), b = xpFor(lv+1);
  const owned = new Set(pr.owned);
  return `${topbar('🏆 ' + esc(p.name), { backAct:'trophies' })}
  <div class="card center pad-l">
    ${av(p,'xl')}
    <h2 class="big-title">${esc(p.name)}</h2>
    <div class="muted b">${t('levelN',{n:lv})} • ${titleOf(lv)}</div>
    <div class="xp"><div class="progress"><i style="width:${Math.min(100,(pr.xp-a)/(b-a)*100)}%"></i></div><small>${pr.xp} / ${b} XP</small></div>
    <div class="stat-pills center-flex"><span class="badge big">🪙 ${pr.coins}</span><span class="badge">🎮 ${pr.games}</span><span class="badge">👑 ${pr.wins}</span><span class="badge">📅🔥 ${pr.daily.streak}</span><span class="badge">🍔🥦 ${pr.snackBest}</span><span class="badge">🥦 ${pr.healthyDays}</span></div>
  </div>
  <div class="card"><div class="card-title mb">🏅 ${t('achievements')} (${pr.ach.length}/${ACHIEVEMENTS.length})</div>
    <div class="ach-grid">${ACHIEVEMENTS.map(x => { const on = pr.ach.includes(x.id), l = loc(x); return `<div class="ach ${on?'on':''}"><span class="ai">${on ? x.icon : '🔒'}</span><b>${esc(l[0])}</b><small>${esc(l[1])}</small></div>`; }).join('')}</div></div>
  <div class="card"><div class="card-title mb">🎭 ${t('avatars')}</div>
    <div class="av-grid">${AVATARS.map(e => `<button class="avopt ${p.avatar===e?'on':''}" data-act="equip" data-id="${esc(pid)}" data-e="${e}">${e}</button>`).join('')}</div>
    <div class="card-title mb mt">🛍️ ${t('shop')} <span class="badge">🪙 ${pr.coins}</span></div>
    <div class="av-grid">${SHOP.map(s => { const has = owned.has(s.e);
      return `<button class="avopt shop ${p.avatar===s.e?'on':''} ${has?'owned':''}" data-act="${has?'equip':'buy'}" data-id="${esc(pid)}" data-e="${s.e}">${s.e}<small>${has ? (p.avatar===s.e ? '✓' : t('use')) : '🪙 ' + s.cost}</small></button>`; }).join('')}</div>
    <p class="muted small">${t('coinsHelp')}</p></div>`;
};

/* =========================================================
   Players management
   ========================================================= */
let lastRemoved = null;
function addPlayer(){
  const inp = $('#newName'); if(!inp) return;
  const name = inp.value.replace(/\s+/g,' ').trim().slice(0,20);
  if(!name){ toast('✍️ ' + t('typeName')); inp.focus(); return; }
  if(S.players.some(p => p.name === name)){ toast('🙂 ' + t('nameExists')); inp.select(); return; }
  const used = new Set(S.players.map(p => p.avatar)), i = S.players.length;
  const p = { id:'p'+Date.now().toString(36)+Math.random().toString(36).slice(2,6), name, level:'medium', avatar:AVATARS.find(a => !used.has(a)) || AVATARS[i%AVATARS.length], color:COLORS[i%COLORS.length] };
  S.players.push(p); S.selected.push(p.id); save(); render();
  Snd.sfx.correct(); toast('🎉 ' + t('welcome',{name:esc(name)}));
  setTimeout(() => { const n = $('#newName'); if(n) n.focus(); }, 50);
}
function removePlayer(id){
  const idx = S.players.findIndex(p => p.id === id); if(idx < 0) return;
  const p = S.players[idx];
  lastRemoved = { p, idx, sel:S.selected.includes(id) };
  S.players.splice(idx,1); S.selected = S.selected.filter(x => x !== id); save(); render(); Snd.sfx.click();
  toast(t('removed',{name:esc(p.name)}), t('undo'), () => {
    if(!lastRemoved || S.players.some(x => x.id === lastRemoved.p.id)) return;
    S.players.splice(Math.min(lastRemoved.idx, S.players.length), 0, lastRemoved.p);
    if(lastRemoved.sel) S.selected.push(lastRemoved.p.id);
    lastRemoved = null; save(); if(screen === 'players') render();
  });
}
function restoreDefaults(){
  let added = 0;
  defaultPlayers().forEach((d,i) => { if(!S.players.some(p => p.name === d.name)){ if(S.players.some(p => p.id === d.id)) d.id += '_' + Date.now().toString(36); S.players.splice(Math.min(i,S.players.length),0,d); S.selected.push(d.id); added++; } });
  save(); render(); toast(added ? t('restored',{n:added}) : t('allThere'));
}

/* =========================================================
   Install (PWA)
   ========================================================= */
let deferredInstall = null;
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; });
addEventListener('appinstalled', () => { deferredInstall = null; toast('📲 ' + t('installed')); if(screen === 'home') render(); });
async function installApp(){
  if(deferredInstall){ deferredInstall.prompt(); try{ await deferredInstall.userChoice; }catch(e){} deferredInstall = null; return; }
  modal('📲 ' + t('installTitle'), `<div class="install-steps"><p><b>iPhone / iPad:</b> ${t('installIOS')}</p><p><b>Android:</b> ${t('installAndroid')}</p><p><b>${t('computer')}:</b> ${t('installDesktop')}</p></div>`, [[t('close'),'btn-gold']]);
}
if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)){
  addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}

/* =========================================================
   Action dispatcher
   ========================================================= */
const ACTIONS = Object.assign({}, QV_ACTIONS, {
  home(){ go('home'); },
  players(){ go('players'); },
  advSetup(){ go('advSetup'); },
  dailyPick(){ go('dailyPick'); },
  snackPick(){ go('snackPick'); },
  food(){ go('food'); },
  trophies(){ go('trophies'); },
  profile(d){ go('profile', d.id); },
  toggleLang(){ S.lang = S.lang === 'ar' ? 'en' : 'ar'; Snd.cfg.lang = S.lang; save(); render(); },
  toggleSound(){ S.sound = !S.sound; Snd.cfg.sound = S.sound; save(); refreshSoundBtns(); Snd.sfx.click(); },
  toggleVoice(){ S.voice = !S.voice; Snd.cfg.voice = S.voice; save(); refreshSoundBtns(); if(S.voice){ if(!Snd.hasVoiceFor(L())) toast('🗣️ ' + t('noVoice')); Snd.speak(t('voiceOn'), 'happy'); } else if('speechSynthesis' in window) speechSynthesis.cancel(); },
  install(){ installApp(); },
  invite(){ share(t('inviteText')); },
  shareText(d){ share(d.text); },
  togglePlayer(d){ const i = S.selected.indexOf(d.id); if(i >= 0) S.selected.splice(i,1); else S.selected.push(d.id); Snd.sfx.click(); save(); render(); const el = document.querySelector(`.player[data-id="${CSS.escape(d.id)}"]`); if(el) el.focus({preventScroll:true}); },
  removePlayer(d){ removePlayer(d.id); },
  cycleLevel(d){ const p = getPlayer(d.id); const o = ['easy','medium','hard']; p.level = o[(o.indexOf(p.level)+1)%3]; Snd.sfx.click(); save(); render(); },
  selAll(){ S.selected = S.players.map(p => p.id); save(); render(); },
  selNone(){ S.selected = []; save(); render(); },
  restore(){ restoreDefaults(); },
  setOpt(d){ S.settings[d.k] = d.k === 'mode' || d.k === 'diff' ? d.v : Number(d.v); Snd.sfx.click(); save(); render(); },
  startAdv(){ startAdventure(); },
  goStage(){ Snd.sfx.click(); G.q = 0; G.stageCorrect = 0; advNextTurn(); },
  afterClear(){ Snd.sfx.click(); G.stage++; G.q = 0; G.stageCorrect = 0; if(G.stage >= STAGES.length) go('final'); else go('map'); },
  openChest(){ openChest(); },
  menu(){
    modal('⏸️ ' + t('paused'), `<p class="muted">${t('pausedQ')}</p>`, [
      ['▶️ ' + t('resume'), 'btn-gold'],
      ['🏁 ' + t('endNow'), 'btn-ghost', () => go('final')],
      ['🏠 ' + t('quitHome'), 'btn-danger', () => { G = null; go('home'); }],
      [t('close'), 'btn-ghost']
    ]);
  },
  dailyStart(d){ dailyStart(d.id); },
  snackStart(d){ snackStart(d.id); },
  snackEat(){ snackChoose(true); },
  snackSkip(){ snackChoose(false); },
  foodTab(d){ go('food', d.id); },
  foodAdd(d){ foodAdd(d.f); },
  foodRemove(d){ foodRemove(d.f); },
  equip(d){ const p = getPlayer(d.id); p.avatar = d.e; Snd.sfx.pop(); save(); render(); },
  buy(d){
    const pr = prof(d.id), item = SHOP.find(s => s.e === d.e); if(!item) return;
    if(pr.coins < item.cost){ toast('🪙 ' + t('needCoins',{n:item.cost - pr.coins})); Snd.sfx.wrong(); return; }
    pr.coins -= item.cost; pr.owned.push(item.e); getPlayer(d.id).avatar = item.e;
    ach(d.id,'shopper'); Snd.sfx.coin(); confetti(60); save(); render();
  }
});

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if(!el || el.disabled) return;
  // a button inside a clickable card should not trigger the card too
  e.stopPropagation();
  const fn = ACTIONS[el.dataset.act]; if(fn){ e.preventDefault(); fn(el.dataset, el, e); }
});
document.addEventListener('keydown', e => {
  const el = e.target;
  if((e.key === 'Enter' || e.key === ' ') && el.matches && el.matches('div[data-act]')){ e.preventDefault(); el.click(); return; }
  if($('.modal-bg') || el.tagName === 'INPUT') return;
  if(QV && !QV.answered && (screen === 'play' || screen === 'dailyPlay') && QV.q.type === 'mc' && ['1','2','3','4'].includes(e.key)){ QV_ACTIONS.qopt({ i:+e.key-1 }); }
  if(screen === 'snackPlay'){ if(e.key === 'ArrowRight' || e.key === 'ArrowLeft'){ const eatIsStart = L()==='ar'; snackChoose((e.key === 'ArrowRight') === eatIsStart); } }
});
document.addEventListener('submit', e => { if(e.target.dataset.form === 'addPlayer'){ e.preventDefault(); addPlayer(); } });

/* =========================================================
   Boot
   ========================================================= */
load();
Snd.cfg.sound = S.sound; Snd.cfg.voice = S.voice; Snd.cfg.lang = S.lang;
const startScreen = (new URLSearchParams(location.search).get('go') || '');
render();
if(['dailyPick','snackPick','food','advSetup','trophies'].includes(startScreen)) go(startScreen);
