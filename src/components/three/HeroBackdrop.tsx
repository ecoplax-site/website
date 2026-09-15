"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  LinearFilter,
  SRGBColorSpace,
  Texture,
  Vector2,
  VideoTexture,
  type Mesh,
  type PlaneGeometry,
  type ShaderMaterial,
} from "three";

/*
  Fondo del hero dentro de la escena WebGL.

  POR QUÉ EXISTE. La transmisión de three no ve el DOM: antes de pintar el
  envase renderiza los objetos opacos de la escena en una textura y el envase
  refracta esa textura. Sin nada opaco en la escena, la textura era un blanco
  plano y el envase no tenía qué desviar. Este plano pinta en la escena el mismo
  video —o la misma fotografía— que se ve en la tarjeta, y como es opaco entra
  en esa textura: el envase refracta el paisaje real.

  COINCIDENCIA CON LA PÁGINA. El canvas mide exactamente lo mismo que la
  tarjeta, y el video y la fotografía de la tarjeta la cubren con object-cover
  centrado. Aquí se reproduce el mismo recorte: la textura se escala para cubrir
  el canvas conservando la proporción y se centra. La fuente es el propio
  elemento de la página —el <video> que se está reproduciendo o el <img> que ya
  descargó next/image—, así que el fotograma y el bitmap son los mismos, sin
  segunda descarga.

  Como el plano cubre todo el canvas, el canvas deja de ser transparente desde
  que hay textura: lo que se ve en la tarjeta a partir de lg es este render, y
  el video del DOM queda debajo como fuente. No hay borde entre dentro y fuera
  del canvas porque el canvas ocupa la tarjeta entera. Hasta que la textura está
  lista el plano no se pinta y se sigue viendo el DOM.

  COLOR. El fondo se lee en lineal —que es lo que espera la transmisión— y
  colorspace_fragment lo vuelve a codificar a sRGB al pintar en pantalla. Sin
  tone mapping: tiene que salir con los mismos valores que el video del DOM, no
  con la curva ACES del envase.

  Cómo llega a lineal depende de la fuente, y no es igual para las dos:

    - Fotografía: three la sube con formato sRGB (SRGB8_ALPHA8) y es la GPU la
      que la decodifica al leerla.
    - Video: three la sube SIEMPRE en formato lineal (RGBA8), aunque se declare
      sRGB, y deja la decodificación al shader. Sus materiales lo hacen solos;
      un ShaderMaterial propio no. Si no se decodifica aquí, el valor sRGB se
      toma por lineal y colorspace_fragment lo codifica una segunda vez: el
      video sale lavado y desaturado. Por eso decodeSRGB se activa solo con
      video.

  FOTOGRAFÍA COMO IMAGEBITMAP. No se sube el <img> directamente: three reserva
  la textura con image.width × image.height, y en un <img> esas propiedades dan
  el tamaño con que se pinta en la página —el de la tarjeta—, no el del archivo.
  Al subir la imagen real desbordaba la reserva, WebGL rechazaba la subida y el
  fondo salía negro. Un ImageBitmap mide lo que mide el archivo. Se crea ya
  volteado en vertical porque WebGL no aplica flipY a los ImageBitmap.

  PROFUNDIDAD. Se pinta primero (renderOrder -1), sin test ni escritura de
  profundidad: queda detrás de todo sin ocupar el depth buffer, y la sombra y el
  envase se dibujan encima con normalidad.
*/

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D map;
  uniform vec2 uvScale;
  uniform vec2 uvOffset;
  uniform bool decodeSRGB;
  varying vec2 vUv;

  void main() {
    vec4 texel = texture2D(map, vUv * uvScale + uvOffset);
    if (decodeSRGB) texel = sRGBTransferEOTF(texel);
    gl_FragColor = vec4(texel.rgb, 1.0);
    #include <colorspace_fragment>
  }
`;

function subscribeToLoad(image: HTMLImageElement | null) {
  return (onStoreChange: () => void) => {
    image?.addEventListener("load", onStoreChange);
    return () => image?.removeEventListener("load", onStoreChange);
  };
}

/** Si la fotografía póster ya está descargada y decodificable. */
function useImageReady(image: HTMLImageElement | null) {
  const subscribe = useMemo(() => subscribeToLoad(image), [image]);
  return useSyncExternalStore(
    subscribe,
    () => Boolean(image?.complete && image.naturalWidth > 0),
    () => false,
  );
}

type HeroBackdropProps = {
  /** Video de la tarjeta, solo mientras se está reproduciendo. */
  video: HTMLVideoElement | null;
  /** Fotografía póster de la tarjeta. */
  poster: HTMLImageElement | null;
};

export default function HeroBackdrop({ video, poster }: HeroBackdropProps) {
  const invalidate = useThree((state) => state.invalidate);
  const posterReady = useImageReady(poster);

  /*
    Con video reproduciéndose, el video. Si no —antes de que arranque, o con
    prefers-reduced-motion, donde no se monta—, la fotografía: es lo mismo que
    muestra la tarjeta en cada caso.
  */
  const [posterBitmap, setPosterBitmap] = useState<ImageBitmap | null>(null);

  useEffect(() => {
    if (!poster || !posterReady) return;

    let cancelled = false;
    let bitmap: ImageBitmap | null = null;
    createImageBitmap(poster, { imageOrientation: "flipY" }).then((result) => {
      if (cancelled) {
        result.close();
        return;
      }
      bitmap = result;
      setPosterBitmap(result);
    });

    return () => {
      cancelled = true;
      bitmap?.close();
      setPosterBitmap(null);
    };
  }, [poster, posterReady]);

  const source = video ?? posterBitmap;

  const texture = useMemo(() => {
    if (!source) return null;

    const map =
      source instanceof HTMLVideoElement
        ? new VideoTexture(source)
        : new Texture(source);
    // El ImageBitmap ya viene volteado; WebGL no aplica flipY a los bitmaps.
    map.flipY = source instanceof HTMLVideoElement;
    map.colorSpace = SRGBColorSpace;
    map.minFilter = LinearFilter;
    map.magFilter = LinearFilter;
    map.generateMipmaps = false;
    map.needsUpdate = true;
    return map;
  }, [source]);

  /*
    Uniforms creados una vez. Se actualizan en useFrame a través de la malla,
    no del objeto de este hook: el material lo crea y lo libera R3F.
  */
  const uniforms = useMemo(
    () => ({
      map: { value: null as Texture | null },
      decodeSRGB: { value: false },
      uvScale: { value: new Vector2(1, 1) },
      uvOffset: { value: new Vector2(0, 0) },
    }),
    [],
  );
  const meshRef = useRef<Mesh<PlaneGeometry, ShaderMaterial>>(null);

  useEffect(() => () => texture?.dispose(), [texture]);

  // Un frame nuevo al cambiar de fuente, también en modo "demand".
  useEffect(() => {
    invalidate();
  }, [texture, invalidate]);

  /*
    En modo "demand" —táctil o sin movimiento del envase— nada pediría frames
    mientras el video avanza, y el fondo del canvas se congelaría sobre el video
    del DOM, que queda tapado. Se pide un frame por cada fotograma de video. En
    modo "always" es redundante y no cuesta nada.
  */
  useEffect(() => {
    if (!(source instanceof HTMLVideoElement)) return;
    if (!("requestVideoFrameCallback" in source)) return;

    let id = 0;
    const onFrame = () => {
      invalidate();
      id = source.requestVideoFrameCallback(onFrame);
    };
    id = source.requestVideoFrameCallback(onFrame);
    return () => source.cancelVideoFrameCallback(id);
  }, [source, invalidate]);

  /*
    Recorte object-cover centrado, recalculado en cada frame: depende del tamaño
    del canvas y de las dimensiones de la fuente, y la cuenta es trivial.
  */
  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh || !texture || !source) return;

    const isVideo = source instanceof HTMLVideoElement;
    const mediaWidth = isVideo ? source.videoWidth : source.width;
    const mediaHeight = isVideo ? source.videoHeight : source.height;
    if (!mediaWidth || !mediaHeight) return;

    const canvasAspect = state.size.width / state.size.height;
    const mediaAspect = mediaWidth / mediaHeight;
    const { uniforms: current } = mesh.material;

    current.map.value = texture;
    current.decodeSRGB.value = isVideo;
    if (canvasAspect > mediaAspect) {
      // Canvas más apaisado: la fuente llena el ancho y se recorta en alto.
      const visible = mediaAspect / canvasAspect;
      current.uvScale.value.set(1, visible);
      current.uvOffset.value.set(0, (1 - visible) / 2);
    } else {
      // Canvas más alto: la fuente llena el alto y se recorta en ancho.
      const visible = canvasAspect / mediaAspect;
      current.uvScale.value.set(visible, 1);
      current.uvOffset.value.set((1 - visible) / 2, 0);
    }
  });

  if (!texture) return null;

  return (
    <mesh ref={meshRef} frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
