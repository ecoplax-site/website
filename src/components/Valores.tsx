import { valoresCards } from "@/content/valores";

/**
 * Cuatro tarjetas —Calidad, Sustentabilidad, Innovación y Compromiso— en una
 * fila, justo después de Origen.
 *
 * Sección a sangre: el fondo beige ocupa todo el ancho de la ventana, sin radio
 * ni margen lateral. No usa el componente Section, que siempre pinta tarjeta.
 * Conserva su ritmo vertical —mt-6/sm:mt-10 de separación y py-12/sm:py-16 de
 * aire— para que el hueco con Origen y con Materiales no cambie.
 *
 * Retícula:
 *   - móvil: una columna, a ancho completo.
 *   - md: 2 × 2.
 *   - xl: una fila de cuatro.
 *
 * En todos los casos las tarjetas miden lo mismo: la retícula reparte el ancho
 * a partes iguales y estira cada tarjeta al alto de su fila, así que comparten
 * línea superior e inferior aunque una descripción ocupe más líneas.
 */

/*
  Superficies.

  Sección: surface-soft (Eggshell #edeedb), la superficie beige del sistema de
  secciones. Dark Vanilla es más beige, pero no es una superficie de sección.

  Tarjetas: surface-base (Canvas #fbfbf9), el blanco del sistema. No se usa
  blanco puro. Contra la sección mide 1.14:1.

  Sobre la tarjeta en reposo:
    ink       (título)       9.59:1
    ink-soft  (descripción)  8.64:1
    bloque de imagen, pastel gray, contra la tarjeta: 1.46:1

  Las cuatro tarjetas son iguales: no hay acento.
*/
const CARD_STYLES = "bg-surface-base text-ink";

/*
  Medianil: el fondo va a sangre, pero las tarjetas conservan el margen lateral
  que tenían dentro de la tarjeta de sección, alineadas con el contenido del
  resto de secciones: 40px en móvil (px-4 del contenedor de Section + px-6 de la
  tarjeta) y 64px de sm en adelante (px-6 + px-10). Mismo valor que Materiales;
  si esas medidas cambian en Section, cambian aquí.

  Es también el espacio que usa el hover para apartar a las tarjetas de los
  extremos (ver valores-row en globals.css).
*/
const CONTENT_GUTTER = "px-10 sm:px-16";

/*
  Tarjeta activa en xl: verde de marca con texto inverso.

  Sobre surface-strong, ink-inverse es el único color de texto válido. Mide
  9.59:1 con su valor actual, Canvas (#fbfbf9), y 8.44:1 si pasa a Eggshell
  (#edeedb), que es el que le da CLAUDE.md. El bloque de imagen, pastel gray,
  mide 6.57:1 contra el verde.

  El título hereda el color de la tarjeta, así que su color entra en la
  transición de la tarjeta. La descripción tiene color propio (ink-soft) y
  necesita el suyo vía group-hover, con la misma transición.

  El cambio de color NO va bajo motion-safe: con prefers-reduced-motion la
  tarjeta cambia de color igual, porque es la única señal de que responde. Lo
  que sí va bajo motion-safe es la transición, así que en ese caso el cambio
  es instantáneo.
*/
const CARD_ACTIVE_STYLES =
  "group xl:hover:bg-surface-strong xl:hover:text-ink-inverse";
/*
  Descripción: un escalón por debajo del cuerpo de sección
  (sectionTypography.body, text-base sm:text-lg), en tamaño y en interlineado.
  En la escala de Tailwind cada tamaño lleva su propio interlineado, así que
  bajar el tamaño un peldaño baja también el interlineado un peldaño:

    móvil  text-base 16px / 24px  ->  text-sm   14px / 20px
    sm+    text-lg   18px / 28px  ->  text-base 16px / 24px
*/
/*
  Degradado sobre el bloque de imagen: funde su parte baja con el fondo de la
  tarjeta. Parte del color de la tarjeta en el borde inferior y llega a
  transparente a la mitad de la imagen (to-50%); la mitad superior queda
  intacta y no se oscurece nada.

  Sigue al fondo real de la tarjeta: surface-base en reposo y surface-strong en
  hover, en el mismo breakpoint (xl) que el cambio de la tarjeta. El color
  cambia también con prefers-reduced-motion; solo la transición va bajo
  motion-safe, así que en ese caso cambia sin recorrido.

  La transición es posible porque Tailwind registra los colores del degradado
  como propiedades <color> animables (--tw-gradient-from y compañía) y
  transition-colors los incluye. Mismo ritmo que la tarjeta: 500ms, ease-out.
*/
const IMAGE_FADE_STYLES =
  "absolute inset-0 bg-linear-to-t from-surface-base to-transparent to-50% xl:group-hover:from-surface-strong motion-safe:transition-colors motion-safe:duration-500 motion-safe:ease-out";

const DESCRIPTION_STYLES =
  "font-body text-sm sm:text-base text-ink-soft xl:group-hover:text-ink-inverse motion-safe:transition-colors motion-safe:duration-500 motion-safe:ease-out";

/*
  Hover en la fila de xl: la tarjeta bajo el puntero escala un 5% y las otras
  tres se apartan lo mismo que ella crece por cada costado, así que el hueco
  entre tarjetas es el de reposo. Las vecinas no cambian de tamaño. Escalado y
  desplazamiento, sus medidas y el límite que evita desbordar viven en la
  utilidad valores-row de globals.css, que se aplica a la <ul>.

  Aquí solo queda lo que llevan todas las tarjetas: la transición, para que la
  activa y las vecinas se muevan y cambien de color a la vez, con 500ms y ease-out en los dos
  sentidos —el ritmo del bento de Productos—, y relative con z-0 como punto de
  partida del z-index de la activa. El z-index entra en la transición —por eso
  parte de z-0 y no de auto, que no se interpola—: al salir el puntero, la
  tarjeta sigue por encima mientras vuelve a su tamaño.

  Todo bajo motion-safe: con prefers-reduced-motion no hay escalado ni
  desplazamiento. valores-row solo aplica hover con (hover: hover), así que en
  táctil no se activa.

  Sin tabIndex: las tarjetas no son enfocables.
*/
const CARD_MOTION_STYLES =
  "relative z-0 motion-safe:transition-all motion-safe:duration-500 motion-safe:ease-out";

export default function Valores() {
  return (
    <section
      className={`mt-6 bg-surface-soft py-12 sm:mt-10 sm:py-16 ${CONTENT_GUTTER}`}
    >
      <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4 motion-safe:xl:valores-row">
        {valoresCards.map((card) => {
          return (
            <li
              key={card.title}
              /*
                El padding va en la tarjeta, no en el texto: así el bloque de
                imagen y el texto comparten el mismo margen por arriba y por los
                lados. El gap entre ambos es el mismo valor, que es la distancia
                que ya había entre la imagen y el título.
              */
              className={`flex flex-col gap-6 overflow-hidden rounded-2xl p-6 lg:gap-8 lg:p-8 ${CARD_MOTION_STYLES} ${CARD_STYLES} ${CARD_ACTIVE_STYLES}`}
            >
              {/*
                PENDIENTE imagen de la tarjeta.

                Mientras tanto, el bloque de color de las fotos de producto
                (surface-muted), contenido dentro del padding de la tarjeta, con
                el fondo de la tarjeta visible alrededor. Proporción 4:3, la
                misma en las cuatro, así que todas empiezan el texto a la misma
                altura.

                Radio propio de 12px (rounded-xl), un escalón por debajo de los
                16px de la tarjeta. overflow-hidden recorta a ese radio la
                imagen que entre aquí.

                Al recibir la imagen, sustituye al bloque de color y va antes
                del degradado, que tiene que quedar encima:
                  <Image src={...} alt={...} fill className="object-cover" />
              */}
              <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden rounded-xl">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-surface-muted"
                />
                <div aria-hidden="true" className={IMAGE_FADE_STYLES} />
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="font-heading text-xl font-semibold">
                  {card.title}
                </h3>
                <p className={DESCRIPTION_STYLES}>
                  {card.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
