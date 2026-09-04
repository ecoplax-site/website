"use client";

import { useContactModal } from "@/components/ContactModal";

/**
 * Botón que abre el modal de contacto. El del hero y el del header abren el
 * mismo modal; solo cambia su aspecto.
 */

const VARIANT_STYLES = {
  /*
    Botón principal, bajo el subtítulo: verde de marca con texto claro. Es el
    par fondo/texto que ya usa la tarjeta del hero, en el que ink-inverse mide
    9.6:1 sobre surface-strong.

    pointer-events-auto: el contenedor del bloque de texto los desactiva para
    no congelar el giro del envase, así que el botón los recupera.
  */
  hero: "pointer-events-auto bg-surface-strong px-6 py-3 text-ink-inverse focus-visible:outline-ink-inverse",
  /*
    Botón del header, sobre la tarjeta del hero. Verde de marca sólido, sin
    transparencia: es la acción principal y tiene que pesar más que las
    píldoras de navegación, que llevan el mismo verde al 80%.

    Antes era surface-raised. Se cambió porque ese relleno claro medía 1.01:1
    contra el cielo de la fotografía: el botón no se distinguía como forma.
    Sólido, ni el texto ni la silueta dependen ya de lo que haya en la foto.

    El anillo de foco va en ink y no en ink-inverse: el hueco que deja
    outline-offset enseña el cielo, y ahí un anillo claro no se ve.
  */
  header: "bg-surface-strong px-5 py-2 text-ink-inverse focus-visible:outline-ink",
  /*
    CTA del footer, sobre la fotografía de fondo. Mismo par de tokens que el
    del hero —ink-inverse sobre surface-strong, 9.6:1— porque es el que da
    contraste propio sin depender de lo que haya en la foto detrás.
  */
  footer: "bg-surface-strong px-6 py-3 text-ink-inverse focus-visible:outline-ink-inverse",
  /*
    Botón dentro del panel de navegación de móvil (Header.tsx). Mismo par de
    tokens que el del hero —ink-inverse sobre surface-strong, 9.6:1—, a todo el
    ancho porque en el panel es la única acción.

    Es la única variante que va sobre fondo CLARO (el panel es surface-raised),
    así que su anillo de foco es ink y no ink-inverse: un anillo casi blanco
    sobre mist mide 1.06:1 y no se vería. Por eso el color del anillo vive en
    cada variante y no en las clases comunes.
  */
  menu: "w-full bg-surface-strong px-6 py-3 text-ink-inverse focus-visible:outline-ink",
} as const;

type ContactButtonProps = {
  variant: keyof typeof VARIANT_STYLES;
  label: string;
  /**
   * Se ejecuta junto con la apertura del modal. Lo usa el panel de navegación
   * de móvil para cerrarse: dos capas modales abiertas a la vez se pelearían
   * por el foco y por la tecla Escape.
   */
  onClick?: () => void;
};

export default function ContactButton({
  variant,
  label,
  onClick,
}: ContactButtonProps) {
  const openContactModal = useContactModal();

  return (
    <button
      type="button"
      onClick={() => {
        onClick?.();
        openContactModal();
      }}
      className={`appearance-none rounded-xl font-body text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${VARIANT_STYLES[variant]}`}
    >
      {label}
    </button>
  );
}
