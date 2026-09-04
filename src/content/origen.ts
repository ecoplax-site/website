// Contenido visible de la sección Origen (src/components/Origen.tsx).
// Editable desde la interfaz web de GitHub sin abrir un editor de código:
// cambia solo los valores entre comillas, no las llaves ni los dos puntos.
//
// Copy entregado por SCNDAL.
// Para agregar o quitar un párrafo, añade o borra una línea entrecomillada
// dentro de `paragraphs`. Para agregar o quitar una tarjeta, añade o borra un
// bloque { title: "...", description: "..." } dentro de `cards`, respetando las
// comas. El orden de la lista es el orden en que se muestran.

export type OrigenCard = {
  /** Título de la tarjeta. Se renderiza como <h3>, bajo el <h2> de la sección. */
  title: string;
  description: string;
};

export type OrigenContent = {
  /** Etiqueta pequeña sobre el titular. */
  eyebrow: string;
  /** Titular de la sección. Se renderiza como <h2>: el único <h1> es el del Hero. */
  headline: string;
  /** Párrafos bajo el titular, en el orden en que se muestran. */
  paragraphs: string[];
  /**
   * Tarjetas de la columna derecha. La segunda de la lista se muestra en verde
   * de marca: es el acento de la sección (ver Origen.tsx). Si reordenas la
   * lista, el acento se queda en la segunda posición, no sigue a la tarjeta.
   */
  cards: OrigenCard[];
};

export const origenContent: OrigenContent = {
  eyebrow: "Nuestro origen",
  headline: "El plástico no es el problema. Lo que hacemos con él, sí.",
  paragraphs: [
    "Ecoplax nació de una convicción incómoda: la industria del envase no tiene que desaparecer, tiene que cambiar de materia. Que un frasco pueda tener una segunda vida. Y una tercera. Que el material que hoy protege un producto mañana regrese a la línea en lugar de quedarse en un suelo o en el mar.",
    "No creemos en los gestos. Creemos en las decisiones que se toman en planta, envase por envase, todos los días.",
  ],
  cards: [
    {
      title: "Calidad",
      description:
        "Los mismos controles, los mismos moldes y las mismas certificaciones que sostienen más de cinco décadas de Cajaplax.",
    },
    {
      title: "Sustentabilidad",
      description:
        "Resinas recicladas post-consumo y materiales de menor impacto, dentro de un plan con metas y años definidos.",
    },
    {
      title: "Innovación",
      description:
        "Materiales nuevos sobre geometrías probadas. El cambio ocurre en la materia prima, no en tu línea de llenado.",
    },
    {
      title: "Compromiso",
      description:
        "Fabricación propia en Apan, Hidalgo. Respondemos por cada lote porque lo producimos nosotros.",
    },
  ],
};
