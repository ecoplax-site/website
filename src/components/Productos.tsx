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

  En escritorio, tres columnas: una pieza alta a la izquierda, las dos pequeñas
  apiladas en el centro y otra pieza alta a la derecha. Cada alta ocupa las dos
  filas.

  El reparto es de 4, 3 y 4 sobre once columnas. No es un número redondo, pero
  es el que deja las dos altas en proporción 0.84, casi el 4:5 de las fotos, así
  que object-contain apenas deja banda. Con 3/2/3 sobre ocho salían en 0.95,
  demasiado cuadradas para un envase vertical.

  Las columnas de las dos piezas centrales y de la última van declaradas con
  col-start y no dejadas a la colocación automática: la rejilla, al ver hueco a
  la derecha en la primera fila, metía ahí la segunda pequeña en vez de
  apilarla debajo de la primera.

  Por debajo de lg se reorganiza en vertical en lugar de mantener la
  composición: a 150px de ancho por columna, las piezas altas quedarían como
  franjas estrechas con el producto diminuto en el centro. Cada alta ocupa todo
  el ancho y las dos pequeñas van juntas en una fila entre ambas, así que el
  ritmo de la composición —alta, dos pequeñas, alta— se mantiene en vertical.

  Separación entre piezas: gap-5, 20px, igual en horizontal y en vertical. Dos
  tercios de los 32px anteriores serían 21.33, que no es un peldaño de la
  escala; de los dos que lo rodean —20 y 24— el más cercano es 20. Ojo: el ancho
  del bento no cambia, así que el hueco que se libera vuelve a las celdas —se
  reparten más ancho— y, como el alto de fila lo marca el aspect de las
  pequeñas, la tarjeta sube unos píxeles de propina.

  ALTURA DE LA TARJETA. La marcan las celdas pequeñas y solo ellas: son las que
  llevan aspect, de ahí sale el alto de cada fila, y la grande se limita a
  ocupar las dos. La columna de texto no pinta nada —mide 162px— y el padding
  del Section son 128px fijos. Es decir, de los 855px que medía la tarjeta a
  1440px, 727 eran bento.

  En escritorio las pequeñas van en 4:3 y no en cuadrado, que es lo que antes
  disparaba el alto: en cuadrado el bento medía 727px a 1440 y 1002px a 1920,
  porque el lado del cuadrado crece con el ancho de la columna y luego se
  multiplica por dos filas. En 4:3 la tarjeta baja alrededor de un 20% en todos
  los anchos. En móvil siguen cuadradas: allí la celda es estrecha y el problema
  no existe.
*/
const BENTO_GRID = "grid grid-cols-2 gap-5 lg:grid-cols-11 lg:grid-rows-2";
const BENTO_ALTA_BASE =
  "col-span-2 aspect-4/3 lg:col-span-4 lg:aspect-auto lg:h-full";
const BENTO_ALTA = `${BENTO_ALTA_BASE} lg:row-span-2`;
const BENTO_SMALL = "aspect-square lg:col-start-5 lg:col-span-3 lg:aspect-4/3";
/*
  La última pieza fija fila y columna en vez de dejarse colocar.

  La colocación automática nunca retrocede: al llegar aquí el cursor ya había
  bajado de fila colocando la segunda pieza pequeña, así que sin fila fijada
  esta caía en la segunda en lugar de ocupar las dos.

  Y la fila se declara con start/end y no con row-span: row-span emite el
  atajo `grid-row`, que escribe también el inicio, y en la hoja compilada va
  después de row-start; el atajo pisaba la fila fijada y volvía a dejarla en
  automático. row-end-3 solo toca el final y no se estorban.
*/
const BENTO_ALTA_FINAL = `${BENTO_ALTA_BASE} lg:col-start-8 lg:row-start-1 lg:row-end-3`;

/*
  Pieza del bento. Radio 16px, el de tarjeta anidada.

  Fondo surface-base y object-contain, no object-cover: así el producto se ve
  entero en cualquier proporción de celda, y como el fondo de las fotos es un
  casi blanco (#fffefc) que mide 1.03:1 contra canvas, la banda que deja el
  encaje no se percibe. Recortar habría sido lo otro: llenar la celda a costa de
  cortar el envase, y las proporciones de celda de un bento no coinciden con las
  de la foto.
*/
/*
  Elevación al pasar por encima y al recibir el foco.

  El mismo tratamiento en las dos, no solo en hover: quien navega con teclado
  tiene que ver lo mismo que quien navega con el ratón. Va en focus-visible y no
  en focus, para que no salte al hacer clic.

  Reparto entre lo que se mueve y lo que no:

    - La SOMBRA se aplica siempre, también con prefers-reduced-motion activo.
      No es movimiento: es la señal de que la tarjeta responde, y quitarla
      dejaría al usuario con reduced-motion sin ninguna respuesta al foco más
      allá del anillo.
    - El DESPLAZAMIENTO y la transición van bajo motion-safe. Con
      prefers-reduced-motion la tarjeta no se mueve ni un píxel y la sombra
      aparece de golpe, sin recorrido.

  4px de subida y 500ms: lento y corto a propósito. Con más recorrido la pieza
  se despega de la retícula, y con menos duración el gesto se lee como un
  parpadeo. ease-out en los dos sentidos, así que entra y sale igual de suave.
*/
const TILE_STYLES =
  "relative block overflow-hidden rounded-2xl bg-surface-base hover:shadow-lg focus-visible:shadow-lg motion-safe:transition motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-1 motion-safe:focus-visible:-translate-y-1";

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
      {/*
        Cada producto se ajusta a su propia celda: el de una celda grande se ve
        grande y el de una pequeña, pequeño. Va centrado con un margen interior
        uniforme del 10% del ancho de la celda (utilidad bento-product-inset),
        para que no toque los bordes. La imagen está recortada a la silueta del
        producto, así que lo que se centra es el producto y no un lienzo con aire.
      */}
      <span className="bento-product-inset absolute inset-0">
        <span className="relative block size-full">
          <Image
            src={producto.imagen}
            alt={producto.imagenAlt}
            fill
            sizes={sizes}
            className="object-contain"
          />
        </span>
      </span>
    </a>
  );
}

export default function Productos() {
  const [grande, pequenaArriba, pequenaAbajo, ultima] =
    productosContent.destacados;

  /*
    surface-soft: la sección anterior es Pilares, que es muted, y la siguiente
    es Noticias, que no lleva tarjeta y deja ver surface-base. Soft no repite
    tono con ninguna de las dos.

    padding="even": el contenido es una retícula con su propio hueco, así que el
    aire extra que el sistema pone arriba y abajo se leía como vacío. Con "even"
    la distancia al borde es la misma por los cuatro lados. Es un override
    acotado a esta sección: el resto sigue con el padding por defecto.
  */
  return (
    <Section id="productos" surface="soft" padding="even">
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
        {/*
          lg:self-end alinea el bloque abajo, no arriba: su base queda a la
          altura de la base del bento, que es la pieza más alta de la fila. En
          móvil no aplica —el grid es de una columna y el texto va encima—, que
          es lo que hace que baste con la variante lg y no haya que tocar el
          items-start de la fila.
        */}
        <div className={`flex flex-col gap-4 lg:self-end ${TEXT_COLUMN}`}>
          <h2 className={`${sectionTypography.headingLarge} text-ink`}>
            {productosContent.headline}
          </h2>
          <p className={`${sectionTypography.body} text-ink-soft`}>
            {productosContent.intro}
          </p>
        </div>

        <div className={`${BENTO_GRID} ${BENTO_COLUMN}`}>
          <BentoTile
            id={grande}
            className={BENTO_ALTA}
            sizes="(min-width: 1024px) 22vw, 100vw"
          />
          {[pequenaArriba, pequenaAbajo].map((id) => (
            <BentoTile
              key={id}
              id={id}
              className={BENTO_SMALL}
              sizes="(min-width: 1024px) 16vw, 50vw"
            />
          ))}
          <BentoTile
            id={ultima}
            className={BENTO_ALTA_FINAL}
            sizes="(min-width: 1024px) 22vw, 100vw"
          />
        </div>
      </div>
    </Section>
  );
}
