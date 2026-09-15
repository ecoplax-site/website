"use client";

import CarouselControls from "@/components/CarouselControls";
import { sectionTypography } from "@/components/Section";
import {
  buildLoopedItems,
  computeLoopRepeat,
  realBlockIndex,
  useLoopCarousel,
} from "@/hooks/useLoopCarousel";
import { noticiasContent, notaHref } from "@/content/noticias";

/**
 * Sección de últimas noticias: titular y carrusel de tarjetas de nota.
 *
 * No es una tarjeta de sección: igual que Materiales, su contenido va
 * directamente sobre el fondo de página, sin superficie propia, sin radio y sin
 * margen lateral de tarjeta. Conserva el ritmo vertical de Section
 * —mt-6/sm:mt-10 más py-12/sm:py-16— para que la separación con Materiales y con
 * el footer no cambie.
 *
 * La mecánica del bucle y las flechas son las mismas que las de Materiales, ya
 * compartidas en useLoopCarousel y CarouselControls. Lo propio de esta sección
 * es la presentación: el desbordamiento asimétrico y el tratamiento de la
 * tarjeta.
 */

/** Ancla del aria-controls de los botones. */
const SCROLLER_ID = "noticias-carrusel";

/*
  Medianil de contenido. El mismo que usa Materiales, que a su vez replica el que
  dejaría la tarjeta de Section: 40px en móvil y 64px de sm en adelante.
*/
const CONTENT_GUTTER = "px-10 sm:px-16";

/*
  ==================== DESBORDAMIENTO ASIMÉTRICO ====================

  El carrusel ocupa todo el ancho de la ventana, pero solo desborda por la
  DERECHA: lleva padding a la izquierda, del tamaño del medianil, y ninguno a la
  derecha. Así la primera tarjeta arranca alineada con el titular y la última
  visible se corta contra el borde de la ventana.

  scroll-pl acompaña al padding izquierdo: sin él, el scroll-snap alinearía cada
  parada con el borde de la ventana en lugar de con el del contenido.

  Como no hay padding derecho, el ancho de contenido del carrusel —el 100% al
  que se refieren las fórmulas de abajo— es la ventana menos el medianil
  izquierdo.
*/
const CAROUSEL_GUTTER = "pl-10 scroll-pl-10 sm:pl-16 sm:scroll-pl-16";

/*
  Tarjetas completas visibles, más la asomada.

  Los cortes están puestos donde la tarjeta deja de dar ancho suficiente para
  que el titular de la nota se lea sin romperse. Con el titular en text-xl/2xl,
  el suelo práctico está sobre los 195px de tarjeta: por debajo la línea baja de
  unos 13 caracteres y el título empieza a partir palabras y a dejar líneas
  huérfanas. Ancho de tarjeta en el peor caso de cada tramo, es decir en su
  viewport más estrecho:

    base   320px → 1 completa + asomada → 224px
    sm     640px → 2 completas          → 240px
    md     768px → 3 completas          → 197px
    lg    1024px → 4 completas          → 208px

  Ninguno baja del suelo. En escritorio ancho la tarjeta crece hasta 312px a
  1440px, que es la medida para la que está pensada la composición.
*/
const CARDS_PER_VIEW = { base: 1, sm: 2, md: 3, lg: 4 } as const;

/*
  Ancho de tarjeta. Cada fórmula reparte el 100% del ancho de contenido del
  carrusel entre n tarjetas completas descontando los n gap-4 (1rem) y el trozo
  que se deja para la tarjeta asomada, que mide lo mismo que el medianil: 2.5rem
  en móvil y 4rem de sm en adelante.

      100% = n tarjetas + n huecos + asomada

  Son n huecos y no (n-1) porque el hueco que separa la última tarjeta completa
  de la asomada también entra en la cuenta.
*/
const CARD_WIDTH = [
  "w-[calc(100%_-_1rem_-_2.5rem)]",
  "sm:w-[calc((100%_-_2rem_-_4rem)/2)]",
  "md:w-[calc((100%_-_3rem_-_4rem)/3)]",
  "lg:w-[calc((100%_-_4rem_-_4rem)/4)]",
].join(" ");

/*
  Cuánto mide la ventana en anchos de contenido del carrusel. Al desbordar solo
  por un lado, el contenido es la ventana menos un medianil: el peor caso es el
  móvil de 320px, 320/(320-40) = 1.15. Se deja en 1.25, el mismo valor que usa
  Materiales, porque solo puede sobrar margen: si el factor se queda corto el
  bucle enseñaría hueco, si se pasa solo pinta un bloque de más.
*/
const VIEWPORT_TO_CONTENT = 1.25;

const NOTA_COUNT = noticiasContent.notas.length;

const LOOP_REPEAT = computeLoopRepeat(
  NOTA_COUNT,
  CARDS_PER_VIEW.lg,
  VIEWPORT_TO_CONTENT,
);

const REAL_BLOCK_INDEX = realBlockIndex(LOOP_REPEAT);

const LOOPED_NOTAS = buildLoopedItems(noticiasContent.notas, LOOP_REPEAT);

/*
  Barra de scroll oculta sin desactivar el scroll: scrollbar-width para Firefox
  y el pseudoelemento para los navegadores WebKit. Tailwind no trae utilidad
  propia para esto. Mismo tratamiento que en Materiales.
*/
const HIDDEN_SCROLLBAR = "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

/*
  ===================== CONTRASTE DE LA TARJETA DE NOTA =====================

  El titular va superpuesto a la portada, así que el contraste no puede depender
  de la fotografía: lo fija una capa de color propia, uniforme sobre TODA la
  tarjeta. No hay degradado: un degradado parcial dejaría la zona superior con
  menos capa de la medida, y basta con que el título creciera una línea para que
  invadiera esa zona.

  Capa: surface-strong al 80%. Título en ink-inverse. Medido contra el peor caso
  posible, una portada blanca del todo:

    capa       fondo resultante   ink-inverse
     70%          #65816b           4.13:1   ← no cumple
     75%          #5a7860           4.72:1   ← cumple sin margen
     80%          #4e6e56           5.42:1   ← elegido
     85%          #44664b           6.24:1

  Con el bloque surface-muted que hace hoy de portada, el 80% da 6.18:1.
*/
const COVER_PLACEHOLDER = "absolute inset-0 bg-surface-muted";
const COLOR_LAYER = "absolute inset-0 bg-surface-strong/80";

export default function Noticias() {
  const { scrollerRef, scrollByCard } = useLoopCarousel<HTMLUListElement>({
    itemCount: NOTA_COUNT,
    centerBlock: REAL_BLOCK_INDEX,
  });

  return (
    <section id="noticias" className="mt-6 py-12 sm:mt-10 sm:py-16">
      <div className="flex flex-col gap-10">
        {/*
          Encabezado alineado a la izquierda: titular y párrafo de entrada.

          Misma composición que el encabezado que arma Section para las
          secciones que sí son tarjeta —columna de max-w-2xl con gap-4— y misma
          escala tipográfica, sectionTypography. Esto es un encabezado de
          sección, no el titular principal del sitio: a la escala del hero le
          competía.
        */}
        <div className={CONTENT_GUTTER}>
          <div className="flex max-w-2xl flex-col gap-4">
            <h2 className={`${sectionTypography.heading} text-ink`}>
              {noticiasContent.headline}
            </h2>
            <p className={`${sectionTypography.body} text-ink-soft`}>
              {noticiasContent.intro}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/*
            Mismo tratamiento que el carrusel de Materiales: role="list"
            explícito porque list-none deja de exponer la lista en WebKit,
            tabIndex para poder recorrerlo con teclado, flechas del teclado para
            avanzar, y data-lenis-prevent-horizontal para que el scroll suave de
            la página no se coma el desplazamiento horizontal.
          */}
          <ul
            ref={scrollerRef}
            id={SCROLLER_ID}
            data-lenis-prevent-horizontal
            role="list"
            tabIndex={0}
            aria-label={noticiasContent.carouselLabel}
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
            {LOOPED_NOTAS.map(({ item: nota, blockIndex }) => {
              /*
                Solo el bloque central cuenta como contenido: el resto son
                copias para que el bucle no enseñe hueco. aria-hidden las saca
                del árbol accesible e inert las saca del recorrido de
                tabulación, que aquí importa el doble porque cada tarjeta es un
                enlace.
              */
              const isDuplicate = blockIndex !== REAL_BLOCK_INDEX;

              return (
                <li
                  key={`${blockIndex}-${nota.title}`}
                  data-carousel-card
                  aria-hidden={isDuplicate || undefined}
                  inert={isDuplicate}
                  className={`shrink-0 snap-start ${CARD_WIDTH}`}
                >
                  {/*
                    La tarjeta entera es el enlace: un <a>, no un div con
                    onClick. Radio 16px, el de tarjeta anidada.

                    Vertical y alta, 2:3. justify-end apoya el titular en la
                    base de la tarjeta.

                    En la tarjeta solo se ve el título. La fecha y el extracto
                    siguen definidos en el archivo de contenido, para la futura
                    página de detalle de nota.
                  */}
                  <a
                    href={notaHref(nota.slug)}
                    className="relative flex aspect-2/3 flex-col justify-end overflow-hidden rounded-2xl p-6"
                  >
                    {/*
                      PENDIENTE fotografía de portada. Mientras no llegue, un
                      bloque de color del sistema, igual que en Materiales.
                      Al recibirla:
                      <Image src={...} alt="" fill className="object-cover" />
                    */}
                    <div aria-hidden="true" className={COVER_PLACEHOLDER} />
                    <div aria-hidden="true" className={COLOR_LAYER} />

                    <h3 className="relative font-heading text-xl font-semibold text-ink-inverse sm:text-2xl">
                      {nota.title}
                    </h3>
                  </a>
                </li>
              );
            })}
          </ul>

          <CarouselControls
            controls={SCROLLER_ID}
            previousLabel={noticiasContent.previousLabel}
            nextLabel={noticiasContent.nextLabel}
            onStep={scrollByCard}
            className={CONTENT_GUTTER}
          />
        </div>
      </div>
    </section>
  );
}
