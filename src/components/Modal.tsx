"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { pauseSmoothScroll, resumeSmoothScroll } from "@/lib/smoothScroll";

/**
 * Diálogo modal reutilizable.
 *
 * Aporta el comportamiento, no el contenido: apertura y cierre, trampa de
 * foco, bloqueo del scroll de la página y los atributos ARIA. Lo que va dentro
 * lo pone quien lo usa.
 *
 * Se pinta con un portal en <body>, no en el árbol donde se declara: la
 * tarjeta del hero lleva overflow-hidden y un modal pintado dentro quedaría
 * recortado por sus esquinas.
 */

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/*
  Elementos que pueden recibir foco dentro del panel. Se consulta en vivo en
  cada Tab en lugar de guardarse: el contenido del modal puede cambiar mientras
  está abierto —un mensaje de error que aparece, un campo que se deshabilita— y
  una lista congelada dejaría el recorrido desactualizado.
*/
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

type ModalProps = {
  open: boolean;
  onClose: () => void;
  /**
   * id del panel. Solo hace falta cuando algo de fuera tiene que apuntarlo,
   * como el aria-controls del botón que lo abre.
   */
  id?: string;
  /**
   * Título visible del diálogo. Se renderiza como <h2> en la cabecera del
   * panel. Omitirlo deja que el contenido coloque su propio <h2> donde quiera
   * —debe llevar el mismo id que titleId— y entonces el botón de cerrar flota
   * sobre el contenido en lugar de ocupar una fila propia.
   */
  title?: string;
  /** id que se le pone al título y al que apunta el aria-labelledby. */
  titleId: string;
  /** Texto accesible del botón de cerrar. */
  closeLabel: string;
  /**
   * Elemento que recibe el foco al abrir. Sin él, el primer enfocable del
   * panel, que suele ser el botón de cerrar.
   */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Ancho máximo del panel. "wide" es para contenido a dos columnas. */
  size?: "default" | "wide";
  /**
   * false quita el padding del panel: lo necesita el contenido que llega hasta
   * el borde, como una columna de imagen a sangre.
   */
  padded?: boolean;
  children: ReactNode;
};

/*
  El panel va en un componente aparte que solo existe mientras el modal está
  abierto. Así cada efecto —foco, scroll, teclado, entrada— nace y muere con
  él, en vez de tener que preguntar en cada uno si el modal sigue abierto, y el
  estado de la animación se reinicia solo al cerrarse.
*/
export default function Modal({ open, ...panelProps }: ModalProps) {
  // En servidor no hay document; el modal solo se abre tras una interacción.
  if (!open || typeof document === "undefined") return null;

  return createPortal(<ModalPanel {...panelProps} />, document.body);
}

function ModalPanel({
  id,
  onClose,
  title,
  titleId,
  closeLabel,
  initialFocusRef,
  size = "default",
  padded = true,
  children,
}: Omit<ModalProps, "open">) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const prefersReducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);

  /*
    Foco: se guarda el elemento que lo tenía —el botón que abrió el modal— y se
    le devuelve al cerrar, que es lo que espera quien navega con teclado.
  */
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const target =
      initialFocusRef?.current ??
      panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    target?.focus();

    return () => previouslyFocused?.focus();
  }, [initialFocusRef]);

  /*
    Bloqueo del scroll de la página. Se compensa el ancho de la barra de scroll
    con padding: sin eso, al ocultarla el contenido de detrás salta de sitio.

    Además se detiene el scroll suave mientras el modal está abierto. Lenis
    mueve la página desde su propio bucle y con su propio listener de rueda, así
    que no se entera de un overflow: hidden en el body; y de paso, con Lenis
    parado, el scroll interno del panel vuelve a ser el nativo del navegador.
    Si no hay instancia —prefers-reduced-motion— estas llamadas no hacen nada.
  */
  useEffect(() => {
    pauseSmoothScroll();
    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
      resumeSmoothScroll();
    };
  }, []);

  // Escape cierra; Tab y Shift+Tab circulan dentro del panel sin salirse.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusables =
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      const outside = !panel.contains(active);

      if (event.shiftKey && (active === first || outside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || outside)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  /*
    Entrada. Con prefers-reduced-motion no se programa nada: el panel se pinta
    directamente en su estado final, sin transición ni fotograma intermedio.
  */
  useEffect(() => {
    if (prefersReducedMotion) return;

    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [prefersReducedMotion]);

  const motionClasses = prefersReducedMotion
    ? ""
    : `transition duration-200 ease-out ${
        entered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`;

  return (
    /*
      Velo. El cierre se escucha en mousedown y no en click: si se empieza a
      arrastrar dentro del panel —seleccionando texto— y se suelta fuera, el
      click se contabiliza en el velo y el modal se cerraría solo.
    */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-strong/60 p-4 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative max-h-full w-full overflow-y-auto rounded-3xl bg-surface-raised ${
          size === "wide" ? "max-w-4xl" : "max-w-lg"
        } ${padded ? "p-6 sm:p-8" : ""} ${motionClasses}`}
      >
        {title ? (
          <div className="mb-6 flex items-start justify-between gap-4">
            <h2
              id={titleId}
              className="font-heading text-2xl leading-tight font-semibold text-ink"
            >
              {title}
            </h2>
            <CloseButton onClose={onClose} closeLabel={closeLabel} />
          </div>
        ) : (
          /* Sin cabecera propia: el botón flota sobre el contenido. */
          <div className="absolute top-4 right-4 z-10">
            <CloseButton onClose={onClose} closeLabel={closeLabel} />
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

function CloseButton({
  onClose,
  closeLabel,
}: {
  onClose: () => void;
  closeLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label={closeLabel}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <path d="M4 4l8 8M12 4l-8 8" />
      </svg>
    </button>
  );
}
