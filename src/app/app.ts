import {
  Component,
  signal,
  viewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements AfterViewInit {
  protected readonly title = signal('leveloneagency');

  protected readonly words = [
    'Video', 'Foto', 'Social', 'Eventi',
    'Branding', 'Voice Over', 'Formazione', 'Strategia',
  ];

  private readonly list = viewChild<ElementRef<HTMLUListElement>>('list');

  ngAfterViewInit(): void {
    const el = this.list()?.nativeElement;
    if (!el) return;

    el.addEventListener(
      'wheel',
      (e: WheelEvent) => {
        const atTop = el.scrollTop === 0;
        const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
        // ai bordi lascia scorrere la pagina (verso i contatti)
        if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) return;
        e.preventDefault();
        el.scrollTop += e.deltaY;
      },
      { passive: false }
    );
  }
}
