"use client";

import { useContactModal } from "@/components/ContactModal";

/**
 * Botón que abre el modal de contacto. El del hero y el del header abren el
 * mismo modal; solo cambia su aspecto.
 */

const VARIANT_STYLES = {
  /*
    Botón principal, bajo el subtítulo, sobre el video del hero.

    pointer-events-auto: el contenedor del bloque de texto los desactiva para
    no congelar el giro del envase, así que el botón los recupera.

    Sólido, con el mismo tratamiento que las píldoras de navegación del header
    (NAV_PILL_BASE en Header.tsx): fondo eggshell (surface-soft), texto verde
    de marca (ink), radio completo. El relleno es opaco, así que el contraste
    del texto —8.44:1— no depende del video que tenga detrás.

    Hover y foco, los de las píldoras: se invierte a verde de marca con texto
    ink-inverse (9.59:1), con transición de color bajo motion-safe. El anillo
    de foco es focus-ring-photo, de dos tonos, porque el hueco del
    outline-offset cae sobre el video.
  */
  hero: "pointer-events-auto rounded-full bg-surface-soft px-6 py-3 text-ink motion-safe:transition-colors hover:bg-surface-strong hover:text-ink-inverse focus-visible:bg-surface-strong focus-visible:text-ink-inverse focus-ring-photo",
  /*
    Botón del header, sobre la tarjeta del hero. Verde de marca sólido, sin
    transparencia: es la acción principal y tiene que pesar más que las
    píldoras de navegación, que van en Eggshell con texto verde.

    Antes era surface-raised. Se cambió porque ese relleno claro medía 1.01:1
    contra el cielo de la fotografía: el botón no se distinguía como forma.
    Sólido, ni el texto ni la silueta dependen ya de lo que haya en la foto.

    focus-ring-photo: el hueco que deja outline-offset enseña la foto, cuyo
    píxel no es un valor conocido, así que el anillo va en dos tonos —ink más
    halo canvas— y no depende de lo que haya debajo.

    Radio completo, el mismo que las píldoras de navegación que tiene al lado.
    Las demás variantes mantienen el radio de control, 12px.
  */
  header:
    "rounded-full bg-surface-strong px-5 py-2 text-ink-inverse focus-ring-photo",
  /*
    El mismo botón del header cuando la barra NO va sobre fotografía, es decir
    fuera de la home. Idéntico en todo salvo el anillo de foco: aquí el hueco
    del outline-offset cae sobre el fondo de página, que es un valor conocido y
    claro, así que basta el anillo ink de la capa base. El halo de
    focus-ring-photo sería invisible sobre canvas y no pinta nada.
  */
  headerPlain: "rounded-full bg-surface-strong px-5 py-2 text-ink-inverse",
  /*
    CTA del footer, sobre la fotografía de fondo. Mismo par de tokens que el
    del hero —ink-inverse sobre surface-strong, 9.6:1— porque es el que da
    contraste propio sin depender de lo que haya en la foto detrás.

    El anillo de foco iba en ink-inverse. Ahora usa focus-ring-photo, de dos
    tonos, por la misma razón que el del header: el hueco del outline-offset
    cae sobre la foto, no sobre el relleno del botón.
  */
  footer: "rounded-xl bg-surface-strong px-6 py-3 text-ink-inverse focus-ring-photo",
  /*
    Botón dentro del panel de navegación de móvil (Header.tsx). Mismo par de
    tokens que el del hero —ink-inverse sobre surface-strong, 9.6:1—, a todo el
    ancho porque en el panel es la única acción.

    Es la única variante que va sobre fondo CLARO (el panel es surface-raised),
    así que se queda con el anillo por defecto (ink): un anillo casi blanco
    sobre mist mide 1.06:1 y no se vería. Es también la única que no necesita
    focus-ring-photo, porque no se apoya sobre fotografía.
  */
  menu: "w-full rounded-xl bg-surface-strong px-6 py-3 text-ink-inverse",
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
      className={`appearance-none font-body text-sm font-medium ${VARIANT_STYLES[variant]}`}
    >
      {label}
    </button>
  );
}
