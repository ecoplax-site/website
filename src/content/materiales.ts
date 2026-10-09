// Contenido visible de la sección Materiales (src/components/Materiales.tsx).
// Editable desde la interfaz web de GitHub sin abrir un editor de código:
// cambia solo los valores entre comillas, no las llaves ni los dos puntos.
//
// PENDIENTE descripción técnica de RPET, PP-ECO y HDPE-ECO, la define el
// cliente. Las descripciones actuales de esas tres son provisionales y no
// incluyen datos técnicos.
//
// Para agregar o quitar una ruta, añade o borra un bloque
// { name: "...", description: "...", imagen: "...", imagenAlt: "..." } dentro
// de `materiales`, respetando las comas. El carrusel se ajusta solo: no hay que
// tocar el componente.
//
// Las fotos viven en public/images/materiales/ y se escriben aquí sin "public".
// Todas deben ser cuadradas de 1080 × 1080 px: el componente declara esas
// dimensiones. Si una foto nueva tiene otra medida, avisa antes de subirla.

export type Material = {
  /** Nombre de la ruta. Se renderiza como <h3> dentro de su tarjeta. */
  name: string;
  /** Descripción corta, en texto corrido, centrada bajo el nombre. */
  description: string;
  /** Ruta de la foto del material, desde public/. Cuadrada, 1080 × 1080 px. */
  imagen: string;
  /** Texto alternativo de la foto: describe lo que se ve, no el nombre del archivo. */
  imagenAlt: string;
};

export type MaterialesContent = {
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
  materiales: Material[];
};

export const materialesContent: MaterialesContent = {
  eyebrow: "Materiales",
  headline: "Tu envase de siempre, en versión eco",
  intro:
    "Cualquier envase del catálogo de Cajaplax puede fabricarse en versión Ecoplax. La geometría, los moldes y las tolerancias no cambian: cambia la materia con la que se produce. Estas son las rutas disponibles.",
  carouselLabel: "Materiales",
  previousLabel: "Ver materiales anteriores",
  nextLabel: "Ver materiales siguientes",
  materiales: [
    {
      // PENDIENTE descripción técnica: esta es provisional.
      name: "RPET",
      description:
        "PET reciclado post-consumo. Conserva la transparencia y la resistencia del PET virgen.",
      imagen: "/images/materiales/rpet.webp",
      imagenAlt: "Primer plano de pellets de resina transparentes y cristalinos.",
    },
    {
      name: "PCR",
      description:
        "Resinas recicladas post-consumo. Material que ya tuvo una vida útil y vuelve a entrar al ciclo productivo.",
      imagen: "/images/materiales/pcr.webp",
      imagenAlt: "Primer plano de pellets de resina blancos y opacos.",
    },
    {
      // PENDIENTE aprobación de copy: descripción neutralizada, sin afirmaciones
      // ambientales. La descripción técnica de EcoPure® la define el cliente.
      name: "ECOPURE",
      description:
        "Aditivo que se incorpora a la resina durante el proceso productivo. Su alcance y aplicación se definen según el requerimiento de cada proyecto.",
      imagen: "/images/materiales/ecopure.webp",
      imagenAlt: "Pellets de resina transparentes mezclados con pellets azules translúcidos.",
    },
    {
      name: "ADITIVOS",
      description:
        "Otras formulaciones aditivas disponibles según el requerimiento del proyecto.",
      imagen: "/images/materiales/aditivos.webp",
      imagenAlt: "Pellets de resina en azul marino y azul claro, mezclados.",
    },
    {
      // PENDIENTE aprobación de copy: sin afirmaciones ambientales. PENDIENTE
      // también el origen de la materia prima (reciclado, otra fuente…): lo
      // define el cliente.
      name: "PP-ECO",
      description:
        "Versión Ecoplax de los envases de polipropileno del catálogo de Cajaplax. Cambia la materia prima; la geometría, los moldes y las tolerancias son los mismos.",
      imagen: "/images/materiales/pp-eco.webp",
      imagenAlt: "Primer plano de pellets de resina translúcidos de tono lechoso.",
    },
    {
      // PENDIENTE aprobación de copy: sin afirmaciones ambientales. PENDIENTE
      // también el origen de la materia prima (reciclado, otra fuente…): lo
      // define el cliente.
      name: "HDPE-ECO",
      description:
        "Versión Ecoplax de los envases de polietileno de alta densidad del catálogo de Cajaplax. Cambia la materia prima; la geometría, los moldes y las tolerancias son los mismos.",
      imagen: "/images/materiales/hdpe-eco.webp",
      imagenAlt: "Montón de pellets de resina blancos y opacos sobre fondo claro.",
    },
  ],
};
