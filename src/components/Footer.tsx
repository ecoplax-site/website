import { footerContent } from "@/content/footer";

export default function Footer() {
  const year = new Date().getFullYear();
  const availableLegalLinks = footerContent.legalLinks.filter(
    (link) => !link.pending,
  );
  const showLegalBlock = availableLegalLinks.length > 0;

  return (
    <footer className="flex flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
      {/* Tarjeta principal: superficie ancla surface-strong (una por pantalla, ver CLAUDE.md > "Sistema visual: tarjetas"). */}
      <div
        className={`grid grid-cols-1 gap-10 rounded-3xl bg-surface-strong px-6 py-10 text-ink-inverse sm:px-10 ${
          showLegalBlock ? "md:grid-cols-3" : "md:grid-cols-2"
        }`}
      >
        <div className="flex flex-col gap-3">
          {/*
            Placeholder de logo mientras no exista el SVG oficial del cliente.
            Al sustituirlo: reemplazar este <span> por <Image src={...} alt="Ecoplax" />
            dentro del mismo contenedor, sin tocar el resto de la estructura.
          */}
          <span className="font-heading text-2xl font-semibold tracking-tight">
            {footerContent.logoText}
          </span>
          <p className="font-body text-sm">{footerContent.tagline}</p>
        </div>

        <div className="flex flex-col gap-2 font-body text-sm">
          <h2 className="font-heading text-sm font-semibold">
            {footerContent.plant.heading}
          </h2>
          {footerContent.plant.addressLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <a
            href={footerContent.plant.phone.href}
            className="underline underline-offset-2"
          >
            {footerContent.plant.phone.display}
          </a>
        </div>

        {showLegalBlock && (
          <div className="flex flex-col gap-2 font-body text-sm">
            <h2 className="font-heading text-sm font-semibold">Legal</h2>
            <nav className="flex flex-col gap-2">
              {availableLegalLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="underline underline-offset-2"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Tarjeta de cierre: acento surface-accent (liver-chestnut). Flex con justify-between para admitir uno o dos elementos sin reestructurar. */}
      <div className="rounded-3xl bg-surface-accent px-6 py-6 text-ink-inverse sm:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3 font-body text-xs">
          <p>
            © {year} {footerContent.legal.brandLine}
          </p>
        </div>
      </div>
    </footer>
  );
}
