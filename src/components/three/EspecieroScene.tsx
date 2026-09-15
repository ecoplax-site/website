"use client";

import { Suspense, useLayoutEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { MathUtils, Object3D, type Group } from "three";
import EspecieroModel from "./EspecieroModel";
import HeroBackdrop from "./HeroBackdrop";

/*
  Todas las medidas están en metros, igual que el modelo.
  El envase mide 0.1173 m de alto y su origen está en la base.
*/
const MODEL_HEIGHT = 0.1173;

/*
  POSTURA DE REPOSO

  Inclinación en el plano de la imagen: ~22°, con la boca arriba a la izquierda
  y la base abajo a la derecha. Es una rotación en Z positiva porque gira el
  extremo superior hacia las X negativas.
*/
const BASE_TILT_Z = 0.39;

/*
  Inclinación adicional que acerca la boca a la cámara, para que el cuello se
  lea abierto y no como un canto. ~16°. Se aplica en X después de la de Z
  (el orden de Euler por defecto en three es XYZ, que aplica Z primero).
*/
const BASE_TILT_X = 0.28;

/*
  ENCUADRE

  fov cerrado y cámara sobre su propio eje, en vez de escalar la malla:
  escalar alteraría cómo el material interpreta `thickness` y cambiaría el
  aspecto del PET, que se calibra aparte. El fov se mantiene en 22° para que la
  perspectiva siga plana y el envase se lea como objeto de producto.

  El envase queda contenido en la tarjeta y anclado arriba y a la izquierda:
  su parte superior queda siempre a TOP_MARGIN_PX del borde superior, su
  costado izquierdo a CONTENT_GAP_PX de la columna de contenido, y el envase
  crece hacia abajo y a la derecha hasta dejar BOTTOM_MARGIN_PX con esos
  bordes. Distancia de cámara y colocación no son fijas: las calcula
  fitHeroFrame a partir del tamaño del canvas, que mide exactamente lo mismo
  que la tarjeta, y del borde de la columna, que mide EspecieroSceneLoader.
*/
const CAMERA_FOV = 22;
const HALF_FOV_TAN = Math.tan(MathUtils.degToRad(CAMERA_FOV / 2));

/*
  Distancia fija, en px, entre la parte superior del envase en reposo y el
  borde superior de la tarjeta. Es un valor propio de la escena, sin relación
  con el padding interno de la tarjeta (lg:p-20, 80px).
*/
const TOP_MARGIN_PX = 160;

/*
  Separación mínima, en px, entre el borde derecho de la columna de contenido
  del hero y el costado izquierdo del envase. Se garantiza en todo el giro por
  puntero: en reposo el envase queda algo más lejos, porque el giro lo acerca
  a la columna unos píxeles.
*/
const CONTENT_GAP_PX = 0;

/*
  Margen mínimo, en px, entre el envase y los bordes inferior y derecho de la
  tarjeta en el extremo del giro por puntero. En reposo el margen inferior
  queda algo por encima, porque el giro baja la base unos píxeles.
*/
const BOTTOM_MARGIN_PX = 40;

/*
  PUNTOS EXTREMOS DEL ENVASE

  Pares [coordenada, z] en metros, respecto al centro del envase y en el
  espacio de la cámara: z es la distancia hacia la cámara, que amplía la
  proyección en d / (d − z). Por eso no basta con el punto más alto o más
  bajo: uno algo menos alto pero más cercano puede proyectarse por encima.

  Salen de recorrer los vértices del GLB. Solo se conservan los que llegan a
  ser el extremo proyectado para alguna distancia de cámara entre 0.3 y 1.5
  y, en horizontal, para tarjetas de aspecto entre 1 y 3.5 con el borde de la
  columna en cualquier punto de su ancho:

  - TOP: extremo superior en reposo. Es el que se ancla a TOP_MARGIN_PX.
  - BOTTOM: extremo inferior (en valor absoluto) en cualquier punto del giro
    por puntero, ±POINTER_AMPLITUDE en X e Y.
  - RIGHT: extremo derecho en cualquier punto del giro. Los seis últimos
    mandan en tarjetas apaisadas, donde la cercanía a la cámara pesa más.
  - LEFT: extremo izquierdo (en valor absoluto) en cualquier punto del giro.
    Es el que se ancla a CONTENT_GAP_PX. Aquí z cuenta en los dos sentidos:
    según dónde caiga el borde de la columna respecto al centro de la tarjeta,
    manda un punto más cercano o uno más lejano a la cámara.

  Si cambian el modelo, la postura de reposo o POINTER_AMPLITUDE, hay que
  recalcularlos.
*/
const TOP_EXTREMES: ReadonlyArray<readonly [number, number]> = [
  [0.06, 0.0068],
  [0.0598, 0.01],
  [0.0592, 0.0133],
];
const BOTTOM_EXTREMES: ReadonlyArray<readonly [number, number]> = [
  [0.0612, 0.0014],
  [0.061, 0.0035],
  [0.0608, 0.0048],
  [0.0607, 0.0054],
  [0.0602, 0.0079],
];
const RIGHT_EXTREMES: ReadonlyArray<readonly [number, number]> = [
  [0.043, 0.0006],
  [0.0429, 0.0027],
  [0.0426, 0.0048],
  [0.0421, 0.0069],
  [0.0413, 0.009],
  [0.0404, 0.0109],
  [0.0393, 0.0129],
  [0.0384, 0.0141],
  [0.038, 0.0147],
];
const LEFT_EXTREMES: ReadonlyArray<readonly [number, number]> = [
  [0.0374, -0.0105],
  [0.0383, -0.009],
  [0.0391, -0.0074],
  [0.0397, -0.0057],
  [0.0401, -0.0039],
  [0.0404, -0.0021],
  [0.0405, -0.0003],
  [0.0405, 0.0175],
  [0.0404, 0.0192],
  [0.0401, 0.0209],
  [0.0397, 0.0226],
];

type HeroFrame = {
  cameraDistance: number;
  offsetX: number;
  offsetY: number;
};

/**
 * Distancia de cámara y colocación del envase para una tarjeta de
 * width × height px.
 *
 * Con d la distancia y t = tan(fov/2), un punto (y, z) del envase desplazado
 * y0 en vertical se proyecta en NDC como (y0 + y) / (t·(d − z)). En NDC, un
 * margen de m px equivale a 1 − 2·m / alto.
 *
 * - Anclaje arriba: y0 se elige para que el más alto de TOP_EXTREMES caiga
 *   exactamente a TOP_MARGIN_PX. y0 = min(aT·t·(d − z) − y).
 * - Abajo: con ese y0, todo punto de BOTTOM_EXTREMES queda por encima del
 *   margen inferior. Despejando d para cada par de extremos:
 *   d ≥ (y + b + t·(aT·zT + aB·zB)) / (t·(aT + aB))
 * - Anclaje a la izquierda: con x0 el desplazamiento horizontal, un punto
 *   (x, z) se proyecta como (x0 + x) / (t·aspecto·(d − z)). x0 se elige para
 *   que todo punto de LEFT_EXTREMES quede a la derecha de cL, el borde de la
 *   columna más CONTENT_GAP_PX en NDC: x0 = max(cL·t·aspecto·(d − z) + l).
 * - Derecha: con ese x0, todo punto de RIGHT_EXTREMES queda dentro del margen.
 *   Despejando d para cada par de extremos:
 *   d ≥ (r + l + t·aspecto·(cR·zR − cL·zL)) / (t·aspecto·(cR − cL))
 *
 * Se toma la menor d que cumple todo, que es el envase más grande posible.
 * En pantallas apaisadas manda la vertical: el margen inferior se ajusta al
 * mínimo y, al seguir anclado a la columna, el margen que crece es el derecho.
 * En tarjetas más estrechas manda la horizontal, el envase se reduce y el
 * margen que crece es el inferior.
 *
 * Devuelve null si entre la columna y el margen derecho no queda sitio.
 */
function fitHeroFrame(
  width: number,
  height: number,
  contentEdgePx: number,
): HeroFrame | null {
  const aspect = width / height;
  const topNdc = 1 - (2 * TOP_MARGIN_PX) / height;
  const bottomNdc = 1 - (2 * BOTTOM_MARGIN_PX) / height;
  const rightNdc = 1 - (2 * BOTTOM_MARGIN_PX) / width;
  const leftNdc = (2 * (contentEdgePx + CONTENT_GAP_PX)) / width - 1;

  if (rightNdc <= leftNdc) return null;

  const horizontalTan = HALF_FOV_TAN * aspect;
  let cameraDistance = 0;

  for (const [top, topZ] of TOP_EXTREMES) {
    for (const [bottom, bottomZ] of BOTTOM_EXTREMES) {
      cameraDistance = Math.max(
        cameraDistance,
        (top + bottom + HALF_FOV_TAN * (topNdc * topZ + bottomNdc * bottomZ)) /
          (HALF_FOV_TAN * (topNdc + bottomNdc)),
      );
    }
  }

  for (const [left, leftZ] of LEFT_EXTREMES) {
    for (const [right, rightZ] of RIGHT_EXTREMES) {
      cameraDistance = Math.max(
        cameraDistance,
        (right + left + horizontalTan * (rightNdc * rightZ - leftNdc * leftZ)) /
          (horizontalTan * (rightNdc - leftNdc)),
      );
    }
  }

  const offsetX = Math.max(
    ...LEFT_EXTREMES.map(
      ([left, leftZ]) => leftNdc * horizontalTan * (cameraDistance - leftZ) + left,
    ),
  );

  const offsetY = Math.min(
    ...TOP_EXTREMES.map(
      ([top, topZ]) => topNdc * HALF_FOV_TAN * (cameraDistance - topZ) - top,
    ),
  );

  return { cameraDistance, offsetX, offsetY };
}

/*
  MOVIMIENTO POR PUNTERO

  Amplitud discreta: insinúa volumen, no persigue el cursor.
  El suavizado está en unidades de 1/s, no por frame — ver el cálculo de alpha.
*/
const POINTER_AMPLITUDE = 0.2;
const POINTER_SMOOTHING = 3.5;

/*
  SOMBRA PROYECTADA

  No se usa ContactShadows de drei. La razón, comprobada: ContactShadows solo
  funciona en su orientación por defecto, que es la de un suelo horizontal.
  Internamente desenfoca el resultado renderizando un plano auxiliar que vive
  fijo en el plano XZ del mundo, a través de la misma cámara de la sombra; al
  girar el grupo ese plano auxiliar queda escorzado o de canto y el desenfoque
  borra el render. Medido: con el grupo girado la sombra baja a 2.7 niveles de
  oscurecimiento sobre 255, es decir, invisible.

  Y en su orientación por defecto tampoco sirve aquí: el plano queda horizontal
  y nuestra cámara mira en horizontal a la altura del centro del envase, así que
  lo vería exactamente de canto.

  La sombra se resuelve entonces como sombra proyectada de verdad: una luz
  direccional que la emite y un plano de fondo que la recibe con ShadowMaterial,
  que es transparente salvo por la propia sombra — que es justo lo que hace
  falta sobre el verde de la tarjeta, sin traer fondo. Se orienta libremente y
  sigue al envase sola, porque el mapa de sombras se recalcula cada frame.
*/

/*
  Posición de la luz que proyecta, relativa al centro del envase en reposo
  (ver EspecieroRig). Arriba, a la izquierda y al frente: la
  sombra cae hacia abajo y a la derecha, acompañando la diagonal del envase
  (boca arriba-izquierda, base abajo-derecha).

  El ángulo es deliberadamente tendido. Con una luz más cenital la sombra se
  despega tanto del envase que deja de leerse como suya.
*/
const SHADOW_LIGHT_POSITION: [number, number, number] = [-0.22, 0.1, 0.8];

/*
  Plano que recibe la sombra, justo detrás del envase (su cara trasera llega a
  -0.038). Cuanto más cerca, menos se separa la sombra del objeto.
*/
const SHADOW_PLANE_Z = -0.045;
const SHADOW_PLANE_SIZE = 0.5;

/* Sutil a propósito: asienta el envase sin convertirse en una mancha. */
const SHADOW_OPACITY = 0.38;

type EspecieroSceneProps = {
  /*
    Falso en táctil (sin puntero fino) y con prefers-reduced-motion: reduce.
    En ambos casos el envase se queda quieto en su postura de reposo.
  */
  motionEnabled: boolean;
};

type CanvasProps = RigProps & {
  /*
    Video y fotografía de la tarjeta, para pintarlos dentro de la escena y que
    el envase los refracte (ver HeroBackdrop).
  */
  backdropVideo: HTMLVideoElement | null;
  backdropPoster: HTMLImageElement | null;
  /*
    Elemento que escucha el puntero. No es el canvas: el canvas sobresale por
    debajo de la tarjeta y ahí no debe capturar nada, así que va entero con
    pointer-events: none y quien escucha es una capa que cubre solo la tarjeta.
  */
  eventSource: HTMLElement;
};

type RigProps = EspecieroSceneProps & {
  /*
    Borde derecho de la columna de contenido del hero, en px desde el borde
    izquierdo de la tarjeta. Lo mide EspecieroSceneLoader.
  */
  contentEdgePx: number;
};

function EspecieroRig({ motionEnabled, contentEdgePx }: RigProps) {
  const pointerGroup = useRef<Group>(null);
  const size = useThree((state) => state.size);
  const getThreeState = useThree((state) => state.get);
  // Objetivo de la luz direccional, en el centro del envase en reposo.
  const [shadowTarget] = useState(() => new Object3D());

  const frame = fitHeroFrame(size.width, size.height, contentEdgePx);

  /*
    La cámara se acerca o aleja cada vez que cambia el tamaño de la tarjeta. En efecto de layout, para que el primer frame ya salga con la
    distancia correcta. invalidate hace falta en modo "demand" (sin
    movimiento), donde nada más pediría un frame nuevo.

    R3F crea la cámara una sola vez y no vuelve a aplicarle las props del
    Canvas al re-renderizar, así que este valor no se pisa. Se lee con get()
    y no desde useThree: la cámara es un objeto de three que se muta a
    propósito, y el lint de React no admite mutar lo que devuelve un hook.
  */
  const cameraDistance = frame?.cameraDistance;

  useLayoutEffect(() => {
    if (cameraDistance === undefined) return;
    const { camera, invalidate } = getThreeState();
    camera.position.z = cameraDistance;
    camera.updateMatrixWorld();
    invalidate();
  }, [getThreeState, cameraDistance]);

  useFrame((state, delta) => {
    const group = pointerGroup.current;
    if (!group) return;

    if (!motionEnabled) {
      /*
        Vuelta seca a la postura de reposo, sin interpolar: si el usuario activa
        "reducir movimiento" con la página abierta, no debe ver una animación de
        regreso — precisamente lo que pidió evitar.
      */
      group.rotation.set(0, 0, 0);
      return;
    }

    const targetX = -state.pointer.y * POINTER_AMPLITUDE;
    const targetY = state.pointer.x * POINTER_AMPLITUDE;

    /*
      Suavizado exponencial con el delta del frame. Con un factor fijo por frame
      el amortiguado iría al doble de velocidad en un monitor de 120 Hz que en
      uno de 60; así el tiempo de llegada al objetivo es el mismo en ambos.
    */
    const alpha = 1 - Math.exp(-POINTER_SMOOTHING * delta);

    group.rotation.x += (targetX - group.rotation.x) * alpha;
    group.rotation.y += (targetY - group.rotation.y) * alpha;
  });

  /*
    Sin sitio entre la columna y el margen derecho no se pinta el envase: antes
    que invadir la separación con el texto, se retira.
  */
  if (!frame) return null;

  return (
    /*
      Colocación a la derecha de la columna de contenido. El canvas cubre la
      tarjeta completa (hace falta para que el puntero se lea en todo el hero),
      así que el desplazamiento se hace aquí, en unidades de mundo: en
      horizontal ancla el envase a CONTENT_GAP_PX de la columna y en vertical
      lo ancla arriba (ver fitHeroFrame).

      Ambos salen de la misma cuenta que la distancia que fija el efecto de
      arriba. No se usa viewport de R3F: se mide contra la posición de la
      cámara en el momento del redimensionado, antes de que el efecto la mueva,
      y quedaría desfasado.
    */
    <group position-x={frame.offsetX} position-y={frame.offsetY}>
      {/*
        Luz direccional: define el contorno del envase y además es la que
        proyecta la sombra, de modo que dirección de luz y dirección de sombra
        cuentan lo mismo.

        El encuadre de su cámara de sombra se ciñe al volumen del envase: con el
        recuadro por defecto, de 10 unidades, el mapa de sombra dedicaría cuatro
        píxeles al objeto y la sombra saldría dentada.

        Por eso la luz y su objetivo van dentro de este grupo y no en la raíz de
        la escena. Ese encuadre se centra en la línea que une luz y objetivo; con
        la luz en la raíz apuntaba al origen del mundo, mientras el envase se
        desplaza a la derecha en proporción al ancho visible. En ventanas
        anchas (medido: 2560×1080) el costado derecho del envase quedaba fuera
        del recuadro y su sombra se cortaba. Moviendo luz y
        objetivo con el grupo, la dirección de la luz es la misma y el recuadro
        queda siempre centrado en el envase.
      */}
      <primitive object={shadowTarget} />
      <directionalLight
        castShadow
        target={shadowTarget}
        position={SHADOW_LIGHT_POSITION}
        intensity={2.5}
        shadow-mapSize={[512, 512]}
        shadow-radius={10}
        shadow-normalBias={0.004}
        shadow-camera-near={0.01}
        shadow-camera-far={1.2}
        shadow-camera-left={-0.09}
        shadow-camera-right={0.09}
        shadow-camera-top={0.09}
        shadow-camera-bottom={-0.09}
      />

      {/*
        Plano receptor: va fuera del grupo que gira, porque es una superficie
        del mundo y no algo pegado al envase. ShadowMaterial solo pinta la
        sombra; el resto del plano es transparente y el verde de la tarjeta pasa
        entero.
      */}
      <mesh position={[0, 0, SHADOW_PLANE_Z]} receiveShadow>
        <planeGeometry args={[SHADOW_PLANE_SIZE, SHADOW_PLANE_SIZE]} />
        <shadowMaterial transparent opacity={SHADOW_OPACITY} />
      </mesh>

      {/* Modulación por puntero: parte de cero y se suma a la postura de reposo. */}
      <group ref={pointerGroup}>
        {/* Postura de reposo. */}
        <group rotation={[BASE_TILT_X, 0, BASE_TILT_Z]}>
          {/*
            Recentrado del pivote. El origen del modelo está en la BASE del
            envase: rotar la malla directamente pivotaría desde ahí y mandaría
            la boca fuera del encuadre. Bajando la malla media altura dentro de
            este grupo, todos los grupos de arriba giran alrededor del centro
            geométrico del envase. La malla nunca se rota ni se escala.
          */}
          <group position={[0, -MODEL_HEIGHT / 2, 0]}>
            <EspecieroModel />
          </group>
        </group>
      </group>
    </group>
  );
}

/**
 * Escena 3D del envase especiero, capa de fondo del hero.
 *
 * Es decorativa: quien la monta la marca con aria-hidden. El canvas no es
 * enfocable por teclado y no anuncia nada a lectores de pantalla.
 */
export default function EspecieroScene({
  motionEnabled,
  eventSource,
  contentEdgePx,
  backdropVideo,
  backdropPoster,
}: CanvasProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      shadows="percentage"
      /*
        El canvas no escucha eventos (su contenedor va con pointer-events: none
        para no interponerse con el CTA ni con lo que siga debajo en la página).
        Quien los escucha es esta capa, que cubre exactamente la tarjeta.
      */
      eventSource={eventSource}
      /*
        Sin movimiento no hay nada que redibujar: en reposo el canvas renderiza
        bajo demanda en vez de quemar 60 fps sobre una imagen fija.
      */
      frameloop={motionEnabled ? "always" : "demand"}
      /*
        R3F pone touch-action: none en el canvas para gestionar gestos. Aquí no
        hay interacción táctil que capturar y el canvas ocupa todo el hero, así
        que se restituye para no bloquear el scroll de la página.
      */
      style={{ touchAction: "auto" }}
      camera={{
        /*
          Posición inicial provisional: EspecieroRig la sustituye antes del
          primer frame con la distancia que corresponde a la tarjeta.
        */
        position: [
          0,
          0,
          fitHeroFrame(1440, 900, 720)?.cameraDistance ?? 1,
        ],
        /*
          rotation explícita: R3F apunta la cámara a (0, 0, 0) cuando no se le
          da una. Hoy coincide, porque el pivote del envase está en el origen,
          pero dejarlo escrito evita que la cámara se reapunte sola y en
          silencio si alguien mueve el grupo más adelante.
        */
        rotation: [0, 0, 0],
        fov: CAMERA_FOV,
        near: 0.01,
        far: 10,
      }}
    >
      {/*
        Entorno de estudio construido a mano con Lightformer, sin la prop
        `preset`: los presets de drei descargan un HDR desde un CDN externo en
        tiempo de ejecución, y el hero no debe depender de la red de un tercero
        para renderizar. Estos paneles se rasterizan localmente a un cubemap.

        Las posiciones de los Lightformer son relativas a la cámara interna del
        Environment, que vive en su propia escena en el origen. No están a la
        escala del envase (0.1173 m) y no deben ajustarse a ella.

        resolution 256: los reflejos del PET son difusos, no hace falta más.
      */}
      <Environment resolution={256}>
        {/*
          Tira principal: panel estrecho y alto, delante y a la derecha. En un
          cuerpo cilíndrico una tira se refleja como una banda larga de brillo;
          un panel ancho, en cambio, reparte la luz por igual y el envase se lee
          plano. Es lo que da la banda clara del costado derecho.
        */}
        <Lightformer
          form="rect"
          intensity={6}
          position={[1.6, 1.2, 2.4]}
          scale={[0.5, 5, 1]}
        />
        {/*
          Segunda tira, delante y a la izquierda, más tenue. La diferencia de
          intensidad entre las dos es lo que separa el lado claro del oscuro a
          lo largo del cuerpo.
        */}
        <Lightformer
          form="rect"
          intensity={4}
          position={[-2.2, 0.8, 1.6]}
          scale={[0.4, 4.5, 1]}
        />
        {/*
          Contraluz de canto: tira muy estrecha detrás y a la izquierda. Al
          reflejarse en rasante dibuja una línea brillante en la silueta y hace
          que el hombro, la rosca y el anillo de la base se separen del cuerpo.
        */}
        <Lightformer
          form="rect"
          intensity={12}
          position={[-1.9, 0.8, -1.2]}
          scale={[0.15, 4.5, 1]}
        />
        {/*
          Segundo contraluz, detrás y a la derecha: cierra la silueta por el
          lado opuesto para que el canto se dibuje entero y no solo medio.
        */}
        <Lightformer
          form="rect"
          intensity={9}
          position={[2.1, 0.5, -1.4]}
          scale={[0.15, 4, 1]}
        />
        {/*
          Relleno cenital, muy bajo: solo evita que las zonas sin tira caigan a
          negro. Si sube, vuelve a aplanar todo lo anterior.
        */}
        <Lightformer
          form="rect"
          intensity={0.6}
          position={[0, 3, 2]}
          scale={[5, 3, 1]}
        />
      </Environment>

      {/*
        Ambiental retirada: el Environment ya aporta la base de luz y sumarle una
        ambiental solo lavaba el contraste interno del vidrio. La direccional
        vive dentro de EspecieroRig, junto al envase (ver allí por qué).
      */}

      {/*
        Fondo de la tarjeta dentro de la escena, fuera del Suspense: no depende
        de que cargue el GLB, y así el envase nunca llega a refractar la textura
        vacía.
      */}
      <HeroBackdrop video={backdropVideo} poster={backdropPoster} />

      <Suspense fallback={null}>
        <EspecieroRig
          motionEnabled={motionEnabled}
          contentEdgePx={contentEdgePx}
        />
      </Suspense>
    </Canvas>
  );
}
