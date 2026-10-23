import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Seo } from '../shared/seo';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <section class="not-found">
      <p class="kicker">errore 404</p>
      <h1>Questa pagina non esiste</h1>
      <p>Il link potrebbe essere vecchio o scritto male.</p>
      <div class="not-found__actions">
        <a class="btn btn--primary" routerLink="/">Torna alla home</a>
        <a class="btn btn--ghost" routerLink="/blog">Vai al blog</a>
      </div>
    </section>
  `,
})
export class NotFound {
  constructor() {
    inject(Seo).set({ title: 'Pagina non trovata', description: 'La pagina cercata non esiste sul sito di Level One.', path: '/' });
  }
}
