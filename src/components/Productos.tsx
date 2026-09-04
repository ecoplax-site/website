"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { sectionTypography } from "@/components/Section";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { productosContent } from "@/content/productos";

/**
 * Sección de productos con carrusel de scroll horizontal nativo, sin librería.
 *
 * El carrusel hace bucle continuo: no tiene principio ni final. Es un
 * componente de cliente porque eso exige leer y reescribir el scroll en el
 * navegador. El resto de secciones sigue siendo de servidor.
 *
 * A diferencia del resto de secciones, esta no es una tarjeta: no usa el
 * componente Section. Su contenido va directamente sobre el fondo de página
 * (surface-base), sin fondo propio, sin radio y sin margen lateral de tarjeta.
 * Conserva el ritmo vertical de Section —mt-6/sm:mt-10 más py-12/sm:py-16— para
 * que la separación con Origen y con el footer no cambie, y reutiliza su escala
 * tipográfica. El <h2> es propio, dentro del encabezado del carrusel.
 */

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Ancla del aria-controls de los botones. */
const SCROLLER_ID = "productos-carrusel";

/*
  El scroll inicial y los saltos de bucle se escriben antes de que el navegador
  pinte, para que nunca se vea el carrusel colocado en otro sitio. useLayoutEffect
  no existe en servidor —React avisaría por consola—, así que en servidor se
  degrada a useEffect, que allí no llega a ejecutarse.
*/
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/*
  Tarjetas completas que caben en el ancho de CONTENIDO del carrusel —el ancho
  visible menos su padding lateral— en cada breakpoint: 2 en móvil, 3 en tablet
  y 4 en escritorio.

  Son números enteros a propósito, y de ahí sale el corte a ambos lados. Como el
  scroll-snap alinea cada parada con el borde del contenido (scroll-pl), en toda
  parada el ancho visible se reparte así:

      [padding][ n tarjetas completas + (n-1) huecos ][padding]
       corte izq.        ancho de contenido            corte der.

  Es decir: los dos paddings del carrusel SON los dos cortes, y por eso miden
  exactamente lo mismo. En escritorio eso da 4 tarjetas completas al centro y
  64px de tarjeta asomando por cada lado; en tablet 3 y 64px; en móvil 2 y 40px.
*/
const CARDS_PER_VIEW = { base: 2, md: 3, lg: 4 } as const;

/*
  Traducción de lo anterior a clases. Cada fórmula reparte el 100% del ancho de
  contenido entre n tarjetas descontando los (n-1) gap-4 (1rem) que quedan entre
  ellas. Si cambia CARDS_PER_VIEW, cambian estos tres valores con él.
*/
const CARD_WIDTH =
  "w-[calc((100%_-_1rem)/2)] md:w-[calc((100%_-_2rem)/3)] lg:w-[calc((100%_-_3rem)/4)]";

/*
  Medianil de contenido. Al desaparecer la tarjeta de sección, este es el que
  alinea el texto de Productos con el de las secciones que sí son tarjeta: 40px
  en móvil (px-4 del contenedor de Section + px-6 de la tarjeta) y 64px de sm en
  adelante (px-6 + px-10). Si esas medidas cambian en Section, cambian aquí.
*/
const CONTENT_GUTTER = "px-10 sm:px-16";

/*
  El carrusel es el único bloque a sangre: su caja ocupa todo el ancho de la
  ventana y desborda por igual a izquierda y derecha del medianil, de modo que
  las tarjetas parciales llegan al borde en lugar de cortarse antes.

  El padding propio, del tamaño del medianil y en ambos lados, es lo que produce
  los dos cortes: en cualquier parada del bucle asoma por cada borde exactamente
  esa medida de la tarjeta vecina. Al ser el mismo valor a izquierda y derecha,
  los dos cortes son simétricos.

  scroll-pl acompaña al padding izquierdo: sin él, el scroll-snap alinearía cada
  tarjeta con el borde de la ventana en lugar de con el borde del contenido, y
  cada parada quedaría medio palmo a la izquierda de donde debe.
*/
const CAROUSEL_GUTTER = "px-10 scroll-pl-10 sm:px-16 sm:scroll-pl-16";

/*
  Barra de scroll oculta sin desactivar el scroll: scrollbar-width para Firefox
  y el pseudoelemento para los navegadores WebKit. Tailwind no trae utilidad
  propia para esto.
*/
const HIDDEN_SCROLLBAR = "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

/*
  Sin estado deshabilitado: en un carrusel en bucle no hay extremo al que
  llegar, así que los dos botones están siempre activos.
*/
const CONTROL_STYLES =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-raised text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

/*
  ============================ BUCLE INFINITO ============================

  La lista real se repite LOOP_REPEAT veces seguidas. El scroll arranca en el
  bloque del centro y, en cuanto se aleja del ancla más de un bloque entero, se
  reescribe scrollLeft restándole ese bloque. Como todos los bloques son
  idénticos y el salto es de un múltiplo exacto del paso de tarjeta, la imagen
  en pantalla es la misma antes y después: el salto no se ve, y el scroll-snap
  cae en la parada equivalente.

  Cuántas repeticiones hacen falta. Por cada lado del ancla tiene que haber al
  menos un ancho de ventana de tarjetas —para que nunca aparezca hueco— más un
  bloque de margen, que es el recorrido que se deja andar antes de saltar. En
  bloques: K = techo(ventana / bloque) y LOOP_REPEAT = 2K + 1.

  Un bloque mide N tarjetas y, como n tarjetas llenan el ancho de contenido, la
  ventana mide como mucho VIEWPORT_TO_CONTENT (el peor caso es el móvil de
  320px: 320/(320-2*40+16) = 1.25) veces ese ancho de contenido. De ahí:

      K = techo(VIEWPORT_TO_CONTENT * n / N)

  Se toma la n más grande de las tres —la de escritorio— para que el número de
  repeticiones sea uno solo en todos los breakpoints y no haya que remontar el
  carrusel al cambiar de tamaño. Con los 4 productos de hoy sale K=2 y 5
  bloques; cuando la lista real crezca, N sube, K baja y el número de duplicados
  se ajusta solo. No hay nada que tocar a mano.
*/
const VIEWPORT_TO_CONTENT = 1.25;

const PRODUCT_COUNT = productosContent.products.length;

const LOOP_REPEAT =
  2 *
    Math.max(
      1,
      Math.ceil((VIEWPORT_TO_CONTENT * CARDS_PER_VIEW.lg) / PRODUCT_COUNT),
    ) +
  1;

/*
  Bloque que representa a los productos de verdad: el del centro, que es el que
  se ve al cargar. Todos los demás son copias visuales y van marcadas con
  aria-hidden e inert, así que un lector de pantalla anuncia exactamente
  PRODUCT_COUNT productos y el recorrido por teclado no entra en ellas.
*/
const REAL_BLOCK_INDEX = Math.floor(LOOP_REPEAT / 2);

/*
  Lista aplanada que se pinta. Se calcula una sola vez al cargar el módulo: no
  depende de nada del navegador.
*/
const LOOPED_PRODUCTS = Array.from({ length: LOOP_REPEAT }, (_, blockIndex) =>
  productosContent.products.map((product) => ({ product, blockIndex })),
).flat();

/** Ancho de un bloque en píxeles y posición de scroll del bloque central. */
type LoopGeometry = { block: number; anchor: number };

function measureLoop(scroller: HTMLElement): LoopGeometry | null {
  const cards = scroller.querySelectorAll<HTMLElement>("[data-product-card]");
  const first = cards[0];
  /* Primera tarjeta del segundo bloque: la distancia entre ambas es el bloque. */
  const nextBlockStart = cards[PRODUCT_COUNT];
  if (!first || !nextBlockStart) return null;

  const block = nextBlockStart.offsetLeft - first.offsetLeft;
  if (block <= 0) return null;

  return { block, anchor: REAL_BLOCK_INDEX * block };
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

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={direction === "left" ? "M10 3L5 8l5 5" : "M6 3l5 5-5 5"} />
    </svg>
  );
}

export default function Productos() {
  const scrollerRef = useRef<HTMLUListElement>(null);
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
      const geometry = measureLoop(scroller);
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
  }, []);

  /**
   * Desplaza el carrusel una tarjeta en la dirección indicada.
   *
   * El paso se mide del DOM —distancia entre el inicio de una tarjeta y el de
   * la siguiente, que ya incluye el gap— en lugar de recalcular las fórmulas de
   * CARD_WIDTH en JavaScript: así el ancho vive en un solo sitio.
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

      const cards = scroller.querySelectorAll<HTMLElement>(
        "[data-product-card]",
      );
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

  /*
    Sin tarjeta: ni fondo, ni radio, ni margen lateral. Se conserva el ritmo
    vertical que ponía Section —el mt- de separación entre secciones y el py- de
    la tarjeta— para que el hueco con Origen y con el footer no se mueva.
  */
  return (
    <section id="productos" className="mt-6 py-12 sm:mt-10 sm:py-16">
      <div className="flex flex-col gap-10">
        {/*
          Encabezado centrado. items-center centra cada bloque y text-center
          centra el texto dentro de él; el ancho de lectura vive en el párrafo,
          para que el titular no quede recortado por esa misma medida.
        */}
        <div
          className={`flex flex-col items-center gap-3 text-center ${CONTENT_GUTTER}`}
        >
          <p className={`${sectionTypography.eyebrow} text-ink-soft`}>
            {productosContent.eyebrow}
          </p>
          <h2 className={`${sectionTypography.heading} text-ink`}>
            {productosContent.headline}
          </h2>
          <p
            className={`mx-auto max-w-2xl ${sectionTypography.body} text-ink-soft`}
          >
            {productosContent.intro}
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {/*
          role="list" explícito: al quitar los marcadores con list-none, WebKit
          deja de exponer la lista como tal. tabIndex la hace enfocable, que es
          lo que permite recorrerla con el teclado.

          El scroll suave va con motion-safe: con prefers-reduced-motion activo
          el movimiento desaparece también en el desplazamiento por teclado, no
          solo en el de los botones.
        */}
          <ul
            ref={scrollerRef}
            id={SCROLLER_ID}
            /*
            Lenis captura la rueda de toda la página y hace preventDefault, lo
            que mataría el desplazamiento horizontal del carrusel en cuanto el
            gesto de trackpad lleve algo de componente vertical. Este atributo
            le dice que se aparte solo cuando el gesto sea horizontal; los
            verticales los sigue atendiendo él, así que la página no se queda
            atrapada al pasar la rueda por encima del carrusel.

            La variante sin sufijo, data-lenis-prevent, no sirve aquí: aparta a
            Lenis en los dos ejes y su CSS le añade overscroll-behavior: contain.
            Como overflow-x-auto convierte también el eje vertical en auto, el
            carrusel absorbería la rueda vertical y la página dejaría de bajar.

            El desplazamiento por botones y por flechas es programático y nunca
            pasa por Lenis.
          */
            data-lenis-prevent-horizontal
            role="list"
            tabIndex={0}
            aria-label={productosContent.carouselLabel}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") {
                event.preventDefault();
                scrollByCard(1);
              }
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                scrollByCard(-1);
              }
            }}
            className={`flex list-none snap-x snap-mandatory gap-4 overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink motion-safe:scroll-smooth ${CAROUSEL_GUTTER} ${HIDDEN_SCROLLBAR}`}
          >
            {LOOPED_PRODUCTS.map(({ product, blockIndex }) => {
              /*
              Solo el bloque central cuenta como contenido: el resto son copias
              para que el bucle no enseñe hueco. aria-hidden las saca del árbol
              accesible —un lector anuncia los productos reales y ni uno más— e
              inert las saca del recorrido de tabulación y de la selección.
            */
              const isDuplicate = blockIndex !== REAL_BLOCK_INDEX;

              return (
                /*
              Clave por bloque y nombre: los nombres de ruta son únicos, así que
              identifican la tarjeta dentro de su bloque, y el bloque distingue
              entre las copias del bucle.
            */
                <li
                  key={`${blockIndex}-${product.name}`}
                  data-product-card
                  aria-hidden={isDuplicate || undefined}
                  inert={isDuplicate}
                  /*
                Sin fondo, sin borde y sin padding: el contenido va directo
                sobre el fondo de página. items-center y text-center centran
                tanto los bloques como el texto de cada uno.
              */
                  className={`flex shrink-0 snap-start flex-col items-center gap-4 text-center ${CARD_WIDTH}`}
                >
                  {/*
                El contenedor ya fija la proporción 1:1 y el radio de tarjeta
                hija (16px), y es relative para admitir <Image fill>. Sustituir
                el div interior por el <Image> no cambia el layout.

                surface-muted, no surface-raised: contra el fondo de página
                (surface-base) mist mide 1.06:1 y la caja desaparecía; pastel-gray
                mide 1.46:1, el máximo que da un token de superficie clara de la
                paleta, y es el único que deja ver la forma.

                PENDIENTE fotografía de producto.
                Al recibirla: <Image src={...} alt={...} fill className="object-cover" />
              */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-surface-muted"
                    />
                  </div>

                  <h3 className="font-heading text-lg font-semibold text-ink">
                    {product.name}
                  </h3>

                  {/*
                Descripción en texto corrido. Hereda el text-center de la
                tarjeta, así que queda centrada igual que el nombre. ink-soft
                sobre el fondo de página (surface-base) mide 8.6:1.
              */}
                  <p className="font-body text-sm text-ink-soft">
                    {product.description}
                  </p>
                </li>
              );
            })}
          </ul>

          {/*
            Controles debajo del carrusel y centrados: con el encabezado
            centrado ya no cabe anclarlos a su derecha. Van después del
            carrusel en el DOM, que además es el orden de lectura correcto
            —primero la región, luego lo que la gobierna—, y siguen
            apuntándole con aria-controls.
          */}
          <div className={`flex justify-center gap-2 ${CONTENT_GUTTER}`}>
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-controls={SCROLLER_ID}
              aria-label={productosContent.previousLabel}
              className={CONTROL_STYLES}
            >
              <ChevronIcon direction="left" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-controls={SCROLLER_ID}
              aria-label={productosContent.nextLabel}
              className={CONTROL_STYLES}
            >
              <ChevronIcon direction="right" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
