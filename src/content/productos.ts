// Contenido visible de la sección Productos (src/components/Productos.tsx).
// Editable desde la interfaz web de GitHub sin abrir un editor de código:
// cambia solo los valores entre comillas, no las llaves ni los dos puntos.
//
// PENDIENTE aprobación de copy: el titular y el párrafo de abajo son una
// propuesta, no están aprobados.
//
// OJO con los destacados: aquí NO se escriben datos de producto. Solo van los
// identificadores del catálogo (src/content/catalogo.ts), y de ahí salen la
// imagen, su texto alternativo y la ruta de la ficha. Si un producto cambia de
// foto o de nombre, se cambia allí una vez y esta sección se entera sola.

export type ProductosContent = {
  /** Titular de la sección. Se renderiza como <h2>. PENDIENTE aprobación de copy. */
  headline: string;
  /** Párrafo bajo el titular. PENDIENTE aprobación de copy. */
  intro: string;
  /**
   * Los tres productos del bento, por id del catálogo. El PRIMERO es la pieza
   * grande de la izquierda; los otros dos, las pequeñas apiladas a la derecha.
   * Para cambiar qué se destaca, basta con cambiar estos ids.
   */
  destacados: [string, string, string];
};

export const productosContent: ProductosContent = {
  headline: "Descubre nuestra línea de productos",
  intro:
    "Botellas, frascos, tarros y tapas de fabricación propia, en los formatos que ya usa la industria.",
  destacados: ["90794", "91234", "90535"],
};
