// Contenido visible de la sección Origen (src/components/Origen.tsx).
// Editable desde la interfaz web de GitHub sin abrir un editor de código:
// cambia solo los valores entre comillas, no las llaves ni los dos puntos.
//
// Copy entregado por SCNDAL.
// Para agregar o quitar un párrafo, añade o borra una línea entrecomillada
// dentro de `paragraphs`. El orden de la lista es el orden en que se muestran.
//
// Las tarjetas de Calidad, Sustentabilidad, Innovación y Compromiso ya no están
// aquí: viven en src/content/valores.ts.

export type OrigenContent = {
  /** Etiqueta pequeña sobre el titular. */
  eyebrow: string;
  /** Titular de la sección. Se renderiza como <h2>: el único <h1> es el del Hero. */
  headline: string;
  /** Párrafos bajo el titular, en el orden en que se muestran. */
  paragraphs: string[];
};

export const origenContent: OrigenContent = {
  eyebrow: "Nuestro origen",
  headline: "El plástico no es el problema. Lo que hacemos con él, sí.",
  paragraphs: [
    "Ecoplax nació de una convicción incómoda: la industria del envase no tiene que desaparecer, tiene que cambiar de materia. Que un frasco pueda tener una segunda vida. Y una tercera. Que el material que hoy protege un producto mañana regrese a la línea en lugar de quedarse en un suelo o en el mar.",
    "No creemos en los gestos. Creemos en las decisiones que se toman en planta, envase por envase, todos los días.",
  ],
};
