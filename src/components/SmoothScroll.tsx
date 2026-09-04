"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { registerLenis } from "@/lib/smoothScroll";

/**
 * Scroll suave de toda la página.
 *
 * Se monta una sola vez, en el layout raíz, y no renderiza nada: su único
 * trabajo es tener viva una instancia de Lenis mientras corresponda.
 *
 * Con prefers-reduced-motion activo Lenis no se instancia siquiera. No se
 * acorta la duración ni se baja la intensidad: sin instancia no hay listener
 * de rueda ni bucle de animación, y el scroll es exactamente el del navegador.
 *
 * useMediaQuery se suscribe al cambio de la preferencia con matchMedia, así
 * que activarla con la página abierta destruye la instancia en el acto, y
 * desactivarla la vuelve a crear, sin recargar.
 */

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export default function SmoothScroll() {
  const prefersReducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);

  useEffect(() => {
    if (prefersReducedMotion) return;

    // Sin opciones: duración y easing son los que trae Lenis por defecto.
    const lenis = new Lenis();
    registerLenis(lenis);

    /*
      Lenis no anima solo: hay que darle el reloj. El bucle se cancela en la
      limpieza junto con la instancia, para no dejar ni el rAF ni los listeners
      de scroll colgados al desmontar o al cambiar la preferencia.
    */
    let frame = requestAnimationFrame(function step(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(step);
    });

    return () => {
      cancelAnimationFrame(frame);
      registerLenis(null);
      lenis.destroy();
    };
  }, [prefersReducedMotion]);

  return null;
}
