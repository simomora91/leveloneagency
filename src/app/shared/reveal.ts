import { DestroyRef, Directive, ElementRef, afterNextRender, inject } from '@angular/core';

/**
 * Comparsa morbida allo scroll per ogni elemento con classe "reveal".
 * Gira solo nel browser: nelle pagine pre-generate il testo resta comunque leggibile.
 */
@Directive({ selector: '.reveal' })
export class Reveal {
  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    let observer: IntersectionObserver | undefined;

    afterNextRender(() => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced || typeof IntersectionObserver === 'undefined') {
        el.classList.add('is-visible');
        return;
      }
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            el.classList.add('is-visible');
            observer?.disconnect();
          }
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
      );
      observer.observe(el);
    });

    inject(DestroyRef).onDestroy(() => observer?.disconnect());
  }
}
