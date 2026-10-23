export type PostCategory = 'info' | 'tips' | 'eventi' | 'formazione';

export const CATEGORIES: { id: PostCategory; label: string }[] = [
  { id: 'tips', label: 'Tips' },
  { id: 'eventi', label: 'Eventi' },
  { id: 'formazione', label: 'Formazione' },
  { id: 'info', label: 'Info' },
];

export const categoryLabel = (id: PostCategory): string =>
  CATEGORIES.find((c) => c.id === id)?.label ?? id;

export interface PostEvent {
  /** Data in formato ISO, es. 2026-11-20 */
  date: string;
  /** Data leggibile, es. "venerdì 20 novembre 2026" */
  dateLabel: string;
  time?: string;
  place?: string;
  price?: string;
  ctaUrl?: string;
  ctaLabel?: string;
}

export interface Post {
  slug: string;
  title: string;
  description: string;
  date: string;
  dateLabel: string;
  category: PostCategory;
  readingMinutes: number;
  cover?: string;
  coverAlt?: string;
  event?: PostEvent;
  html: string;
}
