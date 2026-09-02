"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { MathUtils, type Group } from "three";
import EspecieroModel from "./EspecieroModel";
import { POINTER_AREA_RATIO } from "./heroSceneLayout";

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

  fov cerrado y cámara cerca sobre su propio eje, en vez de escalar la malla:
  escalar alteraría cómo el material interpreta `thickness` y cambiaría el
  aspecto del PET, que se calibra aparte. El fov se mantiene en 22° para que la
  perspectiva siga plana y el envase se lea como objeto de producto.

  A 0.442 m el envase ocupa ~88% del alto de la tarjeta del hero. La cuenta:
  su alto proyectado es 0.121 unidades de mundo, la altura visible a distancia d
  es 2·d·tan(11°), y el canvas mide 1.25 veces la tarjeta (ver heroSceneLayout).
*/
const CAMERA_DISTANCE = 0.442;
const CAMERA_FOV = 22;

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
  Dirección de la luz que proyecta. Arriba, a la izquierda y al frente: la
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

type CanvasProps = EspecieroSceneProps & {
  /*
    Elemento que escucha el puntero. No es el canvas: el canvas sobresale por
    debajo de la tarjeta y ahí no debe capturar nada, así que va entero con
    pointer-events: none y quien escucha es una capa que cubre solo la tarjeta.
  */
  eventSource: HTMLElement;
};

function EspecieroRig({ motionEnabled }: EspecieroSceneProps) {
  const pointerGroup = useRef<Group>(null);
  const { viewport } = useThree();

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

    /*
      El área que escucha el puntero es la tarjeta, más corta que el canvas: el
      sangrado inferior no recibe eventos. R3F normaliza contra el alto del
      canvas, así que sin corregir, pointer.y solo llegaría hasta -0.6 y el
      punto neutro caería por debajo del centro de la tarjeta. Este remapeo
      devuelve el rango completo -1..1 sobre el área que sí escucha.
    */
    const pointerY = MathUtils.clamp(
      1 - (1 - state.pointer.y) / POINTER_AREA_RATIO,
      -1,
      1,
    );

    const targetX = -pointerY * POINTER_AMPLITUDE;
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

  return (
    /*
      Colocación en la mitad derecha del hero. El canvas cubre la tarjeta
      completa (hace falta para que el puntero se lea en todo el hero), así que
      el desplazamiento se hace aquí, en unidades de mundo: un cuarto del ancho
      visible a la derecha del centro es el centro de la mitad derecha.
      viewport.width se recalcula solo al redimensionar, así que la colocación
      se mantiene en cualquier proporción de pantalla.
    */
    <group position-x={viewport.width * 0.25}>
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
        position: [0, 0, CAMERA_DISTANCE],
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
        define el contorno del envase y además es la que proyecta la sombra, de
        modo que dirección de luz y dirección de sombra cuentan lo mismo.

        El encuadre de su cámara de sombra se ciñe al volumen del envase: con el
        recuadro por defecto, de 10 unidades, el mapa de sombra dedicaría cuatro
        píxeles al objeto y la sombra saldría dentada.
      */}
      <directionalLight
        castShadow
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

      <Suspense fallback={null}>
        <EspecieroRig motionEnabled={motionEnabled} />
      </Suspense>
    </Canvas>
  );
}
