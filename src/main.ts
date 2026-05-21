import './style.css';

import image0 from '../image0 (2).jpeg';
import image1 from '../image1.jpeg';
import image2 from '../image2.jpeg';
import image3 from '../image3.jpeg';
import image4 from '../image4.jpeg';
import image5 from '../image5.jpeg';

type RubyPhoto = {
  src: string;
  alt: string;
  caption: string;
};

const rubyPhotos: RubyPhoto[] = [
  { src: image0, alt: 'Ruby the Cat in a calm portrait pose', caption: 'Composed. Regal. Entirely in charge.' },
  { src: image1, alt: 'Ruby the Cat close up with bright eyes', caption: 'The executive gaze behind every household decision.' },
  { src: image2, alt: 'Ruby the Cat in a playful moment', caption: 'Playful energy with premium-level confidence.' },
  { src: image3, alt: 'Ruby the Cat relaxing comfortably', caption: 'Quiet luxury, but make it feline.' },
  { src: image4, alt: 'Ruby the Cat watching attentively', caption: 'Security lead and morale officer in one.' },
  { src: image5, alt: 'Ruby the Cat posing elegantly', caption: 'A polished finish to the Ruby collection.' }
];

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) throw new Error('App root not found');

app.innerHTML = `
  <main class="site-shell">
    <section class="hero">
      <p class="eyebrow">Ruby the Cat • Premium Fan Archive</p>
      <h1>Ruby the Cat</h1>
      <p class="lead">
        A sleek showcase for Ruby, also known as <strong>Noonie Bee</strong> and <strong>Queen Bee</strong>.
        Built with a clean editorial aesthetic, a full photo collection, and a mini arcade experience.
      </p>
    </section>

    <section class="gallery-panel" aria-label="Ruby photo gallery">
      <div class="section-head">
        <h2>Photo Collection</h2>
        <p>Every available Ruby image from the repository, presented in a unified gallery.</p>
      </div>
      <div class="gallery">
        ${rubyPhotos
          .map(
            (photo) => `
              <article class="card">
                <img src="${photo.src}" alt="${photo.alt}" loading="lazy" />
                <div class="card-body">
                  <p>${photo.caption}</p>
                </div>
              </article>
            `
          )
          .join('')}
      </div>
    </section>

    <section class="game-wrap" aria-label="Flappy Ruby mini game">
      <div class="section-head game-head">
        <h2>Flappy Ruby</h2>
        <p>Press <kbd>Space</kbd> or click/tap the canvas to flap and avoid the treat towers.</p>
      </div>
      <canvas id="flappy" width="360" height="540" aria-label="Flappy Ruby game canvas"></canvas>
      <div class="hud">
        <span>Score: <strong id="score">0</strong></span>
        <span>Best: <strong id="best">0</strong></span>
      </div>
    </section>
  </main>
`;

const canvas = document.querySelector<HTMLCanvasElement>('#flappy');
const scoreEl = document.querySelector<HTMLElement>('#score');
const bestEl = document.querySelector<HTMLElement>('#best');

if (!canvas || !scoreEl || !bestEl) throw new Error('Game elements missing');

const ctx = canvas.getContext('2d');
if (!ctx) throw new Error('2D context unavailable');

const rubySprite = new Image();
rubySprite.src = image1;

const gravity = 0.28;
const flapForce = -5.6;
const pipeWidth = 62;
const gapHeight = 180;
const pipeSpeed = 1.8;

let y = canvas.height / 2;
let velocity = 0;
let score = 0;
let best = Number(localStorage.getItem('ruby-best') || 0);
bestEl.textContent = String(best);
let alive = true;

const pipes: { x: number; gapTop: number; counted: boolean }[] = [];

const reset = () => {
  y = canvas.height / 2;
  velocity = 0;
  score = 0;
  scoreEl.textContent = '0';
  alive = true;
  pipes.length = 0;
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

const loop = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  spawnTicker += 1;
  if (alive && spawnTicker > 110) {
    spawnTicker = 0;
    const minTop = 70;
    const maxTop = canvas.height - gapHeight - 70;
    const gapTop = Math.random() * (maxTop - minTop) + minTop;
    pipes.push({ x: canvas.width, gapTop, counted: false });
  }

  for (let i = pipes.length - 1; i >= 0; i -= 1) {
    const pipe = pipes[i];
    pipe.x -= pipeSpeed;

    ctx.fillStyle = '#111827';
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.gapTop);
    ctx.fillRect(pipe.x, pipe.gapTop + gapHeight, pipeWidth, canvas.height - (pipe.gapTop + gapHeight));

    if (!pipe.counted && pipe.x + pipeWidth < 80) {
      pipe.counted = true;
      score += 1;
      scoreEl.textContent = String(score);
      if (score > best) {
        best = score;
        localStorage.setItem('ruby-best', String(best));
        bestEl.textContent = String(best);
      }
    }

    if (pipe.x + pipeWidth < 0) pipes.splice(i, 1);

    const rubyLeft = 54;
    const rubyRight = rubyLeft + 44;
    const rubyTop = y - 22;
    const rubyBottom = y + 22;

    const withinX = rubyRight > pipe.x && rubyLeft < pipe.x + pipeWidth;
    const hitTop = rubyTop < pipe.gapTop;
    const hitBottom = rubyBottom > pipe.gapTop + gapHeight;

    if (alive && withinX && (hitTop || hitBottom)) alive = false;
  }

  if (alive) {
    velocity += gravity;
    y += velocity;
  }

  if (y > canvas.height - 24 || y < 24) alive = false;

  if (rubySprite.complete) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(78, y, 30, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(rubySprite, 46, y - 30, 64, 64);
    ctx.restore();
  } else {
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(78, y, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  if (!alive) {
    ctx.fillStyle = 'rgba(17, 24, 39, 0.68)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '700 28px Inter, sans-serif';
    ctx.fillText('Boop! Game Over', 88, 220);
    ctx.font = '500 16px Inter, sans-serif';
    ctx.fillText('Press Space or tap to restart', 87, 255);
  }

  requestAnimationFrame(loop);
};

rubySprite.onload = () => requestAnimationFrame(loop);
if (rubySprite.complete) requestAnimationFrame(loop);
