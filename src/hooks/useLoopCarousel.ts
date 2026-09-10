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

/*
  Arrastre con puntero.

  UMBRAL: cuánto se puede mover el puntero entre pulsar y soltar para que
  siga contando como clic. Por debajo navega el enlace de la tarjeta; por
  encima fue un arrastre y el clic se anula. 6px es el margen que deja el
  temblor de la mano al pulsar sin llegar a parecer un gesto.

  ROZAMIENTO: cuánto conserva la velocidad en cada fotograma de 60Hz. Se
  normaliza por el tiempo real transcurrido, así que la inercia dura lo mismo
  en una pantalla de 60Hz que en una de 120.

  VELOCIDAD MÍNIMA: por debajo de esto, en px/ms, la inercia se da por
  terminada. Con menos, el movimiento ya no se percibe y solo retrasa el
  reenganche del scroll-snap.
*/
const DRAG_CLICK_THRESHOLD = 6;

/*
  AVANCE AUTOMÁTICO.

  VELOCIDAD en píxeles por segundo. 24 es deliberadamente lento: el carrusel
  tiene que leerse como que respira, no como que se mueve. A esta velocidad una
  tarjeta de 350px tarda unos quince segundos en cruzar.

  ESPERA: cuánto se queda quieto tras la última interacción del usuario —un
  arrastre, una flecha— antes de retomar el avance. Menos y se siente que pelea
  con quien está mirando.
*/
const AUTOPLAY_SPEED = 24;
const AUTOPLAY_RESUME_DELAY = 2000;
const DRAG_FRICTION = 0.94;
const DRAG_MIN_VELOCITY = 0.02;

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
  /*
    Puente entre lo que hace el usuario y el avance automático. Lo rellena el
    efecto de autoplay y lo llaman el arrastre y las flechas: así ninguno de los
    dos necesita saber si hay autoplay ni cómo está montado.
  */
  const interaccionRef = useRef<(() => void) | null>(null);
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

  /*
    Arrastre con el puntero.

    Solo para ratón y lápiz: si el pointerType es "touch" no se hace nada y el
    desplazamiento táctil sigue siendo el nativo del navegador, que ya funciona
    y se comporta mejor que cualquier arrastre reimplementado. Son eventos de
    puntero, no dos juegos de listeners de ratón y de tacto.

    Al soltar, el desplazamiento continúa con inercia: se guarda la velocidad
    del último tramo del gesto y se va agotando por rozamiento. Con
    prefers-reduced-motion activo no hay inercia: el carrusel se para donde se
    soltó.

    scroll-snap desactivado mientras dura el gesto y la inercia. Si no, el
    navegador tira de cada parada a mitad del arrastre y pelea con el scrollLeft
    que escribimos nosotros. Se restaura al terminar, y ahí sí engancha a la
    parada más cercana, que es lo que se quiere.

    El bucle infinito sigue funcionando durante todo esto sin tocar nada: el
    listener de scroll del efecto de arriba se dispara igual, lo escriba el
    usuario o lo escribamos nosotros.
  */
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    /* Botón pulsado, todavía sin saber si es clic o arrastre. */
    let pulsado = false;
    /* Ya cruzó el umbral: es un arrastre. */
    let arrastrando = false;
    let recorrido = 0;
    let lastX = 0;
    let lastTime = 0;
    let velocity = 0;
    let frame = 0;
    let snapAnterior = "";
    /* Lo pone el final del arrastre y lo consume el click que viene detrás. */
    let cancelarClic = false;

    const pararInercia = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const restaurarSnap = () => {
      scroller.style.scrollSnapType = snapAnterior;
    };

    const soltarGesto = () => {
      /*
        La selección de texto se bloquea en el documento y no en el carrusel: el
        gesto puede acabar con el puntero fuera de él, y ahí el navegador seguía
        pintando selección.
      */
      document.documentElement.style.userSelect = "";
      document.documentElement.style.cursor = "";
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch" || event.button !== 0) return;

      pararInercia();
      interaccionRef.current?.();
      pulsado = true;
      arrastrando = false;
      cancelarClic = false;
      recorrido = 0;
      velocity = 0;
      lastX = event.clientX;
      lastTime = event.timeStamp;
    };

    /*
      El arrastre no empieza al pulsar, sino al cruzar el umbral.

      Es lo que separa un clic de un gesto, y no es solo cosmético: la captura
      de puntero REDIRIGE al elemento que captura todos los eventos que vengan
      detrás, incluidos el mouseup y el click. Capturando desde el pointerdown,
      el click de una tarjeta acababa dirigido al <ul> en lugar de a su <a> y el
      enlace no navegaba nunca. Capturando solo cuando ya hay gesto, un clic
      normal no pasa por aquí y llega intacto a la tarjeta.
    */
    const empezarArrastre = (event: PointerEvent) => {
      arrastrando = true;
      snapAnterior = scroller.style.scrollSnapType;
      scroller.style.scrollSnapType = "none";
      scroller.setPointerCapture(event.pointerId);
      document.documentElement.style.userSelect = "none";
      document.documentElement.style.cursor = "grabbing";
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!pulsado) return;

      const dx = event.clientX - lastX;
      const dt = Math.max(1, event.timeStamp - lastTime);

      recorrido += Math.abs(dx);
      lastX = event.clientX;
      lastTime = event.timeStamp;

      if (!arrastrando) {
        if (recorrido <= DRAG_CLICK_THRESHOLD) return;
        empezarArrastre(event);
      }

      /*
        behavior "instant" y no una asignación a scrollLeft: la clase
        motion-safe:scroll-smooth pone scroll-behavior: smooth en el elemento, y
        con él cada escritura se convierte en una animación propia. El arrastre
        dejaba de seguir al puntero —de 260px de gesto llegaban 72 al scroll— y
        el resto se arrastraba con retraso.
      */
      scroller.scrollBy({ left: -dx, behavior: "instant" });
      velocity = dx / dt;
    };

    const terminar = (event?: PointerEvent) => {
      if (!pulsado) return;
      pulsado = false;

      if (!arrastrando) return;
      arrastrando = false;

      if (event && scroller.hasPointerCapture(event.pointerId)) {
        scroller.releasePointerCapture(event.pointerId);
      }
      soltarGesto();
      interaccionRef.current?.();

      /* Hubo gesto: el enlace de la tarjeta no debe navegar al soltar. */
      cancelarClic = true;

      if (prefersReducedMotion || Math.abs(velocity) < DRAG_MIN_VELOCITY) {
        restaurarSnap();
        return;
      }

      let v = velocity;
      let anterior = performance.now();
      const paso = (ahora: number) => {
        const dt = Math.max(1, ahora - anterior);
        anterior = ahora;

        scroller.scrollBy({ left: -v * dt, behavior: "instant" });
        v *= Math.pow(DRAG_FRICTION, dt / 16.67);

        if (Math.abs(v) > DRAG_MIN_VELOCITY) {
          frame = requestAnimationFrame(paso);
        } else {
          frame = 0;
          restaurarSnap();
        }
      };
      frame = requestAnimationFrame(paso);
    };

    const onClickCapture = (event: MouseEvent) => {
      if (!cancelarClic) return;
      cancelarClic = false;
      event.preventDefault();
      event.stopPropagation();
    };

    /* Sin esto, arrastrar sobre una foto la arrastra como si fuera un archivo. */
    const onDragStart = (event: Event) => event.preventDefault();

    /* Si el botón se suelta fuera de la ventana, el gesto termina igual. */
    const onWindowBlur = () => terminar();

    /*
      Cursor en reposo sobre la zona arrastrable. Va en el <ul> y no en las
      tarjetas, así que los <a> conservan el suyo de enlace: el cursor no se
      hereda cuando el elemento ya tiene uno propio, y a un a[href] se lo pone
      la hoja del navegador.
    */
    const cursorAnterior = scroller.style.cursor;
    scroller.style.cursor = "grab";

    scroller.addEventListener("pointerdown", onPointerDown);
    scroller.addEventListener("pointermove", onPointerMove);
    scroller.addEventListener("pointerup", terminar);
    scroller.addEventListener("pointercancel", terminar);
    scroller.addEventListener("click", onClickCapture, true);
    scroller.addEventListener("dragstart", onDragStart);
    window.addEventListener("blur", onWindowBlur);

    return () => {
      pararInercia();
      soltarGesto();
      scroller.style.cursor = cursorAnterior;
      scroller.removeEventListener("pointerdown", onPointerDown);
      scroller.removeEventListener("pointermove", onPointerMove);
      scroller.removeEventListener("pointerup", terminar);
      scroller.removeEventListener("pointercancel", terminar);
      scroller.removeEventListener("click", onClickCapture, true);
      scroller.removeEventListener("dragstart", onDragStart);
      window.removeEventListener("blur", onWindowBlur);
    };
  }, [prefersReducedMotion]);

  /*
    Avance automático.

    Se mueve escribiendo píxeles enteros cada fotograma y guardando el resto
    fraccionario, no reposicionando de tarjeta en tarjeta: el movimiento es
    continuo. El bucle infinito no se entera de la diferencia, porque lo que
    dispara la recolocación es el evento de scroll, lo escriba quien lo escriba.

    PAUSAS. Son un conjunto de motivos, no un booleano: el puntero encima, el
    foco de teclado dentro, una interacción reciente y la sección fuera de
    pantalla se solapan constantemente —se sale con el puntero mientras el foco
    sigue dentro, por ejemplo— y con una sola bandera cada uno pisaría al
    anterior. Avanza solo cuando no queda ningún motivo.

    Arranca pausado por "fuera" y es el IntersectionObserver quien lo suelta:
    así una sección que nace fuera de pantalla no gasta fotogramas.

    SCROLL-SNAP desactivado mientras el autoplay está montado. Un snap
    obligatorio y un avance continuo son incompatibles por definición: el
    navegador tiraría de cada parada. Se restaura al desmontar, y con
    prefers-reduced-motion no llega a tocarse porque el efecto sale antes.

    Con prefers-reduced-motion no hay avance: el efecto no monta nada y el
    carrusel solo se mueve por acción del usuario.
  */
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || prefersReducedMotion) return;

    const motivos = new Set<string>();
    let frame = 0;
    let anterior = 0;
    let resto = 0;
    let temporizador = 0;

    const snapAnterior = scroller.style.scrollSnapType;
    scroller.style.scrollSnapType = "none";

    const paso = (ahora: number) => {
      /* Tope al delta: si la pestaña estuvo en segundo plano, no salta. */
      const dt = Math.min(64, ahora - anterior);
      anterior = ahora;

      resto += (AUTOPLAY_SPEED * dt) / 1000;
      const entero = Math.trunc(resto);
      if (entero) {
        resto -= entero;
        scroller.scrollBy({ left: entero, behavior: "instant" });
      }

      frame = requestAnimationFrame(paso);
    };

    const arrancar = () => {
      if (frame || motivos.size > 0) return;
      anterior = performance.now();
      resto = 0;
      frame = requestAnimationFrame(paso);
    };

    const pausar = (motivo: string) => {
      motivos.add(motivo);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const reanudar = (motivo: string) => {
      motivos.delete(motivo);
      arrancar();
    };

    /* Arrastre y flechas entran por aquí: paran y rearman la espera. */
    const marcarInteraccion = () => {
      pausar("interaccion");
      window.clearTimeout(temporizador);
      temporizador = window.setTimeout(
        () => reanudar("interaccion"),
        AUTOPLAY_RESUME_DELAY,
      );
    };
    interaccionRef.current = marcarInteraccion;

    const onPointerEnter = () => pausar("puntero");
    const onPointerLeave = () => reanudar("puntero");
    const onFocusIn = () => pausar("foco");
    /*
      relatedTarget es a dónde va el foco. Si sigue dentro del carrusel —de una
      tarjeta a la siguiente— no se reanuda: el foco no ha salido.
    */
    const onFocusOut = (event: FocusEvent) => {
      const destino = event.relatedTarget;
      if (destino instanceof Node && scroller.contains(destino)) return;
      reanudar("foco");
    };

    scroller.addEventListener("pointerenter", onPointerEnter);
    scroller.addEventListener("pointerleave", onPointerLeave);
    scroller.addEventListener("focusin", onFocusIn);
    scroller.addEventListener("focusout", onFocusOut);

    motivos.add("fuera");
    const observer = new IntersectionObserver(([entrada]) => {
      if (entrada.isIntersecting) reanudar("fuera");
      else pausar("fuera");
    });
    observer.observe(scroller);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.clearTimeout(temporizador);
      observer.disconnect();
      interaccionRef.current = null;
      scroller.style.scrollSnapType = snapAnterior;
      scroller.removeEventListener("pointerenter", onPointerEnter);
      scroller.removeEventListener("pointerleave", onPointerLeave);
      scroller.removeEventListener("focusin", onFocusIn);
      scroller.removeEventListener("focusout", onFocusOut);
    };
  }, [prefersReducedMotion]);

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

      interaccionRef.current?.();

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
