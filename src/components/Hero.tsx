import Header from "@/components/Header";
import EspecieroSceneLoader from "@/components/three/EspecieroSceneLoader";
import { heroContent } from "@/content/hero";

export default function Hero() {
  return (
    <section className="relative h-screen px-4 py-4 sm:px-6 sm:py-6">
      <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-surface-strong px-6 py-6 text-ink-inverse sm:px-10">
        <div className="relative z-10">
          <Header />
        </div>

        {/*
          pointer-events-none en los contenedores: son cajas que abarcan todo el
          ancho del hero y, si capturasen el puntero, congelarían el giro del
          envase en la mitad derecha, que está vacía. Los elementos que sí
          necesitan puntero (texto seleccionable y botón) lo reactivan.
        */}
        <div className="pointer-events-none relative z-10 flex flex-1 items-center">
          <div className="flex flex-col items-start gap-6 lg:w-1/2">
            <p className="pointer-events-auto font-body text-xs font-semibold tracking-widest uppercase">
              {heroContent.eyebrow}
            </p>
            <h1 className="pointer-events-auto font-heading text-4xl leading-tight font-semibold sm:text-5xl lg:text-6xl">
              {heroContent.headline}
            </h1>
            <p className="pointer-events-auto max-w-md font-body text-base sm:text-lg">
              {heroContent.subtitle}
            </p>

            {/* Sin acción todavía: se conectará al modal de cotización cuando exista. */}
            <button
              type="button"
              className="pointer-events-auto appearance-none rounded-xl bg-surface-raised px-6 py-3 font-body text-sm font-medium text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-inverse"
            >
              {heroContent.ctaLabel}
            </button>
          </div>
        </div>

        {/* Indicador de scroll discreto, sin animación por ahora. Alineado con el bloque de texto. */}
        <div className="pointer-events-none relative z-10 flex items-center">
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
      </div>

      {/*
        Capa de fondo: el envase en 3D, en la mitad derecha. Va fuera de la
        tarjeta, no dentro, para poder sangrar por su borde inferior sin tocar
        el overflow-hidden de la tarjeta. Se coloca por encima del fondo de la
        tarjeta y por debajo de su contenido (z-10). Es decorativa.
      */}
      <EspecieroSceneLoader />
    </section>
  );
}
