import Image from "next/image";
import ContactButton from "@/components/ContactButton";
import HeroBackgroundVideo from "@/components/HeroBackgroundVideo";
import EspecieroSceneLoader from "@/components/three/EspecieroSceneLoader";
import { heroContent } from "@/content/hero";

export default function Hero() {
  return (
    <section className="relative h-screen px-4 py-4 sm:px-6 sm:py-6">
      {/*
        Padding interno de la tarjeta, escalado por breakpoint: 40px en móvil,
        56px desde sm y 80px desde lg. Está calibrado para el bloque de titular,
        y cubre a los dos bloques que van en el flujo de la tarjeta —bloque de
        texto e indicador de scroll—, así que el indicador conserva su separación
        del borde inferior sin ajuste propio.

        NO alcanza al header: la barra ya no vive aquí dentro —se pinta desde el
        layout, en todas las rutas— y se superpone a esta tarjeta posicionándose
        ella misma contra el viewport, con su propio margen y su propio padding
        (ver Header.tsx). Este valor se puede cambiar sin que la barra se mueva.

        Ojo: este es el padding INTERNO de la tarjeta, distinto del de la
        <section>, que es el margen de la tarjeta respecto al viewport.
      */}
      {/*
        Caja de la tarjeta. Es un hijo en flujo, así que ya nace metido por el
        padding de la <section> sin tener que repetir ese valor en ningún sitio.
        Existe para que la capa de la escena 3D pueda alinearse con la tarjeta
        siendo su hermana: al posicionarse contra esta caja, hereda su borde y
        su alto en porcentaje, y nadie necesita saber cuánto mide el padding.
      */}
      <div className="relative h-full">
        <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-surface-strong p-10 text-ink-inverse sm:p-14 lg:p-20">
          {/*
            Fondo de la tarjeta: fotografía y video encima. Decorativos: alt
            vacío y aria-hidden. No llevan capa de color ni filtro encima.

            El verde de marca sigue en el contenedor (bg-surface-strong) como
            color de respaldo: es lo que se ve mientras la imagen carga y si
            fallara.

            La fotografía hace de póster del video: se ve mientras el video no
            reproduce y en su lugar con prefers-reduced-motion (ver
            HeroBackgroundVideo).

            Orden de apilado dentro del hero: fotografía y video en z-0, por
            orden de aparición; la escena 3D del envase en z-[5] y el contenido
            en z-10. El recorte a las esquinas lo da el
            overflow-hidden con rounded-3xl del propio contenedor.

            priority: está sobre el pliegue y es el LCP probable del hero.

            data-hero-poster marca la fotografía para EspecieroSceneLoader: la
            escena 3D la usa como fondo refractado mientras no hay video.
          */}
          <Image
            src="/images/hero-bg.webp"
            alt=""
            data-hero-poster
            fill
            priority
            sizes="100vw"
            className="z-0 object-cover object-center"
          />
          <HeroBackgroundVideo />

          {/*
            pointer-events-none en los contenedores: son cajas que abarcan todo el
            ancho del hero y, si capturasen el puntero, congelarían el giro del
            envase en la mitad derecha, que está vacía. Los elementos que sí
            necesitan puntero (texto seleccionable y botón) lo reactivan.
          */}
          <div className="pointer-events-none relative z-10 flex flex-1 items-center">
            {/*
              Desde lg la columna declara su ancho: el 60% del interior de la
              tarjeta (w-3/5), y el titular se acomoda dentro. Por debajo de
              lg no lleva ancho y ocupa el disponible.

              data-hero-content marca la columna para EspecieroSceneLoader, que
              mide dónde termina y coloca el envase a CONTENT_GAP_PX de ese
              borde (ver EspecieroScene). La separación no sale del ancho de la
              columna: si la columna cambia, el envase la sigue.
            */}
            <div
              data-hero-content
              className="flex flex-col items-start gap-6 lg:w-3/5"
            >
              <p className="pointer-events-auto font-body text-xs font-semibold tracking-widest uppercase">
                {heroContent.eyebrow}
              </p>
              {/*
                Sin saltos forzados: las entradas de headlineLines se unen con
                un espacio y el texto se parte solo dentro del ancho de la
                columna. text-balance reparte las palabras para que las líneas
                midan parecido, sin cambiar cuántas hay.
              */}
              <h1 className="pointer-events-auto font-heading text-4xl font-semibold text-balance sm:text-5xl lg:text-6xl">
                {heroContent.headlineLines.join(" ")}
              </h1>
              {/*
                El párrafo ocupa el mismo ancho que el titular, pero no lo marca:
                contain-inline-size lo saca del cálculo del ancho de la columna
                —por debajo de lg, donde la columna no declara ancho, la frase
                en una sola línea podría ensancharla— y self-stretch lo estira
                hasta el ancho de la columna.
              */}
              <p className="pointer-events-auto self-stretch font-body text-base contain-inline-size sm:text-lg">
                {heroContent.subtitle}
              </p>

              <ContactButton variant="hero" label={heroContent.ctaLabel} />
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
          Capa de fondo: el envase en 3D, en la mitad derecha, contenido dentro
          de la tarjeta. Es hermana de la tarjeta y no hija: se alinea con ella
          a través de esta caja y recorta sus propias esquinas. Se coloca por
          encima del fondo de la tarjeta y por debajo de su contenido (z-10).
          Es decorativa.
        */}
        <EspecieroSceneLoader />
      </div>
    </section>
  );
}
