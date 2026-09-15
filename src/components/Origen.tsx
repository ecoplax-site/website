import Section, { sectionTypography } from "@/components/Section";
import { origenContent } from "@/content/origen";

/**
 * Sección de texto centrado: etiqueta, titular y párrafos. El <h2> es propio,
 * así que no se usa la cabecera integrada de Section (props heading/intro) sino
 * su misma escala tipográfica, vía sectionTypography.
 *
 * Bloque de texto:
 *   - Centrado en la sección con mx-auto y alineado al centro con text-center.
 *   - Ancho máximo max-w-2xl (42rem, 672px): el mismo que usa la cabecera de
 *     Section y el párrafo de entrada de Materiales, así que la medida de línea
 *     es la del resto del sitio. Por debajo de ese ancho ocupa el disponible.
 *
 * Aire vertical: py-8 sm:py-10 en el bloque, que se suma por igual arriba y
 * abajo al padding de Section (py-12 sm:py-16). El bloque queda centrado en
 * vertical, con 80px por encima y por debajo en móvil y 104px de sm en
 * adelante. Se pone aquí y no en Section para no tocar el padding del resto de
 * secciones.
 */
export default function Origen() {
  return (
    <Section id="origen" surface="soft" margin="afterHero">
      <div className="mx-auto flex max-w-2xl flex-col gap-10 py-8 text-center sm:py-10">
        {/* Bloque superior: etiqueta y titular, pegados entre sí. */}
        <div className="flex flex-col gap-3">
          <p className={`${sectionTypography.eyebrow} text-ink-soft`}>
            {origenContent.eyebrow}
          </p>
          <h2 className={`${sectionTypography.heading} text-ink`}>
            {origenContent.headline}
          </h2>
        </div>

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
    </Section>
  );
}
