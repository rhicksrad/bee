import { getSupabase, type Photo } from './supabase';
import { escapeHtml as esc } from './markdown';
import { builtInPhotos, type GalleryPhoto } from './photos';

let galleryPhotos: GalleryPhoto[] = [];
let lightboxIndex = 0;

function showLightbox(index: number) {
  const lightbox = document.querySelector<HTMLDivElement>('#lightbox');
  const image = document.querySelector<HTMLImageElement>('#lightbox-image');
  const caption = document.querySelector<HTMLElement>('#lightbox-caption');
  const counter = document.querySelector<HTMLElement>('#lightbox-counter');
  if (!lightbox || !image || !caption || !counter) return;

  lightboxIndex = (index + galleryPhotos.length) % galleryPhotos.length;
  const photo = galleryPhotos[lightboxIndex];
  image.src = photo.src;
  image.alt = photo.alt;
  caption.innerHTML = `
    ${photo.label ? `<span class="tile-label">${esc(photo.label)}</span>` : ''}
    ${photo.caption ? `<p>${esc(photo.caption)}</p>` : ''}
  `;
  counter.textContent = `${lightboxIndex + 1} / ${galleryPhotos.length}`;
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lightbox = document.querySelector<HTMLDivElement>('#lightbox');
  if (!lightbox || lightbox.hidden) return;
  lightbox.hidden = true;
  document.body.style.overflow = '';
}

function isLightboxOpen(): boolean {
  const lightbox = document.querySelector<HTMLDivElement>('#lightbox');
  return !!lightbox && !lightbox.hidden;
}

document.querySelectorAll('[data-lightbox-close]').forEach((el) =>
  el.addEventListener('click', closeLightbox)
);
document.querySelector('#lightbox-prev')?.addEventListener('click', () => showLightbox(lightboxIndex - 1));
document.querySelector('#lightbox-next')?.addEventListener('click', () => showLightbox(lightboxIndex + 1));

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeLightbox();
  if (isLightboxOpen()) {
    if (event.key === 'ArrowLeft') showLightbox(lightboxIndex - 1);
    if (event.key === 'ArrowRight') showLightbox(lightboxIndex + 1);
  }
});

function renderGallery(photos: GalleryPhoto[]) {
  const masonry = document.querySelector<HTMLDivElement>('#photo-masonry');
  if (!masonry) return;
  galleryPhotos = photos;

  masonry.innerHTML = photos
    .map(
      (photo, index) => `
        <figure class="photo-tile" data-photo-index="${index}" tabindex="0" role="button"
          aria-label="View photo: ${esc(photo.label || photo.alt)}">
          <img src="${esc(photo.src)}" alt="${esc(photo.alt)}" loading="${index < 4 ? 'eager' : 'lazy'}" />
          ${
            photo.label || photo.caption
              ? `<figcaption>
                  ${photo.label ? `<span class="tile-label">${esc(photo.label)}</span>` : ''}
                  ${photo.caption ? `<p>${esc(photo.caption)}</p>` : ''}
                </figcaption>`
              : ''
          }
        </figure>
      `
    )
    .join('');

  masonry.querySelectorAll<HTMLElement>('[data-photo-index]').forEach((tile) => {
    const open = () => showLightbox(Number(tile.dataset.photoIndex));
    tile.addEventListener('click', open);
    tile.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
    });
  });
}

renderGallery(builtInPhotos);

async function loadUploadedPhotos() {
  const supabase = getSupabase();
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
  renderGallery([...builtInPhotos, ...uploaded]);
}

void loadUploadedPhotos();
