import './style.css';

import image0 from '../image0 (2).jpeg';
import image1 from '../image1.jpeg';
import image2 from '../image2.jpeg';
import image3 from '../image3.jpeg';
import image4 from '../image4.jpeg';
import image5 from '../image5.jpeg';
import image6 from '../image6.jpeg';
import image7 from '../image7.jpeg';
import image8 from '../image8.jpeg';
import image9 from '../image9.jpeg';
import image10 from '../image10.jpeg';

type PetPhoto = {
  src: string;
  alt: string;
  caption: string;
  label: string;
  feature: string;
};

const petPhotos: PetPhoto[] = [
  {
    src: image0,
    alt: 'A peaceful companion pet resting in warm light',
    caption: 'A soft check-in moment for a beloved household companion.',
    label: 'Calm Visit',
    feature: 'Gentle bedside energy'
  },
  {
    src: image1,
    alt: 'A bright-eyed pet looking toward the camera',
    caption: 'Curious eyes, big feelings, and a tiny imaginary chart note.',
    label: 'Curious Case',
    feature: 'Bright-eyed intake notes'
  },
  {
    src: image2,
    alt: 'A playful pet enjoying a lively moment',
    caption: 'Play is enrichment, exercise, comedy, and chaos in one package.',
    label: 'Play Plan',
    feature: 'Movement and mischief'
  },
  {
    src: image3,
    alt: 'A relaxed pet lounging comfortably',
    caption: 'Rest, routine, and a cozy place to supervise the humans.',
    label: 'Recovery Suite',
    feature: 'Quiet comfort rituals'
  },
  {
    src: image4,
    alt: 'An attentive pet watching from a favorite spot',
    caption: 'Alert, observant, and probably already aware of the treat drawer.',
    label: 'Watchful Friend',
    feature: 'Treat-drawer surveillance'
  },
  {
    src: image5,
    alt: 'An elegant pet posing with confidence',
    caption: 'A polished portrait from the imaginary wellness wall of fame.',
    label: 'Portrait Round',
    feature: 'Wall-of-fame polish'
  },
  {
    src: image6,
    alt: 'A beloved pet captured for the rotating parlor gallery',
    caption: 'Another little personality joins the orbit with storybook sparkle.',
    label: 'New Arrival',
    feature: 'Fresh patient spotlight'
  },
  {
    src: image7,
    alt: 'A companion animal featured in a warm veterinary-inspired slideshow',
    caption: 'A bright carousel stop for soft paws, whiskers, and dramatic charm.',
    label: 'Carousel Star',
    feature: '3D gallery motion'
  },
  {
    src: image8,
    alt: 'A pet portrait added to the Persian parlor collection',
    caption: 'Jewel tones, cozy light, and a little clinic-card glamour.',
    label: 'Jewel Tone',
    feature: 'Persian parlor styling'
  },
  {
    src: image9,
    alt: 'A household companion shown as part of the featured slideshow',
    caption: 'A sweet reminder that every pet has a signature mood and mythos.',
    label: 'Signature Mood',
    feature: 'Animated feature card'
  },
  {
    src: image10,
    alt: 'A final pet portrait rounding out the rotating 3D gallery',
    caption: 'The orbit closes with one more portrait from the imaginary rounds.',
    label: 'Orbit Finale',
    feature: 'Expanded image set'
  }
];

const blogPosts = [
  {
    title: 'Why I Love the Little Rituals',
    date: 'Field Note 01',
    copy:
      'The best pet stories usually begin with tiny routines: the breakfast dance, the inspection of every grocery bag, and the dramatic sigh before a nap.'
  },
  {
    title: 'A Persian-Inspired Waiting Room Playlist',
    date: 'Field Note 02',
    copy:
      'Imagine santur shimmer, warm tea, pomegranate color, and a parade of pets who all believe they have urgent business behind the reception desk.'
  },
  {
    title: 'For the Humans Who Worry',
    date: 'Field Note 03',
    copy:
      'This playful corner is for delight, not diagnosis. When something feels off with a real pet, the kindest move is calling a licensed veterinarian.'
  }
];

const faqPrompts = [
  'What is the funniest habit your pet has developed?',
  'If your pet could ask one dramatic question, what would it be?',
  'Which snack, toy, or sunny window deserves a five-star review?'
];

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) throw new Error('App root not found');

app.innerHTML = `
  <main class="site-shell">
    <nav class="top-nav" aria-label="Primary navigation">
      <a class="brand" href="#home" aria-label="A Vet From Persia home">
        <span class="brand-mark" aria-hidden="true">✦</span>
        <span>A Vet From Persia</span>
      </a>
      <div class="nav-links">
        <a href="#gallery">Pets</a>
        <a href="#game">Mini Game</a>
        <a href="#blog">Blog</a>
        <a href="#ask">Ask the Vet</a>
        <a href="#about">About</a>
      </div>
    </nav>

    <section id="home" class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Persian-inspired pet parlor • purely playful</p>
        <h1>A Vet From Persia</h1>
        <p class="lead">
          Welcome to a jewel-toned pet gallery and mini clinic of imagination: warm patterns, tiny paws,
          a still-silly flappy game, notes from the vet herself, and a friendly place to ask pretend questions.
        </p>
        <div class="hero-actions">
          <a class="button primary" href="#ask">Ask a playful question</a>
          <a class="button secondary" href="#about">Read the just-for-fun disclaimer</a>
        </div>
      </div>
      <div class="hero-card" aria-label="Decorative clinic card">
        <span class="tile-icon" aria-hidden="true">🐾</span>
        <p>Tonight's imaginary rounds</p>
        <strong>Kindness, comedy, and pet portraits.</strong>
      </div>
    </section>

    <section id="gallery" class="gallery-panel" aria-label="Pet photo gallery">
      <div class="section-head gallery-intro">
        <p class="kicker">Patient portraits</p>
        <h2>3D orbit of the little Persian parlor</h2>
        <p>Images 6–10 now join the original root-gallery portraits in a rotating carousel with layered cards, featured traits, and jewel-box clinic styling.</p>
      </div>
      <div class="gallery-showcase">
        <div class="carousel-stage" aria-label="Rotating 3D pet slideshow">
          <div class="carousel-ring">
            ${petPhotos
              .map(
                (photo, index) => `
                  <article class="slide-card" style="--slide-index: ${index}; --slide-count: ${petPhotos.length};">
                    <img src="${photo.src}" alt="${photo.alt}" loading="${index < 3 ? 'eager' : 'lazy'}" />
                    <div class="slide-glass">
                      <span>${photo.label}</span>
                      <strong>${photo.feature}</strong>
                    </div>
                  </article>
                `
              )
              .join('')}
          </div>
        </div>
        <aside class="gallery-features" aria-label="Gallery features">
          <span class="feature-pill">11 root images</span>
          <span class="feature-pill">Images 6–10 integrated</span>
          <span class="feature-pill">3D rotating slideshow</span>
          <span class="feature-pill">Hover to pause</span>
          <div class="feature-note">
            <h3>Featured orbit notes</h3>
            <p>The carousel keeps every patient portrait in motion while the cards preserve labels, mood captions, and cozy Persian-inspired flourishes.</p>
          </div>
        </aside>
      </div>
      <div class="gallery-captions">
        ${petPhotos
          .map(
            (photo) => `
              <article class="caption-card">
                <span>${photo.label}</span>
                <p>${photo.caption}</p>
              </article>
            `
          )
          .join('')}
      </div>
    </section>

    <section id="game" class="game-wrap" aria-label="Persian pet mini game">
      <div class="section-head game-head">
        <p class="kicker">Arcade corner</p>
        <h2>Flying Clinic Cat</h2>
        <p>Press <kbd>Space</kbd> or click/tap the canvas to glide between the golden clinic columns.</p>
      </div>
      <canvas id="flappy" width="360" height="540" aria-label="Flying Clinic Cat game canvas"></canvas>
      <div class="hud">
        <span>Score: <strong id="score">0</strong></span>
        <span>Best: <strong id="best">0</strong></span>
      </div>
    </section>

    <section id="blog" class="blog-panel" aria-label="Vet blog">
      <div class="section-head">
        <p class="kicker">From the vet herself</p>
        <h2>The tea-room blog spot</h2>
        <p>Short fictional notes from the desk of A Vet From Persia.</p>
      </div>
      <div class="blog-grid">
        ${blogPosts
          .map(
            (post) => `
              <article class="blog-card">
                <span>${post.date}</span>
                <h3>${post.title}</h3>
                <p>${post.copy}</p>
              </article>
            `
          )
          .join('')}
      </div>
    </section>

    <section id="ask" class="ask-panel" aria-label="Ask the vet questions">
      <div class="ask-copy">
        <p class="kicker">Ask the vet</p>
        <h2>Send a pretend question for a pretend column</h2>
        <p>
          Drop a lighthearted prompt for the vet character. Keep real symptoms, urgent care, dosing, diet changes,
          injuries, and behavior concerns for your licensed veterinary professional.
        </p>
        <ul>
          ${faqPrompts.map((prompt) => `<li>${prompt}</li>`).join('')}
        </ul>
      </div>
      <form class="question-card">
        <label>
          Your name or pet's name
          <input type="text" name="name" placeholder="Mochi, Queen Bee, or Human Friend" />
        </label>
        <label>
          Playful question
          <textarea name="question" rows="5" placeholder="Dear Vet From Persia, why does my cat judge my emails?"></textarea>
        </label>
        <button type="button">Save for the imaginary mailbag</button>
      </form>
    </section>

    <section id="about" class="about-panel" aria-label="About and legal disclaimers">
      <div class="section-head">
        <p class="kicker">About this site</p>
        <h2>Legal-ish statements, with extra caution</h2>
        <p>
          A Vet From Persia is a fictional, entertainment-only pet site. The name, blog, question box,
          gallery captions, and game are all for fun and are not a substitute for professional care.
        </p>
      </div>
      <div class="legal-grid">
        <article>
          <h3>No veterinary-client relationship</h3>
          <p>Using this site, reading posts, or submitting a question does not create a veterinarian-client-patient relationship.</p>
        </article>
        <article>
          <h3>Not medical advice</h3>
          <p>Nothing here should be used to diagnose, treat, prevent, or manage any animal health condition.</p>
        </article>
        <article>
          <h3>Emergencies need real help</h3>
          <p>If a pet may be sick, injured, poisoned, in pain, or acting unusually, contact a licensed veterinarian or emergency clinic immediately.</p>
        </article>
        <article>
          <h3>Content may be fictional</h3>
          <p>Blog entries, questions, captions, names, and scenarios may be invented, exaggerated, decorative, or silly.</p>
        </article>
        <article>
          <h3>No dosing or treatment reliance</h3>
          <p>Do not use this website to decide medications, supplements, dosages, procedures, diets, or home remedies for any animal.</p>
        </article>
        <article>
          <h3>Just a joyful pet corner</h3>
          <p>The intended use is simple: enjoy the pictures, play the mini game, smile at the theme, and then call a real vet when it matters.</p>
        </article>
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

const petSprite = new Image();
petSprite.src = image1;

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
