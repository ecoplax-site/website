import { BufferAttribute, Vector3, type BufferGeometry } from "three";

/**
 * Recalcula las normales de una geometría suavizándolas entre caras vecinas,
 * salvo donde el ángulo entre ellas supere `creaseAngle`: ahí el canto se
 * mantiene duro.
 *
 * Por qué no se usa `toCreasedNormals` de three/addons, que hace justo esto:
 * cuantiza las posiciones multiplicándolas por 100 antes de agrupar los
 * vértices coincidentes, es decir, trabaja sobre una rejilla de 0.01 unidades.
 * Este modelo está en METROS y mide 0.0435 m de ancho, así que el envase
 * entero cabría en unas pocas celdas de esa rejilla y acabaría promediando
 * normales de partes que no se tocan. Aquí la clave de agrupación es la
 * posición exacta, así que la escala del modelo da igual.
 *
 * Devuelve una geometría nueva sin índice: no toca la original, que en el caso
 * de useGLTF está compartida con la copia en caché del modelo.
 */
export function withCreasedNormals(
  geometry: BufferGeometry,
  creaseAngle: number,
): BufferGeometry {
  const result = geometry.index ? geometry.toNonIndexed() : geometry.clone();
  const position = result.attributes.position;
  const vertexCount = position.count;
  const faceCount = vertexCount / 3;
  const creaseDot = Math.cos(creaseAngle);

  const first = new Vector3();
  const second = new Vector3();
  const third = new Vector3();
  const edgeA = new Vector3();
  const edgeB = new Vector3();
  const faceNormal = new Vector3();
  const neighbourNormal = new Vector3();
  const accumulated = new Vector3();

  // Normal de cada cara. Al estar la geometría sin índice, los vértices van de
  // tres en tres y la cara de un vértice es siempre Math.floor(v / 3).
  const faceNormals = new Float32Array(faceCount * 3);
  for (let face = 0; face < faceCount; face++) {
    first.fromBufferAttribute(position, face * 3);
    second.fromBufferAttribute(position, face * 3 + 1);
    third.fromBufferAttribute(position, face * 3 + 2);
    edgeA.subVectors(second, first);
    edgeB.subVectors(third, first);
    faceNormal.crossVectors(edgeA, edgeB).normalize();
    faceNormal.toArray(faceNormals, face * 3);
  }

  // Caras que comparten cada posición. La clave es la posición literal: el GLB
  // trae los vértices partidos por cara, pero los duplicados conservan las
  // mismas coordenadas exactas, así que se reagrupan sin tolerancia.
  const positionKeys = new Array<string>(vertexCount);
  const facesByPosition = new Map<string, number[]>();
  for (let vertex = 0; vertex < vertexCount; vertex++) {
    const key = `${position.getX(vertex)},${position.getY(vertex)},${position.getZ(vertex)}`;
    positionKeys[vertex] = key;

    const face = Math.floor(vertex / 3);
    const faces = facesByPosition.get(key);
    if (faces) faces.push(face);
    else facesByPosition.set(key, [face]);
  }

  // Normal de cada vértice: media de las caras que tocan su posición y quedan
  // dentro del ángulo de canto respecto a la suya. Las que lo superan se
  // descartan, y así el canto sigue siendo canto en lugar de redondearse.
  const normals = new Float32Array(vertexCount * 3);
  for (let vertex = 0; vertex < vertexCount; vertex++) {
    const face = Math.floor(vertex / 3);
    faceNormal.fromArray(faceNormals, face * 3);
    accumulated.set(0, 0, 0);

    for (const neighbour of facesByPosition.get(positionKeys[vertex]) ?? []) {
      neighbourNormal.fromArray(faceNormals, neighbour * 3);
      if (neighbourNormal.dot(faceNormal) >= creaseDot) {
        accumulated.add(neighbourNormal);
      }
    }

    // Caras opuestas que se anulan al sumarse: se conserva la propia.
    if (accumulated.lengthSq() === 0) accumulated.copy(faceNormal);

    accumulated.normalize().toArray(normals, vertex * 3);
  }

  result.setAttribute("normal", new BufferAttribute(normals, 3));
  return result;
}
