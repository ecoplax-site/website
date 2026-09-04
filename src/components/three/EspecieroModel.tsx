"use client";

import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { MathUtils, Mesh, MeshPhysicalMaterial } from "three";
import { withCreasedNormals } from "./creasedNormals";

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
      transmission: 1,
      ior: 1.575, // índice de refracción real del PET
      /*
        Espesor óptico, no espesor de pared. La pared real mide 1 mm, pero
        `thickness` alimenta el recorrido de la luz dentro del volumen: con el
        valor literal el envase se leía como una cáscara sin grueso. Subido
        hasta que la boca y el anillo de la base acusan material.
      */
      thickness: 0.02,
      /*
        Densidad óptica. La luz que atraviesa el volumen se tiñe hacia este
        color a lo largo de attenuationDistance: es lo que separa "vidrio con
        cuerpo" de "cristal vacío". Se usa Pastel Gray de la paleta oficial
        para que el tinte caiga dentro de la marca en vez de inventar un verde.
      */
      attenuationColor: "#234b2c",
      attenuationDistance: 0.08,
      roughness: 0.08,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      metalness: 0,
      transparent: true,
    });

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
