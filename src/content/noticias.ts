// Contenido visible de la sección Noticias (src/components/Noticias.tsx).
// Editable desde la interfaz web de GitHub sin abrir un editor de código:
// cambia solo los valores entre comillas, no las llaves ni los dos puntos.
//
// ============================================================================
// CONTENIDO DE PRUEBA — PENDIENTE DE REEMPLAZO COMPLETO
// ============================================================================
// Ninguna de las cuatro notas de abajo es real. Los titulares, los extractos y
// los cuerpos están escritos para que la sección y la página de detalle se vean
// con un tono verosímil, pero todos son INVENTADOS: no corresponden a ningún
// hecho ocurrido. Se apoyan solo en hechos neutros de operación —apertura,
// disponibilidad, presencia, participación— y no contienen cifras, fechas,
// certificaciones, nombres propios, afirmaciones ambientales ni
// especificaciones técnicas. Sirven para ver las páginas montadas, no para
// publicarse.
//
// Cuidado justamente por eso: al sonar creíbles, es más fácil que se cuelen a
// producción que cuando decían "texto de relleno". Nada de esto se publica sin
// sustituirlo por notas reales.
//
// Al recibir las notas reales hay que sustituir las cuatro entradas enteras
// —slug, fecha, título, extracto y cuerpo— y borrar este aviso. El slug es la
// URL de la nota: cambiarlo rompe el enlace, así que si una nota ya se ha
// compartido, conviene dejarlo como esté.
//
// PENDIENTE también:
//   - fotografías de portada: hoy cada tarjeta pinta un bloque de color del
//     sistema en su lugar, igual que las tarjetas de Materiales;
//   - aprobación de copy del headline, del párrafo introductorio y de las
//     etiquetas de los controles del carrusel.
// ============================================================================

/** Un bloque del cuerpo de la nota: un encabezado y sus párrafos. */
export type NotaSeccion = {
  /**
   * Ancla de la sección dentro de la página. Es lo que enlaza el índice, así
   * que tiene que ser único dentro de su nota y no debería cambiar una vez
   * publicada.
   */
  id: string;
  /** Encabezado del bloque. Se renderiza como <h2> y da nombre a su entrada del índice. */
  heading: string;
  /** Párrafos del bloque, en orden. */
  paragraphs: string[];
};

export type Nota = {
  /**
   * Identificador en la URL: /noticias/<slug>. Minúsculas y guiones, sin
   * acentos ni espacios.
   */
  slug: string;
  /**
   * Fecha de publicación, ya formateada como se quiera ver.
   * PENDIENTE: hoy es un texto de relleno, no una fecha.
   */
  date: string;
  /** Titular de la nota. Se renderiza como <h3> dentro de su tarjeta. */
  title: string;
  /** Extracto breve, dos o tres líneas, bajo el titular. */
  excerpt: string;
  /** Cuerpo de la nota, en bloques con encabezado. Alimenta también el índice. */
  body: NotaSeccion[];
};

export type NoticiasContent = {
  /** Titular de la sección. Se renderiza como <h2>. PENDIENTE aprobación de copy. */
  headline: string;
  /**
   * Párrafo de entrada, bajo el titular. Dice qué encuentra el visitante en la
   * sección. PENDIENTE aprobación de copy.
   */
  intro: string;
  /** Nombre accesible del carrusel: lo anuncian los lectores, no se ve. */
  carouselLabel: string;
  /** Texto accesible del botón anterior: no se ve, el botón muestra un ícono. */
  previousLabel: string;
  /** Texto accesible del botón siguiente: no se ve, el botón muestra un ícono. */
  nextLabel: string;
  /**
   * Nombre accesible del índice de la página de detalle. Lo anuncian los
   * lectores de pantalla al entrar en él; no se ve.
   */
  indiceLabel: string;
  notas: Nota[];
};

export const noticiasContent: NoticiasContent = {
  headline: "Últimas noticias",
  intro:
    "Lanzamientos, aperturas, presencia en el sector y novedades de la operación. Todo lo que va pasando en la compañía, reunido en un mismo lugar.",
  carouselLabel: "Últimas noticias",
  previousLabel: "Ver noticias anteriores",
  nextLabel: "Ver noticias siguientes",
  indiceLabel: "Contenido de la nota",
  notas: [
    {
      slug: "presencia-comercial",
      date: "Fecha pendiente",
      title: "Ampliamos nuestra presencia comercial en el país",
      excerpt:
        "El equipo comercial suma nuevos puntos de contacto para atender proyectos en más regiones del país.",
      body: [
        {
          id: "mas-cerca",
          heading: "Más cerca de cada proyecto",
          paragraphs: [
            "El equipo comercial suma nuevos puntos de contacto para atender proyectos en más regiones del país. La idea es sencilla: acortar la distancia entre quien pregunta y quien responde.",
            "Hasta ahora buena parte de las conversaciones ocurría a distancia. Con la ampliación, muchas pueden resolverse en el mismo terreno donde se está trabajando.",
          ],
        },
        {
          id: "dia-a-dia",
          heading: "Qué cambia en el día a día",
          paragraphs: [
            "Los tiempos de respuesta se acortan y el seguimiento deja de depender de una agenda de viajes. Para los proyectos ya en marcha, el interlocutor sigue siendo el mismo.",
          ],
        },
      ],
    },
    {
      slug: "encuentro-del-sector",
      date: "Fecha pendiente",
      title: "Participamos en un encuentro del sector del envase",
      excerpt:
        "Estuvimos presentes en una jornada del sector, con espacio para conversar con colegas de la industria y ver hacia dónde se mueve el mercado.",
      body: [
        {
          id: "la-jornada",
          heading: "Una jornada de conversaciones",
          paragraphs: [
            "Estuvimos presentes en una jornada del sector, con espacio para conversar con colegas de la industria y ver hacia dónde se mueve el mercado.",
            "El encuentro reunió a fabricantes, transformadores y equipos de compras. La mayor parte del valor no estuvo en las presentaciones, sino en los pasillos.",
          ],
        },
        {
          id: "que-nos-llevamos",
          heading: "Qué nos llevamos",
          paragraphs: [
            "Volvimos con una lista de temas que se repiten en casi todas las conversaciones, y con contactos que ya se han convertido en reuniones.",
          ],
        },
      ],
    },
    {
      slug: "catalogo-en-linea",
      date: "Fecha pendiente",
      title: "El catálogo completo ya está disponible en línea",
      excerpt:
        "Toda la oferta de producto puede consultarse ya desde el sitio, con cada familia reunida en un mismo lugar.",
      body: [
        {
          id: "un-mismo-lugar",
          heading: "Todo en un mismo lugar",
          paragraphs: [
            "Toda la oferta de producto puede consultarse ya desde el sitio, con cada familia reunida en un mismo lugar y una página propia por referencia.",
            "Antes había que pedir el catálogo y esperar a que llegara. Ahora está siempre a mano y siempre en su última versión.",
          ],
        },
        {
          id: "como-esta-organizado",
          heading: "Cómo está organizado",
          paragraphs: [
            "Las referencias se agrupan por formato. Cada una tiene su propia página, con el nombre completo y los campos de ficha que le corresponden.",
          ],
        },
      ],
    },
    {
      slug: "espacio-de-atencion",
      date: "Fecha pendiente",
      title: "Abrimos un nuevo espacio de atención a clientes",
      excerpt:
        "Un punto de encuentro para reuniones y seguimiento de proyectos, pensado para resolver en persona lo que no siempre se resuelve a distancia.",
      body: [
        {
          id: "un-lugar",
          heading: "Un lugar para reunirse",
          paragraphs: [
            "Un punto de encuentro para reuniones y seguimiento de proyectos, pensado para resolver en persona lo que no siempre se resuelve a distancia.",
            "El espacio está abierto tanto a quienes ya trabajan con nosotros como a quienes están evaluando hacerlo.",
          ],
        },
        {
          id: "como-funciona",
          heading: "Cómo funciona",
          paragraphs: [
            "Las visitas se coordinan con el equipo comercial. Basta con avisar con antelación para que quien corresponda esté disponible.",
          ],
        },
      ],
    },
  ],
};

/** Ruta de la página de detalle de una nota. Un solo sitio donde se arma. */
export function notaHref(slug: string) {
  return `/noticias/${slug}`;
}

/** Busca una nota por su slug. Devuelve undefined si no existe. */
export function findNota(slug: string) {
  return noticiasContent.notas.find((nota) => nota.slug === slug);
}
