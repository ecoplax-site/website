import type { Metadata } from "next";
import { DM_Sans, Figtree } from "next/font/google";
import ContactModalProvider from "@/components/ContactModal";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SmoothScroll from "@/components/SmoothScroll";
import { siteMetadata } from "@/content/site";
import { MAIN_CONTENT_ID } from "@/lib/mainContent";
import "./globals.css";

// Sustitutos de PP Mori (tipografía de marca sin licencia web) — ver CLAUDE.md > "Identidad de marca".
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: siteMetadata.title,
  description: siteMetadata.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-MX"
      className={`${dmSans.variable} ${figtree.variable} h-full antialiased`}
    >
      {/*
        relative: la barra superior se posiciona en absoluto contra el <body>
        cuando va superpuesta al hero. Sin esto se mediría contra el bloque
        contenedor inicial, que no es lo mismo en cuanto la página tiene scroll.
      */}
      <body className="relative flex min-h-full flex-col bg-surface-base">
        {/*
          Enlace de salto al contenido. Va el primero del <body> a propósito:
          tiene que ser el primer elemento tabulable del documento, por delante
          del header, para que quien navega con teclado pueda saltarse la
          navegación sin recorrerla entera.

          sr-only lo mantiene invisible y sin ocupar espacio; al recibir foco
          recupera su caja y se coloca en absoluto sobre la esquina superior
          izquierda, así que aparecer no descoloca nada de la página.

          focus-ring-photo: al superponerse a la tarjeta del hero, el hueco de
          su outline-offset puede caer sobre el verde de marca o sobre la
          escena 3D. El anillo de dos tonos no depende de ese píxel.
        */}
        <a
          href={`#${MAIN_CONTENT_ID}`}
          className="focus-ring-photo sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-xl focus:bg-surface-raised focus:px-4 focus:py-3 focus:font-body focus:text-sm focus:font-medium focus:text-ink"
        >
          {siteMetadata.skipLinkLabel}
        </a>

        {/* Scroll suave de toda la página. No pinta nada. */}
        <SmoothScroll />
        {/*
          Un único modal de contacto para toda la página. Vive aquí y no en el
          Hero porque el CTA del footer también lo abre, y el footer se monta
          fuera del árbol del hero.
        */}
        <ContactModalProvider>
          {/*
            La barra superior se pinta en todas las rutas y decide ella misma
            cómo colocarse: superpuesta al hero en la home, en el flujo en el
            resto. Va DENTRO del proveedor porque su botón de cotización abre el
            modal, y FUERA del <main> a propósito: así el enlace de salto, que
            apunta al <main>, se salta de verdad la navegación.
          */}
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </ContactModalProvider>
      </body>
    </html>
  );
}
