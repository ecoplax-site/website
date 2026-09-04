import type { Metadata } from "next";
import { DM_Sans, Figtree } from "next/font/google";
import ContactModalProvider from "@/components/ContactModal";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import { siteMetadata } from "@/content/site";
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
      <body className="flex min-h-full flex-col bg-surface-base">
        {/* Scroll suave de toda la página. No pinta nada. */}
        <SmoothScroll />
        {/*
          Un único modal de contacto para toda la página. Vive aquí y no en el
          Hero porque el CTA del footer también lo abre, y el footer se monta
          fuera del árbol del hero.
        */}
        <ContactModalProvider>
          <div className="flex-1">{children}</div>
          <Footer />
        </ContactModalProvider>
      </body>
    </html>
  );
}
