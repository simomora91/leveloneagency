import { AfterViewInit, Component, ElementRef, OnInit, OnDestroy, signal } from '@angular/core';

interface ServiceFrame {
  code: string;
  name: string;
  copy: string;
}

interface BackstageShot {
  src: string;
  alt: string;
  caption: string;
}

interface Client {
  name: string;
  tag: string;
  url?: string;
  logo: string;
}

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, AfterViewInit, OnDestroy {
  protected readonly title = signal('leveloneagency');

  protected readonly timecode = signal('00:00:00:00');

  protected readonly services: ServiceFrame[] = [
    { code: 'F01', name: 'Video', copy: 'Produzioni corporate, eventi e contenuti social pensati per essere guardati fino alla fine.' },
    { code: 'F02', name: 'Foto', copy: 'Still aziendali e still eventi che raccontano un momento senza bisogno di didascalie.' },
    { code: 'F03', name: 'Social', copy: 'Realizziamo i contenuti per i tuoi canali social: video e foto pensati per ogni formato e pronti da pubblicare.' },
    { code: 'F04', name: 'Eventi', copy: 'Copertura completa di eventi aziendali e privati, dal prima al dopo — non solo scatti.' },
    { code: 'F05', name: 'Siti Web', copy: 'Siti su misura che convertono i visitatori in clienti, veloci e semplici da gestire.' },
    { code: 'F06', name: 'Voice Over', copy: 'Speakeraggio e doppiaggio pubblicitario per dare al messaggio il tono giusto.' },
    { code: 'F07', name: 'Formazione', copy: 'Percorsi su voce, dizione, foto, video e social per chi vuole imparare a comunicare da solo.' },
    { code: 'F08', name: 'Strategia', copy: 'Consulenza e partnership con agenzie per costruire una presenza digitale che dura.' },
  ];

  protected readonly clients: Client[] = [
    { name: 'Tiba Ticino', tag: 'riscaldamento · impiantistica', url: 'https://tiba.ch/tessin/it/', logo: 'clients/tiba-ticino.svg' },
    { name: 'Arcademy', tag: 'counseling · no profit', url: 'https://www.arcademyonline.org', logo: 'clients/arcademy.png' },
    { name: 'D&A Impianti Elettrici', tag: 'impiantistica', url: 'https://www.deaimpiantielettricisrl.it', logo: 'clients/da-impianti-elettrici.png' },
    { name: 'Cornerstone Music Gear', tag: 'prodotti musicali', url: 'https://www.cornerstonemusicgear.com', logo: 'clients/cornerstone-music-gear.svg' },
    { name: 'Porte Aperte Italia', tag: 'no profit', url: 'https://www.porteaperteitalia.org', logo: 'clients/porte-aperte-italia.png' },
    { name: 'Roots Lugano', tag: 'food & beverage', url: 'https://rootslugano.ch', logo: 'clients/roots-lugano.png' },
    { name: 'Ristocasa', tag: 'private dining · food', url: 'https://www.ristocasa.ch', logo: 'clients/ristocasa.png' },
    { name: 'Enos', tag: 'engineering & manufacturing', url: 'https://www.enositalia.com', logo: 'clients/enos.png' },
    { name: 'Pravernara', tag: 'no profit', url: 'https://www.pravernara.it', logo: 'clients/pravernara.svg' },
  ];

  protected readonly backstage: BackstageShot[] = [
    { src: 'about/backstage-azienda.jpg', alt: 'Riprese video in azienda, con la camera a mano accanto a una vetrata', caption: 'riprese in azienda' },
    { src: 'about/backstage-studio.jpg', alt: 'Shooting fotografico in studio, davanti a un softbox', caption: 'shooting in studio' },
    { src: 'about/backstage-intervista.jpg', alt: 'Il team Level One visto di spalle durante le riprese di un\'intervista', caption: 'set intervista' },
    { src: 'about/backstage-set.jpg', alt: 'Il team Level One sul set, con camera video e fotografica in mano', caption: 'sul set, in due' },
  ];

  private frame = 0;
  private intervalId?: ReturnType<typeof setInterval>;
  private revealObserver?: IntersectionObserver;
  private cursorCleanup?: () => void;

  constructor(private readonly hostRef: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      this.timecode.set('00:00:14:07');
      return;
    }

    this.intervalId = setInterval(() => {
      this.frame++;
      const f = this.frame % 25;
      const totalSeconds = Math.floor(this.frame / 25);
      const s = totalSeconds % 60;
      const m = Math.floor(totalSeconds / 60) % 60;
      const h = Math.floor(totalSeconds / 3600);
      const pad = (n: number) => n.toString().padStart(2, '0');
      this.timecode.set(`${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`);
    }, 40);
  }

  ngAfterViewInit(): void {
    this.setupCursorDot();

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const targets = this.hostRef.nativeElement.querySelectorAll<HTMLElement>('.reveal');

    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    this.revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.revealObserver?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );

    targets.forEach((el) => this.revealObserver?.observe(el));
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.revealObserver?.disconnect();
    this.cursorCleanup?.();
  }

  /**
   * Cursore: pallino arancione che segue il mouse con un leggero ritardo e si
   * allunga nella direzione del movimento. Su touch nessun pallino: ogni tap
   * lascia un cerchio che si espande nel punto toccato.
   */
  private setupCursorDot(): void {
    if (typeof window === 'undefined') return;

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
