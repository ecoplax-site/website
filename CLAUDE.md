# Ecoplax — sitio web

Sitio corporativo de Ecoplax, marca de envases plásticos sustentables de Cajaplax (México, fundada en 1975). Agencia a cargo: SCNDAL.

## Stack

- Next.js 16.3.1, App Router, TypeScript, carpeta src/
- Tailwind CSS
- Despliegue en Vercel, repositorio github.com/ecoplax-site/website
- Sin CMS: el contenido vive en el repo como archivos de datos tipados
- Resend para el envío de formularios (se conecta al final)

Next.js 16 es una versión reciente. Antes de escribir código que use APIs del framework, verifica la documentación oficial de la versión instalada en lugar de asumir patrones de versiones anteriores.

## Reglas de trabajo

- Nunca ejecutes git commit ni git push. El historial lo controla Alejandro manualmente.
- Ante cualquier decisión de marca, contenido o negocio: detente y pregunta. No elijas por tu cuenta.
- No inventes datos, cifras, certificaciones, testimonios ni información regulatoria. Si falta un dato, márcalo como PENDIENTE y avísalo.
- Responde en español.
- Reportes cortos: qué hiciste, qué decidiste por tu cuenta, qué quedó abierto.
- Si detectas un problema de accesibilidad, arquitectura frágil o inconsistencia de contenido, dilo aunque no te lo hayan preguntado.

## Contenido

Todo el texto visible va en archivos de datos separados de los componentes, tipados con TypeScript. Ningún string de copy se escribe directamente dentro de un componente.

Razón: el idioma final del sitio está pendiente de definición con el cliente. Si se aprueba versión en inglés, debe bastar con agregar un archivo de traducción, no reescribir componentes.

Los archivos de contenido deben ser editables por alguien no técnico desde la interfaz web de GitHub, sin abrir un editor de código.

## Identidad de marca

Paleta oficial (única fuente válida, no usar otros valores):

- Cal Poly Pomona Green #234b2c
- Liver Chestnut #5a453a
- Pastel Gray #cad6c1
- Dark Vanilla #cdbda2
- Eggshell #edeedb

Regla de uso: #234b2c y #5a453a son los únicos colores válidos para texto. #cad6c1, #cdbda2 y #edeedb son exclusivamente colores de fondo. Nunca uses texto blanco sobre los tres claros: el contraste queda en 1.5:1 y es ilegible.

Sobre fondo Dark Vanilla #cdbda2 usa únicamente Cal Poly Pomona Green #234b2c. La combinación de Liver Chestnut #5a453a sobre #cdbda2 queda prohibida: mide 4.9:1 y no tiene margen frente al mínimo AA.

Tipografía: el manual de marca especifica PP Mori, tipografía comercial sin licencia web adquirida. Sustitutos aprobados de Google Fonts:

- Titulares: DM Sans
- Texto corrido: Figtree

Logotipo: archivos SVG proporcionados por el cliente. Tamaño mínimo en web: 77 px de alto para el isotipo, 360 px de ancho para el imagotipo. Nunca deformar, rotar, alterar proporciones, eliminar elementos ni agregar elementos al imagotipo.

Tagline: "Cambiamos la forma, no el compromiso."

## Accesibilidad

Objetivo WCAG 2.1 nivel AA. Todo texto debe cumplir contraste mínimo 4.5:1 (3:1 para texto grande). Verifica el contraste antes de proponer cualquier combinación de color nueva.

## Datos de la empresa

- Oficinas: Bajío 319, Roma Sur, Cuauhtémoc, CDMX. Tel 5552644545
- Planta: Apan, Hidalgo. Tel 7489120555
- Certificaciones: BRCGS Packaging Materials, SMETA, ESR
- Cajaplax fue fundada en 1975. Nunca escribas el número de años como valor fijo: calcúlalo desde 1975 o usa "más de 50 años".

## Sistema visual: tarjetas

El sitio se construye con lenguaje de tarjetas. Cada sección de la página es una tarjeta que flota sobre el fondo, nunca un bloque a sangre completa.

Reglas de contenedor:

- El fondo de la página es surface-base. Es el aire entre tarjetas, no un lienzo con contenido encima.
- Toda tarjeta de sección lleva margen lateral respecto al viewport. Ninguna tarjeta toca el borde de la ventana.
- Radio de esquina de tarjetas de sección: 24px. Tarjetas anidadas dentro de una sección: 16px. Controles y botones: 12px.
- Las tarjetas se separan entre sí por espacio vertical, no por líneas divisorias.

Jerarquía cromática:

- Por defecto una tarjeta es surface-raised o surface-soft, es decir, de tono muy cercano al fondo. El contraste con el fondo es sutil, no marcado.
- El borde es opcional y siempre tenue. Nunca bordes gruesos ni de color saturado.
- En cada pantalla puede haber como máximo una tarjeta ancla en surface-strong, el verde de marca. Es lo que da jerarquía. Si todo destaca, nada destaca.
- Las tarjetas de acento en color sólido sin fotografía sirven para romper el ritmo entre secciones con imagen. Úsalas con moderación.

Anidamiento:

- Una tarjeta de sección puede contener tarjetas hijas. No anides más de dos niveles.
- Una tarjeta hija nunca repite el mismo tono que su contenedor.

Efecto glass:

- Los paneles con backdrop-filter solo son válidos sobre fotografía, sobre la escena 3D o sobre una tarjeta de color saturado. Nunca sobre surface-base ni sobre tonos claros: difuminar un fondo claro no produce efecto visible.
- Todo panel glass que contenga texto debe llevar además una capa de color semiopaco de base. El desenfoque por sí solo no garantiza contraste, porque la imagen de fondo varía.
- El desenfoque animado se limita a un máximo de dos elementos simultáneos por pantalla. En viewports menores a 768px el glass se resuelve estático, sin animación.

Desbordamiento de imágenes y objetos:

- Un objeto puede romper el borde de su tarjeta y sobresalir. Este comportamiento es exclusivo de escritorio.
- En viewports menores a 1024px el objeto se contiene dentro de la tarjeta. Nunca debe producirse scroll horizontal.
- Un objeto que invade la tarjeta vecina para coser dos secciones es válido, pero solo en escritorio y con la misma regla anterior.

Movimiento:

- Toda animación debe respetar prefers-reduced-motion. Cuando el usuario lo tenga activo, el movimiento se elimina y el contenido se muestra en su estado final.
- El movimiento acompaña al contenido, nunca retrasa su lectura.

@AGENTS.md
