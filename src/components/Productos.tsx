import Image from "next/image";
import Section, { sectionTypography } from "@/components/Section";
import { findProducto } from "@/content/catalogo";
import { productosContent } from "@/content/productos";

/**
 * Sección de productos: texto a la izquierda y bento de tres piezas a la
 * derecha, cada una enlazada a su ficha.
 *
 * No guarda ningún dato de producto. Recibe tres ids y saca del catálogo la
 * imagen, su texto alternativo y la ruta: la fuente de verdad sigue siendo
 * src/content/catalogo.ts, y aquí no hay nada que mantener sincronizado.
 */

/*
  Retícula de la sección: 4 de 12 para el texto y 8 para el bento, de modo que
  la columna izquierda quede claramente más estrecha. Por debajo de lg se apilan
  en el orden del DOM —texto arriba, bento debajo—, sin reordenar nada.
*/
const TEXT_COLUMN = "lg:col-span-4";
const BENTO_COLUMN = "lg:col-span-8";

/*
  Bento.

  En escritorio, dos columnas: la grande a la izquierda ocupando las dos filas
  de alto, y las dos pequeñas apiladas a la derecha. Se reparten 4 y 3 de 7 en
  lugar de mitad y mitad para que la pieza grande no quede en un formato
  demasiado estrecho y alto.

  Por debajo de lg se reorganiza en vertical en lugar de mantener la
  composición: a 150px de ancho por columna, la pieza grande quedaría como una
  franja alta y estrecha con el producto diminuto en el centro. Pasa a ocupar
  todo el ancho arriba y las dos pequeñas se ponen a su lado debajo.
*/
const BENTO_GRID = "grid grid-cols-2 gap-4 lg:grid-cols-7 lg:grid-rows-2";
const BENTO_LARGE =
  "col-span-2 aspect-4/3 lg:col-span-4 lg:row-span-2 lg:aspect-auto lg:h-full";
const BENTO_SMALL = "aspect-square lg:col-span-3";

/*
  Pieza del bento. Radio 16px, el de tarjeta anidada.

  Fondo surface-base y object-contain, no object-cover: así el producto se ve
  entero en cualquier proporción de celda, y como el fondo de las fotos es un
  casi blanco (#fffefc) que mide 1.03:1 contra canvas, la banda que deja el
  encaje no se percibe. Recortar habría sido lo otro: llenar la celda a costa de
  cortar el envase, y las proporciones de celda de un bento no coinciden con las
  de la foto.
*/
const TILE_STYLES =
  "relative block overflow-hidden rounded-2xl bg-surface-base";

function BentoTile({
  id,
  className,
  sizes,
}: {
  id: string;
  className: string;
  /** Ancho que ocupará la celda, para que Next elija la resolución. */
  sizes: string;
}) {
  const producto = findProducto(id);

  /*
    Un id que no esté en el catálogo no rompe la página: la celda no se pinta.
    Es lo que puede pasar si alguien retira un producto del catálogo y olvida
    actualizar los destacados.
  */
  if (!producto) return null;

  return (
    <a
      href={`/productos/${producto.id}`}
      className={`${TILE_STYLES} ${className}`}
    >
      <Image
        src={producto.imagen}
        alt={producto.imagenAlt}
        fill
        sizes={sizes}
        className="object-contain"
      />
    </a>
  );
}

export default function Productos() {
  const [grande, ...pequenas] = productosContent.destacados;

  /*
    surface-soft: la sección anterior es Pilares, que es muted, y la siguiente
    es Noticias, que no lleva tarjeta y deja ver surface-base. Soft no repite
    tono con ninguna de las dos.
  */
  return (
    <Section id="productos" surface="soft">
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
        <div className={`flex flex-col gap-4 ${TEXT_COLUMN}`}>
          <h2 className={`${sectionTypography.heading} text-ink`}>
            {productosContent.headline}
          </h2>
          <p className={`${sectionTypography.body} text-ink-soft`}>
            {productosContent.intro}
          </p>
        </div>

        <div className={`${BENTO_GRID} ${BENTO_COLUMN}`}>
          <BentoTile
            id={grande}
            className={BENTO_LARGE}
            sizes="(min-width: 1024px) 30vw, 100vw"
          />
          {pequenas.map((id) => (
            <BentoTile
              key={id}
              id={id}
              className={BENTO_SMALL}
              sizes="(min-width: 1024px) 22vw, 50vw"
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
