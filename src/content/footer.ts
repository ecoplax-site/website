// Contenido visible del Footer (src/components/Footer.tsx).
// Editable desde la interfaz web de GitHub sin abrir un editor de código:
// cambia solo los valores entre comillas, no las llaves ni los dos puntos.

export type FooterLocation = {
  heading: string;
  addressLines: string[];
  phone: {
    /** Texto visible: formato legible mexicano. No usar este valor en el href. */
    display: string;
    /**
     * Enlace tel: — formato internacional con código de país (+52), solo
     * dígitos tras el "+", sin espacios ni guiones. No usar este valor como texto visible.
     */
    href: `tel:+52${string}`;
  };
};

export type FooterLegalLink = {
  label: string;
  href: string;
  /** true mientras la ruta de destino todavía no exista en el sitio. */
  pending: boolean;
};

export type FooterContent = {
  /** Texto placeholder del logo, mientras no exista el SVG oficial del cliente. */
  logoText: string;
  tagline: string;
  plant: FooterLocation;
  /**
   * PENDIENTE: no hay una dirección de correo de contacto confirmada por el
   * cliente. No se debe inventar una. Cuando SCNDAL la confirme, reemplazar
   * `null` por el string del correo — el Footer ya está listo para mostrarlo.
   */
  email: string | null;
  legal: {
    /** Todo lo que va después de "© [año] " en la línea legal. */
    brandLine: string;
  };
  /**
   * PENDIENTE: /aviso-de-privacidad y /terminos aún no existen como páginas
   * del sitio. Los enlaces quedan preparados apuntando a esas rutas; marcar
   * `pending: false` en cada uno cuando la página correspondiente se publique.
   */
  legalLinks: FooterLegalLink[];
};

export const footerContent: FooterContent = {
  logoText: "ecoplax",
  tagline: "Cambiamos la forma, no el compromiso.",
  plant: {
    heading: "Planta",
    addressLines: ["Apan, Hidalgo"],
    phone: {
      display: "748 912 0555",
      href: "tel:+527489120555",
    },
  },
  email: null,
  legal: {
    brandLine: "Ecoplax. Marca de Cajaplax.",
  },
  legalLinks: [
    { label: "Aviso de privacidad", href: "/aviso-de-privacidad", pending: true },
    { label: "Términos", href: "/terminos", pending: true },
  ],
};
