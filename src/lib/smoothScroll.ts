import type Lenis from "lenis";

/**
 * Punto único de acceso a la instancia de Lenis.
 *
 * Hay una sola instancia para toda la página, montada en <SmoothScroll />, y
 * componentes que no son sus hijos —el modal, sin ir más lejos, que se pinta
 * en un portal en <body>— necesitan poder pausarla. Un módulo con estado
 * evita tener que envolver el árbol entero en un contexto solo para esto.
 *
 * Cuando el usuario tiene activo prefers-reduced-motion no hay instancia y
 * todas estas funciones no hacen nada, que es justo lo que debe pasar: el
 * scroll es el nativo del navegador.
 */

let instance: Lenis | null = null;

/*
  Cuántas capas piden ahora mismo que el scroll suave esté detenido. Se cuenta
  en vez de guardar un booleano para que, si algún día hay dos capas pidiéndolo
  a la vez, cerrar una no reanude el scroll mientras la otra sigue abierta.
*/
let pauseCount = 0;

export function registerLenis(next: Lenis | null) {
  instance = next;
  // Una instancia nueva nace corriendo: si algo la tenía pausada, se respeta.
  if (instance && pauseCount > 0) instance.stop();
}

/** Detiene el scroll suave. Cada llamada exige su resumeSmoothScroll(). */
export function pauseSmoothScroll() {
  pauseCount += 1;
  if (pauseCount === 1) instance?.stop();
}

/** Reanuda el scroll suave cuando ya nadie lo tiene pausado. */
export function resumeSmoothScroll() {
  pauseCount = Math.max(0, pauseCount - 1);
  if (pauseCount === 0) instance?.start();
}
