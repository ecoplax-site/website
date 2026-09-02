"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  HERO_SCENE_HEIGHT_RATIO,
  POINTER_AREA_RATIO,
} from "./heroSceneLayout";

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

/*
  Padding lateral y superior de la sección del hero, en rem. La capa se alinea
  con la tarjeta desde fuera de ella, así que necesita repetir ese valor.
  Es el de `sm:` en adelante, el único que aplica: por debajo de 1024px la
  escena no se monta.
*/
const SECTION_PADDING_REM = 1.5;

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
    Devolver null antes de renderizar la escena evita que se descargue su chunk:
    dynamic() solo pide el módulo cuando el componente se monta. En un teléfono
    no se baja ni un byte de three.js.
  */
  if (!isDesktop) return null;

  return (
    /*
      Capa de la escena. Va FUERA de la tarjeta del hero y alineada con ella
      desde la sección, para poder sobresalir por abajo sin desactivar el
      overflow-hidden de la tarjeta.

      z-[5] la sitúa por encima del fondo de la tarjeta (que no lleva z-index) y
      por debajo del contenido del hero, que va en z-10.

      pointer-events-none en toda la capa: el sangrado se superpone a lo que
      sigue en la página y no debe capturar nada. Solo la sub-capa que cubre la
      tarjeta vuelve a activarlos.

      overflow-hidden con rounded-t-3xl replica el redondeo superior de la
      tarjeta, para que la escena no pueda pintar fuera de sus esquinas. Abajo
      queda recto: por ahí es por donde sangra.
    */
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-[5] overflow-hidden rounded-t-3xl"
      style={{
        top: `${SECTION_PADDING_REM}rem`,
        left: `${SECTION_PADDING_REM}rem`,
        right: `${SECTION_PADDING_REM}rem`,
        height: `calc(${HERO_SCENE_HEIGHT_RATIO * 100}% - ${
          HERO_SCENE_HEIGHT_RATIO * SECTION_PADDING_REM * 2
        }rem)`,
      }}
    >
      {/*
        Área sensible al puntero: cubre exactamente la tarjeta, ni un píxel del
        sangrado. Está por debajo del canvas en orden de pintado, pero el canvas
        no captura eventos, así que los recibe igual.
      */}
      <div
        ref={setPointerArea}
        className="pointer-events-auto absolute inset-x-0 top-0"
        style={{ height: `${POINTER_AREA_RATIO * 100}%` }}
      />

      {pointerArea && (
        <EspecieroScene
          motionEnabled={hasFinePointer && !prefersReducedMotion}
          eventSource={pointerArea}
        />
      )}
    </div>
  );
}
