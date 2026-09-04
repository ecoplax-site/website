import Image from "next/image";
import ContactButton from "@/components/ContactButton";
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

  Medido sobre esta imagen capturando el footer con el texto oculto y buscando
  el peor píxel bajo cada bloque: con surface-base al 82% el fondo efectivo no
  baja de #d4dcd4, lo que deja ink-soft en 6.39:1 e ink en 7.09:1, iguales de
  390px a 1920px porque el panel tapa la foto. Si se cambia la fotografía o se
  baja esta opacidad, hay que volver a medirlo.
*/
const GLASS_STYLES =
  "rounded-3xl border border-ink-inverse/40 bg-surface-base/82 backdrop-blur-md";

export default function Footer() {
  const year = new Date().getFullYear();
  const { cta, brand, nav, contact, legal } = footerContent;

  return (
    /* Nivel 1: fondo de página, margen lateral e inferior de sección. */
    <footer className="mt-6 px-4 pb-4 sm:mt-10 sm:px-6 sm:pb-6">
      {/*
        Nivel 2. El color de respaldo se ve mientras la imagen carga y si
        fallara; overflow-hidden recorta imagen y fundido a las esquinas.
      */}
      <div className="relative min-h-[560px] overflow-hidden rounded-3xl bg-surface-strong sm:min-h-[720px] lg:min-h-[900px]">
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
          el padding, con su separación de gap-12 intacta, y es el bloque de CTA
          el que se queda con todo el espacio sobrante de arriba.
        */}
        <div className="relative flex min-h-[560px] flex-col gap-12 p-6 sm:min-h-[720px] sm:p-10 lg:min-h-[900px] lg:p-16">
          {/*
            flex-1 le da al CTA el espacio libre y justify-center lo centra
            dentro de él; items-center y text-center lo centran en horizontal.

            El flex-basis 0 de flex-1 no llega a recortar nada: como todo item
            flex nace con min-height auto, su tamaño mínimo es el de su propio
            contenido. Cuando no hay espacio sobrante —que es lo que pasa en
            móvil y tablet, donde el contenido ya supera el min-h de la
            tarjeta—, el bloque se queda con su alto natural y la tarjeta crece,
            en lugar de aplastar el CTA contra el borde superior.
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

          <div className={`grid gap-10 p-6 sm:p-10 lg:grid-cols-3 ${GLASS_STYLES}`}>
            <div className="flex flex-col gap-4">
              {/*
                PENDIENTE logotipo: el cliente todavía no ha entregado el SVG.
                Al recibirlo, sustituir este bloque por el <Image>/<svg> con
                w-full h-auto para que conserve sus proporciones y no se recorte.
                Ojo al manual de marca: el imagotipo no baja de 360px de ancho,
                así que hay que comprobar que la columna da esa medida.
              */}
              <div
                aria-hidden="true"
                className="h-20 w-full max-w-[360px] rounded-2xl bg-surface-muted"
              />
              <span className="font-heading text-3xl font-semibold tracking-tight text-ink">
                {brand.logoText}
              </span>
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
                      className="font-body text-sm text-ink-soft underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
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
                  className="underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
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
                className="underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                {legal.privacyLabel}
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
