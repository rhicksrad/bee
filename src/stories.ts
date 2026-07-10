import { getSupabase, formatDate, type Post } from './supabase';
import { renderMarkdown, escapeHtml as esc } from './markdown';
import { excerpt } from './stories-shared';

const SITE_TITLE = "Stories from a Veterinarian's Life | The Vet From Persia";

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
  document.title = `${post.title} | The Vet From Persia`;
  history.replaceState(null, '', `?story=${encodeURIComponent(post.slug)}`);
}

function closePostModal() {
  const modal = document.querySelector<HTMLDivElement>('#post-modal');
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  document.body.style.overflow = '';
  document.title = SITE_TITLE;
  history.replaceState(null, '', location.pathname);
}

document.querySelector('#post-modal')?.addEventListener('click', (event) => {
  if ((event.target as HTMLElement).closest('[data-close]')) closePostModal();
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closePostModal();
});

async function loadPosts() {
  const supabase = getSupabase();
  const grid = document.querySelector<HTMLDivElement>('#blog-grid');
  if (!supabase || !grid) return; // static field notes stay as the fallback

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) return;

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

  // Deep link: stories.html?story=<slug> opens that story directly.
  const requested = new URLSearchParams(location.search).get('story');
  if (requested) {
    const match = posts.find((post) => post.slug === requested);
    if (match) openPostModal(match);
  }
}

void loadPosts();
