// Build-time generator: fetches published stories from Supabase and
// writes a static story/<slug>.html page for each, plus public/sitemap.xml.
// Runs automatically as part of `npm run build`. With no database
// connection it still succeeds and emits the base sitemap.

import { mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const SITE_BASE = 'https://rhicksrad.github.io/bee/';
const STATIC_PAGES = ['', 'stories.html', 'ask.html', 'gallery.html', 'game.html', 'about.html'];

// ---------- env (.env.local for local builds, process.env in CI) ----------

async function loadEnv() {
  const env = { url: process.env.VITE_SUPABASE_URL, key: process.env.VITE_SUPABASE_ANON_KEY };
  if ((!env.url || !env.key) && existsSync('.env.local')) {
    const text = await readFile('.env.local', 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^\s*(VITE_SUPABASE_URL|VITE_SUPABASE_ANON_KEY)\s*=\s*(.+)\s*$/);
      if (!match) continue;
      if (match[1] === 'VITE_SUPABASE_URL' && !env.url) env.url = match[2];
      if (match[1] === 'VITE_SUPABASE_ANON_KEY' && !env.key) env.key = match[2];
    }
  }
  return env;
}

// ---------- markdown (keep in sync with src/markdown.ts) ----------

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInline(escaped) {
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

function renderMarkdown(source) {
  return escapeHtml(source.replace(/\r\n/g, '\n'))
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      const heading = trimmed.match(/^(#{1,3})\s+(.*)$/);
      if (heading) {
        const level = heading[1].length + 2;
        return `<h${level}>${renderInline(heading[2])}</h${level}>`;
      }
      const lines = trimmed.split('\n');
      if (lines.every((line) => /^[-*]\s+/.test(line.trim()))) {
        const items = lines.map((line) => `<li>${renderInline(line.trim().replace(/^[-*]\s+/, ''))}</li>`).join('');
        return `<ul>${items}</ul>`;
      }
      return `<p>${renderInline(lines.join('<br />'))}</p>`;
    })
    .filter(Boolean)
    .join('');
}

function excerpt(body, length = 160) {
  const plain = body
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#*`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > length ? `${plain.slice(0, length).trimEnd()}…` : plain;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ---------- page template ----------

function storyPage(post) {
  const title = `${post.title} | The Vet From Persia`;
  const description = excerpt(post.body) || `A story from The Vet From Persia.`;
  const url = `${SITE_BASE}story/${post.slug}.html`;
  const image = post.cover_image_url || `${SITE_BASE}social-card.jpg`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description,
    image,
    url,
    datePublished: post.created_at,
    dateModified: post.updated_at,
    author: { '@type': 'Person', name: 'The Vet From Persia' },
    publisher: { '@type': 'Person', name: 'The Vet From Persia' },
    mainEntityOfPage: url
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="The Vet From Persia" />
    <meta property="og:title" content="${escapeHtml(post.title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="article:published_time" content="${post.created_at}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(post.title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
    <meta name="theme-color" content="#f6efe3" />
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3E%3Ctext y=%27.9em%27 font-size=%2790%27%3E%E2%9C%A6%3C/text%3E%3C/svg%3E" />
    <link rel="stylesheet" href="/src/style.css" />
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  </head>
  <body>
    <nav class="top-nav" aria-label="Primary navigation">
      <a class="brand" href="../">
        <span class="brand-mark" aria-hidden="true">✦</span>
        <span>The Vet From Persia</span>
      </a>
      <div class="nav-links">
        <a href="../gallery.html">Pets</a>
        <a href="../stories.html" aria-current="page">Stories</a>
        <a href="../ask.html">Mailbag</a>
        <a href="../game.html">Mini Game</a>
        <a href="../about.html">About</a>
      </div>
    </nav>

    <main class="site-shell">
      <article class="story-article">
        <header class="page-head">
          <p class="kicker">${escapeHtml(formatDate(post.created_at))}</p>
          <h1>${escapeHtml(post.title)}</h1>
        </header>
        ${post.cover_image_url ? `<img class="post-cover" src="${escapeHtml(post.cover_image_url)}" alt="" />` : ''}
        <div class="post-body">${renderMarkdown(post.body)}</div>
        <p class="story-back"><a href="../stories.html">← All stories</a></p>
      </article>

      <footer class="site-footer">
        <span>✦ The Vet From Persia</span>
        <a href="../admin.html" class="admin-link" rel="nofollow">Vet's door</a>
      </footer>
    </main>
  </body>
</html>
`;
}

// ---------- sitemap ----------

function sitemap(posts) {
  const staticEntries = STATIC_PAGES.map(
    (page) => `  <url>\n    <loc>${SITE_BASE}${page}</loc>\n  </url>`
  );
  const storyEntries = posts.map(
    (post) =>
      `  <url>\n    <loc>${SITE_BASE}story/${post.slug}.html</loc>\n    <lastmod>${post.updated_at.slice(0, 10)}</lastmod>\n  </url>`
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticEntries, ...storyEntries].join('\n')}\n</urlset>\n`;
}

// ---------- main ----------

async function fetchPosts() {
  if (process.env.STORY_FIXTURE) return JSON.parse(process.env.STORY_FIXTURE);
  const { url, key } = await loadEnv();
  if (!url || !key) {
    console.log('[stories] no Supabase config — generating base sitemap only');
    return [];
  }
  try {
    const response = await fetch(`${url}/rest/v1/posts?select=*&published=eq.true&order=created_at.desc`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`[stories] could not fetch posts (${error.message}) — generating base sitemap only`);
    return [];
  }
}

const posts = (await fetchPosts()).filter((post) => /^[a-z0-9-]+$/.test(post.slug));

await rm('story', { recursive: true, force: true });
await mkdir('story', { recursive: true });
for (const post of posts) {
  await writeFile(`story/${post.slug}.html`, storyPage(post));
}
await mkdir('public', { recursive: true });
await writeFile('public/sitemap.xml', sitemap(posts));

console.log(`[stories] generated ${posts.length} story page(s) + sitemap`);
