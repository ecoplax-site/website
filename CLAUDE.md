# Ecoplax — sitio web

Sitio corporativo de Ecoplax, marca de envases plásticos sustentables de Cajaplax (México, fundada en 1975). Agencia a cargo: SCNDAL.

## Stack

- Next.js 16.3.1, App Router, TypeScript, carpeta src/
- Tailwind CSS v4 con capa de tokens semánticos declarada en @theme. No hay archivo de configuración JS.
- Escena 3D: three, @react-three/fiber y @react-three/drei. Todas las versiones van pinneadas exactas, sin caret ni tilde. No actualices ni instales con rangos.
- Modelos 3D en formato GLB, generados fuera del repo. No los regeneres ni los edites.
- Despliegue en Vercel, repositorio github.com/ecoplax-site/website
- Sin CMS: el contenido vive en el repo como archivos de datos tipados
- Resend para el envío de formularios (se conecta al final)

Next.js 16 es una versión reciente. Antes de escribir código que use APIs del framework, verifica la documentación oficial de la versión instalada en lugar de asumir patrones de versiones anteriores.

## Reglas de trabajo

- Roles del proyecto: la dirección creativa, de diseño, de UX y de contenido corresponde a la agencia. Tu rol es la ejecución técnica. Sobre criterio visual, jerarquía, copy, marca o negocio puedes hacer observaciones y sugerencias, nunca decidir ni aplicar el cambio por tu cuenta.
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

Paleta de marca (brandbook, sección 6.1):

- Cal Poly Pomona Green #234b2c
- Liver Chestnut #5a453a
- Pastel Gray #cad6c1
- Dark Vanilla #cdbda2
- Eggshell #edeedb

El brandbook muestra en otra página los valores #ab8963 y #305137. Son incorrectos: la sección 6.1 es la única fuente válida.

Neutros de sistema, aprobados por la agencia y ajenos al brandbook:

- Canvas #fbfbf9 (fondo de página, surface-base)
- Mist #f4f4f0 (surface-raised)

Estos dos neutros son parte del sistema y no se sustituyen por colores del brandbook. Fuera de estos siete valores no se introduce ningún color nuevo sin aprobación.

Regla de uso: #234b2c y #5a453a son los únicos colores válidos para texto. #cad6c1, #cdbda2 y #edeedb son exclusivamente colores de fondo. Nunca uses texto blanco sobre los tres claros: el contraste queda en 1.5:1 y es ilegible.

Excepción única: sobre surface-strong (Cal Poly Pomona Green) el color de texto válido es ink-inverse, cuyo valor es Eggshell #edeedb. Ningún otro color de texto es admisible sobre esa superficie, y no se usa blanco puro en ningún caso.

Sobre fondo Dark Vanilla #cdbda2 usa únicamente Cal Poly Pomona Green #234b2c. La combinación de Liver Chestnut #5a453a sobre #cdbda2 queda prohibida: mide 4.9:1 y no tiene margen frente al mínimo AA.

Tipografía: el manual de marca especifica PP Mori, tipografía comercial sin licencia web adquirida. Sustitutos aprobados de Google Fonts:

- Titulares: DM Sans
- Texto corrido: Figtree

Logotipo: archivos SVG proporcionados por el cliente, en public/images/brand.

Los tamaños mínimos del brandbook —77 px de alto para el isotipo, 360 px de ancho para el imagotipo— no aplican al header ni al footer del sitio. Esos dos usos van al tamaño que pida la composición: en el header, el alto de la barra; en el footer, el ancho de su columna. Decisión tomada con la agencia.

El SVG se pinta inline y su color se resuelve con currentColor, así que no hay variantes de color que mantener: el mismo archivo va en Cal Poly Pomona Green sobre fondo claro y en Eggshell sobre la tarjeta verde.

Nunca deformar, rotar, alterar proporciones, eliminar elementos ni agregar elementos al imagotipo. Escalar siempre por una sola dimensión y dejar que el navegador calcule la otra.

Tagline: "Cambiamos la forma, no el compromiso."

## Accesibilidad

Objetivo WCAG 2.1 nivel AA. Todo texto debe cumplir contraste mínimo 4.5:1 (3:1 para texto grande). Verifica el contraste antes de proponer cualquier combinación de color nueva.

## Datos de la empresa

Las direcciones, teléfonos, certificaciones, cifras, capacidades productivas y cualquier dato verificable viven exclusivamente en los archivos de contenido. Este archivo no es fuente de datos.

Si un dato no está en los archivos de contenido, no lo escribas: márcalo como PENDIENTE y detente.

## Integridad de contenido

Estas reglas aplican a todo texto visible del sitio y no admiten excepción.

- No escribas cifras de emisiones, huella de carbono ni CO₂ bajo ninguna forma. La línea base GEI está en construcción.
- No atribuyas ninguna afirmación absoluta a un material: nada es "100% reciclable", "totalmente biodegradable" ni equivalente.
- No describas EcoPure® con ningún verbo ambiental (degradar, descomponer, reducir emisiones). Su descripción queda pendiente de datos técnicos del cliente.
- No inventes nombres de producto, SKUs, capacidades ni especificaciones técnicas.
- El informe de sostenibilidad pertenece a CAJAPLAX, S.A. de C.V. Ecoplax es una línea de producto de esa empresa. No atribuyas a Ecoplax datos, certificaciones ni resultados corporativos de Cajaplax.
- Cajaplax fue fundada en 1975. Nunca escribas el número de años como valor fijo: usa "más de cinco décadas".

## Decisiones cerradas

Estas decisiones ya se tomaron y evaluaron. No las reviertas ni las "corrijas" al encontrarlas.

- El header no comparte el sistema de padding del hero. Se desacoplaron a propósito. No los vuelvas a unificar.
- Las secciones Capacidad, Planta, Materiales, Contacto, Sectores y Clientes se eliminaron de la home de forma deliberada. No las reintroduzcas.
- El proyecto usa Tailwind v4 con tokens semánticos en @theme. No introduzcas un archivo de configuración JS ni clases de utilidad con valores arbitrarios.

## Verificación

- Ejecuta la tarea una vez y reporta. No hagas ciclos repetidos de validación por tu cuenta.
- La revisión visual la hace la agencia. No abras el navegador para juzgar cómo se ve algo.
- Para diagnosticar un fallo reportado, sí levanta el servidor y reprodúcelo. No deduzcas la causa leyendo el código.

## Sistema visual: tarjetas

El sitio se construye con lenguaje de tarjetas. Cada sección de la página es una tarjeta que flota sobre el fondo, nunca un bloque a sangre completa.

Reglas de contenedor:

- El fondo de la página es surface-base. Es el aire entre tarjetas, no un lienzo con contenido encima.
- Toda tarjeta de sección lleva margen lateral respecto al viewport. Ninguna tarjeta toca el borde de la ventana.
- Radio de esquina de tarjetas de sección: 24px. Tarjetas anidadas dentro de una sección: 16px. Controles y botones: 12px.
- Excepción aprobada al radio de controles: los elementos con forma de pastilla usan radio completo. Aplica al selector de pilares y a las etiquetas de resina de Productos. El resto de controles —botones, campos de formulario— mantiene los 12px. No extiendas el radio completo a otros controles sin aprobación.
- Las tarjetas se separan entre sí por espacio vertical, no por líneas divisorias.

Jerarquía cromática:

Una tarjeta de sección admite cuatro superficies. Son las que expone la prop `surface` del componente Section, y no hay más: cualquier otra combinación es un error.

- surface-raised (Mist). Por defecto. Tono muy cercano al fondo de página: el contraste es sutil, no marcado.
- surface-soft (Eggshell). Alternativa al anterior, un punto más cálida. Sirve para alternar con raised y dar ritmo entre secciones seguidas sin subir la intensidad.
- surface-muted (Pastel Gray #cad6c1). Un escalón más marcada que las dos anteriores. Es la superficie para secciones que contienen controles en verde de marca: sobre surface-strong esos controles desaparecerían, porque quedarían verde sobre verde. También separa mejor las tarjetas hijas claras que raised o soft. Ambos colores de texto cumplen sobre ella: ink mide 6.6:1 e ink-soft 5.9:1.
- surface-strong (Cal Poly Pomona Green). Ancla de máximo contraste. Como máximo una por pantalla: es lo que da jerarquía, y si todo destaca, nada destaca. Sobre ella, ink-inverse es el único color de texto válido.

Reglas transversales:

- El borde es opcional y siempre tenue. Nunca bordes gruesos ni de color saturado.
- Las tarjetas de acento en color sólido sin fotografía sirven para romper el ritmo entre secciones con imagen. Úsalas con moderación.
- Antes de elegir superficie para una sección nueva, mira la anterior y la siguiente: dos secciones seguidas no deben repetir tono.

Anidamiento:

- Una tarjeta de sección puede contener tarjetas hijas. No anides más de dos niveles.
- Una tarjeta hija nunca repite el mismo tono que su contenedor. En la práctica: hijas claras sobre muted o strong; hijas soft o muted sobre raised.

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
