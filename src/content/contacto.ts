// Contenido visible del modal de contacto (src/components/ContactModal.tsx).
// Editable desde la interfaz web de GitHub sin abrir un editor de código:
// cambia solo los valores entre comillas, no las llaves ni los dos puntos.
//
// Las etiquetas de los campos vienen dadas por SCNDAL. Los mensajes de error,
// el título y los textos de botón son provisionales de maquetación: revisar
// redacción antes de publicar.

export type ContactoField = {
  /** Texto del <label>. Nunca se usa el placeholder como etiqueta. */
  label: string;
};

export type ContactoRequiredField = ContactoField & {
  /** Mensaje cuando el campo obligatorio se deja vacío. */
  error: string;
};

export type ContactoSelectField = ContactoRequiredField & {
  /** Texto de la opción inicial, que va deshabilitada y no es una respuesta válida. */
  placeholder: string;
};

export type ContactoStep = {
  /** Nombre del paso. Se anuncia junto al indicador de progreso. */
  name: string;
};

export type ContactoContent = {
  /**
   * Título del diálogo. Va sobre la imagen del modal y es el destino del
   * aria-labelledby.
   */
  title: string;
  /** Texto accesible del botón de cerrar: no se ve, el botón muestra un ícono. */
  closeLabel: string;
  submitLabel: string;
  /** Botón que avanza del paso 1 al 2. */
  nextLabel: string;
  /** Botón que vuelve del paso 2 al 1. */
  backLabel: string;
  /**
   * Indicador de progreso. {paso} y {total} se sustituyen por los números;
   * conserva las llaves tal cual o el indicador dejará de contar.
   */
  stepIndicator: string;
  /** Los dos pasos del formulario, en orden. */
  steps: ContactoStep[];
  /** Explica la marca de campo obligatorio que acompaña a las etiquetas. */
  requiredLegend: string;
  fields: {
    name: ContactoRequiredField;
    company: ContactoRequiredField;
    email: ContactoRequiredField & {
      /** Mensaje cuando hay texto pero no tiene forma de correo. */
      formatError: string;
    };
    phone: ContactoField;
    product: ContactoSelectField;
    volume: ContactoField & { placeholder: string };
    message: ContactoField;
  };
};

export const contactoContent: ContactoContent = {
  // PENDIENTE aprobación de copy: título, botones de navegación entre pasos,
  // indicador de progreso y nombres de los pasos son provisionales.
  title: "Contáctenos",
  closeLabel: "Cerrar",
  submitLabel: "Enviar solicitud",
  nextLabel: "Siguiente",
  backLabel: "Atrás",
  stepIndicator: "Paso {paso} de {total}",
  steps: [{ name: "Qué necesitas" }, { name: "Tus datos" }],
  requiredLegend: "Los campos marcados con asterisco son obligatorios.",
  fields: {
    name: {
      label: "Nombre completo",
      error: "Escribe tu nombre completo.",
    },
    company: {
      label: "Empresa",
      error: "Escribe el nombre de tu empresa.",
    },
    email: {
      label: "Correo electrónico",
      error: "Escribe tu correo electrónico.",
      formatError: "Revisa el correo: parece que le falta algo.",
    },
    phone: {
      label: "Teléfono",
    },
    product: {
      label: "Producto de interés",
      // PENDIENTE lista de productos, la define el cliente.
      placeholder: "Selecciona un producto",
      error: "Elige un producto de interés.",
    },
    volume: {
      label: "Volumen estimado",
      // PENDIENTE rangos de volumen, los define el cliente.
      placeholder: "Selecciona un volumen",
    },
    message: {
      label: "Mensaje",
    },
  },
};
