/** Scorrimento morbido verso una sezione della pagina corrente (es. i contatti, presenti su ogni pagina). */
export function scrollToSection(event: Event, id: string): void {
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const top = target.getBoundingClientRect().top + window.scrollY - 76;
  window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
}
