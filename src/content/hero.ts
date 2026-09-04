// Contenido visible del Hero (src/components/Hero.tsx).
// Editable desde la interfaz web de GitHub sin abrir un editor de código:
// cambia solo los valores entre comillas, no las llaves ni los dos puntos.

export type HeroContent = {
  /** Etiqueta pequeña sobre el titular. */
  eyebrow: string;
  /**
   * Titular principal — es el único <h1> de la página.
   *
   * Una entrada por línea: el salto entre ellas se fuerza en escritorio (desde
   * xl, que es donde la primera línea cabe entera sin reducir el cuerpo de la
   * letra). Por debajo de ese ancho las líneas se unen con un espacio y el
   * texto fluye solo en las que hagan falta.
   *
   * Para cambiar dónde corta el titular, mueve las palabras entre las dos
   * líneas de la lista. No hace falta tocar el componente.
   */
  headlineLines: string[];
  subtitle: string;
  /** Etiqueta del botón de cotización (sin acción todavía, ver Hero.tsx). */
  ctaLabel: string;
  /**
   * Texto solo para lectores de pantalla del indicador de scroll al pie de
   * la tarjeta (el indicador visual es un ícono sin texto visible).
   */
  scrollIndicatorLabel: string;
};

export const heroContent: HeroContent = {
  eyebrow: "Una marca de Cajaplax",
  headlineLines: ["El envase que ya conoces,", "con otra huella"],
  subtitle:
    "Resinas PCR, RPET y materiales de menor impacto, fabricados en Apan con el respaldo de más de 50 años de Cajaplax.",
  ctaLabel: "Solicitar cotización",
  scrollIndicatorLabel: "Desplázate para ver más contenido",
};
