// Metadatos del sitio (título de pestaña y descripción para buscadores),
// usados en src/app/layout.tsx.
// Editable desde la interfaz web de GitHub sin abrir un editor de código:
// cambia solo los valores entre comillas, no las llaves ni los dos puntos.

export type SiteMetadata = {
  title: string;
  description: string;
  /**
   * Enlace de salto al contenido: el primer elemento tabulable del documento,
   * invisible hasta que recibe el foco. Solo lo ve quien navega con teclado.
   */
  skipLinkLabel: string;
};

export const siteMetadata: SiteMetadata = {
  title: "Ecoplax | Envases de PET con resina reciclada",
  description:
    "Envases plásticos sustentables fabricados en México. Resinas PCR, RPET y materiales de menor impacto, con certificación BRCGS y SMETA.",
  skipLinkLabel: "Saltar al contenido",
};
