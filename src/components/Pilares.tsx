"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import Section, { sectionTypography } from "@/components/Section";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { pilaresContent } from "@/content/pilares";

/**
 * Sección de pilares: selector a la izquierda, imagen al centro y las tarjetas
 * del pilar activo a la derecha.
 *
 * El selector es un patrón de pestañas real (tablist / tab / tabpanel), no tres
 * botones sueltos: eso es lo que hace que un lector de pantalla anuncie cuántas
 * opciones hay y cuál está activa.
 *
 * Retículas, siempre colocando por posición y nunca con order-*, de modo que el
 * orden del DOM —etiqueta, titular, párrafo, selector, tarjetas, imagen— sea el
 * de lectura en móvil y también el de foco en cualquier tamaño:
 *
 *   md  2 columnas   texto y selector arriba a todo lo ancho;
 *                    debajo, imagen a la izquierda y tarjetas a la derecha.
 *   lg  24 columnas  8 / 7 / 9, que es 4 / 3.5 / 4.5 de 12 sin fracciones.
 *                    Las tres columnas alineadas al inicio.
 */

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/* Sobre surface-strong, ink-inverse es el único color de texto válido: 9.6:1. */
const ACTIVE_TAB_STYLES = "bg-surface-strong font-semibold text-ink-inverse";
/* Sobre surface-soft, ink mide 8.5:1. */
const INACTIVE_TAB_STYLES = "bg-surface-soft font-medium text-ink";

export default function Pilares() {
  const { pillars } = pilaresContent;
  const baseId = useId();
  const panelId = `${baseId}-panel`;
  const tabId = (pillarId: string) => `${baseId}-${pillarId}`;

  // El pilar activo por defecto es el primero de la lista de contenido.
  const [activeId, setActiveId] = useState(pillars[0].id);
  const activeIndex = pillars.findIndex((pillar) => pillar.id === activeId);
  const activePillar = pillars[activeIndex];

  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  /*
    Navegación de la lista de pestañas. Arriba y abajo recorren en ciclo, Home y
    End van a los extremos. La pestaña que recibe el foco se activa a la vez
    —activación automática—, que es lo esperado cuando cambiar de pestaña no
    cuesta nada, como aquí.
  */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const lastIndex = pillars.length - 1;
    let nextIndex: number | null = null;

    if (event.key === "ArrowDown") nextIndex = (activeIndex + 1) % pillars.length;
    else if (event.key === "ArrowUp") nextIndex = (activeIndex + lastIndex) % pillars.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = lastIndex;
    if (nextIndex === null) return;

    event.preventDefault();
    const next = pillars[nextIndex];
    setActiveId(next.id);
    tabRefs.current[next.id]?.focus();
  };

  return (
    <Section id="pilares" surface="muted">
      <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2 lg:grid-cols-24">
        <div className="flex flex-col gap-6 md:col-span-2 md:row-start-1 lg:col-span-8 lg:col-start-1">
          <p className={`${sectionTypography.eyebrow} text-ink-soft`}>
            {pilaresContent.eyebrow}
          </p>
          <h2 className={`${sectionTypography.heading} text-ink`}>
            {pilaresContent.headline}
          </h2>
          <p className={`${sectionTypography.body} text-ink-soft`}>
            {pilaresContent.intro}
          </p>

          <div
            role="tablist"
            aria-orientation="vertical"
            aria-label={pilaresContent.selectorLabel}
            onKeyDown={handleKeyDown}
            className="mt-2 flex flex-col gap-3"
          >
            {pillars.map((pillar) => {
              const isActive = pillar.id === activeId;

              return (
                <button
                  key={pillar.id}
                  ref={(element) => {
                    tabRefs.current[pillar.id] = element;
                  }}
                  id={tabId(pillar.id)}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={panelId}
                  /* Roving tabindex: solo la pestaña activa entra en el recorrido de Tab. */
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveId(pillar.id)}
                  className={`flex items-center gap-4 rounded-full pr-6 text-left font-body text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                    isActive ? ACTIVE_TAB_STYLES : INACTIVE_TAB_STYLES
                  }`}
                >
                  {/*
                    Hueco circular del icono, del mismo alto que la pastilla: la
                    pastilla no lleva padding vertical, así que su alto es el
                    diámetro de este círculo.

                    PENDIENTE icono de pilar.

                    Relleno cuando la pestaña está activa y solo contorno cuando
                    no lo está: el estado no se distingue únicamente por color
                    —también por el peso del texto y por este círculo—, como pide
                    WCAG 2.1 en 1.4.1.
                  */}
                  <span
                    aria-hidden="true"
                    className={`h-14 w-14 shrink-0 rounded-full ${
                      isActive
                        ? "bg-surface-soft"
                        : "border border-ink-soft/30 bg-transparent"
                    }`}
                  />
                  {pillar.name}
                </button>
              );
            })}
          </div>
        </div>

        {/*
          Panel de tarjetas. tabIndex 0 porque no contiene nada enfocable: sin
          él, quien navega con teclado no podría llegar a leer su contenido.
          La clave por pilar lo vuelve a montar al cambiar, que es lo que dispara
          la transición de entrada.
        */}
        <div
          id={panelId}
          role="tabpanel"
          aria-labelledby={tabId(activeId)}
          tabIndex={0}
          className="md:col-start-2 md:row-start-2 lg:col-span-9 lg:col-start-16 lg:row-start-1"
        >
          <PillarCards key={activePillar.id} cards={activePillar.cards} />
        </div>

        <div className="md:col-start-1 md:row-start-2 lg:col-span-7 lg:col-start-9 lg:row-start-1">
          {/*
            El contenedor ya fija la proporción 3:4 y el radio de tarjeta hija
            (16px), y es relative para admitir <Image fill>. Sustituir el div
            interior por el <Image> no cambia el layout.

            PENDIENTE fotografía de producto o planta Apan.
            Al recibirla: <Image src={...} alt={...} fill className="object-cover" />
          */}
          <div className="relative aspect-3/4 w-full overflow-hidden rounded-2xl">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-surface-soft"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}

/**
 * Tarjetas del pilar activo. Solo texto: sin título, sin icono y sin botón.
 *
 * Se monta de nuevo con cada cambio de pilar (va con key), y ahí entra la
 * transición. Con prefers-reduced-motion no se programa nada y las tarjetas se
 * pintan directamente en su estado final.
 */
function PillarCards({ cards }: { cards: string[] }) {
  const [entered, setEntered] = useState(false);
  const prefersReducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [prefersReducedMotion]);

  const motionClasses = prefersReducedMotion
    ? ""
    : `transition duration-200 ease-out ${
        entered ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
      }`;

  return (
    <ul role="list" className={`flex flex-col gap-4 ${motionClasses}`}>
      {cards.map((card) => (
        <li
          key={card}
          className={`rounded-2xl border border-ink-soft/20 bg-surface-soft p-6 sm:p-8 ${sectionTypography.body} text-ink-soft`}
        >
          {card}
        </li>
      ))}
    </ul>
  );
}
