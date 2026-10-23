import { Component, ElementRef, afterNextRender, inject, DestroyRef } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { scrollToSection } from './shared/scroll';
import { Reveal } from './shared/reveal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Reveal],
  templateUrl: './app.html',
})
export class App {
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private cursorCleanup?: () => void;

  constructor() {
    // Lo header è sticky: le ancore (#servizi, #clienti...) si fermano sotto di lui
    inject(ViewportScroller).setOffset([0, 76]);

    afterNextRender(() => this.setupCursorDot());
    inject(DestroyRef).onDestroy(() => this.cursorCleanup?.());
  }

  protected goTo(event: Event, id: string): void {
    scrollToSection(event, id);
  }

  /**
   * Cursore: pallino arancione che segue il mouse con un leggero ritardo e si
   * allunga nella direzione del movimento. Su touch nessun pallino: ogni tap
   * lascia un cerchio che si espande nel punto toccato.
   */
  private setupCursorDot(): void {
    const dot = this.hostRef.nativeElement.querySelector<HTMLElement>('.cursor-dot');
    if (!dot) return;

    const root = document.documentElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let angle = 0;
    let stretch = 0;
    let started = false;
    let rafId = 0;
    let lastTime = 0;

    const render = () => {
      dot.style.transform =
        `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${angle.toFixed(3)}rad) ` +
        `scale(${(1 + stretch).toFixed(3)}, ${(1 - stretch * 0.45).toFixed(3)})`;
    };

    const tick = (time: number) => {
      const dt = Math.min(time - lastTime, 50) || 16;
      lastTime = time;

      // Inseguimento morbido, indipendente dal frame rate
      const k = 1 - Math.exp(-dt / 85);
      const dx = (targetX - x) * k;
      const dy = (targetY - y) * k;
      x += dx;
      y += dy;

      // Deformazione: più veloce va, più si allunga lungo la direzione
      const speed = Math.hypot(dx, dy) / dt;
      const limit = dot.classList.contains('is-link') ? 0.12 : 0.4;
      const wanted = Math.min(speed * 0.32, limit);
      stretch += (wanted - stretch) * 0.3;
      if (speed > 0.02) angle = Math.atan2(dy, dx);

      render();

      const settled = Math.abs(targetX - x) < 0.1 && Math.abs(targetY - y) < 0.1 && stretch < 0.005;
      if (settled) {
        x = targetX;
        y = targetY;
        stretch = 0;
        render();
        rafId = 0;
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      // Il cursore di sistema sparisce solo quando il pallino è davvero in funzione
      root.classList.add('has-cursor-dot');
      targetX = e.clientX;
      targetY = e.clientY;
      dot.classList.add('is-on');
      const target = e.target instanceof Element ? e.target : null;
      dot.classList.toggle('is-link', !!target?.closest('a, button, [role="button"]'));

      if (!started || reducedMotion) {
        started = true;
        x = targetX;
        y = targetY;
        stretch = 0;
        render();
        return;
      }
      if (!rafId) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(tick);
      }
    };

    // Touch: "impact" circolare nel punto del tap (non durante lo scroll)
    let tapX = 0;
    let tapY = 0;
    let tapId = -1;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') {
        dot.classList.add('is-down');
        return;
      }
      dot.classList.remove('is-on');
      root.classList.remove('has-cursor-dot');
      tapX = e.clientX;
      tapY = e.clientY;
      tapId = e.pointerId;
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') {
        dot.classList.remove('is-down');
        return;
      }
      if (e.pointerId !== tapId || reducedMotion) return;
      tapId = -1;
      if (Math.hypot(e.clientX - tapX, e.clientY - tapY) > 12) return;

      const ripple = document.createElement('span');
      ripple.className = 'tap-ripple';
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
      document.body.appendChild(ripple);
    };

    const onLeave = () => dot.classList.remove('is-on');

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    root.addEventListener('mouseleave', onLeave);
    window.addEventListener('blur', onLeave);

    this.cursorCleanup = () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      root.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('blur', onLeave);
      root.classList.remove('has-cursor-dot');
    };
  }
}
