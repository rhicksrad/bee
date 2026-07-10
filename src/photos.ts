import photo0 from './photos/photo0.jpg';
import photo1 from './photos/photo1.jpg';
import photo2 from './photos/photo2.jpg';
import photo3 from './photos/photo3.jpg';
import photo4 from './photos/photo4.jpg';
import photo5 from './photos/photo5.jpg';
import photo6 from './photos/photo6.jpg';
import photo7 from './photos/photo7.jpg';
import photo8 from './photos/photo8.jpg';
import photo9 from './photos/photo9.jpg';
import photo10 from './photos/photo10.jpg';

export type GalleryPhoto = {
  src: string;
  alt: string;
  caption: string;
  label: string;
};

export const heroPhoto = photo0;
export const gameSprite = photo1;

// The built-in photos carry no labels or captions — those belong to the
// vet's own uploads, which she annotates herself in the admin panel.
const plain = (src: string, alt: string): GalleryPhoto => ({ src, alt, caption: '', label: '' });

export const builtInPhotos: GalleryPhoto[] = [
  plain(photo0, 'A white Persian cat resting in warm light'),
  plain(photo1, 'A bright-eyed pet looking toward the camera'),
  plain(photo2, 'A playful pet enjoying a lively moment'),
  plain(photo3, 'A relaxed pet lounging comfortably'),
  plain(photo4, 'An attentive pet watching from a favorite spot'),
  plain(photo5, 'An elegant pet posing with confidence'),
  plain(photo6, 'A beloved pet in the parlor gallery'),
  plain(photo7, 'A companion animal in a warm portrait'),
  plain(photo8, 'A pet portrait in jewel tones and cozy light'),
  plain(photo9, 'A household companion in a featured portrait'),
  plain(photo10, 'A pet portrait from the vet’s rounds')
];
