import { getSupabase, formatDate, type Post, type Question } from './supabase';
import { escapeHtml as esc } from './markdown';
import { excerpt } from './stories-shared';

const supabase = getSupabase();

// The Latest Stories section stays hidden until real published stories exist.
async function loadLatestStories() {
  const section = document.querySelector<HTMLElement>('#latest-stories-section');
  const grid = document.querySelector<HTMLDivElement>('#latest-stories');
  if (!supabase || !section || !grid) return;

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(3);

  if (error || !data || data.length === 0) return;

  grid.innerHTML = (data as Post[])
    .map(
      (post) => `
        <a class="blog-card blog-card-live" href="./story/${encodeURIComponent(post.slug)}.html">
          ${post.cover_image_url ? `<img class="blog-card-cover" src="${esc(post.cover_image_url)}" alt="" loading="lazy" />` : ''}
          <span>${esc(formatDate(post.created_at))}</span>
          <h3>${esc(post.title)}</h3>
          <p>${esc(excerpt(post.body))}</p>
          <span class="read-more">Read the full story →</span>
        </a>
      `
    )
    .join('');
  section.hidden = false;
}

// Show the most recently answered question as a teaser in the CTA band.
async function loadMailbagTeaser() {
  const teaser = document.querySelector<HTMLDivElement>('#mailbag-teaser');
  if (!supabase || !teaser) return;

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('status', 'answered')
    .order('answered_at', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return;

  const q = data[0] as Question;
  teaser.innerHTML = `
    <p class="mailbag-teaser-label">Recently answered</p>
    <article class="qa-item">
      <p class="qa-question"><strong>${esc(q.author_name || 'Anonymous')} asks:</strong> ${esc(q.question_text)}</p>
      <p class="qa-answer"><span class="qa-vet">The vet answers:</span> ${esc(q.answer_text ?? '')}</p>
    </article>
  `;
  teaser.hidden = false;
}

void loadLatestStories();
void loadMailbagTeaser();
