import { gameSprite } from './photos';
import { getSupabase } from './supabase';
import { escapeHtml as esc } from './markdown';

const canvas = document.querySelector<HTMLCanvasElement>('#flappy');
const scoreEl = document.querySelector<HTMLElement>('#score');
const bestEl = document.querySelector<HTMLElement>('#best');
const soundToggle = document.querySelector<HTMLButtonElement>('#sound-toggle');

if (!canvas || !scoreEl || !bestEl) throw new Error('Game elements missing');

const ctx = canvas.getContext('2d');
if (!ctx) throw new Error('2D context unavailable');

const W = canvas.width;
const H = canvas.height;
const GROUND_H = 42;
const CAT_X = 78;
const CAT_R = 21;

const petSprite = new Image();
petSprite.src = gameSprite;

// ---------- Audio ----------

let muted = localStorage.getItem('persia-vet-muted') === '1';
let audio: AudioContext | null = null;

function playTone(freq: number, dur = 0.09, type: OscillatorType = 'triangle', vol = 0.045, slide = 0) {
  if (muted) return;
  try {
    audio ??= new AudioContext();
    if (audio.state === 'suspended') void audio.resume();
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audio.currentTime);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), audio.currentTime + dur);
    gain.gain.setValueAtTime(vol, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + dur);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + dur);
  } catch {
    // audio unavailable — play on silently
  }
}

function updateSoundToggle() {
  if (!soundToggle) return;
  soundToggle.textContent = muted ? 'Sound: Off' : 'Sound: On';
  soundToggle.setAttribute('aria-pressed', String(!muted));
}
soundToggle?.addEventListener('click', () => {
  muted = !muted;
  localStorage.setItem('persia-vet-muted', muted ? '1' : '0');
  updateSoundToggle();
  if (!muted) playTone(660, 0.08);
});
updateSoundToggle();

// ---------- State ----------

type Column = { x: number; gapTop: number; counted: boolean };
type Particle = { x: number; y: number; vx: number; vy: number; life: number };
type Popup = { x: number; y: number; life: number };

let state: 'ready' | 'playing' | 'dead' = 'ready';
let y = H / 2;
let velocity = 0;
let score = 0;
let best = Number(localStorage.getItem('persia-vet-best') || 0);
let newBest = false;
let tick = 0;
let deathTick = 0;
let spawnTicker = 0;
let skylineScroll = 0;
let rugScroll = 0;

const columns: Column[] = [];
const particles: Particle[] = [];
const popups: Popup[] = [];

bestEl.textContent = String(best);

// Difficulty ramps from gentle to spicy over the first 30 points.
function difficulty() {
  const t = Math.min(score / 30, 1);
  return {
    speed: 1.9 + t * 1.0,
    gap: 185 - t * 38,
    spawnEvery: Math.round(112 - t * 26)
  };
}

function reset() {
  y = H / 2;
  velocity = 0;
  score = 0;
  newBest = false;
  spawnTicker = 0;
  deathTick = 0;
  offeredThisRun = false;
  columns.length = 0;
  particles.length = 0;
  popups.length = 0;
  scoreEl!.textContent = '0';
}

function die() {
  state = 'dead';
  deathTick = 0;
  playTone(150, 0.3, 'sawtooth', 0.06, -90);
}

function flap() {
  if (state === 'ready') {
    state = 'playing';
    velocity = -6.2;
    playTone(560, 0.09, 'triangle', 0.04, 170);
    return;
  }
  if (state === 'dead') {
    if (deathTick > 25) {
      reset();
      state = 'ready';
    }
    return;
  }
  velocity = -6.2;
  playTone(560, 0.09, 'triangle', 0.04, 170);
  for (let i = 0; i < 6; i += 1) {
    particles.push({
      x: CAT_X - 18,
      y: y + 10,
      vx: -1.2 - Math.random() * 1.4,
      vy: (Math.random() - 0.3) * 2,
      life: 20
    });
  }
}

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !isTypingTarget(e.target) && initialsModal?.hidden !== false) {
    e.preventDefault();
    flap();
  }
});
canvas.addEventListener('pointerdown', flap);

// ---------- Leaderboard ----------

const supabase = getSupabase();
const leaderboardList = document.querySelector<HTMLOListElement>('#leaderboard-list');
const initialsModal = document.querySelector<HTMLDivElement>('#initials-modal');
const initialsForm = document.querySelector<HTMLFormElement>('#initials-form');
const initialsInputs = [...document.querySelectorAll<HTMLInputElement>('.initials-inputs input')];
const initialsStatus = document.querySelector<HTMLElement>('#initials-status');

type ScoreRow = { id: string; initials: string; score: number; created_at: string };
let topScores: ScoreRow[] = [];
let pendingScore = 0;
let offeredThisRun = false;
let highlightId: string | null = null;

async function loadLeaderboard() {
  if (!leaderboardList) return;
  if (!supabase) {
    leaderboardList.innerHTML = '<li class="loading-note">The scoreboard opens once the site is connected.</li>';
    return;
  }

  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(10);

  if (error) {
    leaderboardList.innerHTML = '<li class="loading-note">The scoreboard is warming up — check back soon.</li>';
    return;
  }

  topScores = (data ?? []) as ScoreRow[];
  if (topScores.length === 0) {
    leaderboardList.innerHTML = '<li class="loading-note">No champions yet — set the very first score!</li>';
    return;
  }

  leaderboardList.innerHTML = topScores
    .map(
      (row, i) => `
        <li class="score-row${row.id === highlightId ? ' is-you' : ''}${i === 0 ? ' is-champion' : ''}">
          <span class="rank">${i + 1}</span>
          <span class="initials">${esc(row.initials)}</span>
          <span class="pts">${row.score}</span>
        </li>
      `
    )
    .join('');
}

function qualifiesForBoard(s: number): boolean {
  if (!supabase || s < 1) return false;
  if (topScores.length < 10) return true;
  return s > topScores[topScores.length - 1].score;
}

function openInitialsModal(s: number) {
  if (!initialsModal || !initialsStatus) return;
  pendingScore = Math.min(s, 999);
  const line = document.querySelector<HTMLElement>('#initials-score-line');
  if (line) line.textContent = `You scored ${pendingScore} — enter your initials for the Hall of Fame.`;
  initialsStatus.textContent = '';
  const saved = (localStorage.getItem('persia-vet-initials') || '').split('');
  initialsInputs.forEach((input, i) => (input.value = saved[i] ?? ''));
  initialsModal.hidden = false;
  initialsInputs[0]?.focus();
  initialsInputs[0]?.select();
}

function closeInitialsModal() {
  if (initialsModal) initialsModal.hidden = true;
}

initialsInputs.forEach((input, i) => {
  input.addEventListener('input', () => {
    input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 1);
    if (input.value && i < initialsInputs.length - 1) {
      initialsInputs[i + 1].focus();
      initialsInputs[i + 1].select();
    }
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !input.value && i > 0) {
      initialsInputs[i - 1].focus();
      initialsInputs[i - 1].select();
    }
  });
});

document.querySelector('#initials-skip')?.addEventListener('click', closeInitialsModal);

initialsForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!supabase || !initialsStatus) return;

  const initials = initialsInputs.map((input) => input.value).join('');
  if (!/^[A-Z0-9]{3}$/.test(initials)) {
    initialsStatus.textContent = 'Three letters or numbers, arcade style!';
    return;
  }

  initialsStatus.textContent = 'Carving your name into the wall…';
  const { data, error } = await supabase
    .from('scores')
    .insert({ initials, score: pendingScore })
    .select()
    .single();

  if (error) {
    initialsStatus.textContent = 'Could not save the score — try again in a moment.';
    return;
  }

  localStorage.setItem('persia-vet-initials', initials);
  highlightId = (data as ScoreRow).id;
  closeInitialsModal();
  playTone(880, 0.1, 'sine', 0.05);
  playTone(1175, 0.14, 'sine', 0.05);
  void loadLeaderboard();
});

void loadLeaderboard();

// ---------- Drawing ----------

function drawBackground() {
  const gradient = ctx!.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, '#fdf3df');
  gradient.addColorStop(0.55, '#fbe3ae');
  gradient.addColorStop(1, '#e8c88a');
  ctx!.fillStyle = gradient;
  ctx!.fillRect(0, 0, W, H);

  // soft sun
  const sun = ctx!.createRadialGradient(W - 70, 80, 8, W - 70, 80, 60);
  sun.addColorStop(0, 'rgba(255, 214, 130, 0.9)');
  sun.addColorStop(1, 'rgba(255, 214, 130, 0)');
  ctx!.fillStyle = sun;
  ctx!.fillRect(W - 140, 10, 140, 150);

  // drifting clouds
  ctx!.fillStyle = 'rgba(255, 251, 240, 0.75)';
  const cloudDrift = (tick * 0.2) % (W + 160);
  for (const [baseX, cy, s] of [
    [40, 70, 1],
    [220, 120, 0.7],
    [130, 40, 0.55]
  ] as const) {
    const cx = ((baseX - cloudDrift) % (W + 160)) + (baseX - cloudDrift < -80 ? W + 160 : 0);
    ctx!.beginPath();
    ctx!.ellipse(cx, cy, 34 * s, 12 * s, 0, 0, Math.PI * 2);
    ctx!.ellipse(cx + 22 * s, cy - 8 * s, 22 * s, 10 * s, 0, 0, Math.PI * 2);
    ctx!.ellipse(cx - 24 * s, cy - 5 * s, 18 * s, 9 * s, 0, 0, Math.PI * 2);
    ctx!.fill();
  }

  // distant dome skyline (parallax)
  const skyBase = H - GROUND_H;
  ctx!.fillStyle = 'rgba(19, 78, 74, 0.28)';
  const unit = 130;
  const offset = skylineScroll % unit;
  for (let x = -offset - unit; x < W + unit; x += unit) {
    ctx!.beginPath();
    ctx!.moveTo(x, skyBase);
    ctx!.lineTo(x, skyBase - 34);
    ctx!.arc(x + 32, skyBase - 34, 32, Math.PI, 0);
    ctx!.lineTo(x + 64, skyBase);
    ctx!.closePath();
    ctx!.fill();
    ctx!.fillRect(x + 78, skyBase - 58, 10, 58);
    ctx!.beginPath();
    ctx!.arc(x + 83, skyBase - 58, 7, Math.PI, 0);
    ctx!.fill();
    ctx!.fillRect(x + 100, skyBase - 26, 18, 26);
  }
}

function drawGround() {
  const top = H - GROUND_H;
  ctx!.fillStyle = '#7f1d1d';
  ctx!.fillRect(0, top, W, GROUND_H);
  ctx!.fillStyle = '#96262c';
  ctx!.fillRect(0, top + 4, W, GROUND_H - 8);

  // scrolling gold diamonds — a little Persian rug
  ctx!.fillStyle = '#d9a441';
  const step = 36;
  const offset = rugScroll % step;
  const mid = top + GROUND_H / 2;
  for (let x = -offset; x < W + step; x += step) {
    ctx!.beginPath();
    ctx!.moveTo(x, mid - 7);
    ctx!.lineTo(x + 7, mid);
    ctx!.lineTo(x, mid + 7);
    ctx!.lineTo(x - 7, mid);
    ctx!.closePath();
    ctx!.fill();
  }
  ctx!.fillStyle = '#fbbf24';
  ctx!.fillRect(0, top, W, 3);
  ctx!.fillRect(0, H - 3, W, 3);
}

function drawColumn(column: Column, gap: number) {
  const { x, gapTop } = column;
  const width = 62;
  const lowerY = gapTop + gap;
  const bodyGradient = ctx!.createLinearGradient(x, 0, x + width, 0);
  bodyGradient.addColorStop(0, '#8e2a2a');
  bodyGradient.addColorStop(0.45, '#a83a34');
  bodyGradient.addColorStop(1, '#711f22');

  ctx!.fillStyle = bodyGradient;
  ctx!.fillRect(x, 0, width, gapTop - 16);
  ctx!.fillRect(x, lowerY + 16, width, H - GROUND_H - lowerY - 16);

  // gold capitals framing the gap
  ctx!.fillStyle = '#d9a441';
  ctx!.fillRect(x - 6, gapTop - 16, width + 12, 16);
  ctx!.fillRect(x - 6, lowerY, width + 12, 16);
  ctx!.fillStyle = '#fbbf24';
  ctx!.fillRect(x - 6, gapTop - 16, width + 12, 4);
  ctx!.fillRect(x - 6, lowerY + 12, width + 12, 4);

  // column fluting
  ctx!.fillStyle = 'rgba(255, 240, 220, 0.14)';
  ctx!.fillRect(x + 10, 0, 7, gapTop - 16);
  ctx!.fillRect(x + 10, lowerY + 16, 7, H - GROUND_H - lowerY - 16);
  ctx!.fillStyle = 'rgba(30, 8, 3, 0.18)';
  ctx!.fillRect(x + width - 14, 0, 7, gapTop - 16);
  ctx!.fillRect(x + width - 14, lowerY + 16, 7, H - GROUND_H - lowerY - 16);
}

function drawCat(catY: number, angle: number) {
  ctx!.save();
  ctx!.translate(CAT_X, catY);
  ctx!.rotate(angle);
  ctx!.beginPath();
  ctx!.arc(0, 0, CAT_R + 5, 0, Math.PI * 2);
  ctx!.fillStyle = 'rgba(255, 251, 240, 0.85)';
  ctx!.fill();
  ctx!.beginPath();
  ctx!.arc(0, 0, CAT_R + 3, 0, Math.PI * 2);
  ctx!.closePath();
  ctx!.clip();
  if (petSprite.complete) {
    ctx!.drawImage(petSprite, -CAT_R - 5, -CAT_R - 3, (CAT_R + 4) * 2, (CAT_R + 4) * 2);
  } else {
    ctx!.fillStyle = '#7f1d1d';
    ctx!.fillRect(-CAT_R - 4, -CAT_R - 4, (CAT_R + 4) * 2, (CAT_R + 4) * 2);
  }
  ctx!.restore();
}

function drawParticles() {
  for (const p of particles) {
    const alpha = p.life / 20;
    ctx!.fillStyle = `rgba(217, 164, 65, ${alpha.toFixed(2)})`;
    ctx!.beginPath();
    ctx!.arc(p.x, p.y, 2.4 + alpha * 1.6, 0, Math.PI * 2);
    ctx!.fill();
  }
}

function drawPopups() {
  ctx!.font = '700 17px Georgia, serif';
  for (const pop of popups) {
    const alpha = pop.life / 24;
    ctx!.fillStyle = `rgba(127, 29, 29, ${alpha.toFixed(2)})`;
    ctx!.fillText('+1', pop.x, pop.y);
  }
}

function centeredText(text: string, yPos: number, font: string, color: string) {
  ctx!.font = font;
  ctx!.fillStyle = color;
  ctx!.textAlign = 'center';
  ctx!.fillText(text, W / 2, yPos);
  ctx!.textAlign = 'left';
}

function drawReadyScreen() {
  centeredText('Flying Clinic Cat', 190, '700 30px Georgia, serif', '#7f1d1d');
  centeredText('Tap, click, or press Space to fly', 224, '600 15px Georgia, serif', 'rgba(51, 36, 28, 0.75)');
  if (best > 0) centeredText(`Best so far: ${best}`, 252, '600 14px Georgia, serif', 'rgba(51, 36, 28, 0.6)');
}

function drawDeathCard() {
  ctx!.fillStyle = 'rgba(30, 8, 3, 0.45)';
  ctx!.fillRect(0, 0, W, H);

  const cardW = 250;
  const cardH = 168;
  const cx = (W - cardW) / 2;
  const cy = 170;
  ctx!.fillStyle = '#fffcf5';
  ctx!.strokeStyle = '#d9a441';
  ctx!.lineWidth = 3;
  ctx!.beginPath();
  ctx!.roundRect(cx, cy, cardW, cardH, 14);
  ctx!.fill();
  ctx!.stroke();

  centeredText('Clinic Closed!', cy + 40, '700 26px Georgia, serif', '#7f1d1d');
  centeredText(`Score  ${score}`, cy + 78, '600 18px Georgia, serif', '#33241c');
  centeredText(newBest ? '✦ New best! ✦' : `Best  ${best}`, cy + 106, '600 16px Georgia, serif', newBest ? '#b8862c' : 'rgba(51, 36, 28, 0.65)');
  if (deathTick > 25) {
    centeredText('Tap to try again', cy + 142, '600 14px Georgia, serif', 'rgba(51, 36, 28, 0.6)');
  }
}

// ---------- Main loop ----------

function update() {
  tick += 1;
  const { speed, gap, spawnEvery } = difficulty();

  if (state !== 'dead') {
    skylineScroll += speed * 0.25;
    rugScroll += speed;
  }

  if (state === 'playing') {
    velocity = Math.min(velocity + 0.32, 9);
    y += velocity;

    spawnTicker += 1;
    if (spawnTicker >= spawnEvery) {
      spawnTicker = 0;
      const minTop = 60;
      const maxTop = H - GROUND_H - gap - 60;
      const gapTop = Math.random() * (maxTop - minTop) + minTop;
      columns.push({ x: W, gapTop, counted: false });
    }

    for (let i = columns.length - 1; i >= 0; i -= 1) {
      const column = columns[i];
      column.x -= speed;

      if (!column.counted && column.x + 62 < CAT_X - CAT_R) {
        column.counted = true;
        score += 1;
        scoreEl!.textContent = String(score);
        popups.push({ x: CAT_X + 18, y: y - 26, life: 24 });
        playTone(880, 0.1, 'sine', 0.05);
        if (score > best) {
          best = score;
          newBest = true;
          localStorage.setItem('persia-vet-best', String(best));
          bestEl!.textContent = String(best);
        }
      }

      if (column.x + 62 < -12) columns.splice(i, 1);

      const withinX = CAT_X + CAT_R > column.x && CAT_X - CAT_R < column.x + 62;
      const hitTop = y - CAT_R < column.gapTop;
      const hitBottom = y + CAT_R > column.gapTop + gap;
      if (withinX && (hitTop || hitBottom)) die();
    }

    if (y + CAT_R > H - GROUND_H || y - CAT_R < 0) die();
  }

  if (state === 'dead') {
    deathTick += 1;
    if (deathTick === 35 && !offeredThisRun && qualifiesForBoard(score)) {
      offeredThisRun = true;
      openInitialsModal(score);
    }
    if (y + CAT_R < H - GROUND_H) {
      velocity = Math.min(velocity + 0.4, 10);
      y += velocity;
      if (y + CAT_R > H - GROUND_H) y = H - GROUND_H - CAT_R;
    }
  }

  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.05;
    p.life -= 1;
    if (p.life <= 0) particles.splice(i, 1);
  }

  for (let i = popups.length - 1; i >= 0; i -= 1) {
    popups[i].y -= 0.8;
    popups[i].life -= 1;
    if (popups[i].life <= 0) popups.splice(i, 1);
  }
}

function draw() {
  const { gap } = difficulty();
  ctx!.clearRect(0, 0, W, H);
  drawBackground();
  for (const column of columns) drawColumn(column, gap);
  drawGround();
  drawParticles();

  if (state === 'ready') {
    const bobY = H / 2 + Math.sin(tick * 0.08) * 8;
    drawCat(bobY, Math.sin(tick * 0.08) * 0.08);
    drawReadyScreen();
  } else {
    const angle = Math.max(-0.45, Math.min(1.15, velocity * 0.07));
    drawCat(y, angle);
  }

  drawPopups();
  if (state === 'dead') drawDeathCard();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
