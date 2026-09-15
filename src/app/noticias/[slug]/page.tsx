import { notFound } from "next/navigation";
import Section, { sectionTypography } from "@/components/Section";
import { findNota, noticiasContent } from "@/content/noticias";
import { MAIN_CONTENT_ID } from "@/lib/mainContent";

/**
 * Página de detalle de nota.
 *
 * Mismo tratamiento que la ficha de producto: la barra superior la pinta el
 * layout, el <main> lleva el ancla del enlace de salto y el contenido va en
 * tarjetas de Section.
 *
 * En Next 16 `params` es una promesa y hay que esperarla: el tipo PageProps que
 * genera el framework a partir de la propia ruta ya lo declara así. No es el
 * objeto síncrono de las versiones 14 y anteriores.
 */

/*
  Todas las notas se prerrenderizan en el build: el contenido vive en el repo,
  no hay nada que consultar en tiempo de petición.
*/
export function generateStaticParams() {
  return noticiasContent.notas.map((nota) => ({ slug: nota.slug }));
}

/*
  ===================== CONTRASTE DE LA PORTADA =====================

  El titular y la descripción van superpuestos a la fotografía, así que el
  contraste no puede depender de ella: lo fija una capa de color propia,
  uniforme sobre toda la tarjeta. Es la misma capa que usan las tarjetas de nota
  de la home, y por la misma razón.

  Capa: surface-strong al 80%. Texto en ink-inverse. Medido contra el peor caso
  posible, una portada blanca del todo:

    capa       fondo resultante   ink-inverse
     70%          #65816b           4.13:1   <- no cumple
     75%          #5a7860           4.72:1   <- cumple sin margen
     80%          #4e6e56           5.42:1   <- elegido
     85%          #44664b           6.24:1

  Con el bloque surface-muted que hace hoy de portada, el 80% da 6.18:1.

  El degradado inferior es SOLO profundidad: va con el mismo verde y encima de
  la capa base, así que únicamente suma oscuridad y no puede bajar del 5.42:1
  que ya garantiza la capa.
*/
const COVER_PLACEHOLDER = "absolute inset-0 bg-surface-muted";
const COVER_LAYER = "absolute inset-0 bg-surface-strong/80";
const COVER_GRADIENT =
  "absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-surface-strong/60 to-transparent";

/*
  scroll-mt en cada bloque del cuerpo: sin él, al saltar desde el índice el
  encabezado queda pegado al borde superior de la ventana.
*/
const BODY_SECTION = "flex scroll-mt-10 flex-col gap-4";

export default async function NotaPage({
  params,
}: PageProps<"/noticias/[slug]">) {
  const { slug } = await params;
  const nota = findNota(slug);

  /* Un slug que no está en el contenido es un 404, no una página vacía. */
  if (!nota) notFound();

  return (
    <main id={MAIN_CONTENT_ID} tabIndex={-1}>
      {/*
        Portada. No usa Section: no es una tarjeta de superficie plana sino una
        de fotografía, como la del footer. Conserva el margen lateral y el ritmo
        vertical de Section para que encaje con la tarjeta de abajo.

        PENDIENTE fotografía de portada. Mientras no llegue, el mismo bloque de
        color del sistema que usan las tarjetas de nota de la home. Al recibirla:
        <Image src={...} alt="" fill priority className="object-cover" />
      */}
      <section className="mt-6 px-4 sm:mt-10 sm:px-6">
        <div className="relative flex min-h-96 flex-col justify-end overflow-hidden rounded-3xl p-6 sm:min-h-[32rem] sm:p-10 lg:p-16">
          <div aria-hidden="true" className={COVER_PLACEHOLDER} />
          <div aria-hidden="true" className={COVER_LAYER} />
          <div aria-hidden="true" className={COVER_GRADIENT} />

          <div className="relative flex max-w-3xl flex-col gap-4">
            <h1
              className={`${sectionTypography.headingLarge} text-ink-inverse`}
            >
              {nota.title}
            </h1>
            <p className={`${sectionTypography.body} text-ink-inverse`}>
              {nota.excerpt}
            </p>
          </div>
        </div>
      </section>

      <Section surface="raised">
        {/*
          Dos columnas en escritorio: cuerpo a la izquierda y el índice, más
          estrecho, a la derecha. Por debajo de lg se apilan y el índice queda
          ARRIBA, antes del cuerpo: es donde sirve de algo, porque permite
          saltar sin recorrer la nota entera. Y como ya está primero en el DOM,
          esa es también la colocación de móvil sin necesidad de reordenar nada.
        */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
          {/*
            El índice acompaña al scroll con sticky. self-start es lo que lo
            deja pegado arriba en lugar de estirarse al alto de la fila, que es
            lo que impediría que se moviera.
          */}
          <nav
            aria-label={noticiasContent.indiceLabel}
            className="lg:sticky lg:top-10 lg:col-span-3 lg:col-start-10 lg:self-start"
          >
            <ul role="list" className="flex list-none flex-col gap-3">
              {nota.body.map((seccion) => (
                <li key={seccion.id}>
                  <a
                    href={`#${seccion.id}`}
                    className="font-body text-sm text-ink-soft underline underline-offset-2"
                  >
                    {seccion.heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-10 lg:col-span-8 lg:col-start-1 lg:row-start-1">
            {nota.body.map((seccion) => (
              <section
                key={seccion.id}
                id={seccion.id}
                className={BODY_SECTION}
              >
                <h2 className={`${sectionTypography.heading} text-ink`}>
                  {seccion.heading}
                </h2>
                {seccion.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className={`${sectionTypography.body} text-ink-soft`}
                  >
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </Section>
    </main>
  );
}
