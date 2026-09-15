"use client";

import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { DoubleSide, MathUtils, Mesh, MeshPhysicalMaterial } from "three";
import { withCreasedNormals } from "./creasedNormals";
import { applyPetWall } from "./petWall";

const MODEL_URL = "/models/especiero.glb";

/*
  Ángulo a partir del cual una arista se considera canto y no se suaviza.

  Sale de medir la malla, no de tantear: de sus 46.230 aristas interiores, el
  97% queda por debajo de 10° —las facetas del revolucionado, que es lo que hay
  que suavizar— y solo el 1,8% pasa de 30°, que son los cantos de diseño: la
  boca, el anillo de la base y las crestas de la rosca. Entre 10° y 30° apenas
  hay aristas, así que el umbral cae en un hueco de la distribución y no parte
  ningún grupo por la mitad.
*/
const CREASE_ANGLE = MathUtils.degToRad(30);

/**
 * Envase especiero en 3D.
 *
 * El modelo viene en unidades reales (metros): 0.0435 × 0.0435 × 0.1173 m,
 * con el origen en la base. No se reescala aquí a propósito — el encuadre
 * se resuelve moviendo la cámara en EspecieroScene, para que las medidas del
 * archivo sigan correspondiendo con el envase físico.
 */
export default function EspecieroModel() {
  const { scene } = useGLTF(MODEL_URL);

  /*
    Material de PET transparente.

    Es meshPhysicalMaterial de three, no MeshTransmissionMaterial de drei: el de
    three es más barato porque reutiliza el buffer de transmisión del propio
    renderer en vez de montar un render target extra por material.

    Sin un entorno que refractar, un material con transmission se ve negro o
    vacío. Los reflejos los aporta el <Environment> de EspecieroScene.

    Se clona la escena para no mutar la que useGLTF cachea entre montajes, y se
    aplica un único material a todas las mallas.

    NORMALES

    El GLB sale de Blender con sombreado plano: 60.300 vértices para 15.412
    posiciones únicas (3,91 duplicados por posición) y el 100% de esas
    posiciones con normales divergentes, hasta 90° entre sí. Sobre una
    superficie curva eso rompe el reflejo en bloques de borde duro que siguen
    las caras del polígono — que es exactamente el artefacto que se veía en el
    cuello y en el cuerpo.

    No basta con computeVertexNormals(): la geometría está indexada, pero con
    los vértices ya partidos por cara, así que promediar por índice no cruza
    ninguna cara y devuelve las mismas normales facetadas. Hay que reagrupar
    por posición, que es lo que hace withCreasedNormals.

    Se corrige por código y no en el archivo: el GLB queda intacto.
  */
  const model = useMemo(() => {
    const clone = scene.clone(true);
    const petMaterial = new MeshPhysicalMaterial({
      /*
        Transmisión total, sin tinte: PET transparente.

        El envase refracta el fondo real de la tarjeta —video o fotografía—, que
        HeroBackdrop pinta dentro de la escena. Con eso la transmisión ya tiene
        qué desviar y no hace falta mezclar difuso para darle cuerpo: la forma la
        dan la distorsión del paisaje a través del volumen, el Fresnel de los
        cantos y los reflejos de las tiras del <Environment>.
      */
      transmission: 1,
      ior: 1.575, // índice de refracción real del PET
      /*
        Espesor óptico, no espesor de pared (la pared real mide 1 mm).

        En la transmisión de three, thickness es la distancia que recorre el
        rayo refractado antes de volver a muestrear el fondo: cuanto mayor, más
        se desplaza el paisaje visto a través del envase. Con 0.02 el paisaje se
        torcía tanto que el envase se leía como vidrio grueso. Con 0.005 —una
        cuarta parte— el desplazamiento baja en la misma proporción y el fondo
        se ve casi recto, con una desviación ligera, como PET de pared fina.
      */
      thickness: 0.005,
      /*
        Sin attenuationColor ni attenuationDistance: el tinte verde (#234b2c a
        0.08) se retiró para que el envase se lea blancuzco y neutro. Sin ellos,
        three no aplica atenuación de volumen y la luz transmitida no cambia de
        color.
      */
      roughness: 0.08,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      metalness: 0,
      transparent: true,
      /*
        Doble cara: la pared trasera se ve a través del cuerpo.

        Con una sola cara, a través del envase solo llegaba el paisaje: nada
        del propio frasco. Con DoubleSide three hace dos cosas:

          - En la textura que refracta el envase pinta también las caras
            traseras, así que la cara delantera refracta el paisaje CON la
            pared de atrás delante, con sus reflejos y sus nervaduras.
          - En el render final dibuja primero las caras traseras y luego las
            delanteras, en dos pasadas.

        La malla es una sola superficie sin grosor (a media altura del cuerpo
        todos sus vértices están a 19.5 mm del eje): la "pared trasera" es la
        mitad posterior de esa misma superficie, vista desde dentro.
      */
      side: DoubleSide,
      /*
        Sin tone mapping. El fondo de la escena (HeroBackdrop) sale sin tone
        mapping para coincidir con el video de la página; si el envase lo
        llevara, lo que se ve a través de él pasaría por la curva ACES y saldría
        más oscuro que el paisaje de alrededor, sobre todo en las sombras, que
        ACES aplasta. Medido en 1440×900 con la foto póster: con ACES, un fondo
        de 28,32,24 salía a 10,13,8 a través del cuerpo; sin él, a 27,31,24.

        Afecta también a los reflejos, que ya no se comprimen: sus picos
        llegan a blanco en lugar de redondearse.
      */
      toneMapped: false,
    });
    // Grosor de pared y difusión del PET soplado (ver petWall.ts).
    applyPetWall(petMaterial);

    clone.traverse((object) => {
      if (object instanceof Mesh) {
        /*
          Geometría nueva: la del clon sigue siendo la misma instancia que
          cachea useGLTF, así que no se puede escribir sobre ella.
        */
        object.geometry = withCreasedNormals(object.geometry, CREASE_ANGLE);
        object.material = petMaterial;
        // Proyecta sombra sobre el plano de fondo de la escena.
        object.castShadow = true;
      }
    });

    return clone;
  }, [scene]);

  /*
    Liberación al desmontar. El material y las geometrías recalculadas se crean
    en cada montaje y no los gestiona R3F, que solo se ocupa de lo que crea él.
    Importa porque la escena se monta y desmonta al cruzar el umbral de 1024px
    (ver EspecieroSceneLoader): sin esto, cada cruce dejaría atrás la geometría
    anterior, que no es pequeña.
  */
  useEffect(() => {
    return () => {
      model.traverse((object) => {
        if (object instanceof Mesh) {
          object.geometry.dispose();
          if (object.material instanceof MeshPhysicalMaterial) {
            object.material.dispose();
          }
        }
      });
    };
  }, [model]);

  return <primitive object={model} />;
}

useGLTF.preload(MODEL_URL);
