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
  Dimensiones intrínsecas de las fotografías de producto: 1080x1350, es decir
  4:5 vertical. Las tres disponibles hoy miden exactamente lo mismo.

  El contenedor lleva esta misma proporción a propósito. Con 1:1 —la que tenía
  el hueco de color— la foto habría que recortarla por arriba y por abajo, y en
  un formato vertical eso se come el producto. Si las fotos definitivas llegan
  con otra proporción, hay que cambiar estos dos números y la clase aspect del
  contenedor a la vez: son el mismo dato escrito en dos sitios.
*/
const IMAGE_WIDTH = 1080;
const IMAGE_HEIGHT = 1350;

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

            Dimensiones explícitas y no fill: el navegador reserva el hueco con
            la proporción correcta antes de descargar nada, sin depender de que
            el contenedor la fije. El aspect del contenedor y el par
            IMAGE_WIDTH/IMAGE_HEIGHT dicen lo mismo, así que object-cover no
            llega a recortar: está por si un día dejan de coincidir.

            surface-muted debajo: es lo que se ve mientras la imagen carga y si
            fallara. Se elige sobre la tarjeta de sección, que es raised, porque
            un tono igual al suyo no se distinguiría.

            priority: es la imagen grande y sobre el pliegue de esta página, el
            LCP probable.

            sizes: a partir de lg la retícula es de dos columnas y la foto ocupa
            media pantalla; por debajo, el ancho completo.
          */}
          <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl bg-surface-muted">
            <Image
              src={producto.imagen}
              alt={producto.imagenAlt}
              width={IMAGE_WIDTH}
              height={IMAGE_HEIGHT}
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="h-full w-full object-cover"
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
