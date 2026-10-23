import { Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Reveal } from '../shared/reveal';
import { Seo } from '../shared/seo';
import { categoryLabel } from './post';
import { PostList } from './post-list';
import { POSTS } from './posts.generated';

@Component({
  selector: 'app-blog-post',
  imports: [RouterLink, PostList, Reveal],
  template: `
    @if (post(); as p) {
      <article class="post">
        <a class="post__back" routerLink="/blog">← Tutti gli articoli</a>

        <header class="post__head">
          <p class="post__meta">
            <span class="post__cat">{{ label(p.category) }}</span>
            <span>{{ p.dateLabel }}</span>
            <span>{{ p.readingMinutes }} min di lettura</span>
          </p>
          <h1>{{ p.title }}</h1>
          <p class="post__lead">{{ p.description }}</p>
        </header>

        @if (p.event; as ev) {
          <aside class="post-event" aria-label="Dettagli dell'appuntamento">
            <span class="post-event__corner post-event__corner--tl"></span>
            <span class="post-event__corner post-event__corner--br"></span>
            <p class="post-event__rec"><span class="post-event__dot"></span>in programma</p>
            <dl class="post-event__grid">
              <div><dt>Data</dt><dd>{{ ev.dateLabel }}</dd></div>
              @if (ev.time) { <div><dt>Orario</dt><dd>{{ ev.time }}</dd></div> }
              @if (ev.place) { <div><dt>Luogo</dt><dd>{{ ev.place }}</dd></div> }
              @if (ev.price) { <div><dt>Quota</dt><dd>{{ ev.price }}</dd></div> }
            </dl>
            @if (ev.ctaUrl) {
              <a class="btn btn--primary post-event__cta" [href]="ev.ctaUrl">{{ ev.ctaLabel || 'Iscriviti' }}</a>
            }
          </aside>
        }

        @if (p.cover) {
          <figure class="post__cover">
            <img [src]="p.cover" [alt]="p.coverAlt || ''" loading="lazy" decoding="async" />
          </figure>
        }

        <div class="post__body" [innerHTML]="p.html"></div>
      </article>

      @if (others().length) {
        <section class="post-more">
          <p class="kicker reveal">altri articoli</p>
          <app-post-list [posts]="others()" />
        </section>
      }
    } @else {
      <section class="not-found">
        <p class="kicker">blog</p>
        <h1>Articolo non trovato</h1>
        <p>L'articolo che cerchi non esiste più o ha cambiato indirizzo.</p>
        <a class="btn btn--ghost" routerLink="/blog">Vai al blog</a>
      </section>
    }
  `,
})
export class BlogPost {
  /** Arriva dal percorso /blog/:slug */
  readonly slug = input.required<string>();

  protected readonly label = categoryLabel;
  protected readonly post = computed(() => POSTS.find((p) => p.slug === this.slug()));
  protected readonly others = computed(() => POSTS.filter((p) => p.slug !== this.slug()).slice(0, 2));

  constructor() {
    const seo = inject(Seo);
    effect(() => {
      const p = this.post();
      if (p) {
        seo.set({ title: p.title, description: p.description, path: `/blog/${p.slug}/`, type: 'article', image: p.cover });
      } else {
        seo.set({ title: 'Articolo non trovato', description: 'Questo articolo del blog di Level One non è disponibile.', path: '/blog/' });
      }
    });
  }
}
