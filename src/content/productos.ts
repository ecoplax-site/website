// Contenido visible de la sección Productos (src/components/Productos.tsx).
// Editable desde la interfaz web de GitHub sin abrir un editor de código:
// cambia solo los valores entre comillas, no las llaves ni los dos puntos.
//
// PENDIENTE descripción técnica de RPET, PP-ECO y HDPE-ECO, la define el
// cliente. Las descripciones actuales de esas tres son provisionales y no
// incluyen datos técnicos.
//
// Para agregar o quitar una ruta, añade o borra un bloque
// { name: "...", description: "..." } dentro de `products`, respetando las
// comas. El carrusel se ajusta solo: no hay que tocar el componente.

export type Producto = {
  /** Nombre de la ruta. Se renderiza como <h3> dentro de su tarjeta. */
  name: string;
  /** Descripción corta, en texto corrido, centrada bajo el nombre. */
  description: string;
};

export type ProductosContent = {
  /** Etiqueta pequeña sobre el titular. */
  eyebrow: string;
  /** Titular de la sección. Se renderiza como <h2>: el único <h1> es el del Hero. */
  headline: string;
  /** Párrafo de introducción, bajo el titular. */
  intro: string;
  /** Nombre accesible del carrusel: lo anuncian los lectores de pantalla, no se ve. */
  carouselLabel: string;
  /** Texto accesible del botón anterior: no se ve, el botón muestra un ícono. */
  previousLabel: string;
  /** Texto accesible del botón siguiente: no se ve, el botón muestra un ícono. */
  nextLabel: string;
  products: Producto[];
};

export const productosContent: ProductosContent = {
  eyebrow: "Nuestros productos",
  headline: "Tu envase de siempre, en versión eco",
  intro:
    "Cualquier envase del catálogo de Cajaplax puede fabricarse en versión Ecoplax. La geometría, los moldes y las tolerancias no cambian: cambia la materia con la que se produce. Estas son las rutas disponibles.",
  carouselLabel: "Productos",
  previousLabel: "Ver productos anteriores",
  nextLabel: "Ver productos siguientes",
  products: [
    {
      // PENDIENTE descripción técnica: esta es provisional.
      name: "RPET",
      description:
        "PET reciclado post-consumo. Conserva la transparencia y la resistencia del PET virgen.",
    },
    {
      name: "PCR",
      description:
        "Resinas recicladas post-consumo. Material que ya tuvo una vida útil y vuelve a entrar al ciclo productivo.",
    },
    {
      name: "ECOPURE",
      description:
        "Aditivo que favorece la descomposición del plástico en condiciones ambientales.",
    },
    {
      name: "ADITIVOS",
      description:
        "Otras formulaciones aditivas disponibles según el requerimiento del proyecto.",
    },
    {
      // PENDIENTE descripción técnica: esta es provisional.
      name: "PP-ECO",
      description: "Polipropileno en versión de menor impacto.",
    },
    {
      // PENDIENTE descripción técnica: esta es provisional.
      name: "HDPE-ECO",
      description: "Polietileno de alta densidad en versión de menor impacto.",
    },
  ],
};
