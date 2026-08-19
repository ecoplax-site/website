import { headerContent } from "@/content/header";

export default function Header() {
  return (
    <header className="flex items-center justify-between gap-4">
      {/*
        Placeholder de logo mientras no exista el SVG oficial del cliente.
        Al sustituirlo: reemplazar este <span> por <Image src={...} alt="Ecoplax" />
        en el mismo lugar, sin tocar el resto de la estructura.
      */}
      <span className="font-heading text-2xl font-semibold tracking-tight text-ink-inverse">
        {headerContent.logoText}
      </span>

      {/* Sin acción todavía: se conectará al modal de cotización cuando exista. */}
      <button
        type="button"
        className="appearance-none rounded-xl bg-surface-raised px-5 py-2 font-body text-sm font-medium text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-inverse"
      >
        {headerContent.ctaLabel}
      </button>
    </header>
  );
}
