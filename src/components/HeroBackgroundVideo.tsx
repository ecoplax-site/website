"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { setHeroBackdropVideo } from "@/lib/heroBackdropVideo";

/*
  WebM primero y MP4 como alternativa: el navegador toma la primera fuente que
  sabe reproducir. Ambas son recompresiones del original, que vive fuera de
  public/ para no desplegarse: assets-source/videos/background-ecoplax.mp4.
  Las dos van a 1920×1074, sin pista de audio.

  ETIQUETA DE COLOR. Los dos archivos declaran primarios y matriz BT.709 y
  transferencia sRGB (iec61966-2-1). Sin transferencia declarada, macOS pinta
  el video de la página aplicándole una curva que lo aclara —trata el archivo
  como gamma 1.961 y lo convierte a sRGB—, mientras que WebGL sube los píxeles
  tal cual. La escena 3D usa este mismo video como fondo refractado
  (three/HeroBackdrop), así que desde lg el canvas y la página no coincidían.
  Con la transferencia declarada, los dos caminos dan los valores del archivo.
  Si se vuelven a exportar, hay que conservar la etiqueta: solo cambia los
  metadatos, no los píxeles.
*/
const VIDEO_SOURCES = [
  { src: "/videos/background-ecoplax-web.webm", type: "video/webm" },
  { src: "/videos/background-ecoplax-web.mp4", type: "video/mp4" },
];

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToPageLoad(onStoreChange: () => void) {
  window.addEventListener("load", onStoreChange);
  return () => window.removeEventListener("load", onStoreChange);
}

/**
 * Video de fondo del hero. Va encima de la fotografía, que hace de póster.
 *
 * - No bloquea la carga: el <video> no existe hasta que la página ha
 *   terminado de cargar (un elemento de medios que se inserta antes retrasa
 *   el evento load), y es invisible hasta que empieza a reproducirse. Hasta
 *   entonces se ve la fotografía, que Hero sigue cargando con priority.
 * - Con prefers-reduced-motion: reduce no se monta, y queda la fotografía.
 *   Si la preferencia cambia con la página abierta, el video se desmonta.
 * - Decorativo: aria-hidden, sin controles y fuera del orden de tabulación.
 */
export default function HeroBackgroundVideo() {
  const prefersReducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const pageLoaded = useSyncExternalStore(
    subscribeToPageLoad,
    () => document.readyState === "complete",
    () => false,
  );

  if (!pageLoaded || prefersReducedMotion) return null;

  return <BackgroundVideo />;
}

/*
  Componente aparte para que el estado de reproducción se reinicie cada vez que
  el video se monta: si vuelve tras desactivar "reducir movimiento", no debe
  aparecer visible antes de tener imagen.
*/
function BackgroundVideo() {
  const [playing, setPlaying] = useState(false);

  /*
    muted se fija también como propiedad: React no siempre refleja el atributo,
    y sin él los navegadores bloquean la reproducción automática.

    Al desmontarse retira el video del puente con la escena 3D, que vuelve a
    refractar la fotografía (ver lib/heroBackdropVideo).

    useCallback sin dependencias: con una función nueva en cada render, React
    ejecutaría la limpieza en cada re-render —el primero llega justo al empezar
    a reproducirse— y el video se retiraría del puente nada más entregarse.
  */
  const attachVideo = useCallback((video: HTMLVideoElement | null) => {
    if (!video) return;
    video.muted = true;
    return () => setHeroBackdropVideo(null);
  }, []);

  return (
    <video
      ref={attachVideo}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden="true"
      tabIndex={-1}
      /*
        Al empezar a reproducirse se hace visible y se entrega a la escena 3D,
        que lo usa como fondo refractado (ver three/HeroBackdrop).
      */
      onPlaying={(event) => {
        setPlaying(true);
        setHeroBackdropVideo(event.currentTarget);
      }}
      className={`absolute inset-0 z-0 h-full w-full object-cover object-center ${
        playing ? "opacity-100" : "opacity-0"
      }`}
    >
      {VIDEO_SOURCES.map((source) => (
        <source key={source.src} src={source.src} type={source.type} />
      ))}
    </video>
  );
}
