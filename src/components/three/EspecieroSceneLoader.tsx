"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/*
  Punto de entrada de la escena 3D desde el árbol de servidor.

  Three.js no corre en servidor, así que la escena se carga con ssr: false.
  Next 16 no permite `ssr: false` dentro de un Server Component (lanza error en
  build), y Hero.tsx lo es: por eso este envoltorio de cliente, cuyo único
  trabajo es decidir si la escena se monta, con qué modo de movimiento y sobre
  qué geometría.
*/
const EspecieroScene = dynamic(() => import("./EspecieroScene"), {
  ssr: false,
});

/*
  Umbral de montaje. Coincide con el breakpoint `lg` de Tailwind, que es donde
  el hero pasa a dos columnas y aparece la mitad derecha libre. Por debajo, el
  texto ocupa todo el ancho y no hay sitio para el envase.
*/
const DESKTOP_QUERY = "(min-width: 1024px)";

/* Sin puntero fino (táctil) no hay cursor al que reaccionar. */
const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export default function EspecieroSceneLoader() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const hasFinePointer = useMediaQuery(FINE_POINTER_QUERY);
  const prefersReducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);

  /*
    El elemento que escucha el puntero se guarda en estado, no en una ref, para
    que la escena solo se monte cuando ya existe: el Canvas de R3F lee su fuente
    de eventos una única vez, al crearse.
  */
  const [pointerArea, setPointerArea] = useState<HTMLDivElement | null>(null);

  /*
    Borde derecho de la columna de contenido del hero, en px desde el borde
    izquierdo de la tarjeta. EspecieroScene coloca el envase a CONTENT_GAP_PX
    de ahí. La escena no se monta hasta tenerlo, para que el primer frame ya
    salga en su sitio.

    La columna se busca por data-hero-content dentro de la caja que comparte
    con esta capa (ver Hero.tsx). Se observan las dos con ResizeObserver: la
    columna cambia de ancho con el breakpoint y cuando carga la fuente del
    titular, y la tarjeta con la ventana.
  */
  const [contentEdgePx, setContentEdgePx] = useState<number | null>(null);

  useEffect(() => {
    const cardBox = pointerArea?.parentElement?.parentElement;
    const content = cardBox?.querySelector<HTMLElement>("[data-hero-content]");
    if (!pointerArea || !content) return;

    const measure = () => {
      const edge =
        content.getBoundingClientRect().right -
        pointerArea.getBoundingClientRect().left;
      setContentEdgePx(Math.round(edge));
    };

    const observer = new ResizeObserver(measure);
    observer.observe(content);
    observer.observe(pointerArea);
    return () => observer.disconnect();
  }, [pointerArea]);

  /*
    Devolver null antes de renderizar la escena evita que se descargue su chunk:
    dynamic() solo pide el módulo cuando el componente se monta. En un teléfono
    no se baja ni un byte de three.js.
  */
  if (!isDesktop) return null;

  return (
    /*
      Capa de la escena, dentro de la caja que Hero envuelve alrededor de la
      tarjeta. Esa caja YA es la tarjeta, así que inset-0 basta para alinearse
      con ella y este archivo no necesita conocer el padding de la sección.

      El envase queda contenido en la tarjeta: la capa mide exactamente lo
      mismo que ella y overflow-hidden con rounded-3xl replica su redondeo en
      las cuatro esquinas, así que ni el envase girado ni su sombra pueden
      pintar fuera. El margen entre el envase y los bordes lo calcula
      EspecieroScene (ver fitHeroFrame).

      z-[5] la sitúa por encima del fondo de la tarjeta (que no lleva z-index) y
      por debajo del contenido del hero, que va en z-10.

      pointer-events-none en la capa: el canvas no debe interponerse con el
      contenido. Solo la sub-capa que escucha el puntero vuelve a activarlos.
    */
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[5] overflow-hidden rounded-3xl"
    >
      {/*
        Área sensible al puntero: cubre la tarjeta. Está por debajo del canvas
        en orden de pintado, pero el canvas no captura eventos, así que los
        recibe igual.
      */}
      <div
        ref={setPointerArea}
        className="pointer-events-auto absolute inset-0"
      />

      {pointerArea && contentEdgePx !== null && (
        <EspecieroScene
          motionEnabled={hasFinePointer && !prefersReducedMotion}
          eventSource={pointerArea}
          contentEdgePx={contentEdgePx}
        />
      )}
    </div>
  );
}
