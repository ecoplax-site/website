// Contenido visible del Header (src/components/Header.tsx).
// Editable desde la interfaz web de GitHub sin abrir un editor de código:
// cambia solo los valores entre comillas, no las llaves ni los dos puntos.

import { footerContent, type FooterNavLink } from "@/content/footer";

/**
 * Los enlaces de navegación son los mismos que los del footer —mismas
 * etiquetas y mismas anclas—, así que se reutilizan de ahí en lugar de
 * copiarlos: si se añade o se quita una sección, se toca un solo sitio y las
 * dos navegaciones quedan igual.
 *
 * OJO para quien edite contenido: las etiquetas de los enlaces NO están en este
 * archivo, están en src/content/footer.ts, en nav.links.
 */
export type HeaderNavLink = FooterNavLink;

export type HeaderContent = {
  /** Texto placeholder del logo, mientras no exista el SVG oficial del cliente. */
  logoText: string;
  /** Etiqueta del botón de cotización. Abre el modal de contacto. */
  ctaLabel: string;
  /** Nombre accesible del <nav>, para lectores de pantalla. */
  navLabel: string;
  /** Enlaces de navegación. Se toman del footer: ver nota de arriba. */
  navLinks: HeaderNavLink[];
  /** Panel de navegación de móvil, el que abre el botón de hamburguesa. */
  menu: {
    /**
     * Título del panel. Hace tres cosas a la vez: es el titular visible del
     * panel, el nombre accesible del botón de hamburguesa y el nombre del
     * diálogo. PENDIENTE aprobación de copy.
     */
    label: string;
    /** Etiqueta accesible del botón de cerrar del panel. */
    closeLabel: string;
  };
};

export const headerContent: HeaderContent = {
  logoText: "ecoplax",
  ctaLabel: "Solicitar cotización",
  navLabel: "Navegación principal",
  navLinks: footerContent.nav.links,
  menu: {
    label: "Menú",
    closeLabel: "Cerrar menú",
  },
};
