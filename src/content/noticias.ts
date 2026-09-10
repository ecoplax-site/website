// Contenido visible de la sección Noticias (src/components/Noticias.tsx).
// Editable desde la interfaz web de GitHub sin abrir un editor de código:
// cambia solo los valores entre comillas, no las llaves ni los dos puntos.
//
// ============================================================================
// CONTENIDO DE PRUEBA — PENDIENTE DE REEMPLAZO COMPLETO
// ============================================================================
// Ninguna de las cuatro notas de abajo es real. Los titulares y los extractos
// están escritos para que la sección se vea con un tono verosímil, pero unos y
// otros son INVENTADOS: no corresponden a ningún hecho ocurrido. Se apoyan
// solo en hechos neutros de operación —apertura, disponibilidad, presencia,
// participación— y no contienen cifras, fechas, certificaciones, nombres
// propios, afirmaciones ambientales ni especificaciones técnicas. Sirven para
// ver la sección montada, no para publicarse.
//
// Cuidado justamente por eso: al sonar creíbles, es más fácil que se cuelen a
// producción que cuando decían "texto de relleno". Nada de esto se publica sin
// sustituirlo por notas reales.
//
// Al recibir las notas reales hay que sustituir las cuatro entradas enteras
// —fecha, título, extracto y enlace— y borrar este aviso.
//
// PENDIENTE también:
//   - fotografías de portada: hoy cada tarjeta pinta un bloque de color del
//     sistema en su lugar, igual que las tarjetas de Materiales;
//   - destino de los enlaces: no existe todavía página de detalle de nota, así
//     que los cuatro href apuntan a "#";
//   - aprobación de copy del headline, del párrafo introductorio y de las
//     etiquetas de los controles del carrusel.
// ============================================================================

export type Nota = {
  /**
   * Fecha de publicación, ya formateada como se quiera ver.
   * PENDIENTE: hoy es un texto de relleno, no una fecha.
   */
  date: string;
  /** Titular de la nota. Se renderiza como <h3> dentro de su tarjeta. */
  title: string;
  /** Extracto breve, dos o tres líneas, bajo el titular. */
  excerpt: string;
  /** Destino de la tarjeta. La tarjeta entera es el enlace. */
  href: string;
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
  notas: Nota[];
};

export const noticiasContent: NoticiasContent = {
  headline: "Últimas noticias",
  intro:
    "Lanzamientos, aperturas, presencia en el sector y novedades de la operación. Todo lo que va pasando en la compañía, reunido en un mismo lugar.",
  carouselLabel: "Últimas noticias",
  previousLabel: "Ver noticias anteriores",
  nextLabel: "Ver noticias siguientes",
  notas: [
    {
      date: "Fecha pendiente",
      title: "Ampliamos nuestra presencia comercial en el país",
      excerpt:
        "El equipo comercial suma nuevos puntos de contacto para atender proyectos en más regiones del país.",
      href: "#",
    },
    {
      date: "Fecha pendiente",
      title: "Participamos en un encuentro del sector del envase",
      excerpt:
        "Estuvimos presentes en una jornada del sector, con espacio para conversar con colegas de la industria y ver hacia dónde se mueve el mercado.",
      href: "#",
    },
    {
      date: "Fecha pendiente",
      title: "El catálogo completo ya está disponible en línea",
      excerpt:
        "Toda la oferta de producto puede consultarse ya desde el sitio, con cada familia reunida en un mismo lugar.",
      href: "#",
    },
    {
      date: "Fecha pendiente",
      title: "Abrimos un nuevo espacio de atención a clientes",
      excerpt:
        "Un punto de encuentro para reuniones y seguimiento de proyectos, pensado para resolver en persona lo que no siempre se resuelve a distancia.",
      href: "#",
    },
  ],
};
