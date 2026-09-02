/*
  Geometría de la capa que aloja la escena 3D del hero.

  Vive en su propio módulo, sin dependencias, para que el loader pueda leerla
  sin arrastrar three.js a su chunk: importar estas constantes desde
  EspecieroScene.tsx convertiría el import dinámico en estático y anularía la
  separación de bundles.
*/

/**
 * Alto del canvas respecto al alto de la tarjeta del hero.
 *
 * El excedente sobre 1 es el sangrado: la franja de canvas que continúa por
 * debajo del borde inferior de la tarjeta, sobre el fondo de la página.
 *
 * Es una proporción y no un valor fijo en píxeles a propósito. Con un sangrado
 * fijo, el envase —que ocupa una fracción constante del canvas— sobresaldría
 * cada vez menos según crece el alto de la ventana, hasta dejar de asomar en
 * pantallas altas. En proporción, la composición se mantiene en cualquier alto.
 */
export const HERO_SCENE_HEIGHT_RATIO = 1.25;

/**
 * Fracción del alto del canvas que queda por encima de la tarjeta y, por tanto,
 * escucha el puntero. La franja restante es el sangrado, que va con
 * pointer-events: none para no interponerse con lo que siga en la página.
 */
export const POINTER_AREA_RATIO = 1 / HERO_SCENE_HEIGHT_RATIO;
