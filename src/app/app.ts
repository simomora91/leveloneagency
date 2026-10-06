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
  }
}
