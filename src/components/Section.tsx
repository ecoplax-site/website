import type { ReactNode } from "react";

/**
 * Tarjeta de sección — implementa el contenedor descrito en
 * CLAUDE.md > "Sistema visual: tarjetas".
 *
 * Responsabilidades que centraliza (ninguna sección debe repetir estas clases):
 *  - Margen lateral respecto al viewport: la tarjeta nunca toca el borde.
 *  - Radio de esquina de 24px (rounded-3xl).
 *  - Separación vertical uniforme respecto a la sección anterior (mt),
 *    por espacio, no por líneas divisorias. La única variante es la de la
 *    sección que sigue al hero (ver marginStyles).
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
  heading: "font-heading text-3xl font-semibold sm:text-4xl",
  /**
   * Titular con más presencia que el de sección. En móvil mide lo mismo que
   * `heading`, 30px, y sube un escalón desde sm: 48px frente a los 36px de
   * aquel.
   *
   * El titular del hero va en 36/48/60px. En móvil este se queda por debajo
   * (30 contra 36) y en lg también (48 contra 60), pero en el tramo sm los dos
   * miden 48px. Nunca coinciden en pantalla —el hero solo está en la home y no
   * comparte pliegue con ninguna sección—, pero conviene saberlo.
   */
  headingLarge: "font-heading text-3xl font-semibold sm:text-5xl",
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

/*
  Padding interno de la tarjeta.

  Por defecto el vertical es mayor que el lateral —48/64px frente a 24/40px—,
  que es el aire que pide una sección de texto corrido.

  "even" lo iguala al lateral: misma distancia al borde por los cuatro lados.
  Sirve para secciones cuyo contenido es una retícula de piezas con su propio
  hueco, donde el aire de más arriba y abajo se lee como vacío y no como
  respiración. El lateral no cambia en ningún caso: es el que alinea el
  contenido de todas las secciones entre sí.
*/
const paddingStyles = {
  default: "py-12 sm:py-16",
  even: "py-6 sm:py-10",
} as const;

type SectionPadding = keyof typeof paddingStyles;

/*
  Separación respecto a lo que hay encima.

  Por defecto, mt-6/sm:mt-10: el hueco entre dos secciones.

  "afterHero" es para la sección que va justo debajo de la tarjeta del hero. La
  <section> del hero ya deja por debajo su propio margen de viewport
  (py-4/sm:py-6, el mismo que el lateral), así que aquí se suma otro igual:
  mt-4/sm:mt-6. El hueco total entre las dos tarjetas es el doble del margen
  lateral de la del hero: 32px en móvil y 48px de sm en adelante. Si cambia el
  margen de Hero.tsx, cambia aquí.
*/
const marginStyles = {
  default: "mt-6 sm:mt-10",
  afterHero: "mt-4 sm:mt-6",
} as const;

type SectionMargin = keyof typeof marginStyles;

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
  /**
   * Padding vertical de la tarjeta. Por defecto el del sistema, mayor que el
   * lateral; "even" lo iguala a él. Ver paddingStyles.
   */
  padding?: SectionPadding;
  /**
   * Separación superior. "afterHero" solo para la sección que sigue al hero.
   * Ver marginStyles.
   */
  margin?: SectionMargin;
  /** Retícula de la sección: tarjetas hijas, bloques de imagen, etc. */
  children?: ReactNode;
};

export default function Section({
  id,
  heading,
  intro,
  surface = "raised",
  padding = "default",
  margin = "default",
  children,
}: SectionProps) {
  const styles = surfaceStyles[surface];

  return (
    <section id={id} className={`px-4 sm:px-6 ${marginStyles[margin]}`}>
      <div
        className={`rounded-3xl px-6 sm:px-10 ${paddingStyles[padding]} ${styles.card}`}
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
