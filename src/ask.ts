import { getSupabase, type Question } from './supabase';
import { escapeHtml as esc } from './markdown';

const supabase = getSupabase();

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
    .limit(50);

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
          <p class="qa-answer"><span class="qa-vet">She writes back:</span> ${esc(q.answer_text ?? '')}</p>
        </article>
      `
    )
    .join('');

  injectFaqSchema(questions);
}

// FAQPage structured data so answered questions can appear as rich results.
function injectFaqSchema(questions: Question[]) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.slice(0, 20).map((q) => ({
      '@type': 'Question',
      name: q.question_text,
      acceptedAnswer: { '@type': 'Answer', text: q.answer_text ?? '' }
    }))
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
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
    status.textContent = 'Sent! She reads every letter. Replies appear in the mailbag.';
  });
}

void loadAnsweredQuestions();
wireQuestionForm();
