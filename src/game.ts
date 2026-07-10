import { gameSprite } from './photos';

const canvas = document.querySelector<HTMLCanvasElement>('#flappy');
const scoreEl = document.querySelector<HTMLElement>('#score');
const bestEl = document.querySelector<HTMLElement>('#best');

if (!canvas || !scoreEl || !bestEl) throw new Error('Game elements missing');

const ctx = canvas.getContext('2d');
if (!ctx) throw new Error('2D context unavailable');

const petSprite = new Image();
petSprite.src = gameSprite;

const gravity = 0.28;
const flapForce = -5.6;
const columnWidth = 62;
const gapHeight = 180;
const columnSpeed = 1.8;

let y = canvas.height / 2;
let velocity = 0;
let score = 0;
let best = Number(localStorage.getItem('persia-vet-best') || 0);
bestEl.textContent = String(best);
let alive = true;

const columns: { x: number; gapTop: number; counted: boolean }[] = [];

const reset = () => {
  y = canvas.height / 2;
  velocity = 0;
  score = 0;
  scoreEl.textContent = '0';
  alive = true;
  columns.length = 0;
};

const flap = () => {
  if (!alive) {
    reset();
    return;
  }
  velocity = flapForce;
};

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    flap();
  }
});
canvas.addEventListener('pointerdown', flap);

let spawnTicker = 0;

const drawBackground = () => {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#fff7ed');
  gradient.addColorStop(0.58, '#fde68a');
  gradient.addColorStop(1, '#0f766e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(127, 29, 29, 0.13)';
  for (let i = 0; i < canvas.width; i += 48) {
    ctx.beginPath();
    ctx.arc(i + 12, 52, 18, 0, Math.PI * 2);
    ctx.fill();
  }
};

const drawColumn = (x: number, topHeight: number) => {
  const lowerY = topHeight + gapHeight;
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(x, 0, columnWidth, topHeight);
  ctx.fillRect(x, lowerY, columnWidth, canvas.height - lowerY);

  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(x - 6, topHeight - 18, columnWidth + 12, 18);
  ctx.fillRect(x - 6, lowerY, columnWidth + 12, 18);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.fillRect(x + 12, 0, 8, topHeight);
  ctx.fillRect(x + 12, lowerY, 8, canvas.height - lowerY);
};

const loop = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  spawnTicker += 1;
  if (alive && spawnTicker > 110) {
    spawnTicker = 0;
    const minTop = 70;
    const maxTop = canvas.height - gapHeight - 70;
    const gapTop = Math.random() * (maxTop - minTop) + minTop;
    columns.push({ x: canvas.width, gapTop, counted: false });
  }

  for (let i = columns.length - 1; i >= 0; i -= 1) {
    const column = columns[i];
    column.x -= columnSpeed;
    drawColumn(column.x, column.gapTop);

    if (!column.counted && column.x + columnWidth < 80) {
      column.counted = true;
      score += 1;
      scoreEl.textContent = String(score);
      if (score > best) {
        best = score;
        localStorage.setItem('persia-vet-best', String(best));
        bestEl.textContent = String(best);
      }
    }

    if (column.x + columnWidth < 0) columns.splice(i, 1);

    const petLeft = 54;
    const petRight = petLeft + 44;
    const petTop = y - 22;
    const petBottom = y + 22;

    const withinX = petRight > column.x && petLeft < column.x + columnWidth;
    const hitTop = petTop < column.gapTop;
    const hitBottom = petBottom > column.gapTop + gapHeight;

    if (alive && withinX && (hitTop || hitBottom)) alive = false;
  }

  if (alive) {
    velocity += gravity;
    y += velocity;
  }

  if (y > canvas.height - 24 || y < 24) alive = false;

  if (petSprite.complete) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(78, y, 30, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(petSprite, 46, y - 30, 64, 64);
    ctx.restore();
  } else {
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.arc(78, y, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#7f1d1d';
  ctx.font = '700 18px Inter, sans-serif';
  ctx.fillText('✦', 74, y - 38);

  if (!alive) {
    ctx.fillStyle = 'rgba(67, 20, 7, 0.72)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '700 28px Inter, sans-serif';
    ctx.fillText('Clinic Closed!', 88, 220);
    ctx.font = '500 16px Inter, sans-serif';
    ctx.fillText('Press Space or tap to reopen', 72, 255);
  }

  requestAnimationFrame(loop);
};

petSprite.onload = () => requestAnimationFrame(loop);
if (petSprite.complete) requestAnimationFrame(loop);
