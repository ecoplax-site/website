// Contenido visible de la sección Pilares (src/components/Pilares.tsx).
// Editable desde la interfaz web de GitHub sin abrir un editor de código:
// cambia solo los valores entre comillas, no las llaves ni los dos puntos.
//
// Copy entregado por SCNDAL.
// Para agregar o quitar una tarjeta de un pilar, añade o borra una línea
// entrecomillada dentro de su lista `cards`, respetando las comas. El número de
// tarjetas puede variar de un pilar a otro: la retícula se adapta sola.

export type Pilar = {
  /** Identificador interno. Se usa en los id de la pestaña y del panel. */
  id: string;
  /** Nombre del pilar, el texto visible del botón del selector. */
  name: string;
  /** Tarjetas de contenido del pilar, en el orden en que se muestran. */
  cards: string[];
};

export type PilaresContent = {
  /** Etiqueta pequeña sobre el titular. */
  eyebrow: string;
  /** Titular de la sección. Se renderiza como <h2>. */
  headline: string;
  /** Párrafo de entrada, bajo el titular. */
  intro: string;
  /** Nombre accesible del selector de pilares: lo anuncian los lectores de pantalla. */
  selectorLabel: string;
  /** Pilares. El primero de la lista es el que aparece activo al cargar. */
  pillars: Pilar[];
};

export const pilaresContent: PilaresContent = {
  eyebrow: "Nuestros pilares",
  headline: "Innovación con propósito",
  intro:
    "En Ecoplax el progreso no se paga con la salud del planeta. Nuestros productos se diseñan bajo tres pilares que ordenan cada decisión de material, proceso y diseño.",
  selectorLabel: "Pilares",
  pillars: [
    {
      id: "sostenibilidad",
      name: "Sostenibilidad Integral",
      cards: [
        "Trabajamos con materiales reciclables, diseñados para que cada envase pueda tener más de una vida útil.",
        "Incorporamos resinas PCR, plástico ya usado que vuelve a entrar al ciclo de producción en lugar de terminar como residuo.",
        "Ofrecemos EcoPure®, un aditivo que favorece la descomposición del plástico en condiciones ambientales, disponible como línea distinta a la de resinas recicladas.",
      ],
    },
    {
      id: "calidad",
      name: "Calidad y Experiencia",
      cards: [
        "Más de cinco décadas de experiencia de Cajaplax respaldan cada envase: duradero, seguro y funcional, sin ceder en higiene, inocuidad ni resistencia.",
        "Innovamos en diseño para adaptarnos a industrias distintas, de alimentos a cosméticos, con un enfoque ecoeficiente.",
      ],
    },
    {
      id: "impacto",
      name: "Impacto Positivo",
      cards: [
        "No solo vendemos envases: buscamos transformar hábitos y promover una cultura de consumo responsable.",
        "Construimos alianzas con empresas comprometidas para fortalecer cadenas de valor sostenibles.",
      ],
    },
  ],
};
