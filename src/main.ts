import './style.css';

const cats = [
  {
    name: 'Mochi',
    caption: 'Window watcher and sunbeam specialist.',
    image:
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Pixel',
    caption: 'Always ready for dramatic close-ups.',
    image:
      'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Nimbus',
    caption: 'Master of naps and soft-focus portraits.',
    image:
      'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=1200&q=80'
  }
];

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App root not found');
}

app.innerHTML = `
  <main class="container">
    <header class="hero">
      <p class="eyebrow">GitHub Pages + TypeScript</p>
      <h1>Cat Photo Showcase</h1>
      <p>
        A lightweight starter shell to publish your best cat photography.
      </p>
    </header>

    <section class="gallery" aria-label="Featured cat photos">
      ${cats
        .map(
          (cat) => `
            <article class="card">
              <img src="${cat.image}" alt="${cat.name} the cat" loading="lazy" />
              <div class="card-body">
                <h2>${cat.name}</h2>
                <p>${cat.caption}</p>
              </div>
            </article>
          `
        )
        .join('')}
    </section>
  </main>
`;
