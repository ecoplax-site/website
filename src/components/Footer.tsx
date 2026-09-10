import Image from "next/image";
import ContactButton from "@/components/ContactButton";
import Imagotipo from "@/components/brand/Imagotipo";
import { sectionTypography } from "@/components/Section";
import { footerContent } from "@/content/footer";

/**
 * Footer en tres niveles anidados:
 *
 *   1  contenedor exterior sobre el fondo de página, con el mismo margen
 *      lateral que las secciones del cuerpo y el mismo aire por abajo;
 *   2  tarjeta de imagen a todo su ancho, con la fotografía de fondo y el
 *      fundido superior;
 *   3  contenido, tres bloques en columna: las dos tarjetas de vidrio
 *      ancladas abajo y el CTA ocupando el espacio sobrante de arriba.
 *
 * Los dos bloques inferiores son paneles de vidrio: van sobre fotografía y
 * llevan capa de color semiopaca además del desenfoque, como exige
 * CLAUDE.md > "Sistema visual: tarjetas". El bloque de CTA va directo sobre la
 * imagen y no lleva panel.
 */

/*
  Vidrio. La opacidad no es estética: es lo que sostiene el contraste del texto,
  porque el desenfoque por sí solo no garantiza nada sobre una fotografía que
  cambia de zona a zona.

  Medido sobre footer-bg.webp con la geometría REAL de los paneles, sacada del
  navegador en 390, 768, 1024, 1440 y 1920px: se replica el object-cover de cada
  breakpoint, se aplica al recorte el mismo desenfoque gaussiano que el
  backdrop-filter, se compone canvas encima con esta opacidad y se busca el
  píxel más oscuro bajo cada panel.

    capa base    peor ink-soft   peor ink
      80%           5.52:1        6.13:1
      78%           5.26:1        5.84:1
      75%           4.88:1        5.41:1   <- actual
      72%           4.51:1        5.01:1

  75% es el punto de equilibrio: deja pasar bastante más foto que valores altos
  y conserva ~0,4 de margen sobre el mínimo AA. El 72% cumple sobre el papel
  pero se queda sin margen, y cualquier cambio de fotografía lo tumbaría.

  El peor caso está en la barra de copyright a 1440px, con 4.88:1. Al quitar el
  alto mínimo de la tarjeta el recorte de la foto cambió, pero el peor caso no
  se movió: los paneles siguen cayendo sobre la misma zona de bosque oscuro.

  Los dos paneles comparten valor porque medidos por separado piden lo mismo:
  en escritorio la barra de copyright da 4.89:1 y el panel principal 4.88:1.

  El desenfoque se queda en md (12px). Subirlo no ayuda: sobre esta zona de la
  foto, que ya es de bajo contraste local, un radio mayor aplana todavía más el
  fondo y la variación residual BAJA (a 16px la barra cae a Δ 17-23). El efecto
  se lee por lo que deja pasar la capa de color, no por el radio.

  Si se cambia la fotografía, hay que volver a medir esta tabla entera.
*/
const GLASS_STYLES =
  "rounded-3xl border border-ink-inverse/40 bg-surface-base/75 backdrop-blur-md";

export default function Footer() {
  const year = new Date().getFullYear();
  const { cta, brand, nav, contact, legal } = footerContent;

  return (
    /*
      Nivel 1: fondo de página. El margen lateral y el superior son los de
      Section, para no romper el ritmo con el resto de la página; el inferior
      es la mitad, para acercar el footer al borde de la ventana.
    */
    <footer className="mt-6 px-4 pb-2 sm:mt-10 sm:px-6 sm:pb-3">
      {/*
        Nivel 2. El color de respaldo se ve mientras la imagen carga y si
        fallara; overflow-hidden recorta imagen y fundido a las esquinas.

        Sin alto mínimo: la tarjeta mide lo que mida su contenido. Ojo si se
        vuelve a poner uno, o si cambia el contenido de los paneles: la
        fotografía va con object-cover, así que cualquier cambio de alto mueve
        el recorte y con él los píxeles que quedan bajo los paneles de vidrio.
        La opacidad de GLASS_STYLES está medida contra ESTA geometría.
      */}
      <div className="relative overflow-hidden rounded-3xl bg-surface-strong">
        <Image
          src="/images/footer-bg.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />

        {/*
          Fundido superior: cose la tarjeta con el fondo de la página. Arranca
          del propio token de fondo, no de blanco, y se apaga hacia abajo a lo
          largo de un tercio de la tarjeta. El extremo transparente se escribe
          como el mismo token con alfa 0 para que el degradado no vire de tono
          por el camino.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-surface-base from-0% via-surface-base/95 via-55% to-surface-base/0 to-100%"
        />

        {/*
          Nivel 3. Los tres bloques van en columna sin justify-between: en
          orden natural, las dos tarjetas de vidrio quedan pegadas abajo contra
          el padding, con su separación propia intacta, y es el bloque de CTA el
          que se queda con todo el espacio sobrante de arriba.

          Los paddings ya no son iguales en los cuatro lados. El superior
          conserva la medida original (24/40/64px); el inferior y los dos
          laterales están a la mitad (12/20/32px), para acercar los paneles al
          borde de la ventana y a los bordes de la tarjeta. Laterales e
          inferior comparten valor, así que la inserción sigue siendo simétrica
          izquierda-derecha y hace esquina con el borde de abajo.
        */}
        <div className="relative flex flex-col gap-12 px-3 pt-6 pb-3 sm:px-5 sm:pt-10 sm:pb-5 lg:px-8 lg:pt-16 lg:pb-8">
          {/*
            flex-1 le da al CTA el espacio libre y justify-center lo centra
            dentro de él; items-center y text-center lo centran en horizontal.

            El flex-basis 0 de flex-1 no llega a recortar nada: como todo item
            flex nace con min-height auto, su tamaño mínimo es el de su propio
            contenido. La tarjeta ya no tiene alto mínimo, así que normalmente
            no hay espacio sobrante que repartir: el bloque se queda con su alto
            natural y la tarjeta mide lo que miden sus tres bloques más el
            padding. flex-1 sigue puesto por si algún día vuelve a haberlo.
          */}
          <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
            <h2 className={`${sectionTypography.heading} text-ink`}>
              {cta.headline}
            </h2>
            <p className={`max-w-xl ${sectionTypography.body} text-ink`}>
              {cta.intro}
            </p>
            <ContactButton variant="footer" label={cta.buttonLabel} />
          </div>

          {/*
            Los dos paneles de vidrio van agrupados: entre ellos la separación
            es la mitad que la del gap-12 exterior, que es el que sigue
            marcando la distancia con el bloque de CTA. Sin este contenedor,
            un solo gap gobernaría las dos separaciones a la vez.
          */}
          <div className="flex flex-col gap-6">
            <div
              className={`grid gap-10 p-6 sm:p-10 lg:grid-cols-3 ${GLASS_STYLES}`}
            >
              <div className="flex flex-col gap-4">
                {/*
                  Imagotipo horizontal, en verde: el panel de vidrio es claro.

                  Se escala por ancho —w-full con tope y h-auto— y manda la
                  columna: el alto lo calcula el navegador desde el viewBox, así
                  que la marca no se deforma en ningún breakpoint.

                  Ya no lleva debajo la palabra "ecoplax" en texto: el imagotipo
                  la incluye, y repetirla era decirlo dos veces.
                */}
                <Imagotipo
                  label={brand.logoAlt}
                  className="h-auto w-full max-w-xs text-ink"
                />
                <p className={`${sectionTypography.body} text-ink-soft`}>
                  {brand.descriptor}
                </p>
              </div>

              <nav aria-label={nav.label} className="flex flex-col gap-4">
                <h3 className="font-heading text-sm font-semibold text-ink">
                  {nav.heading}
                </h3>
                <ul role="list" className="flex list-none flex-col gap-2">
                  {nav.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="font-body text-sm text-ink-soft underline underline-offset-2"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="flex flex-col gap-4">
                <h3 className="font-heading text-sm font-semibold text-ink">
                  {contact.heading}
                </h3>

                <div className="flex flex-col gap-1 font-body text-sm text-ink-soft">
                  <p className="font-medium text-ink">{contact.plantHeading}</p>
                  {contact.plant.addressLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                  <a
                    href={contact.plant.phone.href}
                    className="underline underline-offset-2"
                  >
                    {contact.plant.phone.display}
                  </a>
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="underline underline-offset-2"
                    >
                      {contact.email}
                    </a>
                  )}
                </div>

                {/*
                  PENDIENTE datos de Cajaplax. Espacio reservado, vacío a
                  propósito: no hay información confirmada que poner aquí.
                */}
                <div aria-hidden="true" className="min-h-20 rounded-2xl" />
              </div>
            </div>

            <div
              className={`flex flex-wrap items-center justify-between gap-4 px-6 py-4 sm:px-10 ${GLASS_STYLES}`}
            >
              {/*
                PENDIENTE SVG de SCNDAL ("Created by SCNDAL"). Contenedor con la
                proporción reservada y vacío: no se dibuja nada ni se pone texto
                de sustituto. Al recibir el archivo, ajustar la proporción a la
                real y colocarlo dentro.
              */}
              <div aria-hidden="true" className="aspect-5/1 w-40" />

              <p className="font-body text-xs text-ink-soft">
                © {year} {legal.brandLine}{" "}
                <a
                  href={legal.privacyHref}
                  className="underline underline-offset-2"
                >
                  {legal.privacyLabel}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
