import Image from "next/image";
import { notFound } from "next/navigation";
import { MAIN_CONTENT_ID } from "@/lib/mainContent";
import Section, { sectionTypography } from "@/components/Section";
import { catalogoContent, findProducto } from "@/content/catalogo";

/**
 * Página de detalle de producto.
 *
 * Plantilla: hoy el catálogo tiene un solo producto de ejemplo y no hay
 * fotografías. La estructura ya es la definitiva; lo que falta es contenido.
 *
 * En Next 16 `params` es una promesa y hay que esperarla: el tipo PageProps que
 * genera el framework a partir de la propia ruta ya lo declara así. No es el
 * objeto síncrono de las versiones 14 y anteriores.
 */

/*
  Todas las rutas del catálogo se prerrenderizan en el build. El contenido vive
  en el repo, no en un CMS: no hay nada que consultar en tiempo de petición.
*/
export function generateStaticParams() {
  return catalogoContent.productos.map((producto) => ({ id: producto.id }));
}

export default async function ProductoPage({
  params,
}: PageProps<"/productos/[id]">) {
  const { id } = await params;
  const producto = findProducto(id);

  /* Un id que no está en el catálogo es un 404, no una página vacía. */
  if (!producto) notFound();

  return (
    /*
      id y tabIndex -1: son el destino del enlace de salto del layout, que se
      pinta en todas las rutas. Sin ellos el enlace de salto de esta página no
      llevaría a ninguna parte.
    */
    <main id={MAIN_CONTENT_ID} tabIndex={-1}>
      {/*
        surface-raised: es la única sección de la página y la siguiente tarjeta
        es el footer, que es surface-strong, así que no repite tono con nada.
        Además deja sitio para que el bloque de imagen sea surface-muted, que es
        la hija clara que sí se distingue sobre raised.
      */}
      <Section surface="raised">
        {/*
          Dos columnas en escritorio, apiladas en móvil con la imagen arriba.
          El orden del DOM ya es ese, así que no hace falta reordenar nada: la
          retícula solo las pone en fila cuando hay ancho.
        */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2">
          {/*
            Fotografía de producto. Radio de tarjeta hija, 16px.

            Contenedor 4:5 y foto con fill y object-contain. Las fotos están
            recortadas a la silueta de cada producto, sin fondo, y cada una
            tiene la proporción de su producto: object-contain las muestra
            enteras y centradas dentro de la caja, sin cortar ni el cuello ni la
            base. La proporción la fija el contenedor, así que el hueco se
            reserva antes de descargar la foto.

            surface-muted debajo: es el fondo sobre el que se ve el producto
            transparente, y lo que se ve mientras la imagen carga. Se elige
            sobre la tarjeta de sección, que es raised, porque un tono igual al
            suyo no se distinguiría.

            priority: es la imagen grande y sobre el pliegue de esta página, el
            LCP probable.

            sizes: a partir de lg la retícula es de dos columnas y la foto ocupa
            media pantalla; por debajo, el ancho completo.
          */}
          <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl bg-surface-muted">
            <Image
              src={producto.imagen}
              alt={producto.imagenAlt}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-contain"
            />
          </div>

          <div className="flex flex-col gap-8">
            {/*
              El nombre es el <h1> de la página: aquí no hay hero, así que este
              es el único titular de primer nivel del documento.
            */}
            <h1 className={`${sectionTypography.heading} text-ink`}>
              {producto.nombre}
            </h1>

            <div className="flex flex-col gap-4">
              <h2 className="font-heading text-sm font-semibold text-ink">
                {catalogoContent.caracteristicasHeading}
              </h2>

              {/*
                <dl> y no una tabla ni una lista suelta: son pares de campo y
                valor, que es exactamente lo que describe una lista de
                definiciones. Cada par va en su fila, con el campo a la
                izquierda y el valor a la derecha.
              */}
              <dl className="flex flex-col gap-3">
                {producto.caracteristicas.map((caracteristica) => (
                  <div
                    key={caracteristica.label}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-ink-soft/20 pb-3"
                  >
                    <dt className="font-body text-sm text-ink-soft">
                      {caracteristica.label}
                    </dt>
                    <dd className="font-body text-sm font-medium text-ink">
                      {caracteristica.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}
