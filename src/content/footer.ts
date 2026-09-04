// Contenido visible del Footer (src/components/Footer.tsx).
// Editable desde la interfaz web de GitHub sin abrir un editor de código:
// cambia solo los valores entre comillas, no las llaves ni los dos puntos.

export type FooterNavLink = {
  label: string;
  /** Ancla a una sección de la home. Debe coincidir con el id real de la sección. */
  href: string;
};

export type FooterPlant = {
  addressLines: string[];
  phone: {
    /** Texto visible: formato legible mexicano. No usar este valor en el href. */
    display: string;
    /**
     * Enlace tel: — formato internacional con código de país (+52), solo
     * dígitos tras el "+", sin espacios ni guiones. No usar como texto visible.
     */
    href: `tel:+52${string}`;
  };
};

export type FooterContent = {
  /**
   * PENDIENTE aprobación de copy: el titular, el párrafo y la etiqueta del
   * botón del CTA son versiones provisionales de maquetación.
   */
  cta: {
    /** Se renderiza como <h2>. */
    headline: string;
    intro: string;
    buttonLabel: string;
  };
  brand: {
    /** Texto placeholder del logo, mientras no exista el SVG oficial del cliente. */
    logoText: string;
    /** Descriptor de marca. Es el tagline oficial: no cambiarlo sin aprobación. */
    descriptor: string;
  };
  nav: {
    /** PENDIENTE aprobación de copy. */
    heading: string;
    /** Nombre accesible del <nav>, para lectores de pantalla. */
    label: string;
    links: FooterNavLink[];
  };
  contact: {
    /** PENDIENTE aprobación de copy. */
    heading: string;
    plantHeading: string;
    plant: FooterPlant;
    /**
     * PENDIENTE: no hay una dirección de correo de contacto confirmada por el
     * cliente. No se debe inventar una. Cuando SCNDAL la confirme, reemplazar
     * `null` por el string del correo — el Footer ya está listo para mostrarlo.
     */
    email: string | null;
  };
  legal: {
    /** Todo lo que va después de "© [año] " en la línea legal. */
    brandLine: string;
    /**
     * PENDIENTE aprobación de copy. La ruta /aviso-de-privacidad todavía no
     * existe como página del sitio.
     */
    privacyLabel: string;
    privacyHref: string;
  };
};

export const footerContent: FooterContent = {
  cta: {
    headline: "Hablemos de tu envase",
    intro:
      "Cuéntanos qué produces y en qué volumen. Te respondemos con opciones de material y formato para tu línea.",
    buttonLabel: "Solicitar cotización",
  },
  brand: {
    logoText: "ecoplax",
    descriptor: "Cambiamos la forma, no el compromiso.",
  },
  nav: {
    heading: "Navegación",
    label: "Secciones del sitio",
    // Los href corresponden a los id reales de cada <Section> de la home.
    links: [
      { label: "Origen", href: "#origen" },
      { label: "Pilares", href: "#pilares" },
      { label: "Productos", href: "#productos" },
    ],
  },
  contact: {
    heading: "Contacto",
    plantHeading: "Planta",
    plant: {
      addressLines: ["Apan, Hidalgo"],
      phone: {
        display: "748 912 0555",
        href: "tel:+527489120555",
      },
    },
    email: null,
  },
  legal: {
    brandLine: "Ecoplax. Marca de Cajaplax.",
    privacyLabel: "Aviso de privacidad",
    privacyHref: "/aviso-de-privacidad",
  },
};
