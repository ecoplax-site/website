"use client";

/**
 * Par de flechas de un carrusel. Lo comparten Materiales y Noticias.
 *
 * Van después del carrusel en el DOM, que es el orden de lectura correcto
 * —primero la región, luego lo que la gobierna— y le apuntan con aria-controls.
 *
 * Sin estado deshabilitado: en un carrusel en bucle no hay extremo al que
 * llegar, así que los dos botones están siempre activos.
 */

const CONTROL_STYLES =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-raised text-ink";

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={direction === "left" ? "M10 3L5 8l5 5" : "M6 3l5 5-5 5"} />
    </svg>
  );
}

type CarouselControlsProps = {
  /** id del carrusel al que apunta el aria-controls de los dos botones. */
  controls: string;
  previousLabel: string;
  nextLabel: string;
  onStep: (direction: 1 | -1) => void;
  /** Clases del contenedor: cada sección pone su propio medianil. */
  className?: string;
};

export default function CarouselControls({
  controls,
  previousLabel,
  nextLabel,
  onStep,
  className = "",
}: CarouselControlsProps) {
  return (
    <div className={`flex justify-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => onStep(-1)}
        aria-controls={controls}
        aria-label={previousLabel}
        className={CONTROL_STYLES}
      >
        <ChevronIcon direction="left" />
      </button>
      <button
        type="button"
        onClick={() => onStep(1)}
        aria-controls={controls}
        aria-label={nextLabel}
        className={CONTROL_STYLES}
      >
        <ChevronIcon direction="right" />
      </button>
    </div>
  );
}
