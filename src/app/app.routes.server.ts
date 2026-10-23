import { RenderMode, ServerRoute } from '@angular/ssr';
import { POSTS } from './blog/posts.generated';

/**
 * Home, blog e ogni articolo diventano pagine HTML pronte (lette subito anche da Google).
 * Gli indirizzi sconosciuti finiscono sulla pagina 404, generata nel browser.
 */
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'blog', renderMode: RenderMode.Prerender },
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => POSTS.map((p) => ({ slug: p.slug })),
  },
  { path: '**', renderMode: RenderMode.Client },
];
