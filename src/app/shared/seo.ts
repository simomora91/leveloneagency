import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

const SITE = 'https://leveloneagency.ch';
const DEFAULT_TITLE = 'Level One | Comunicazione audiovisiva a Lugano';
const DEFAULT_IMAGE = `${SITE}/about/backstage-azienda.jpg`;

export interface SeoData {
  /** Titolo della pagina; senza titolo si usa quello della home. */
  title?: string;
  description: string;
  /** Percorso della pagina, es. "/blog/" */
  path: string;
  type?: 'website' | 'article';
  image?: string;
}

/** Titolo, descrizione e anteprima social di ogni pagina, scritti già nell'HTML pre-generato. */
@Injectable({ providedIn: 'root' })
export class Seo {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  set(data: SeoData): void {
    const title = data.title ? `${data.title} | Level One` : DEFAULT_TITLE;
    const url = `${SITE}${data.path}`;
    const image = data.image ? `${SITE}/${data.image.replace(/^\//, '')}` : DEFAULT_IMAGE;

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: data.description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: data.description });
    this.meta.updateTag({ property: 'og:type', content: data.type ?? 'website' });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:locale', content: 'it_CH' });
    this.meta.updateTag({ property: 'og:site_name', content: 'Level One' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });

    let link = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
