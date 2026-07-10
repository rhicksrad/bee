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

export const builtInPhotos: GalleryPhoto[] = [
  {
    src: photo0,
    alt: 'A white Persian cat resting in warm light',
    caption: 'A soft check-in moment for a beloved household companion.',
    label: 'Calm Visit'
  },
  {
    src: photo1,
    alt: 'A bright-eyed pet looking toward the camera',
    caption: 'Curious eyes, big feelings, and a tiny imaginary chart note.',
    label: 'Curious Case'
  },
  {
    src: photo2,
    alt: 'A playful pet enjoying a lively moment',
    caption: 'Play is enrichment, exercise, comedy, and chaos in one package.',
    label: 'Play Plan'
  },
  {
    src: photo3,
    alt: 'A relaxed pet lounging comfortably',
    caption: 'Rest, routine, and a cozy place to supervise the humans.',
    label: 'Recovery Suite'
  },
  {
    src: photo4,
    alt: 'An attentive pet watching from a favorite spot',
    caption: 'Alert, observant, and probably already aware of the treat drawer.',
    label: 'Watchful Friend'
  },
  {
    src: photo5,
    alt: 'An elegant pet posing with confidence',
    caption: 'A polished portrait from the wellness wall of fame.',
    label: 'Portrait Round'
  },
  {
    src: photo6,
    alt: 'A beloved pet captured for the parlor gallery',
    caption: 'Another little personality joins the gallery with storybook sparkle.',
    label: 'New Arrival'
  },
  {
    src: photo7,
    alt: 'A companion animal featured in a warm veterinary-inspired gallery',
    caption: 'A bright gallery stop for soft paws, whiskers, and dramatic charm.',
    label: 'Star Patient'
  },
  {
    src: photo8,
    alt: 'A pet portrait added to the Persian parlor collection',
    caption: 'Jewel tones, cozy light, and a little clinic-card glamour.',
    label: 'Jewel Tone'
  },
  {
    src: photo9,
    alt: 'A household companion shown as part of the featured gallery',
    caption: 'A sweet reminder that every pet has a signature mood and mythos.',
    label: 'Signature Mood'
  },
  {
    src: photo10,
    alt: 'A pet portrait rounding out the gallery',
    caption: 'One more portrait from the vet’s rounds.',
    label: 'Grand Finale'
  }
];
