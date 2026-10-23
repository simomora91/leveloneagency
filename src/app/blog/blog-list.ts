import { Component, computed, inject, signal } from '@angular/core';
import { Reveal } from '../shared/reveal';
import { Seo } from '../shared/seo';
import { CATEGORIES, PostCategory } from './post';
import { PostList } from './post-list';
import { POSTS } from './posts.generated';

@Component({
  selector: 'app-blog-list',
  imports: [PostList, Reveal],
  template: `
    <section class="blog">
      <header class="blog__head reveal">
        <p class="kicker">blog</p>
        <h1>Consigli, novità e appuntamenti</h1>
        <p class="blog__lead">Tips pratiche su video, foto e voce, eventi e formazioni in Ticino, e quello che succede dietro le quinte di Level One.</p>
      </header>

      <div class="blog__filters reveal" role="group" aria-label="Filtra per categoria">
        <button type="button" class="chip" [class.is-active]="active() === null" [attr.aria-pressed]="active() === null" (click)="active.set(null)">Tutti</button>
        @for (c of categories; track c.id) {
          <button type="button" class="chip" [class.is-active]="active() === c.id" [attr.aria-pressed]="active() === c.id" (click)="active.set(c.id)">{{ c.label }}</button>
        }
      </div>

      @if (filtered().length) {
        <app-post-list [posts]="filtered()" />
      } @else {
        <p class="blog__empty">Nessun articolo in questa categoria, per ora.</p>
      }
    </section>
  `,
})
export class BlogList {
  protected readonly categories = CATEGORIES;
  protected readonly active = signal<PostCategory | null>(null);
  protected readonly filtered = computed(() => {
    const cat = this.active();
    return cat ? POSTS.filter((p) => p.category === cat) : POSTS;
  });

  constructor() {
    inject(Seo).set({
      title: 'Blog',
      description:
        'Consigli pratici su video, foto e voce, eventi e formazioni in Ticino: il blog di Level One, agenzia di comunicazione audiovisiva a Lugano.',
      path: '/blog/',
    });
  }
}
