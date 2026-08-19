import Header from "@/components/Header";
import { heroContent } from "@/content/hero";

export default function Hero() {
  return (
    <section className="h-screen px-4 py-4 sm:px-6 sm:py-6">
      <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-surface-strong px-6 py-6 text-ink-inverse sm:px-10">
        <Header />

        <div className="flex flex-1 items-center">
          <div className="flex flex-col items-start gap-6 lg:w-1/2">
            <p className="font-body text-xs font-semibold tracking-widest uppercase">
              {heroContent.eyebrow}
            </p>
            <h1 className="font-heading text-4xl leading-tight font-semibold sm:text-5xl lg:text-6xl">
              {heroContent.headline}
            </h1>
            <p className="max-w-md font-body text-base sm:text-lg">
              {heroContent.subtitle}
            </p>

            {/* Sin acción todavía: se conectará al modal de cotización cuando exista. */}
            <button
              type="button"
              className="appearance-none rounded-xl bg-surface-raised px-6 py-3 font-body text-sm font-medium text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-inverse"
            >
              {heroContent.ctaLabel}
            </button>
          </div>
        </div>

        {/* Indicador de scroll discreto, sin animación por ahora. Alineado con el bloque de texto. */}
        <div className="flex items-center">
          <span className="sr-only">{heroContent.scrollIndicatorLabel}</span>
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
            <path d="M4 6l4 4 4-4" />
          </svg>
        </div>

        {/*
          Mitad derecha reservada para el envase en 3D: se integrará después
          como una capa superpuesta (position: absolute) sobre esta tarjeta.
          Intencionalmente vacía — sin placeholder visual, recuadro ni imagen.
          `relative` en el contenedor ya deja lista la referencia de posicionamiento.
        */}
      </div>
    </section>
  );
}
