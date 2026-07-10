import type { Session } from '@supabase/supabase-js';
import { getSupabase, formatDate, type Post, type Question, type Photo } from './supabase';
import { escapeHtml as esc } from './markdown';

const root = document.querySelector<HTMLDivElement>('#admin');
if (!root) throw new Error('Admin root not found');

const supabase = getSupabase();

// ---------- Not configured yet ----------

if (!supabase) {
  root.innerHTML = `
    <main class="admin-shell">
      <section class="admin-card">
        <h1>✦ Vet's Desk</h1>
        <p>
          The site is not connected to its database yet. Follow the steps in
          <code>SETUP.md</code> (create the Supabase project, run
          <code>supabase/schema.sql</code>, and set the two
          <code>VITE_SUPABASE_*</code> values), then reload this page.
        </p>
      </section>
    </main>
  `;
  throw new Error('Supabase not configured');
}

const db = supabase;

// ---------- Layout ----------

root.innerHTML = `
  <main class="admin-shell">
    <section class="admin-card" id="login-view" hidden>
      <h1>✦ Vet's Desk</h1>
      <p>Sign in to write stories, answer questions, and add photos.</p>
      <form id="login-form" class="admin-form">
        <label>Email <input type="email" name="email" autocomplete="username" required /></label>
        <label>Password <input type="password" name="password" autocomplete="current-password" required /></label>
        <button type="submit" class="button primary">Sign in</button>
        <p class="form-status" id="login-status" role="alert"></p>
      </form>
      <p class="admin-back"><a href="index.html">← Back to the site</a></p>
    </section>

    <section id="dashboard-view" hidden>
      <header class="admin-header">
        <h1>✦ Vet's Desk</h1>
        <div class="admin-header-actions">
          <a class="button secondary" href="index.html" target="_blank" rel="noopener">View site</a>
          <button type="button" class="button secondary" id="sign-out">Sign out</button>
        </div>
      </header>

      <nav class="admin-tabs" role="tablist">
        <button type="button" class="admin-tab active" data-tab="questions">Questions <span id="pending-badge" class="badge" hidden></span></button>
        <button type="button" class="admin-tab" data-tab="posts">Stories</button>
        <button type="button" class="admin-tab" data-tab="photos">Photos</button>
      </nav>

      <p class="form-status" id="admin-status" role="status"></p>

      <section class="admin-panel" id="tab-questions"></section>

      <section class="admin-panel" id="tab-posts" hidden>
        <div class="panel-head">
          <h2>Stories</h2>
          <button type="button" class="button primary" id="new-post">＋ New story</button>
        </div>
        <div id="post-editor" hidden></div>
        <div id="post-list"></div>
      </section>

      <section class="admin-panel" id="tab-photos" hidden>
        <div class="panel-head">
          <h2>Photos</h2>
          <label class="button primary upload-button">
            ＋ Upload photos
            <input type="file" id="photo-upload" accept="image/*" multiple hidden />
          </label>
        </div>
        <p class="panel-note">Uploaded photos join the 3D carousel on the public site. Add a label and caption, then save.</p>
        <div id="photo-list" class="photo-grid"></div>
      </section>
    </section>
  </main>
`;

const loginView = document.querySelector<HTMLElement>('#login-view')!;
const dashboardView = document.querySelector<HTMLElement>('#dashboard-view')!;
const adminStatus = document.querySelector<HTMLElement>('#admin-status')!;

let statusTimer: number | undefined;
function flash(message: string, isError = false) {
  adminStatus.textContent = message;
  adminStatus.classList.toggle('error', isError);
  window.clearTimeout(statusTimer);
  if (message) statusTimer = window.setTimeout(() => (adminStatus.textContent = ''), 5000);
}

function fail(error: { message: string } | null, context: string): boolean {
  if (!error) return false;
  const hint = /row-level security/i.test(error.message)
    ? ' (Is this account listed in the admins table? See SETUP.md.)'
    : '';
  flash(`${context}: ${error.message}${hint}`, true);
  return true;
}

// ---------- Auth ----------

function showLogin() {
  loginView.hidden = false;
  dashboardView.hidden = true;
}

function showDashboard() {
  loginView.hidden = true;
  dashboardView.hidden = false;
  void loadQuestions();
  void loadPosts();
  void loadPhotos();
}

db.auth.onAuthStateChange((_event: string, session: Session | null) => {
  if (session) showDashboard();
  else showLogin();
});

const loginForm = document.querySelector<HTMLFormElement>('#login-form')!;
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const status = document.querySelector<HTMLElement>('#login-status')!;
  const formData = new FormData(loginForm);
  status.textContent = 'Signing in…';

  const { error } = await db.auth.signInWithPassword({
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? '')
  });

  status.textContent = error ? `Could not sign in: ${error.message}` : '';
  if (!error) loginForm.reset();
});

document.querySelector('#sign-out')?.addEventListener('click', () => void db.auth.signOut());

// ---------- Tabs ----------

document.querySelectorAll<HTMLButtonElement>('.admin-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll<HTMLButtonElement>('.admin-tab').forEach((t) => t.classList.toggle('active', t === tab));
    ['questions', 'posts', 'photos'].forEach((name) => {
      const panel = document.querySelector<HTMLElement>(`#tab-${name}`);
      if (panel) panel.hidden = name !== tab.dataset.tab;
    });
  });
});

// ---------- Questions ----------

async function loadQuestions() {
  const panel = document.querySelector<HTMLElement>('#tab-questions')!;
  const { data, error } = await db.from('questions').select('*').order('created_at', { ascending: false });
  if (fail(error, 'Could not load questions')) return;

  const questions = (data ?? []) as Question[];
  const pending = questions.filter((q) => q.status === 'pending');
  const answered = questions.filter((q) => q.status === 'answered');
  const hidden = questions.filter((q) => q.status === 'hidden');

  const badge = document.querySelector<HTMLElement>('#pending-badge')!;
  badge.hidden = pending.length === 0;
  badge.textContent = String(pending.length);

  const questionCard = (q: Question) => `
    <article class="question-item" data-id="${q.id}">
      <header>
        <strong>${esc(q.author_name || 'Anonymous')}</strong>
        <span>${esc(formatDate(q.created_at))}</span>
      </header>
      <p class="question-text">${esc(q.question_text)}</p>
      <label>
        ${q.status === 'pending' ? 'Your answer' : 'Answer (editable)'}
        <textarea rows="3" data-answer>${esc(q.answer_text ?? '')}</textarea>
      </label>
      <div class="item-actions">
        <button type="button" class="button primary" data-action="answer">
          ${q.status === 'answered' ? 'Update answer' : 'Publish answer'}
        </button>
        ${
          q.status === 'hidden'
            ? '<button type="button" class="button secondary" data-action="delete">Delete forever</button>'
            : '<button type="button" class="button secondary" data-action="hide">Hide</button>'
        }
      </div>
    </article>
  `;

  const section = (title: string, items: Question[], emptyNote: string) => `
    <div class="panel-head"><h2>${title}</h2></div>
    ${items.length ? items.map(questionCard).join('') : `<p class="panel-note">${emptyNote}</p>`}
  `;

  panel.innerHTML = `
    ${section(`Waiting for an answer (${pending.length})`, pending, 'No new questions — the mailbag is empty.')}
    ${section(`Answered (${answered.length})`, answered, 'Nothing answered yet.')}
    ${hidden.length ? section(`Hidden (${hidden.length})`, hidden, '') : ''}
  `;

  panel.querySelectorAll<HTMLElement>('.question-item').forEach((item) => {
    const id = item.dataset.id!;
    item.querySelector('[data-action="answer"]')?.addEventListener('click', async () => {
      const answer = item.querySelector<HTMLTextAreaElement>('[data-answer]')!.value.trim();
      if (!answer) {
        flash('Write an answer before publishing.', true);
        return;
      }
      const { error: updateError } = await db
        .from('questions')
        .update({ answer_text: answer, status: 'answered', answered_at: new Date().toISOString() })
        .eq('id', id);
      if (fail(updateError, 'Could not save the answer')) return;
      flash('Answer published to the site. ✦');
      void loadQuestions();
    });

    item.querySelector('[data-action="hide"]')?.addEventListener('click', async () => {
      const { error: hideError } = await db.from('questions').update({ status: 'hidden' }).eq('id', id);
      if (fail(hideError, 'Could not hide the question')) return;
      flash('Question hidden.');
      void loadQuestions();
    });

    item.querySelector('[data-action="delete"]')?.addEventListener('click', async () => {
      if (!window.confirm('Delete this question forever?')) return;
      const { error: deleteError } = await db.from('questions').delete().eq('id', id);
      if (fail(deleteError, 'Could not delete the question')) return;
      flash('Question deleted.');
      void loadQuestions();
    });
  });
}

// ---------- Storage helper ----------

async function uploadImage(file: File, folder: string): Promise<{ url: string; path: string } | null> {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await db.storage.from('photos').upload(path, file, { cacheControl: '31536000' });
  if (fail(error, `Could not upload ${file.name}`)) return null;
  const { data } = db.storage.from('photos').getPublicUrl(path);
  return { url: data.publicUrl, path };
}

// ---------- Posts ----------

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return base || `story-${Date.now()}`;
}

function openPostEditor(post?: Post) {
  const editor = document.querySelector<HTMLElement>('#post-editor')!;
  editor.hidden = false;
  editor.innerHTML = `
    <form class="admin-form post-form">
      <h3>${post ? 'Edit story' : 'New story'}</h3>
      <label>Title <input type="text" name="title" required maxlength="200" value="${esc(post?.title ?? '')}" /></label>
      <label>
        Story <span class="label-hint">(plain text works; **bold**, *italics*, # headings, - lists, and [links](https://…) too)</span>
        <textarea name="body" rows="12">${esc(post?.body ?? '')}</textarea>
      </label>
      <div class="inline-photo-row">
        <label class="button secondary upload-button">
          📷 Add photos into the story
          <input type="file" data-inline-photos accept="image/*" multiple hidden />
        </label>
        <span class="label-hint">Uploads the photo and drops it into the story right where your cursor is.</span>
      </div>
      <label class="cover-label">
        Cover photo (optional)
        <input type="file" name="cover" accept="image/*" />
        ${post?.cover_image_url ? `<img class="cover-preview" src="${esc(post.cover_image_url)}" alt="Current cover" />` : ''}
      </label>
      <label class="check-label"><input type="checkbox" name="published" ${post?.published ? 'checked' : ''} /> Published (visible on the site)</label>
      <div class="item-actions">
        <button type="submit" class="button primary">${post ? 'Save changes' : 'Create story'}</button>
        <button type="button" class="button secondary" data-action="cancel">Cancel</button>
      </div>
    </form>
  `;
  editor.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const form = editor.querySelector<HTMLFormElement>('form')!;
  form.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
    editor.hidden = true;
    editor.innerHTML = '';
  });

  const bodyField = form.querySelector<HTMLTextAreaElement>('textarea[name="body"]')!;
  form.querySelector<HTMLInputElement>('[data-inline-photos]')?.addEventListener('change', async (event) => {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (files.length === 0) return;

    flash(`Uploading ${files.length} photo${files.length > 1 ? 's' : ''} into the story…`);
    const snippets: string[] = [];
    for (const file of files) {
      const uploaded = await uploadImage(file, 'stories');
      if (uploaded) snippets.push(`![photo](${uploaded.url})`);
    }
    if (snippets.length === 0) return;

    const insertion = `\n\n${snippets.join('\n\n')}\n\n`;
    const at = bodyField.selectionStart ?? bodyField.value.length;
    bodyField.value = bodyField.value.slice(0, at) + insertion + bodyField.value.slice(at);
    const cursor = at + insertion.length;
    bodyField.focus();
    bodyField.setSelectionRange(cursor, cursor);
    flash('Photo added to the story. ✦');
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const title = String(formData.get('title') ?? '').trim();
    if (!title) return;

    const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    submitButton.disabled = true;
    flash('Saving story…');

    let coverUrl = post?.cover_image_url ?? null;
    const coverFile = formData.get('cover');
    if (coverFile instanceof File && coverFile.size > 0) {
      const uploaded = await uploadImage(coverFile, 'covers');
      if (!uploaded) {
        submitButton.disabled = false;
        return;
      }
      coverUrl = uploaded.url;
    }

    const record = {
      title,
      body: String(formData.get('body') ?? ''),
      cover_image_url: coverUrl,
      published: formData.get('published') === 'on'
    };

    const { error } = post
      ? await db.from('posts').update(record).eq('id', post.id)
      : await db.from('posts').insert({ ...record, slug: slugify(title) });

    submitButton.disabled = false;
    if (fail(error, 'Could not save the story')) return;

    editor.hidden = true;
    editor.innerHTML = '';
    flash(post ? 'Story updated. ✦' : 'Story created. ✦');
    void loadPosts();
  });
}

document.querySelector('#new-post')?.addEventListener('click', () => openPostEditor());

async function loadPosts() {
  const list = document.querySelector<HTMLElement>('#post-list')!;
  const { data, error } = await db.from('posts').select('*').order('created_at', { ascending: false });
  if (fail(error, 'Could not load stories')) return;

  const posts = (data ?? []) as Post[];
  if (posts.length === 0) {
    list.innerHTML = '<p class="panel-note">No stories yet — write the first one!</p>';
    return;
  }

  list.innerHTML = posts
    .map(
      (post) => `
        <article class="post-item" data-id="${post.id}">
          <div class="post-item-info">
            <strong>${esc(post.title)}</strong>
            <span>${esc(formatDate(post.created_at))} · ${post.published ? '<em class="live">Published</em>' : '<em class="draft">Draft</em>'}</span>
          </div>
          <div class="item-actions">
            <button type="button" class="button secondary" data-action="toggle">${post.published ? 'Unpublish' : 'Publish'}</button>
            <button type="button" class="button secondary" data-action="edit">Edit</button>
            <button type="button" class="button secondary" data-action="delete">Delete</button>
          </div>
        </article>
      `
    )
    .join('');

  list.querySelectorAll<HTMLElement>('.post-item').forEach((item) => {
    const post = posts.find((p) => p.id === item.dataset.id)!;

    item.querySelector('[data-action="edit"]')?.addEventListener('click', () => openPostEditor(post));

    item.querySelector('[data-action="toggle"]')?.addEventListener('click', async () => {
      const { error: toggleError } = await db.from('posts').update({ published: !post.published }).eq('id', post.id);
      if (fail(toggleError, 'Could not update the story')) return;
      flash(post.published ? 'Story unpublished.' : 'Story published to the site. ✦');
      void loadPosts();
    });

    item.querySelector('[data-action="delete"]')?.addEventListener('click', async () => {
      if (!window.confirm(`Delete "${post.title}" forever?`)) return;
      const { error: deleteError } = await db.from('posts').delete().eq('id', post.id);
      if (fail(deleteError, 'Could not delete the story')) return;
      flash('Story deleted.');
      void loadPosts();
    });
  });
}

// ---------- Photos ----------

document.querySelector<HTMLInputElement>('#photo-upload')?.addEventListener('change', async (event) => {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files ?? []);
  input.value = '';
  if (files.length === 0) return;

  flash(`Uploading ${files.length} photo${files.length > 1 ? 's' : ''}…`);
  for (const file of files) {
    const uploaded = await uploadImage(file, 'gallery');
    if (!uploaded) continue;
    const { error } = await db.from('photos').insert({
      image_url: uploaded.url,
      storage_path: uploaded.path
    });
    if (fail(error, `Could not save ${file.name}`)) continue;
  }
  flash('Upload finished. Add labels and captions below. ✦');
  void loadPhotos();
});

async function loadPhotos() {
  const list = document.querySelector<HTMLElement>('#photo-list')!;
  const { data, error } = await db
    .from('photos')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (fail(error, 'Could not load photos')) return;

  const photos = (data ?? []) as Photo[];
  if (photos.length === 0) {
    list.innerHTML = '<p class="panel-note">No uploaded photos yet. The 11 original portraits are built into the site and always shown.</p>';
    return;
  }

  list.innerHTML = photos
    .map(
      (photo) => `
        <article class="photo-item" data-id="${photo.id}">
          <img src="${esc(photo.image_url)}" alt="" loading="lazy" />
          <label>Label <input type="text" maxlength="80" data-label value="${esc(photo.label)}" placeholder="e.g. Sunday Nap" /></label>
          <label>Caption <input type="text" maxlength="300" data-caption value="${esc(photo.caption)}" placeholder="A short caption" /></label>
          <div class="item-actions">
            <button type="button" class="button primary" data-action="save">Save</button>
            <button type="button" class="button secondary" data-action="delete">Delete</button>
          </div>
        </article>
      `
    )
    .join('');

  list.querySelectorAll<HTMLElement>('.photo-item').forEach((item) => {
    const photo = photos.find((p) => p.id === item.dataset.id)!;

    item.querySelector('[data-action="save"]')?.addEventListener('click', async () => {
      const label = item.querySelector<HTMLInputElement>('[data-label]')!.value.trim();
      const caption = item.querySelector<HTMLInputElement>('[data-caption]')!.value.trim();
      const { error: saveError } = await db.from('photos').update({ label, caption }).eq('id', photo.id);
      if (fail(saveError, 'Could not save the photo details')) return;
      flash('Photo details saved. ✦');
    });

    item.querySelector('[data-action="delete"]')?.addEventListener('click', async () => {
      if (!window.confirm('Remove this photo from the site?')) return;
      const { error: deleteError } = await db.from('photos').delete().eq('id', photo.id);
      if (fail(deleteError, 'Could not delete the photo')) return;
      if (photo.storage_path) void db.storage.from('photos').remove([photo.storage_path]);
      flash('Photo removed.');
      void loadPhotos();
    });
  });
}
