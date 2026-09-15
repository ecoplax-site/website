// Contenido visible de la sección Valores (src/components/Valores.tsx).
// Editable desde la interfaz web de GitHub sin abrir un editor de código:
// cambia solo los valores entre comillas, no las llaves ni los dos puntos.
//
// Copy entregado por SCNDAL. Antes vivía en src/content/origen.ts, sin cambios.
// Para agregar o quitar una tarjeta, añade o borra un bloque
// { title: "...", description: "..." }, respetando las comas. El orden de la
// lista es el orden en que se muestran.
//
// La sección está pensada para cuatro tarjetas en una fila: con otro número
// hay que revisar el componente.

export type ValorCard = {
  /** Título de la tarjeta. Se renderiza como <h3>. */
  title: string;
  description: string;
};

/**
 * La segunda tarjeta de la lista se muestra en verde de marca: es el acento de
 * la sección (ver Valores.tsx). Si reordenas la lista, el acento se queda en la
 * segunda posición, no sigue a la tarjeta.
 */
export const valoresCards: ValorCard[] = [
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
];
