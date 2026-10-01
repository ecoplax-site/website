"use client";

import { useEffect, useId, useRef } from "react";
import Modal from "@/components/Modal";
import { pilaresContent } from "@/content/pilares";

/*
  Video institucional completo: el MP4 original, sin recomprimir (H.264 720p,
  con faststart), y su póster en el segundo 18.2.
*/
const VIDEO_SRC = "/videos/institucional.mp4";
const POSTER_SRC = "/videos/institucional-poster.jpg";

/**
 * Modal con el video institucional completo. El comportamiento —foco
 * atrapado, Esc, clic fuera, fondo inerte, Lenis en pausa y foco de vuelta al
 * botón que lo abrió— lo pone Modal, igual que en el de contacto.
 *
 * El video solo existe mientras el modal está abierto: Modal desmonta el panel
 * al cerrar, así que cada apertura empieza desde el principio.
 */
export default function VideoModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { video } = pilaresContent;
  const titleId = `${useId()}-title`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={video.dialogTitle}
      titleId={titleId}
      closeLabel={video.closeLabel}
      size="video"
    >
      <InstitutionalVideo />
    </Modal>
  );
}

/*
  Componente aparte para que su efecto nazca y muera con el panel del modal.
*/
function InstitutionalVideo() {
  const { video } = pilaresContent;
  const videoRef = useRef<HTMLVideoElement>(null);

  /*
    Arranca con sonido al abrir. Lo permite el navegador porque la apertura
    viene de un clic o una tecla del usuario; si aun así lo rechaza, quedan los
    controles nativos para darle play a mano.

    Al cerrar se pausa y vuelve al inicio. El desmontaje ya lo detiene —un
    elemento de medios que sale del documento se pausa—, pero se hace explícito
    para no depender de eso.
  */
  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;
    element.play().catch(() => {});

    return () => {
      element.pause();
      element.currentTime = 0;
    };
  }, []);

  return (
    /*
      rounded-2xl: radio de tarjeta anidada. aspect-video reserva el 16:9 antes
      de que cargue el archivo, y video-modal-frame limita el ancho para que el
      video quepa también en alto (ver globals.css).
    */
    <video
      ref={videoRef}
      src={VIDEO_SRC}
      poster={POSTER_SRC}
      controls
      playsInline
      preload="auto"
      className="video-modal-frame mx-auto block aspect-video rounded-2xl bg-surface-strong"
    >
      {/*
        Pista de subtítulos en español. No se pinta mientras no haya archivo
        (captionsSrc en content/pilares.ts): una pista vacía aparecería en el
        menú del reproductor sin mostrar nada.
      */}
      {video.captionsSrc ? (
        <track
          kind="captions"
          src={video.captionsSrc}
          srcLang="es"
          label={video.captionsLabel}
        />
      ) : null}
    </video>
  );
}
