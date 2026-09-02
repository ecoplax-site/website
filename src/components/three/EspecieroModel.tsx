"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { Mesh, MeshPhysicalMaterial } from "three";

const MODEL_URL = "/models/especiero.glb";

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
        object.material = petMaterial;
        // Proyecta sombra sobre el plano de fondo de la escena.
        object.castShadow = true;
      }
    });

    return clone;
  }, [scene]);

  return <primitive object={model} />;
}

useGLTF.preload(MODEL_URL);
