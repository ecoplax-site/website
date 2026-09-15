"use client";

import { useCallback, useId, useState } from "react";
import { usePathname } from "next/navigation";
import ContactButton from "@/components/ContactButton";
import Imagotipo from "@/components/brand/Imagotipo";
import Modal from "@/components/Modal";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { headerContent } from "@/content/header";

/**
 * Barra superior del sitio: logotipo, navegación y botón de cotización.
 *
 * Vive en el layout, así que se pinta en todas las rutas, y se posiciona a sí
 * misma. Tiene dos modos, que decide la ruta:
 *
 *   SOBRE EL HERO (home). Va superpuesta, fuera del flujo, sobre la tarjeta
 *   verde con fotografía. Es el modo para el que están calibrados los colores
 *   de los controles y el anillo de foco de dos tonos.
 *
 *   SOBRE EL FONDO DE PÁGINA (el resto de rutas). Va en el flujo, ocupando su
 *   sitio, sobre surface-base. Aquí no hay foto detrás: el logotipo pasa a ink
 *   —en ink-inverse mediría 1.02:1 y no se vería— y los controles se quedan con
 *   el anillo ink de la capa base, porque el halo claro de focus-ring-photo
 *   sobre canvas es invisible y no aporta nada.
 *
 * Su padding sigue siendo suyo y no tiene ninguna relación con el interno de la
 * tarjeta del hero: aquel está calibrado para el bloque de titular y aquí solo
 * hace falta separar la barra del borde. Siguen desacoplados.
 *
 * Es un componente de cliente porque el panel de navegación de móvil tiene
 * estado de abierto/cerrado, y porque necesita saber en qué ruta está.
 */

/*
  Umbral entre las dos navegaciones. Coincide con el breakpoint `md` de
  Tailwind, que es el que usan las clases de abajo para mostrar una u otra: si
  se cambia aquí, hay que cambiarlas también.

  Solo se usa para cerrar el panel al pasar a escritorio; qué se ve en cada
  tamaño lo deciden las clases, no este valor.
*/
const DESKTOP_QUERY = "(min-width: 768px)";

/*
  Padding propio de la barra, distinto en cada modo.

  SOBRE EL HERO: 22px en móvil, 30px desde sm y 38px desde lg. Deliberadamente
  menor que el padding interno de la tarjeta del hero (40/56/80px): basta para
  despegar la barra del borde, sin el aire que sí necesita el bloque de texto.
  Sigue sin tener relación con aquel: son dos valores independientes y este se
  puede mover sin tocar el otro.

  Estos 22/30/38 salen de restar 2px por lado a los 24/32/40 que tenía, para
  compensar los 4px que gana la fila (ver BAR_ROW_MIN_HEIGHT) y que la altura
  total de la barra no se mueva. Los dos valores están emparejados: si se cambia
  uno hay que rehacer la cuenta del otro.

  SOBRE EL FONDO DE PÁGINA: 12/16/20px. Aquí la barra tiene superficie propia,
  así que este padding ya no separa del borde de la tarjeta del hero sino que es
  el aire interior de la propia barra, y con menos basta. La altura total baja
  de 84/104/128px a 64/76/92px. La fila no cambia, así que el logotipo mide lo
  mismo en los dos modos: lo que encoge es el aire, no la marca.
*/
const HEADER_PADDING = {
  hero: "p-5.5 sm:p-7.5 lg:p-9.5",
  page: "p-3 sm:p-4 lg:p-5",
} as const;

/*
  Superficie de la barra.

  Sobre el hero no lleva ninguna: se superpone a la fotografía y los controles
  se sostienen solos.

  Fuera de la home lleva surface-muted, que es la que CLAUDE.md reserva para
  bloques con controles en verde de marca. Es además la que más separa del fondo
  de página: 1.46:1 contra canvas, frente a 1.06 de raised y 1.14 de soft, que
  a esa distancia no se leerían como barra. Contrastes medidos sobre ella:

    logotipo ink                6.57:1
    texto de píldora            8.44:1  (sobre su propio relleno Eggshell)
    silueta de píldora           1.28:1  (en hover, verde: 6.57:1)
    CTA y hamburguesa, texto     9.59:1
    CTA y hamburguesa, silueta   6.57:1
    anillo de foco               6.57:1

  Radio 24px, el de tarjeta de sección: la barra es una tarjeta más de la página.
*/
const HEADER_SURFACE = {
  hero: "",
  page: "rounded-3xl bg-surface-muted",
} as const;

/*
  Margen de la barra respecto al viewport. Es el mismo que separa del borde a
  todas las tarjetas de sección —y el que ponía la <section> del hero cuando la
  barra vivía dentro—, así que la barra sigue alineada con la tarjeta que tenga
  debajo.

  Ojo: esto NO es el padding interno de la tarjeta del hero. Son dos cosas
  distintas que casualmente conviven en el mismo borde. El de la tarjeta
  (p-10/sm:p-14/lg:p-20) no interviene aquí y puede cambiar sin mover la barra.
*/
const VIEWPORT_MARGIN = "px-4 py-4 sm:px-6 sm:py-6";

/*
  Alto del logotipo por breakpoint: 40px en móvil, 44px desde sm y 52px desde lg.

  Es exactamente el alto mínimo de la fila (BAR_ROW_MIN_HEIGHT), es decir todo
  el sitio disponible: el imagotipo lo ocupa entero. Que la fila haya crecido no
  mueve la barra, porque el padding baja lo mismo que ella sube.

  Lo que gobierna la pieza es el ALTO de su caja, no el cuerpo de la letra. El
  texto de abajo es un placeholder: cuando llegue el SVG definitivo se sustituye
  por la imagen, dentro del mismo enlace, con esta misma clase y w-auto —

      <Image src={...} alt="Ecoplax" className={`${LOGO_HEIGHT} w-auto`} />

  — y ni la barra cambia de alto ni hay que recalibrar el padding. Por eso el
  placeholder lleva leading-none y un cuerpo que nunca supera ese alto (24/30/36
  px), centrado dentro de la caja: ya ocupa hoy el sitio que ocupará el logo.

  PENDIENTE decisión de marca: el manual fija mínimos de 77px de alto para el
  isotipo y 360px de ancho para el imagotipo. Ninguno de los dos entra en una
  barra de estas medidas, así que al recibir los SVG hay que decidir con el
  cliente qué versión del logotipo va aquí y con qué mínimo.
*/
const LOGO_HEIGHT = "h-10 sm:h-11 lg:h-13";

/*
  Alto mínimo de la fila de la barra: 40px en móvil, 44px desde sm y 52px desde
  lg. Fijado explícitamente para que no lo marque el elemento más alto que haya
  dentro en cada momento.

  Subió un escalón (4px) respecto a los 36/40/48 originales para dar más sitio
  al imagotipo, y HEADER_PADDING bajó 2px por lado para compensarlo: la altura
  total de la barra es la misma que antes —84/104/128px— y ni el CTA ni la
  hamburguesa se mueven de donde estaban, porque lo que la fila gana de alto se
  reparte a partes iguales arriba y abajo al centrarlos.

  Gracias a él, el alto de la barra no depende ni del logotipo ni de los
  controles: pueden cambiar de tamaño —o llegar el SVG con otra proporción— sin
  mover el borde inferior de la barra ni tocar el padding.

  Va en una fila interior, no en el <header>: así el mínimo mide solo el
  contenido y queda independiente del padding, que se suma por fuera.
*/
const BAR_ROW_MIN_HEIGHT = "min-h-10 sm:min-h-11 lg:min-h-13";

/*
  Píldora de navegación de escritorio.

  REPOSO: fondo Eggshell (surface-soft) sólido con texto verde de marca (ink),
  sin borde. El texto mide 8.44:1 sobre el relleno, que es sólido, así que el
  contraste del texto no depende de lo que haya detrás: ni del video del hero
  ni del fondo de página.

  Capitalización normal, sin uppercase: el texto se muestra tal como está en
  src/content/footer.ts, con solo la inicial en mayúscula. Sin tracking: el
  espaciado abierto estaba pensado para mayúsculas, así que queda el de la
  fuente por defecto.

  HOVER y FOCUS: la píldora se invierte —relleno verde de marca y texto
  ink-inverse, 9.59:1—. Se mantiene la inversión como señal de estado: con el
  relleno claro de reposo, cualquier otro tono claro sería un matiz.

  El foco añade además el anillo exterior, separado por outline-offset para que
  se lea como anillo y no como relleno: eso es lo que lo distingue del hover.

  motion-safe en la transición: con prefers-reduced-motion el cambio de color
  es instantáneo, sin recorrido.
*/
const NAV_PILL_BASE =
  "inline-flex items-center rounded-full bg-surface-soft px-4 py-2 font-body text-xs font-semibold whitespace-nowrap text-ink motion-safe:transition-colors hover:bg-surface-strong hover:text-ink-inverse focus-visible:bg-surface-strong focus-visible:text-ink-inverse";

/*
  Sobre el hero, el hueco del outline-offset cae sobre el video, cuyo píxel no
  es un valor conocido: anillo de dos tonos (focus-ring-photo). Fuera de la home
  cae sobre la barra en surface-muted y basta el anillo ink de la capa base
  (6.57:1).

  Silueta de la píldora en reposo: 1.28:1 contra la barra surface-muted de las
  páginas interiores y 1.18:1 contra blanco puro en el video del hero. En hover
  pasa a verde: 6.57:1 contra la barra y 9.93:1 contra blanco.
*/
const NAV_PILL_STYLES = {
  hero: `${NAV_PILL_BASE} focus-ring-photo`,
  page: NAV_PILL_BASE,
} as const;

/*
  Hamburguesa de móvil. Sólida y circular, con los mismos tokens que el botón de
  cotización del header, porque es el control que lo sustituye a este tamaño.

  Verde de marca sólido, no surface-raised: con el relleno claro que tenía, su
  silueta medía 1.03:1 contra el cielo de la fotografía y el botón desaparecía
  como forma. El icono claro sobre el verde no depende de la foto.

  El anillo de foco va en verde por lo mismo que el de las píldoras: el hueco
  del outline-offset deja ver el cielo, y un anillo claro ahí no se vería.

  36px de lado: es el alto que ya tenía la fila en móvil, así que la barra no
  cambia de altura al aparecer.
*/
const HAMBURGER_BASE =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-strong text-ink-inverse md:hidden";

const HAMBURGER_STYLES = {
  hero: `${HAMBURGER_BASE} focus-ring-photo`,
  page: HAMBURGER_BASE,
} as const;

/*
  Enlace dentro del panel de móvil. Aquí el fondo es claro (el panel es
  surface-raised), así que el texto es ink: 9.0:1. El hover pasa a
  surface-muted, donde ink mide 6.6:1. Radio de control, 12px.
*/
const MENU_LINK_STYLES =
  "block rounded-xl px-4 py-3 font-heading text-xl font-semibold text-ink motion-safe:transition-colors hover:bg-surface-muted";

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />
    </svg>
  );
}

export default function Header() {
  const { homeLinkLabel, ctaLabel, navLabel, navLinks, menu } = headerContent;
  const [menuRequested, setMenuRequested] = useState(false);
  const menuPanelId = useId();
  const menuTitleId = useId();

  /*
    En servidor useMediaQuery devuelve false, así que en el primer render el
    panel nunca se da por abierto; solo reacciona a un ancho real.
  */
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  /*
    Estado derivado, no sincronizado con un efecto: al ensanchar la ventana
    hasta escritorio la hamburguesa desaparece con un display:none, y un panel
    que siguiera abierto se quedaría atrapando el foco con el botón que lo abrió
    ya fuera del árbol accesible. Calculándolo en el render, el panel se cierra
    en el mismo paso en que deja de haber hamburguesa.
  */
  const menuOpen = menuRequested && !isDesktop;

  const closeMenu = useCallback(() => setMenuRequested(false), []);

  /*
    La home es la única ruta con hero, y por tanto la única en la que la barra
    va superpuesta sobre fotografía. En el resto se apoya en el fondo de página.
    Se mira la ruta y no una prop porque la barra vive en el layout, que es
    común a todas las páginas y no sabe cuál está pintando.
  */
  const mode = usePathname() === "/" ? "hero" : "page";
  const onHero = mode === "hero";

  return (
    /*
      Sobre el hero va en absoluto, fuera del flujo, para superponerse a la
      tarjeta sin ocupar sitio: es lo que hacía el contenedor de Hero.tsx antes
      de que la barra se mudara al layout. En el resto de rutas va en el flujo,
      porque si no taparía la primera sección de la página.

      z-30 la mantiene sobre el contenido del hero (z-10) y sobre la capa de la
      escena 3D (z-[5]); el modal, que es z-50, sigue quedando por encima.

      pointer-events-none también en este envoltorio, no solo en el <header>:
      su caja es más alta que la de la barra —le suma el margen de viewport— y
      sin esto esa franja de más capturaría el puntero sobre la escena 3D. Los
      controles de dentro lo reactivan uno a uno, como ya hacían.
    */
    <div
      className={
        onHero
          ? `pointer-events-none absolute inset-x-0 top-0 z-30 ${VIEWPORT_MARGIN}`
          : VIEWPORT_MARGIN
      }
    >
      {/*
        pointer-events-none en la barra: sobre el hero es una caja que abarca
        todo el ancho de la tarjeta y, si capturase el puntero, congelaría el
        giro del envase 3D en toda la franja superior. Los elementos que sí lo
        necesitan lo reactivan. Es el mismo patrón que usan los otros bloques
        del hero.
      */}
      <header
        className={`pointer-events-none ${HEADER_PADDING[mode]} ${HEADER_SURFACE[mode]}`}
      >
        {/*
          items-center es lo que mantiene alineados logotipo, enlaces y botón en
          el eje vertical: los centra a todos sobre el mismo eje independientemente
          de lo que mida cada uno.
        */}
        <div
          className={`flex items-center justify-between gap-4 ${BAR_ROW_MIN_HEIGHT}`}
        >
          {/*
            Imagotipo horizontal —isotipo y palabra—, enlazado al inicio.

            Ocupa el alto de la fila (LOGO_HEIGHT), que es todo el sitio
            disponible: la fila tiene ese mismo mínimo. El ancho lo calcula el
            navegador desde el viewBox —w-auto—, que es lo que impide
            deformarlo: se escala por una sola dimensión.

            El color se hereda: ink-inverse sobre la tarjeta verde del hero
            (8.9:1), ink sobre el fondo de página (9.6:1). El SVG va inline con
            currentColor, así que es el mismo archivo en los dos casos y no hay
            variantes de color que mantener.

            El nombre accesible vive en el enlace y describe el destino; la
            pieza va como decorativa para no anunciarlo dos veces.
          */}
          <a
            href="/"
            aria-label={homeLinkLabel}
            className={`pointer-events-auto flex items-center ${
              onHero ? "text-ink-inverse" : "text-ink"
            } ${LOGO_HEIGHT}`}
          >
            <Imagotipo className="h-full w-auto" />
          </a>

          {/* Todo lo interactivo, agrupado a la derecha y con puntero activo. */}
          <div className="pointer-events-auto flex items-center gap-4">
            <nav aria-label={navLabel} className="hidden md:block">
              <ul role="list" className="flex list-none items-center gap-2">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className={NAV_PILL_STYLES[mode]}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/*
              El botón de cotización se mantiene sólido: es la acción principal y
              no debe leerse como un enlace más. En móvil se oculta y reaparece
              dentro del panel.
            */}
            <div className="hidden md:block">
              <ContactButton
                variant={onHero ? "header" : "headerPlain"}
                label={ctaLabel}
              />
            </div>

            <button
              type="button"
              onClick={() => setMenuRequested(true)}
              aria-label={menu.label}
              aria-expanded={menuOpen}
              aria-controls={menuPanelId}
              className={HAMBURGER_STYLES[mode]}
            >
              <MenuIcon />
            </button>
          </div>
        </div>

        {/*
          Panel de navegación de móvil.

          Reutiliza Modal en lugar de repetir su comportamiento: ya resuelve el
          portal a <body> —imprescindible aquí, porque la tarjeta del hero lleva
          overflow-hidden y recortaría el panel—, la trampa de foco, la devolución
          del foco al botón que lo abrió, el cierre con Escape, el bloqueo del
          scroll del body con la pausa de Lenis, y la entrada respetando
          prefers-reduced-motion.
        */}
        <Modal
          open={menuOpen}
          onClose={closeMenu}
          id={menuPanelId}
          title={menu.label}
          titleId={menuTitleId}
          closeLabel={menu.closeLabel}
        >
          <nav aria-label={navLabel}>
            <ul role="list" className="flex list-none flex-col gap-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  {/*
                    El panel se cierra al pulsar: la navegación por ancla ocurre
                    después, con el scroll del body ya desbloqueado y Lenis
                    reanudado.
                  */}
                  <a
                    href={link.href}
                    onClick={closeMenu}
                    className={MENU_LINK_STYLES}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-6">
            <ContactButton
              variant="menu"
              label={ctaLabel}
              onClick={closeMenu}
            />
          </div>
        </Modal>
      </header>
    </div>
  );
}
