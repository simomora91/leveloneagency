import { Component, OnInit, OnDestroy, signal } from '@angular/core';

interface ServiceFrame {
  code: string;
  name: string;
  copy: string;
}

interface Client {
  name: string;
  tag: string;
}

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('leveloneagency');

  protected readonly timecode = signal('00:00:00:00');

  protected readonly services: ServiceFrame[] = [
    { code: 'F01', name: 'Video', copy: 'Produzioni corporate, eventi e contenuti social pensati per essere guardati fino alla fine.' },
    { code: 'F02', name: 'Foto', copy: 'Still aziendali e still eventi che raccontano un momento senza bisogno di didascalie.' },
    { code: 'F03', name: 'Social', copy: 'Gestione editoriale e community: contenuti che generano conversazioni vere, non solo impression.' },
    { code: 'F04', name: 'Eventi', copy: 'Copertura completa di eventi aziendali e privati, dal prima al dopo — non solo scatti.' },
    { code: 'F05', name: 'Siti Web', copy: 'Siti su misura che convertono i visitatori in clienti, veloci e semplici da gestire.' },
    { code: 'F06', name: 'Voice Over', copy: 'Speakeraggio e doppiaggio pubblicitario per dare al messaggio il tono giusto.' },
    { code: 'F07', name: 'Formazione', copy: 'Percorsi su voce, dizione, foto, video e social per chi vuole imparare a comunicare da solo.' },
    { code: 'F08', name: 'Strategia', copy: 'Consulenza e partnership con agenzie per costruire una presenza digitale che dura.' },
  ];

  protected readonly clients: Client[] = [
    { name: 'Tiba Ticino', tag: 'riscaldamento · impiantistica' },
    { name: 'Arcademy', tag: 'counseling · no profit' },
    { name: 'D&A Impianti Elettrici', tag: 'impiantistica' },
    { name: 'Cornerstone Music Gear', tag: 'prodotti musicali' },
    { name: 'Porte Aperte Italia', tag: 'no profit' },
    { name: 'Roots Lugano', tag: 'food & beverage' },
  ];

  private frame = 0;
  private intervalId?: ReturnType<typeof setInterval>;

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

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
