import './style.css';

import { getSupabase, formatDate, type Post, type Question, type Photo } from './supabase';
import { renderMarkdown, escapeHtml as esc } from './markdown';

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

type GalleryPhoto = {
  src: string;
  alt: string;
  caption: string;
  label: string;
};

const builtInPhotos: GalleryPhoto[] = [
  {
    src: image0,
    alt: 'A peaceful companion pet resting in warm light',
    caption: 'A soft check-in moment for a beloved household companion.',
    label: 'Calm Visit'
  },
  {
    src: image1,
    alt: 'A bright-eyed pet looking toward the camera',
    caption: 'Curious eyes, big feelings, and a tiny imaginary chart note.',
    label: 'Curious Case'
  },
  {
    src: image2,
    alt: 'A playful pet enjoying a lively moment',
    caption: 'Play is enrichment, exercise, comedy, and chaos in one package.',
    label: 'Play Plan'
  },
  {
    src: image3,
    alt: 'A relaxed pet lounging comfortably',
    caption: 'Rest, routine, and a cozy place to supervise the humans.',
    label: 'Recovery Suite'
  },
  {
    src: image4,
    alt: 'An attentive pet watching from a favorite spot',
    caption: 'Alert, observant, and probably already aware of the treat drawer.',
    label: 'Watchful Friend'
  },
  {
    src: image5,
    alt: 'An elegant pet posing with confidence',
    caption: 'A polished portrait from the wellness wall of fame.',
    label: 'Portrait Round'
  },
  {
    src: image6,
    alt: 'A beloved pet captured for the rotating parlor gallery',
    caption: 'Another little personality joins the orbit with storybook sparkle.',
    label: 'New Arrival'
  },
  {
    src: image7,
    alt: 'A companion animal featured in a warm veterinary-inspired slideshow',
    caption: 'A bright carousel stop for soft paws, whiskers, and dramatic charm.',
    label: 'Carousel Star'
  },
  {
    src: image8,
    alt: 'A pet portrait added to the Persian parlor collection',
    caption: 'Jewel tones, cozy light, and a little clinic-card glamour.',
    label: 'Jewel Tone'
  },
  {
    src: image9,
    alt: 'A household companion shown as part of the featured slideshow',
    caption: 'A sweet reminder that every pet has a signature mood and mythos.',
    label: 'Signature Mood'
  },
  {
    src: image10,
    alt: 'A pet portrait rounding out the rotating 3D gallery',
    caption: 'One more portrait from the vet’s rounds.',
    label: 'Orbit Finale'
  }
];

const supabase = getSupabase();

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('App root not found');

app.innerHTML = `
  <main class="site-shell">
    <nav class="top-nav" aria-label="Primary navigation">
      <a class="brand" href="#home" aria-label="The Vet From Persia home">
        <span class="brand-mark" aria-hidden="true">✦</span>
        <span>The Vet From Persia</span>
      </a>
      <div class="nav-links">
        <a href="#gallery">Pets</a>
        <a href="#blog">Stories</a>
        <a href="#ask">Ask the Vet</a>
        <a href="#game">Mini Game</a>
        <a href="#about">About</a>
      </div>
    </nav>

    <section id="home" class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Stories, pets, and questions answered</p>
        <h1>The Vet From Persia</h1>
        <p class="lead">
          Welcome to the vet's own corner of the internet: real stories from her life, a jewel-toned
          gallery of pets, answers to your questions, and one very silly flying-cat game.
        </p>
        <div class="hero-actions">
          <a class="button primary" href="#ask">Ask the vet a question</a>
          <a class="button secondary" href="#blog">Read her stories</a>
        </div>
      </div>
      <div class="hero-card" aria-label="Decorative clinic card">
        <span class="tile-icon" aria-hidden="true">🐾</span>
        <p>Fresh from the vet's desk</p>
        <strong>Stories, answers, and pet portraits.</strong>
      </div>
    </section>

    <section id="gallery" class="gallery-panel" aria-label="Pet photo gallery">
      <div class="section-head gallery-intro">
        <p class="kicker">Patient portraits</p>
        <h2>3D orbit of the little Persian parlor</h2>
        <p>Pets from the vet's world, spinning in a rotating jewel-box carousel. Hover to pause.</p>
      </div>
      <div class="gallery-showcase">
        <div class="carousel-stage" aria-label="Rotating 3D pet slideshow">
          <div class="carousel-ring" id="carousel-ring"></div>
        </div>
        <aside class="gallery-features" aria-label="Gallery features">
          <span class="feature-pill" id="photo-count-pill">11 portraits</span>
          <span class="feature-pill">3D rotating slideshow</span>
          <span class="feature-pill">Hover to pause</span>
          <div class="feature-note">
            <h3>Featured orbit notes</h3>
            <p>New photos the vet uploads join the orbit automatically, labels, captions, and all.</p>
          </div>
        </aside>
      </div>
      <div class="gallery-captions" id="gallery-captions"></div>
    </section>

    <section id="blog" class="blog-panel" aria-label="Stories from the vet">
      <div class="section-head">
        <p class="kicker">From the vet herself</p>
        <h2>Stories from her life</h2>
        <p>Real notes, memories, and tales from The Vet From Persia.</p>
      </div>
      <div class="blog-grid" id="blog-grid">
        <p class="loading-note">Fetching stories…</p>
      </div>
    </section>

    <section id="ask" class="ask-panel" aria-label="Ask the vet questions">
      <div class="ask-copy">
        <p class="kicker">Ask the vet</p>
        <h2>Send a question to the mailbag</h2>
        <p>
          Curious about her life, her pets, Persia, or anything fun? Drop a question below and it may get
          a personal answer in the column. Keep real symptoms, urgent care, dosing, diet changes, injuries,
          and behavior concerns for your own licensed veterinary professional.
        </p>
        <div class="qa-list" id="qa-list">
          <p class="loading-note">Opening the mailbag…</p>
        </div>
      </div>
      <form class="question-card" id="question-form">
        <label>
          Your name or pet's name
          <input type="text" name="name" maxlength="80" placeholder="Mochi, Queen Bee, or Human Friend" />
        </label>
        <label>
          Your question
          <textarea name="question" rows="5" maxlength="2000" required
            placeholder="Dear Vet From Persia, why does my cat judge my emails?"></textarea>
        </label>
        <button type="submit" class="button primary">Send to the mailbag</button>
        <p class="form-status" id="question-status" role="status"></p>
      </form>
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

    <section id="about" class="about-panel" aria-label="About and legal disclaimers">
      <div class="section-head">
        <p class="kicker">About this site</p>
        <h2>The friendly fine print</h2>
        <p>
          The Vet From Persia is a personal blog and Q&amp;A corner. It is a place for stories and fun —
          not a substitute for professional veterinary care.
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
      </div>
      <footer class="site-footer">
        <span>✦ The Vet From Persia</span>
        <a href="admin.html" class="admin-link">Vet's door</a>
      </footer>
    </section>
  </main>

  <div class="post-modal" id="post-modal" hidden>
    <div class="post-modal-backdrop" data-close></div>
    <article class="post-modal-card">
      <button type="button" class="post-modal-close" data-close aria-label="Close story">✕</button>
      <div id="post-modal-content"></div>
    </article>
  </div>
`;

// ---------- Gallery ----------

function renderCarousel(photos: GalleryPhoto[]) {
  const ring = document.querySelector<HTMLDivElement>('#carousel-ring');
  const captions = document.querySelector<HTMLDivElement>('#gallery-captions');
  const pill = document.querySelector<HTMLElement>('#photo-count-pill');
  if (!ring || !captions) return;

  ring.innerHTML = photos
    .map(
      (photo, index) => `
        <article class="slide-card" style="--slide-index: ${index}; --slide-count: ${photos.length};">
          <img src="${esc(photo.src)}" alt="${esc(photo.alt)}" loading="${index < 3 ? 'eager' : 'lazy'}" />
          <div class="slide-glass">
            <span>${esc(photo.label)}</span>
          </div>
        </article>
      `
    )
    .join('');

  captions.innerHTML = photos
    .filter((photo) => photo.caption)
    .map(
      (photo) => `
        <article class="caption-card">
          <span>${esc(photo.label)}</span>
          <p>${esc(photo.caption)}</p>
        </article>
      `
    )
    .join('');

  if (pill) pill.textContent = `${photos.length} portraits`;
}

renderCarousel(builtInPhotos);

async function loadPhotos() {
  if (!supabase) return;
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error || !data || data.length === 0) return;

  const uploaded: GalleryPhoto[] = (data as Photo[]).map((photo) => ({
    src: photo.image_url,
    alt: photo.caption || photo.label || 'A pet photo from The Vet From Persia',
    caption: photo.caption,
    label: photo.label || 'New Portrait'
  }));
  renderCarousel([...builtInPhotos, ...uploaded]);
}

// ---------- Blog ----------

const fallbackPosts = [
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
      'This corner is for delight, not diagnosis. When something feels off with a real pet, the kindest move is calling a licensed veterinarian.'
  }
];

function excerpt(body: string, length = 170): string {
  const plain = body
    .replace(/[#*`]/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > length ? `${plain.slice(0, length).trimEnd()}…` : plain;
}

function renderFallbackPosts(grid: HTMLElement) {
  grid.innerHTML = fallbackPosts
    .map(
      (post) => `
        <article class="blog-card">
          <span>${esc(post.date)}</span>
          <h3>${esc(post.title)}</h3>
          <p>${esc(post.copy)}</p>
        </article>
      `
    )
    .join('');
}

function openPostModal(post: Post) {
  const modal = document.querySelector<HTMLDivElement>('#post-modal');
  const content = document.querySelector<HTMLDivElement>('#post-modal-content');
  if (!modal || !content) return;

  content.innerHTML = `
    ${post.cover_image_url ? `<img class="post-cover" src="${esc(post.cover_image_url)}" alt="" />` : ''}
    <p class="kicker">${esc(formatDate(post.created_at))}</p>
    <h2>${esc(post.title)}</h2>
    <div class="post-body">${renderMarkdown(post.body)}</div>
  `;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closePostModal() {
  const modal = document.querySelector<HTMLDivElement>('#post-modal');
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = '';
}

document.querySelector('#post-modal')?.addEventListener('click', (event) => {
  if ((event.target as HTMLElement).closest('[data-close]')) closePostModal();
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closePostModal();
});

async function loadPosts() {
  const grid = document.querySelector<HTMLDivElement>('#blog-grid');
  if (!grid) return;

  if (!supabase) {
    renderFallbackPosts(grid);
    return;
  }

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    renderFallbackPosts(grid);
    return;
  }

  const posts = data as Post[];
  grid.innerHTML = posts
    .map(
      (post, index) => `
        <article class="blog-card blog-card-live" data-post-index="${index}" tabindex="0" role="button"
          aria-label="Read story: ${esc(post.title)}">
          ${post.cover_image_url ? `<img class="blog-card-cover" src="${esc(post.cover_image_url)}" alt="" loading="lazy" />` : ''}
          <span>${esc(formatDate(post.created_at))}</span>
          <h3>${esc(post.title)}</h3>
          <p>${esc(excerpt(post.body))}</p>
          <span class="read-more">Read the full story →</span>
        </article>
      `
    )
    .join('');

  grid.querySelectorAll<HTMLElement>('[data-post-index]').forEach((card) => {
    const open = () => openPostModal(posts[Number(card.dataset.postIndex)]);
    card.addEventListener('click', open);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
    });
  });
}

// ---------- Q&A ----------

async function loadAnsweredQuestions() {
  const list = document.querySelector<HTMLDivElement>('#qa-list');
  if (!list) return;

  if (!supabase) {
    list.innerHTML = '<p class="loading-note">The mailbag opens once the site is connected to its database.</p>';
    return;
  }

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('status', 'answered')
    .order('answered_at', { ascending: false })
    .limit(20);

  if (error) {
    list.innerHTML = '<p class="loading-note">The mailbag is stuck — try again later.</p>';
    return;
  }

  const questions = (data ?? []) as Question[];
  if (questions.length === 0) {
    list.innerHTML = '<p class="loading-note">No answered questions yet — yours could be the first!</p>';
    return;
  }

  list.innerHTML = questions
    .map(
      (q) => `
        <article class="qa-item">
          <p class="qa-question"><strong>${esc(q.author_name || 'Anonymous')} asks:</strong> ${esc(q.question_text)}</p>
          <p class="qa-answer"><span class="qa-vet">The vet answers:</span> ${esc(q.answer_text ?? '')}</p>
        </article>
      `
    )
    .join('');
}

function wireQuestionForm() {
  const form = document.querySelector<HTMLFormElement>('#question-form');
  const status = document.querySelector<HTMLElement>('#question-status');
  if (!form || !status) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!supabase) {
      status.textContent = 'The mailbag is not connected yet — check back soon!';
      return;
    }

    const formData = new FormData(form);
    const name = String(formData.get('name') ?? '').trim();
    const question = String(formData.get('question') ?? '').trim();
    if (!question) {
      status.textContent = 'Write a question first!';
      return;
    }

    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (button) button.disabled = true;
    status.textContent = 'Sending…';

    const { error } = await supabase.from('questions').insert({
      author_name: name || 'Anonymous',
      question_text: question
    });

    if (button) button.disabled = false;
    if (error) {
      status.textContent = 'Something went wrong — please try again in a moment.';
      return;
    }

    form.reset();
    status.textContent = 'Sent! The vet will read it soon. Answered questions appear in the mailbag.';
  });
}

void loadPhotos();
void loadPosts();
void loadAnsweredQuestions();
wireQuestionForm();

// ---------- Flying Clinic Cat mini game ----------

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
