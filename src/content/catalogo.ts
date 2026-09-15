// Catálogo de producto: el contenido de las páginas de detalle
// (src/app/productos/[id]/page.tsx).
// Editable desde la interfaz web de GitHub sin abrir un editor de código:
// cambia solo los valores entre comillas, no las llaves ni los dos puntos.
//
// ============================================================================
// CARACTERÍSTICAS INCOMPLETAS — SOLO LO QUE DICE EL NOMBRE
// ============================================================================
// Los ocho productos son reales y su id y su nombre están tal cual los entrega
// el cliente: no se corrigen ni se reescriben.
//
// Las características, en cambio, están rellenadas ÚNICAMENTE con lo que el
// propio nombre nombra. Todo lo que el nombre no dice queda en PENDIENTE, y
// tiene que ponerlo el cliente. En concreto:
//
//   - MATERIAL está en PENDIENTE en los ocho, sin excepción. Palabras como
//     CRISTAL o TRANSPARENTE describen cómo se ve el envase, no de qué está
//     hecho: leerlas como material sería inventarlo.
//   - Los milímetros de las tapas (63 MM, 80 MM) van en el formato, no en
//     capacidad: son una medida de la tapa, y el nombre no dice a qué envase
//     ajusta. La compatibilidad tapa/envase no está en ninguna parte.
//   - Las tapas no tienen capacidad, así que ese campo les queda en PENDIENTE.
//   - Hay tokens del nombre sin identificar —"SQ", "NUEVA IMAGEN", "NUEVO"— que
//     no se han mapeado a ningún campo a propósito.
//
// Tapas y envases comparten el mismo tipo y los mismos cuatro campos: son el
// mismo producto para el sitio, solo cambia qué campos puede rellenar el nombre.
//
// Para añadir un producto basta con copiar un bloque y cambiar sus valores, sin
// tocar el componente.
//
// ----------------------------------------------------------------------------
// FOTOGRAFÍAS PROVISIONALES — REEMPLAZAR
// ----------------------------------------------------------------------------
// Solo hay tres fotos disponibles y son ocho productos, así que se reparten
// rotando: la misma imagen se repite en varios productos y NINGUNA corresponde
// al producto que ilustra. Sirven para ver la página montada.
//
// Consecuencia que hay que tener presente: el texto alternativo describe el
// producto del CATÁLOGO, no lo que se ve en la foto de hoy. Es decir, ahora
// mismo un lector de pantalla anuncia algo que no coincide con la imagen. Se
// arregla solo cuando lleguen las fotos definitivas, y hay que revisar los alt
// junto con ellas.
//
// Al recibirlas: una foto por producto, y repasar `imagen` y `imagenAlt` de los
// ocho bloques.
// ----------------------------------------------------------------------------
//
// PENDIENTE también:
//   - aprobación de copy del encabezado de la lista de características.
// ============================================================================

/** Par etiqueta/valor de la ficha del producto. */
export type Caracteristica = {
  /** Nombre del campo, tal como se ve. */
  label: string;
  /** Valor del campo. Vacío o "PENDIENTE" mientras no lo confirme el cliente. */
  value: string;
};

export type ProductoCatalogo = {
  /** Identificador del producto. Es el segmento de la URL: /productos/<id>. */
  id: string;
  /** Nombre completo. Se renderiza como <h1> de la página de detalle. */
  nombre: string;
  /**
   * Ruta de la fotografía dentro de /public.
   * PROVISIONAL: ver el aviso de la cabecera del archivo.
   */
  imagen: string;
  /**
   * Texto alternativo de la fotografía: describe el producto para quien no ve
   * la imagen. Nunca el id ni el nombre del archivo.
   * PROVISIONAL: describe el producto del catálogo, no lo que se ve hoy en la
   * foto. Ver el aviso de la cabecera.
   */
  imagenAlt: string;
  /** Ficha del producto, en el orden en que se quiere ver. */
  caracteristicas: Caracteristica[];
};

export type CatalogoContent = {
  /** Encabezado de la lista de características. PENDIENTE aprobación de copy. */
  caracteristicasHeading: string;
  productos: ProductoCatalogo[];
};

export const catalogoContent: CatalogoContent = {
  caracteristicasHeading: "Características",
  productos: [
    {
      id: "90794",
      nombre: "BOTELLA OVAL 500 ML SQ NUEVA IMAGEN CRISTAL",
      imagen: "/images/productos/2-sin-fondo.png",
      imagenAlt: "Botella oval de 500 ml, acabado cristal",
      caracteristicas: [
        { label: "Capacidad", value: "500 ml" },
        { label: "Formato", value: "Botella oval" },
        { label: "Color o acabado", value: "Cristal" },
        { label: "Material", value: "PENDIENTE" },
      ],
    },
    {
      id: "91234",
      nombre: "VASO CIL. 15 ML DOSIFICADOR",
      imagen: "/images/productos/3-sin-fondo.png",
      imagenAlt: "Vaso cilíndrico dosificador de 15 ml",
      caracteristicas: [
        { label: "Capacidad", value: "15 ml" },
        { label: "Formato", value: "Vaso cilíndrico dosificador" },
        { label: "Color o acabado", value: "PENDIENTE" },
        { label: "Material", value: "PENDIENTE" },
      ],
    },
    {
      id: "90535",
      nombre: "BOTELLA CIL. 30 ML AMBAR",
      imagen: "/images/productos/4-sin-fondo.png",
      imagenAlt: "Botella cilíndrica de 30 ml, color ámbar",
      caracteristicas: [
        { label: "Capacidad", value: "30 ml" },
        { label: "Formato", value: "Botella cilíndrica" },
        { label: "Color o acabado", value: "Ámbar" },
        { label: "Material", value: "PENDIENTE" },
      ],
    },
    {
      id: "91299",
      nombre: "TAPA 63 MM BLANCA C/LINER INTEG.",
      imagen: "/images/productos/2-sin-fondo.png",
      imagenAlt: "Tapa de 63 mm con liner integrado, color blanco",
      caracteristicas: [
        { label: "Capacidad", value: "PENDIENTE" },
        { label: "Formato", value: "Tapa de 63 mm con liner integrado" },
        { label: "Color o acabado", value: "Blanca" },
        { label: "Material", value: "PENDIENTE" },
      ],
    },
    {
      id: "90053",
      nombre: "BOTELLA CIL. 150 ML AMBAR",
      imagen: "/images/productos/3-sin-fondo.png",
      imagenAlt: "Botella cilíndrica de 150 ml, color ámbar",
      caracteristicas: [
        { label: "Capacidad", value: "150 ml" },
        { label: "Formato", value: "Botella cilíndrica" },
        { label: "Color o acabado", value: "Ámbar" },
        { label: "Material", value: "PENDIENTE" },
      ],
    },
    {
      id: "91300",
      nombre: "FRASCO CIL. 150 ML PASTILLERO AMBAR",
      imagen: "/images/productos/4-sin-fondo.png",
      imagenAlt: "Frasco cilíndrico pastillero de 150 ml, color ámbar",
      caracteristicas: [
        { label: "Capacidad", value: "150 ml" },
        { label: "Formato", value: "Frasco cilíndrico pastillero" },
        { label: "Color o acabado", value: "Ámbar" },
        { label: "Material", value: "PENDIENTE" },
      ],
    },
    {
      id: "90597",
      nombre: "TARRO CIL. 300 ML PRESION CRISTAL NUEVO",
      imagen: "/images/productos/2-sin-fondo.png",
      imagenAlt: "Tarro cilíndrico de 300 ml de cierre a presión, acabado cristal",
      caracteristicas: [
        { label: "Capacidad", value: "300 ml" },
        { label: "Formato", value: "Tarro cilíndrico de presión" },
        { label: "Color o acabado", value: "Cristal" },
        { label: "Material", value: "PENDIENTE" },
      ],
    },
    {
      id: "90596",
      nombre: "TAPA 80 MM PRESION TRANSPARENTE",
      imagen: "/images/productos/3-sin-fondo.png",
      imagenAlt: "Tapa de 80 mm de cierre a presión, acabado transparente",
      caracteristicas: [
        { label: "Capacidad", value: "PENDIENTE" },
        { label: "Formato", value: "Tapa de 80 mm de presión" },
        { label: "Color o acabado", value: "Transparente" },
        { label: "Material", value: "PENDIENTE" },
      ],
    },
  ],
};

/** Busca un producto por su id. Devuelve undefined si no está en el catálogo. */
export function findProducto(id: string) {
  return catalogoContent.productos.find((producto) => producto.id === id);
}
