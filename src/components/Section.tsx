import type { ReactNode } from "react";

/**
 * Tarjeta de sección — implementa el contenedor descrito en
 * CLAUDE.md > "Sistema visual: tarjetas".
 *
 * Responsabilidades que centraliza (ninguna sección debe repetir estas clases):
 *  - Margen lateral respecto al viewport: la tarjeta nunca toca el borde.
 *  - Radio de esquina de 24px (rounded-3xl).
 *  - Separación vertical uniforme respecto a la sección anterior (mt),
 *    por espacio, no por líneas divisorias.
 *  - Superficie de la tarjeta y color de texto legible sobre ella.
 *
 * Las tarjetas hijas que se pasen como children llevan radio de 16px
 * (rounded-2xl) y un tono distinto al de su contenedor.
 */

/**
 * Superficies válidas para una tarjeta de sección.
 * "strong" es la tarjeta ancla (verde de marca): como máximo una por pantalla.
 */
export type SectionSurface = "raised" | "soft" | "muted" | "strong";

/**
 * Escala tipográfica compartida de las secciones. Se exporta para que una
 * sección con retícula propia —que coloca su <h2> dentro de una columna en vez
 * de usar la prop `heading`— reutilice exactamente la misma escala en lugar de
 * redefinirla. Solo tamaños y pesos: el color lo pone cada sección con un token
 * de tinta válido sobre su superficie.
 */
export const sectionTypography = {
  /**
   * Etiqueta pequeña sobre el titular. Mismo tratamiento que la etiqueta del
   * Hero (src/components/Hero.tsx): si cambia allí, cambia aquí.
   */
  eyebrow: "font-body text-xs font-semibold tracking-widest uppercase",
  heading: "font-heading text-3xl leading-tight font-semibold sm:text-4xl",
  body: "font-body text-base sm:text-lg",
} as const;

const surfaceStyles: Record<
  SectionSurface,
  { card: string; heading: string; intro: string }
> = {
  // mist — tarjeta elevada, tono muy cercano al fondo.
  raised: {
    card: "bg-surface-raised",
    heading: "text-ink",
    intro: "text-ink-soft",
  },
  // eggshell — sección suave de marca.
  soft: {
    card: "bg-surface-soft",
    heading: "text-ink",
    intro: "text-ink-soft",
  },
  // pastel-gray — bloque secundario, un paso más marcado que soft. Sobre él
  // ink mide 6.6:1 e ink-soft 5.9:1, los dos por encima de AA.
  muted: {
    card: "bg-surface-muted",
    heading: "text-ink",
    intro: "text-ink-soft",
  },
  // cal-poly-pomona-green — ancla de máximo contraste.
  // Sobre ella, ink-inverse es el único color de texto válido (ver globals.css).
  strong: {
    card: "bg-surface-strong",
    heading: "text-ink-inverse",
    intro: "text-ink-inverse",
  },
};

type SectionProps = {
  /** Ancla de navegación (#id). Opcional. */
  id?: string;
  /**
   * Título de la sección. Se renderiza como <h2>: el único <h1> es el del Hero.
   * Opcional: una sección con retícula propia puede omitirlo y renderizar su
   * propio <h2> dentro de children —debe seguir siendo un <h2>— usando
   * `sectionTypography.heading`.
   */
  heading?: string;
  /** Párrafo de entrada, bajo el título. Solo se muestra junto a `heading`. */
  intro?: string;
  /** Superficie de la tarjeta. Por defecto la más cercana al fondo. */
  surface?: SectionSurface;
  /** Retícula de la sección: tarjetas hijas, bloques de imagen, etc. */
  children?: ReactNode;
};

export default function Section({
  id,
  heading,
  intro,
  surface = "raised",
  children,
}: SectionProps) {
  const styles = surfaceStyles[surface];

  return (
    <section id={id} className="mt-6 px-4 sm:mt-10 sm:px-6">
      <div
        className={`rounded-3xl px-6 py-12 sm:px-10 sm:py-16 ${styles.card}`}
      >
        {heading ? (
          <div className="flex max-w-2xl flex-col gap-4">
            <h2 className={`${sectionTypography.heading} ${styles.heading}`}>
              {heading}
            </h2>
            {intro ? (
              <p className={`${sectionTypography.body} ${styles.intro}`}>
                {intro}
              </p>
            ) : null}
          </div>
        ) : null}

        {children ? (
          <div className={heading ? "mt-10 sm:mt-12" : undefined}>
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}
