import Hero from "@/components/Hero";
import Origen from "@/components/Origen";
import Pilares from "@/components/Pilares";
import Productos from "@/components/Productos";
import Materiales from "@/components/Materiales";
import Noticias from "@/components/Noticias";
import { MAIN_CONTENT_ID } from "@/lib/mainContent";

export default function Home() {
  return (
    /*
      id y tabIndex -1 son el destino del enlace de salto del layout. Sin
      tabIndex el navegador desplaza la página pero no mueve el foco, y el
      siguiente Tab volvería al principio del documento. -1 lo hace enfocable
      por programa sin meterlo en el recorrido de tabulación.

      Toda página nueva debe repetir estos dos atributos en su <main>: el
      enlace de salto vive en el layout y apunta a este ancla.
    */
    <main id={MAIN_CONTENT_ID} tabIndex={-1}>
      <Hero />
      <Origen />
      <Materiales />
      <Pilares />
      <Productos />
      <Noticias />
    </main>
  );
}
