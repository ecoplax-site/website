"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Lee una media query y se resuscribe a sus cambios.
 *
 * Es reactiva en vivo: si el usuario cambia la preferencia del sistema con la
 * página abierta (reducir movimiento, por ejemplo), el componente se vuelve a
 * renderizar sin recargar.
 *
 * En servidor devuelve `false` siempre. Quien la use debe tratar ese `false`
 * como "todavía no se sabe", no como una respuesta negativa.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", onStoreChange);
      return () => mediaQueryList.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
