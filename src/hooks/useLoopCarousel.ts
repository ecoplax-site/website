"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type RefObject,
} from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/**
 * Carrusel horizontal en bucle continuo, sin librería.
 *
 * Es la mecánica que estrenó la sección Materiales, extraída tal cual para que
 * la comparta con Noticias: medida del bloque, recolocación del scroll y paso
 * por tarjeta. Lo que NO entra aquí es la presentación —anchos de tarjeta,
 * medianiles, sangrado— porque cada sección la resuelve distinto: Materiales va
 * a sangre completa y Noticias dentro de una tarjeta de sección.
 *
 * Cómo funciona el bucle: la lista real se repite `loopRepeat` veces seguidas,
 * el scroll arranca en el bloque del centro y, en cuanto se aleja del ancla más
 * de un bloque entero, se le resta ese bloque. Como todos los bloques son
 * idénticos y el salto es un múltiplo exacto del paso de tarjeta, la imagen en
 * pantalla es la misma antes y después: el salto no se ve.
 */

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Marca cada tarjeta del carrusel. Lo lee la medición del bloque. */
export const CAROUSEL_CARD_ATTR = "data-carousel-card";

const CARD_SELECTOR = `[${CAROUSEL_CARD_ATTR}]`;

/*
  El scroll inicial y los saltos de bucle se escriben antes de que el navegador
  pinte, para que nunca se vea el carrusel colocado en otro sitio.
  useLayoutEffect no existe en servidor —React avisaría por consola—, así que
  allí se degrada a useEffect, que no llega a ejecutarse.
*/
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Cuántas veces hay que repetir la lista.
 *
 * Por cada lado del ancla tiene que haber al menos un ancho de ventana de
 * tarjetas —para que nunca aparezca hueco— más un bloque de margen, que es el
 * recorrido que se deja andar antes de saltar. En bloques:
 * K = techo(viewportToContent * tarjetasPorVista / tarjetas) y repeticiones
 * = 2K + 1.
 *
 * @param itemCount          tarjetas reales de la lista.
 * @param cardsPerView       las que caben a la vez en el breakpoint más ancho.
 * @param viewportToContent  cuánto mide la ventana en anchos de contenido del
 *   carrusel. 1 cuando el carrusel no desborda su contenedor; mayor cuando va
 *   a sangre y asoman tarjetas por los lados.
 */
export function computeLoopRepeat(
  itemCount: number,
  cardsPerView: number,
  viewportToContent = 1,
) {
  return (
    2 * Math.max(1, Math.ceil((viewportToContent * cardsPerView) / itemCount)) +
    1
  );
}

/**
 * Bloque que representa a los elementos de verdad: el del centro, que es el que
 * se ve al cargar. Todos los demás son copias visuales y deben ir con
 * aria-hidden e inert, así que un lector anuncia exactamente `itemCount`
 * elementos y el recorrido por teclado no entra en ellas.
 */
export function realBlockIndex(loopRepeat: number) {
  return Math.floor(loopRepeat / 2);
}

/** Aplana la lista repetida que se pinta, con su índice de bloque. */
export function buildLoopedItems<T>(items: readonly T[], loopRepeat: number) {
  return Array.from({ length: loopRepeat }, (_, blockIndex) =>
    items.map((item) => ({ item, blockIndex })),
  ).flat();
}

/** Ancho de un bloque en píxeles y posición de scroll del bloque central. */
type LoopGeometry = { block: number; anchor: number };

function measureLoop(
  scroller: HTMLElement,
  itemCount: number,
  centerBlock: number,
): LoopGeometry | null {
  const cards = scroller.querySelectorAll<HTMLElement>(CARD_SELECTOR);
  const first = cards[0];
  /* Primera tarjeta del segundo bloque: la distancia entre ambas es el bloque. */
  const nextBlockStart = cards[itemCount];
  if (!first || !nextBlockStart) return null;

  const block = nextBlockStart.offsetLeft - first.offsetLeft;
  if (block <= 0) return null;

  return { block, anchor: centerBlock * block };
}

/*
  Devuelve el scroll a la ventana [ancla - bloque, ancla + bloque] si se ha
  salido de ella. El salto es de un número entero de bloques, así que sirve
  igual para un arrastre lento que para un golpe de rueda que cruza varios de
  una vez.

  behavior "instant" es imprescindible: la clase motion-safe:scroll-smooth pone
  scroll-behavior: smooth en el elemento, y sin esto el reposicionamiento se
  animaría y se vería.
*/
function keepInLoop(scroller: HTMLElement, { block, anchor }: LoopGeometry) {
  const delta = scroller.scrollLeft - anchor;
  if (Math.abs(delta) < block) return;

  const shift = Math.trunc(delta / block) * block;
  scroller.scrollTo({ left: scroller.scrollLeft - shift, behavior: "instant" });
}

type UseLoopCarouselOptions = {
  /** Tarjetas reales de la lista, sin contar las copias del bucle. */
  itemCount: number;
  /** El que devuelve realBlockIndex() para el mismo loopRepeat de la lista. */
  centerBlock: number;
};

export function useLoopCarousel<T extends HTMLElement>({
  itemCount,
  centerBlock,
}: UseLoopCarouselOptions): {
  scrollerRef: RefObject<T | null>;
  scrollByCard: (direction: 1 | -1) => void;
} {
  const scrollerRef = useRef<T>(null);
  /*
    La geometría se mide una vez y se guarda en una ref, no en estado: el
    listener de scroll la consulta en cada evento y leer offsetLeft ahí forzaría
    un recálculo de layout en cada fotograma del desplazamiento.
  */
  const loopRef = useRef<LoopGeometry | null>(null);
  const prefersReducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);

  useIsomorphicLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    /*
      Mide y coloca el carrusel en el bloque central. Se ejecuta al montar y
      cada vez que cambia el ancho: las tarjetas miden un porcentaje del
      contenedor, así que al redimensionar cambia el tamaño del bloque y el
      ancla anterior deja de valer.
    */
    const settle = () => {
      const geometry = measureLoop(scroller, itemCount, centerBlock);
      loopRef.current = geometry;
      if (geometry) {
        scroller.scrollTo({ left: geometry.anchor, behavior: "instant" });
      }
    };

    /*
      El salto se hace DURANTE el scroll, no al terminarlo: en el propio evento,
      que llega en cada fotograma del desplazamiento. Esperar a que el scroll
      pare dejaría ver el hueco del final.
    */
    const handleScroll = () => {
      const geometry = loopRef.current;
      if (geometry) keepInLoop(scroller, geometry);
    };

    settle();
    scroller.addEventListener("scroll", handleScroll, { passive: true });
    const resizeObserver = new ResizeObserver(settle);
    resizeObserver.observe(scroller);

    return () => {
      scroller.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    };
  }, [itemCount, centerBlock]);

  /**
   * Desplaza el carrusel una tarjeta en la dirección indicada.
   *
   * El paso se mide del DOM —distancia entre el inicio de una tarjeta y el de
   * la siguiente, que ya incluye el gap— en lugar de recalcular los anchos en
   * JavaScript: así el ancho vive en un solo sitio, el CSS de cada sección.
   */
  const scrollByCard = useCallback(
    (direction: 1 | -1) => {
      const scroller = scrollerRef.current;
      if (!scroller) return;

      /*
        Recolocar ANTES de animar, no durante. Si el salto de bucle cayera a
        mitad de un desplazamiento suave, escribir scrollLeft cancelaría la
        animación del navegador y el movimiento se cortaría a medias. Hecho
        antes, la animación arranca ya dentro de la ventana segura y un paso de
        una tarjeta nunca alcanza a salirse de ella.
      */
      const geometry = loopRef.current;
      if (geometry) keepInLoop(scroller, geometry);

      const cards = scroller.querySelectorAll<HTMLElement>(CARD_SELECTOR);
      const firstCard = cards[0];
      if (!firstCard) return;

      const step =
        cards.length > 1
          ? cards[1].offsetLeft - firstCard.offsetLeft
          : firstCard.offsetWidth;

      scroller.scrollBy({
        left: direction * step,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    },
    [prefersReducedMotion],
  );

  return { scrollerRef, scrollByCard };
}
