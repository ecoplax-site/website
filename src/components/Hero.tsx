import { Fragment } from "react";
import Image from "next/image";
import ContactButton from "@/components/ContactButton";
import Header from "@/components/Header";
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

        NO alcanza al header: ese va superpuesto, fuera del flujo, y pone su
        propio padding (ver Header.tsx). Este valor se puede cambiar sin que el
        header se mueva.

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
            Fondo de la tarjeta. Decorativa: alt vacío.

            El verde de marca sigue en el contenedor (bg-surface-strong) como
            color de respaldo: es lo que se ve mientras la imagen carga y si
            fallara. No lleva overlay ni filtro encima.

            Orden de apilado dentro del hero: esta capa en z-0, la escena 3D del
            envase en z-[5] y el contenido en z-10. El recorte a las esquinas lo
            da el overflow-hidden con rounded-3xl del propio contenedor.

            priority: está sobre el pliegue y es el LCP probable del hero.
          */}
          <Image
            src="/images/hero-bg.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="z-0 object-cover object-center"
          />

          {/*
            El header se superpone a la tarjeta en lugar de ir en su flujo.

            Al posicionarlo en absoluto, su caja se mide contra la CAJA DE
            PADDING de la tarjeta —que es el borde de la tarjeta, no el borde
            interior del padding—, así que el p-10/sm:p-14/lg:p-20 de arriba no
            le llega y el espacio con el borde lo decide él. Los dos paddings
            quedan independientes: mover uno no mueve al otro.

            z-10 lo mantiene sobre la escena 3D, que va en z-[5].
          */}
          <div className="absolute inset-x-0 top-0 z-10">
            <Header />
          </div>

          {/*
            pointer-events-none en los contenedores: son cajas que abarcan todo el
            ancho del hero y, si capturasen el puntero, congelarían el giro del
            envase en la mitad derecha, que está vacía. Los elementos que sí
            necesitan puntero (texto seleccionable y botón) lo reactivan.
          */}
          <div className="pointer-events-none relative z-10 flex flex-1 items-center">
            {/*
              Hasta lg la columna ocupa media tarjeta. Desde xl su ancho lo marca
              el contenido: así la primera línea del titular cabe entera sea cual
              sea su medida real, sin depender de una fracción calculada a ojo ni
              de reducir el cuerpo de la letra.
            */}
            <div className="flex flex-col items-start gap-6 lg:w-1/2 xl:w-auto">
              <p className="pointer-events-auto font-body text-xs font-semibold tracking-widest uppercase">
                {heroContent.eyebrow}
              </p>
              {/*
                El salto entre líneas sale del contenido, no del JSX: aquí solo se
                intercala un <br> entre una entrada y la siguiente. Se oculta por
                debajo de xl —donde la primera línea no cabe— y entonces las
                líneas se leen seguidas, separadas por el espacio que va tras cada
                una, y el texto se ajusta solo.
              */}
              <h1 className="pointer-events-auto font-heading text-4xl leading-tight font-semibold sm:text-5xl lg:text-6xl">
                {heroContent.headlineLines.map((line, index) => (
                  <Fragment key={line}>
                    {index > 0 && <br className="hidden xl:inline" />}
                    {line}
                    {index < heroContent.headlineLines.length - 1 ? " " : null}
                  </Fragment>
                ))}
              </h1>
              <p className="pointer-events-auto max-w-md font-body text-base sm:text-lg">
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
          Capa de fondo: el envase en 3D, en la mitad derecha. Va fuera de la
          tarjeta, no dentro, para poder sangrar por su borde inferior sin tocar
          el overflow-hidden de la tarjeta. Se coloca por encima del fondo de la
          tarjeta y por debajo de su contenido (z-10). Es decorativa.
        */}
        <EspecieroSceneLoader />
      </div>
    </section>
  );
}
