import Section, { sectionTypography } from "@/components/Section";
import { origenContent } from "@/content/origen";

/**
 * Sección a dos columnas. El <h2> vive dentro de la columna izquierda, así que
 * no se usa la cabecera integrada de Section (props heading/intro) sino su
 * misma escala tipográfica, vía sectionTypography.
 *
 * Retícula de escritorio (md hacia arriba), 12 columnas:
 *   columnas 1-5   texto: etiqueta y titular arriba, párrafos abajo
 *   columna  6     separación
 *   columnas 7-12  tarjetas, 2 x 2
 * El gap horizontal se anula en md (gap-x-0): la separación la da la columna
 * vacía, no el gap. Las dos columnas comparten altura por el stretch por
 * defecto de la retícula —de ahí que no se fije items-start—, y dentro de la
 * izquierda el espacio libre queda al centro con justify-between.
 *
 * El orden del DOM ya es el de móvil (etiqueta, titular, párrafos, tarjetas),
 * así que en escritorio no hay nada que reordenar: las columnas solo se
 * colocan por posición en la retícula, sin utilidades order-*.
 */

/**
 * Índice de la tarjeta de acento, la única en verde de marca de la sección
 * (ver CLAUDE.md > "Sistema visual: tarjetas"). Es una decisión visual, no de
 * contenido: por eso vive aquí y no en src/content/origen.ts.
 */
const ACCENT_CARD_INDEX = 1;

// Sobre surface-strong, ink-inverse es el único color de texto válido: es el
// mismo par de fondo y texto que usa el Hero. Sobre surface-soft, los dos
// oscuros de la paleta (ink e ink-soft) superan 7:1 — ver globals.css.
const ACCENT_CARD_STYLES = "bg-surface-strong text-ink-inverse";
const CARD_STYLES = "bg-surface-soft text-ink";

export default function Origen() {
  return (
    <Section id="origen" surface="soft">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-x-0">
        <div className="flex flex-col gap-10 md:col-span-5 md:col-start-1 md:justify-between">
          {/* Bloque superior: etiqueta y titular, pegados entre sí. */}
          <div className="flex flex-col gap-3">
            <p className={`${sectionTypography.eyebrow} text-ink-soft`}>
              {origenContent.eyebrow}
            </p>
            <h2 className={`${sectionTypography.heading} text-ink`}>
              {origenContent.headline}
            </h2>
          </div>

          {/* Bloque inferior: párrafos al pie de la columna. */}
          <div className="flex flex-col gap-4">
            {origenContent.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className={`${sectionTypography.body} text-ink-soft`}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <ul className="grid grid-cols-1 gap-4 md:col-span-6 md:col-start-7 md:grid-cols-2">
          {origenContent.cards.map((card, index) => {
            const isAccent = index === ACCENT_CARD_INDEX;

            return (
              <li
                key={card.title}
                /*
                  aspect-square desde xl, no desde md, y la razón es medida.

                  Un ítem de retícula con aspect-ratio deja de estirarse al alto
                  de su fila: la proporción fija su alto y el stretch por defecto
                  no se aplica. Mientras el cuadrado da de sí para el texto no se
                  nota, porque todas las tarjetas miden lo mismo. En cuanto una
                  necesita más alto que el cuadrado, su fila crece y la vecina se
                  queda corta: el hueco que deja se suma al gap vertical y ya no
                  coincide con el horizontal. Medido a 820px: 16px de hueco
                  horizontal contra 72px de vertical.

                  Y por debajo de ~1200px el cuadrado no se cumplía de todos
                  modos —a 1024px las tarjetas medían 216x328— así que la
                  proporción solo estaba rompiendo el stretch. Desde xl sí cabe
                  el texto: 280x280 a 1280px y 320x320 a 1440px, con las cuatro
                  tarjetas del mismo alto y los dos ejes a 16px.

                  El contenido se ancla abajo con justify-end.
                */
                className={`flex flex-col justify-end gap-3 rounded-2xl p-6 lg:p-8 xl:aspect-square ${
                  isAccent ? ACCENT_CARD_STYLES : CARD_STYLES
                }`}
              >
                <h3 className="font-heading text-xl font-semibold">
                  {card.title}
                </h3>
                <p
                  className={`${sectionTypography.body} ${
                    isAccent ? "" : "text-ink-soft"
                  }`}
                >
                  {card.description}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
