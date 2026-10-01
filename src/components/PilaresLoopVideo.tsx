"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/*
  Loop del cuadro central de Pilares: 1:01.3–1:06.9 del video institucional
  (toma de voluntarios), 5.6 s, sin audio, H.264 con faststart.

  Recorte: 468×624 (3:4), desde x=446 sobre el cuadro de 1280×720. Se quitan
  los 96px inferiores (13.3%) y no el 12% exacto: la marca de agua ecoplax.com
  empieza en y≈631 y con 634px de alto asomaba el borde de las letras.

  468×624 es la resolución nativa del recorte: el original es 720p y no hay más
  píxeles que sacar. En escritorio el cuadro mide unos 500px de ancho, así que
  en pantallas 2x se ve a densidad 1x. Escalarlo solo añadiría peso.

  Etiquetado BT.709 como el original, para que el loop y el video del modal
  den el mismo color.

  El póster es el frame 112 del loop (3.7 s): el primero en que la bolsa queda
  entera dentro del encuadre 3:4.
*/
const LOOP_VIDEO_SRC = "/videos/institucional-loop.mp4";
const LOOP_POSTER_SRC = "/videos/institucional-loop-poster.jpg";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const subscribeNoop = () => () => {};

/**
 * Fondo en movimiento del cuadro central de Pilares. Llena el contenedor, que
 * pone el relative, el overflow-hidden y el radio.
 *
 * - El póster siempre está debajo: es lo que se ve mientras el video carga,
 *   si la reproducción automática se bloquea y, con prefers-reduced-motion,
 *   en lugar del video, que entonces no se monta.
 * - Solo reproduce mientras el cuadro está en pantalla. Con preload="none" el
 *   archivo tampoco se descarga hasta la primera vez que entra.
 * - paused lo detiene aunque esté en pantalla: lo usa Pilares mientras el
 *   modal del video completo está abierto. Al pasar a false se reanuda si el
 *   cuadro sigue visible.
 * - Decorativo: alt vacío, aria-hidden, sin controles y fuera del orden de
 *   tabulación.
 */
export default function PilaresLoopVideo({ paused }: { paused: boolean }) {
  const prefersReducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  /*
    En servidor y durante la hidratación useMediaQuery da false aunque el
    usuario tenga reducir movimiento: el video solo se monta en cliente, ya con
    la preferencia real, para no llegar a pedirlo en ese caso.
  */
  const isClient = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  return (
    <>
      <Image
        src={LOOP_POSTER_SRC}
        alt=""
        fill
        sizes="(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw"
        className="object-cover object-center"
      />
      {isClient && !prefersReducedMotion ? <LoopVideo paused={paused} /> : null}
    </>
  );
}

/*
  Sin autoPlay: el loop reproduce solo si el cuadro está en pantalla y nadie lo
  ha pausado desde fuera. Si el navegador rechaza el play(), se queda el póster.
*/
function syncPlayback(video: HTMLVideoElement, visible: boolean, paused: boolean) {
  if (visible && !paused) video.play().catch(() => {});
  else video.pause();
}

/*
  Componente aparte, como en HeroBackgroundVideo: el estado de reproducción se
  reinicia cada vez que el video se monta, así que si vuelve tras desactivar
  "reducir movimiento" no aparece visible antes de tener imagen.
*/
function LoopVideo({ paused }: { paused: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  /*
    Visibilidad y pausa externa en refs: el observador se crea una sola vez y
    lee siempre el valor vigente, sin tener que recrearse cuando cambia paused.
  */
  const visibleRef = useRef(false);
  const pausedRef = useRef(paused);

  /*
    muted se fija también como propiedad: React no siempre refleja el atributo,
    y sin él los navegadores bloquean la reproducción.
  */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;

    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      syncPlayback(video, visibleRef.current, pausedRef.current);
    });
    observer.observe(video);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    pausedRef.current = paused;
    const video = videoRef.current;
    if (video) syncPlayback(video, visibleRef.current, paused);
  }, [paused]);

  return (
    <video
      ref={videoRef}
      src={LOOP_VIDEO_SRC}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setPlaying(true)}
      className={`absolute inset-0 h-full w-full object-cover object-center ${
        playing ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
