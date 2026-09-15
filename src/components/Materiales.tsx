"use client";

import CarouselControls from "@/components/CarouselControls";
import { sectionTypography } from "@/components/Section";
import {
  buildLoopedItems,
  computeLoopRepeat,
  realBlockIndex,
  useLoopCarousel,
} from "@/hooks/useLoopCarousel";
import { materialesContent } from "@/content/materiales";

/**
 * Sección de materiales con carrusel de scroll horizontal nativo, sin librería.
 *
 * El carrusel hace bucle continuo: no tiene principio ni final. Es un
 * componente de cliente porque eso exige leer y reescribir el scroll en el
 * navegador. El resto de secciones sigue siendo de servidor.
 *
 * A diferencia del resto de secciones, esta no es una tarjeta: no usa el
 * componente Section. Su contenido va directamente sobre el fondo de página
 * (surface-base), sin fondo propio, sin radio y sin margen lateral de tarjeta.
 * Conserva el ritmo vertical de Section —mt-6/sm:mt-10 más py-12/sm:py-16— para
 * que la separación con la sección anterior y con el footer no cambie, y reutiliza su escala
 * tipográfica. El <h2> es propio, dentro del encabezado del carrusel.
 */

/** Ancla del aria-controls de los botones. */
const SCROLLER_ID = "materiales-carrusel";

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
  alinea el texto de Materiales con el de las secciones que sí son tarjeta: 40px
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
  carrusel al cambiar de tamaño. Con los 4 materiales de hoy sale K=2 y 5
  bloques; cuando la lista real crezca, N sube, K baja y el número de duplicados
  se ajusta solo. No hay nada que tocar a mano.
*/
const VIEWPORT_TO_CONTENT = 1.25;

const MATERIAL_COUNT = materialesContent.materiales.length;

const LOOP_REPEAT = computeLoopRepeat(
  MATERIAL_COUNT,
  CARDS_PER_VIEW.lg,
  VIEWPORT_TO_CONTENT,
);

/*
  Bloque que representa a los materiales de verdad: el del centro, que es el que
  se ve al cargar. Todos los demás son copias visuales y van marcadas con
  aria-hidden e inert, así que un lector de pantalla anuncia exactamente
  MATERIAL_COUNT materiales y el recorrido por teclado no entra en ellas.
*/
const REAL_BLOCK_INDEX = realBlockIndex(LOOP_REPEAT);

/*
  Lista aplanada que se pinta. Se calcula una sola vez al cargar el módulo: no
  depende de nada del navegador.
*/
const LOOPED_MATERIALES = buildLoopedItems(
  materialesContent.materiales,
  LOOP_REPEAT,
);

export default function Materiales() {
  const { scrollerRef, scrollByCard } = useLoopCarousel<HTMLUListElement>({
    itemCount: MATERIAL_COUNT,
    centerBlock: REAL_BLOCK_INDEX,
  });
  /*
    Sin tarjeta: ni fondo, ni radio, ni margen lateral. Se conserva el ritmo
    vertical que ponía Section —el mt- de separación entre secciones y el py- de
    la tarjeta— para que el hueco con la sección anterior y con el footer no se mueva.
  */
  return (
    <section id="materiales" className="mt-6 py-12 sm:mt-10 sm:py-16">
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
            {materialesContent.eyebrow}
          </p>
          <h2 className={`${sectionTypography.heading} text-ink`}>
            {materialesContent.headline}
          </h2>
          <p
            className={`mx-auto max-w-2xl ${sectionTypography.body} text-ink-soft`}
          >
            {materialesContent.intro}
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
            aria-label={materialesContent.carouselLabel}
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
            className={`flex list-none snap-x snap-mandatory gap-4 overflow-x-auto motion-safe:scroll-smooth ${CAROUSEL_GUTTER} ${HIDDEN_SCROLLBAR}`}
          >
            {LOOPED_MATERIALES.map(({ item: material, blockIndex }) => {
              /*
              Solo el bloque central cuenta como contenido: el resto son copias
              para que el bucle no enseñe hueco. aria-hidden las saca del árbol
              accesible —un lector anuncia los materiales reales y ni uno más— e
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
                  key={`${blockIndex}-${material.name}`}
                  data-carousel-card
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

                PENDIENTE fotografía del material.
                Al recibirla: <Image src={...} alt={...} fill className="object-cover" />
              */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-surface-muted"
                    />
                  </div>

                  <h3 className="font-heading text-lg font-semibold text-ink">
                    {material.name}
                  </h3>

                  {/*
                Descripción en texto corrido. Hereda el text-center de la
                tarjeta, así que queda centrada igual que el nombre. ink-soft
                sobre el fondo de página (surface-base) mide 8.6:1.
              */}
                  <p className="font-body text-sm text-ink-soft">
                    {material.description}
                  </p>
                </li>
              );
            })}
          </ul>

          <CarouselControls
            controls={SCROLLER_ID}
            previousLabel={materialesContent.previousLabel}
            nextLabel={materialesContent.nextLabel}
            onStep={scrollByCard}
            className={CONTENT_GUTTER}
          />
        </div>
      </div>
    </section>
  );
}
