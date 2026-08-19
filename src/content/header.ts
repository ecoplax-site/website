// Contenido visible del Header (src/components/Header.tsx).
// Editable desde la interfaz web de GitHub sin abrir un editor de código:
// cambia solo los valores entre comillas, no las llaves ni los dos puntos.

export type HeaderContent = {
  /** Texto placeholder del logo, mientras no exista el SVG oficial del cliente. */
  logoText: string;
  /** Etiqueta del botón de cotización (sin acción todavía, ver Header.tsx). */
  ctaLabel: string;
};

export const headerContent: HeaderContent = {
  logoText: "ecoplax",
  ctaLabel: "Solicitar cotización",
};
