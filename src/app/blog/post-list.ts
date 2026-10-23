import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Reveal } from '../shared/reveal';
import { Post, categoryLabel } from './post';

/** Elenco articoli a righe, usato nella pagina Blog, in home e in fondo agli articoli. */
@Component({
  selector: 'app-post-list',
  imports: [RouterLink, Reveal],
  template: `
    <ul class="post-list">
      @for (p of posts(); track p.slug; let i = $index) {
        <li class="post-row reveal" [style.--reveal-delay.ms]="i * 60">
          <a class="post-row__link" [routerLink]="['/blog', p.slug]">
            <span class="post-row__meta">
              <span class="post-row__cat">{{ label(p.category) }}</span>
              <span>{{ p.dateLabel }}</span>
            </span>
            <span class="post-row__main">
              <span class="post-row__title">{{ p.title }}</span>
              <span class="post-row__excerpt">{{ p.description }}</span>
              @if (p.event) {
                <span class="post-row__event"><span class="post-row__dot"></span>{{ p.event.dateLabel }}@if (p.event.place) { · {{ p.event.place }} }</span>
              }
            </span>
            <span class="post-row__arrow" aria-hidden="true">→</span>
          </a>
        </li>
      }
    </ul>
  `,
})
export class PostList {
  readonly posts = input.required<Post[]>();
  protected readonly label = categoryLabel;
}
