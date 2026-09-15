/*
  Puente entre el video de fondo del hero (HeroBackgroundVideo, en el DOM) y la
  escena 3D (EspecieroScene), que lo usa como textura para que el envase lo
  refracte.

  Son dos islas de cliente separadas —una dentro de la tarjeta, la otra en la
  capa hermana de la escena—, así que no comparten estado de React. Este módulo
  guarda el elemento <video> que está reproduciéndose y avisa a quien escuche.

  HeroBackgroundVideo lo registra cuando empieza a reproducirse y lo retira al
  desmontarse (por ejemplo, al activar prefers-reduced-motion). Mientras no hay
  video, la escena usa la fotografía póster.
*/

let current: HTMLVideoElement | null = null;
const listeners = new Set<() => void>();

export function setHeroBackdropVideo(video: HTMLVideoElement | null) {
  if (current === video) return;
  current = video;
  listeners.forEach((listener) => listener());
}

export function getHeroBackdropVideo() {
  return current;
}

export function subscribeHeroBackdropVideo(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
