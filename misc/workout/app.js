/* =============================================================
   WORKOUT — App logic
   Daily checklist, no history: state is keyed to today's date in
   localStorage, so yesterday's checks are simply never loaded again.
   ============================================================= */

/* -------- CONFIG -------- */
// The program. Edit here when the plan changes.
// demo: base path of a start/end frame pair ('anim/name' expects
// anim/name-1.png and anim/name-2.png, crossfaded as an animation),
// or a full image path with extension (e.g. 'anim/bench.gif') to show as is.
// Frame pairs are Everkinetic line illustrations (CC-BY-SA), used as CSS
// masks so they take on the theme ink color.
const DAYS = [
  {
    key: 'day1',
    label: 'Day 1',
    focus: 'Heavy Bench + Triceps',
    exercises: [
      { name: 'Machine bench press', scheme: '4×5-6, heavy', demo: 'anim/bench-press' },
      { name: 'Pec dec flys', scheme: '3×12-15', demo: 'anim/pec-dec' },
      { name: 'Skull crushers (head on bench)', scheme: '3×10-12', demo: 'anim/skull-crusher' },
      { name: 'Overhead extension, seated with back support', scheme: '3×12', demo: 'anim/overhead-extension' }
    ]
  },
  {
    key: 'day2',
    label: 'Day 2',
    focus: 'Shoulders + Biceps',
    exercises: [
      { name: 'High-incline seated press', scheme: '4×8-10', demo: 'anim/incline-press' },
      { name: 'Lateral raises', scheme: '4×12-15', demo: 'anim/lateral-raise' },
      { name: 'Chest-supported rear delt flys', scheme: '3×15', demo: 'anim/rear-delt' },
      { name: 'Underhand lat pulldown (front)', scheme: '3×8-10', demo: 'anim/pulldown' },
      { name: 'Alternating curls', scheme: '3×10', demo: 'anim/curls' }
    ]
  },
  {
    key: 'day3',
    label: 'Day 3',
    focus: 'Volume Bench + Arms',
    exercises: [
      { name: 'Machine bench press', scheme: '3×10-12, moderate (roughly 70-75% of Day 1 weight)', demo: 'anim/bench-press' },
      { name: 'Incline press', scheme: '3×10', demo: 'anim/incline-press' },
      { name: 'Close-grip machine press', scheme: '3×8-10', demo: 'anim/close-grip-press' },
      { name: 'Hammer curls', scheme: '3×12', demo: 'anim/hammer-curl' },
      { name: 'Incline curls (45°, head supported)', scheme: '3×10-12', demo: 'anim/incline-curl' }
    ]
  }
];

const THEME_KEY = 'workout.theme';
const MODE_KEY  = 'workout.mode';
const TAB_KEY   = 'workout.selectedDay';
const DAY_KEY   = (date) => `workout.day.${date}`;

const VALID_THEMES = ['swiss', 'ration', 'instrument'];
const DEFAULT_THEME = 'swiss';

/* -------- STATE -------- */
function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// State shape: { day1: [0,1,...], day2: [...], day3: [...] }
function emptyState() {
  const s = {};
  for (const d of DAYS) s[d.key] = new Array(d.exercises.length).fill(0);
  return s;
}

function normalizeState(raw) {
  const fresh = emptyState();
  if (!raw || typeof raw !== 'object') return fresh;
  for (const d of DAYS) {
    if (Array.isArray(raw[d.key]) && raw[d.key].length === d.exercises.length) {
      fresh[d.key] = raw[d.key].map(v => v ? 1 : 0);
    }
  }
  return fresh;
}

function loadDayState(dateKey) {
  try {
    const raw = localStorage.getItem(DAY_KEY(dateKey));
    if (!raw) return emptyState();
    return normalizeState(JSON.parse(raw));
  } catch (e) {
    return emptyState();
  }
}

function saveDayState(dateKey, state) {
  try {
    localStorage.setItem(DAY_KEY(dateKey), JSON.stringify(state));
    // Drop older days so no history accumulates.
    const prefix = 'workout.day.';
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix) && k !== DAY_KEY(dateKey)) {
        localStorage.removeItem(k);
      }
    }
  } catch (e) {
    // localStorage may be unavailable in private mode — fail silently
  }
}

/* -------- DOM REFS -------- */
const app         = document.getElementById('app');
const tabsEl      = document.getElementById('dayTabs');
const focusEl     = document.getElementById('dayFocus');
const exercisesEl = document.getElementById('exercises');
const trigger     = document.getElementById('themeTrigger');
const menu        = document.getElementById('themeMenu');
const modeTrigger = document.getElementById('modeTrigger');
const dateEl      = document.getElementById('dateText');
const remainingEl = document.getElementById('remainingText');
const doneSumEl   = document.querySelector('.done-sum');
const denominatorEl = document.querySelector('.denominator');

let currentDate  = todayKey();
let currentState = loadDayState(currentDate);
let selectedDay  = loadSelectedDay();

function loadSelectedDay() {
  try {
    const v = localStorage.getItem(TAB_KEY);
    if (DAYS.some(d => d.key === v)) return v;
  } catch (e) {}
  return DAYS[0].key;
}

function activeDay() {
  return DAYS.find(d => d.key === selectedDay) || DAYS[0];
}

/* -------- RENDERING -------- */
function renderTabs() {
  tabsEl.innerHTML = '';
  for (const d of DAYS) {
    const b = document.createElement('button');
    b.className = 'day-tab';
    b.type = 'button';
    b.textContent = d.label;
    b.setAttribute('aria-pressed', d.key === selectedDay ? 'true' : 'false');
    b.addEventListener('click', () => {
      if (selectedDay === d.key) return;
      selectedDay = d.key;
      try { localStorage.setItem(TAB_KEY, selectedDay); } catch (e) {}
      renderTabs();
      renderExercises();
    });
    tabsEl.appendChild(b);
  }
}

// Resolve an asset path. window.__ASSET__ lets a bundled build (e.g. the
// mockup artifact) substitute inline data URIs; in production it's absent.
function asset(path) {
  return (window.__ASSET__ && window.__ASSET__[path]) || path;
}

// A demo path with an extension is a plain image (gif/png/webp/svg);
// anything else is a start/end frame pair rendered as theme-colored
// masks, crossfaded to read as motion.
function isPlainImage(demo) {
  return /\.(gif|png|webp|svg|jpe?g)$/i.test(demo);
}

function framesMarkup(demo) {
  return `
    <div class="frame frame-a" style="--mask:url('${asset(demo + '-1.png')}')"></div>
    <div class="frame frame-b" style="--mask:url('${asset(demo + '-2.png')}')"></div>`;
}

function demoMarkup(demo) {
  if (!demo) return '';
  if (isPlainImage(demo)) {
    return `<img src="${asset(demo)}" alt="" loading="lazy" />`;
  }
  return `<div class="ex-demo-frames">${framesMarkup(demo)}</div>`;
}

function thumbMarkup(demo) {
  if (!demo) return '';
  if (isPlainImage(demo)) {
    return `<img class="ex-thumb-img" src="${asset(demo)}" alt="" loading="lazy" />`;
  }
  return `<div class="ex-thumb">${framesMarkup(demo)}</div>`;
}

function renderExercises() {
  const day = activeDay();
  focusEl.textContent = day.focus;
  exercisesEl.innerHTML = '';

  day.exercises.forEach((ex, i) => {
    const row = document.createElement('article');
    row.className = 'ex-row';
    row.dataset.idx = String(i);

    row.innerHTML = `
      <div class="ex-main">
        <button class="ex-box" type="button" aria-label="Mark ${ex.name} done" aria-pressed="false"></button>
        <div class="ex-text">
          <div class="ex-name">${ex.name}</div>
          <div class="ex-scheme">${ex.scheme}</div>
        </div>
        <button class="ex-demo-toggle" type="button" aria-label="Show ${ex.name} demo" aria-expanded="false">
          ${thumbMarkup(ex.demo)}
        </button>
      </div>
      <div class="ex-demo">
        ${demoMarkup(ex.demo)}
        <div class="ex-demo-caption">${ex.name}</div>
      </div>
    `;

    const toggle = () => toggleExercise(day.key, i);
    row.querySelector('.ex-box').addEventListener('click', toggle);
    row.querySelector('.ex-text').addEventListener('click', toggle);

    row.querySelector('.ex-demo-toggle').addEventListener('click', () => {
      const open = row.dataset.demoOpen === 'true';
      // Close any other open demo so only one animates at a time.
      exercisesEl.querySelectorAll('[data-demo-open="true"]').forEach(r => {
        r.dataset.demoOpen = 'false';
        r.querySelector('.ex-demo-toggle').setAttribute('aria-expanded', 'false');
      });
      row.dataset.demoOpen = open ? 'false' : 'true';
      row.querySelector('.ex-demo-toggle').setAttribute('aria-expanded', open ? 'false' : 'true');
    });

    exercisesEl.appendChild(row);
  });

  applyState();
}

function applyState() {
  const day = activeDay();
  const arr = currentState[day.key];
  exercisesEl.querySelectorAll('.ex-row').forEach((row, i) => {
    row.classList.toggle('checked', !!arr[i]);
    row.querySelector('.ex-box').setAttribute('aria-pressed', arr[i] ? 'true' : 'false');
  });
  updateTotals();
}

function updateTotals() {
  const day = activeDay();
  const arr = currentState[day.key];
  const done = arr.filter(v => v).length;
  const total = arr.length;
  doneSumEl.textContent = done;
  denominatorEl.textContent = total;
  remainingEl.textContent = done === total ? 'Done for today' : `${total - done} remaining`;
}

function toggleExercise(dayKey, idx) {
  currentState[dayKey][idx] = currentState[dayKey][idx] ? 0 : 1;
  saveDayState(currentDate, currentState);
  applyState();
}

/* -------- DATE / MIDNIGHT ROLLOVER -------- */
function renderDate() {
  const d = new Date();
  const opts = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
  dateEl.textContent = d.toLocaleDateString(undefined, opts);
}

function checkRollover() {
  const newDate = todayKey();
  if (newDate !== currentDate) {
    currentDate = newDate;
    currentState = loadDayState(currentDate);  // fresh, empty state
    renderDate();
    applyState();
  }
}

window.addEventListener('focus', checkRollover);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) checkRollover();
});
setInterval(checkRollover, 60 * 1000);

/* -------- THEME -------- */
function getSavedTheme() {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return VALID_THEMES.includes(v) ? v : DEFAULT_THEME;
  } catch (e) {
    return DEFAULT_THEME;
  }
}
function setTheme(name) {
  if (!VALID_THEMES.includes(name)) return;
  app.setAttribute('data-theme', name);
  try { localStorage.setItem(THEME_KEY, name); } catch (e) {}
  menu.querySelectorAll('[data-theme-pick]').forEach(b => {
    b.setAttribute('aria-pressed', b.dataset.themePick === name);
  });
}

menu.querySelectorAll('[data-theme-pick]').forEach(btn => {
  btn.addEventListener('click', () => {
    setTheme(btn.dataset.themePick);
    closeMenu();
  });
});

function openMenu() {
  menu.setAttribute('data-open', 'true');
  trigger.setAttribute('aria-expanded', 'true');
}
function closeMenu() {
  menu.setAttribute('data-open', 'false');
  trigger.setAttribute('aria-expanded', 'false');
}
trigger.addEventListener('click', (e) => {
  e.stopPropagation();
  if (menu.getAttribute('data-open') === 'true') closeMenu();
  else openMenu();
});
document.addEventListener('click', (e) => {
  if (!menu.contains(e.target) && e.target !== trigger && !trigger.contains(e.target)) {
    closeMenu();
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});

/* -------- LIGHT / DARK MODE -------- */
const mql = window.matchMedia('(prefers-color-scheme: dark)');

function getSavedMode() {
  try {
    const v = localStorage.getItem(MODE_KEY);
    if (v === 'light' || v === 'dark') return v;
  } catch (e) {}
  return null;
}

function setMode(mode) {
  app.setAttribute('data-mode', mode);
  modeTrigger.setAttribute('aria-pressed', mode === 'dark' ? 'true' : 'false');
}

setMode(getSavedMode() || (mql.matches ? 'dark' : 'light'));

mql.addEventListener('change', e => {
  if (getSavedMode()) return;
  setMode(e.matches ? 'dark' : 'light');
});

modeTrigger.addEventListener('click', () => {
  const next = app.getAttribute('data-mode') === 'dark' ? 'light' : 'dark';
  setMode(next);
  try { localStorage.setItem(MODE_KEY, next); } catch (e) {}
});

/* -------- INITIAL RENDER -------- */
renderDate();
renderTabs();
renderExercises();
setTheme(getSavedTheme());
