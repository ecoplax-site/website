import { ShaderChunk, type MeshPhysicalMaterial } from "three";

/*
  GROSOR DE PARED DEL PET

  La transmisión de three trata el envase como un volumen de espesor constante:
  el rayo recorre siempre `thickness`, mire hacia donde mire. Por eso el cuerpo
  tenía la misma densidad en el centro que en los bordes y se leía como una
  lámina.

  En un envase soplado de verdad, en el centro la mirada atraviesa la pared de
  frente —1 mm— y en el contorno la atraviesa de lado, a lo largo de la curva:
  ahí el material se acumula y se ve más denso. Este parche reproduce eso en el
  shader del material, sin tocar la geometría, en dos partes:

  1. DENSIDAD EN EL CONTORNO. Se mide cuánto de lado mira la cámara a la
     superficie, 1 − |N·V|: 0 de frente y 1 en rasante. Elevado a WALL_FALLOFF,
     el efecto se concentra en una banda estrecha junto al borde, que es donde
     el recorrido por la pared crece de verdad. En esa banda lo transmitido se
     mezcla, hasta WALL_DENSITY, con una versión desaturada y levantada hacia un
     gris claro neutro (WALL_HAZE): la luz que cruza más material se difunde y
     pierde color, sin teñirse de ningún tono.

     Con estos valores, en un cilindro visto de frente el efecto no pasa del
     0.5% en el 60% central, ronda el 4% al 80% del radio, el 20% al 95% y el 38%
     al 99%; en rasante exacta llegaría al 60%, que es WALL_DENSITY. El centro
     del cuerpo no cambia: el paisaje se ve igual de brillante que alrededor.

  2. DIFUSIÓN. El fondo refractado se lee con una rugosidad de al menos
     WALL_DIFFUSION, en lugar de la de los reflejos (0.08). Solo afecta a lo
     transmitido: los reflejos y el clearcoat conservan su nitidez. Desenfoca el
     paisaje unos 4 px a través de todo el cuerpo —el PET soplado nunca es
     ópticamente perfecto— sin cambiar su brillo medio.

  3. TURBIDEZ SIN ACLARAR. Lo transmitido se apaga sin levantarse hacia ningún
     gris, que es lo que lo volvía lechoso:

     - Contraste: se mezcla, en TURBIDITY_CONTRAST, con una versión muy
       desenfocada de sí mismo, leída con rugosidad TURBIDITY_BLUR (un mip
       ~25 px). Esa versión es la media local del propio paisaje, así que la
       mezcla acerca cada punto a su entorno —lo claro baja y lo oscuro sube lo
       mismo— y el brillo medio no cambia.
     - Color: se mezcla, en TURBIDITY_DESATURATION, con su propia luminancia
       (Rec. 709, en lineal). Pierde saturación sin cambiar de luminancia.

     Valores en el extremo conservador: detrás del envase hay musgo a foco, y
     cualquier desenfoque se nota mucho más que sobre un fondo liso.

  Todo va en espacio lineal, antes de la salida: no se aplica tone mapping al
  envase (ver EspecieroModel).
*/

/** Mezcla máxima hacia el velo denso, en el filo del contorno. */
const WALL_DENSITY = 0.6;

/** Estrechez de la banda del contorno: más alto, banda más fina. */
const WALL_FALLOFF = 3;

/** Gris neutro, en lineal, hacia el que se levanta el velo denso. */
const WALL_HAZE = 0.55;

/** Rugosidad mínima con que se lee el fondo refractado. */
const WALL_DIFFUSION = 0.2;

/** Mezcla con la media local del paisaje: cuánto baja el contraste. */
const TURBIDITY_CONTRAST = 0.15;

/** Rugosidad con que se lee esa media local: cuánto de ancho es el entorno. */
const TURBIDITY_BLUR = 0.45;

/** Mezcla con la propia luminancia: cuánto se desatura. */
const TURBIDITY_DESATURATION = 0.1;

const WALL_UNIFORMS = /* glsl */ `
uniform float petWallDensity;
uniform float petWallFalloff;
uniform float petWallHaze;
uniform float petWallDiffusion;
uniform float petTurbidityContrast;
uniform float petTurbidityBlur;
uniform float petTurbidityDesaturation;
`;

const TRANSMITTED_LINE =
  "totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );";

const TRANSMISSION_WITH_WALL = ShaderChunk.transmission_fragment
  .replace(
    "n, v, material.roughness, material.diffuseContribution",
    "n, v, max( material.roughness, petWallDiffusion ), material.diffuseContribution",
  )
  .replace(
    TRANSMITTED_LINE,
    /* glsl */ `vec4 petLocalMean = getIBLVolumeRefraction(
		n, v, petTurbidityBlur, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	transmitted.rgb = mix( transmitted.rgb, petLocalMean.rgb, petTurbidityContrast );
	float petTransmittedLuma = dot( transmitted.rgb, vec3( 0.2126, 0.7152, 0.0722 ) );
	transmitted.rgb = mix( transmitted.rgb, vec3( petTransmittedLuma ), petTurbidityDesaturation );

	${TRANSMITTED_LINE}

	float petGrazing = 1.0 - saturate( abs( dot( normal, geometryViewDir ) ) );
	float petWall = petWallDensity * pow( petGrazing, petWallFalloff );
	float petLuma = dot( totalDiffuse, vec3( 0.2126, 0.7152, 0.0722 ) );
	vec3 petHaze = vec3( mix( petLuma, petWallHaze, 0.5 ) );
	totalDiffuse = mix( totalDiffuse, petHaze, petWall );`,
  );

/*
  Los reemplazos dependen del texto exacto del shader de three 0.185.1. Si una
  actualización lo cambia, el parche dejaría de aplicarse en silencio: se avisa.
*/
if (
  !TRANSMISSION_WITH_WALL.includes("petWallDiffusion") ||
  !TRANSMISSION_WITH_WALL.includes("petGrazing") ||
  !TRANSMISSION_WITH_WALL.includes("petLocalMean")
) {
  console.warn(
    "petWall: el shader de transmisión de three cambió y el grosor de pared no se aplica.",
  );
}

/**
 * Añade al material el grosor de pared y la difusión del PET soplado.
 * Se aplica una vez, al crear el material.
 */
export function applyPetWall(material: MeshPhysicalMaterial) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.petWallDensity = { value: WALL_DENSITY };
    shader.uniforms.petWallFalloff = { value: WALL_FALLOFF };
    shader.uniforms.petWallHaze = { value: WALL_HAZE };
    shader.uniforms.petWallDiffusion = { value: WALL_DIFFUSION };
    shader.uniforms.petTurbidityContrast = { value: TURBIDITY_CONTRAST };
    shader.uniforms.petTurbidityBlur = { value: TURBIDITY_BLUR };
    shader.uniforms.petTurbidityDesaturation = { value: TURBIDITY_DESATURATION };

    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${WALL_UNIFORMS}`)
      .replace("#include <transmission_fragment>", TRANSMISSION_WITH_WALL);
  };

  // Programa propio: sin esto three podría reutilizar el de un material físico
  // sin parchear.
  material.customProgramCacheKey = () => "pet-wall";
}
