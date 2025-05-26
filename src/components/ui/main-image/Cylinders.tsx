'use client'

import * as THREE from "three";
import { useFrame, type RootState } from "@react-three/fiber";
import { Canvas, useThree, extend, } from "@react-three/fiber";
import { useRef, useEffect, useState } from "react";
import { RefObject } from 'react';
import { Mesh, BufferGeometry, Material, NormalBufferAttributes } from 'three';
import { Reflector } from "three/examples/jsm/Addons.js";
import { gsap } from "gsap/gsap-core";
import { useGSAP } from "@gsap/react";
import { Text } from 'troika-three-text'
import { useWindowWidth } from "@/hooks/useWindowWidth";
import { Text as DreiText } from '@react-three/drei';

extend({ Text });

interface ICylinderParameters {
  radius: number,
  radialSegments: number,
  mirrorRadius: number,
  xPosition: number,
  yPosition: number
}

interface ITextParameters {
  mainTextSize: number,
  subtextSize: number,
  positionMainTextX: number,
  positionMainTextY: number,
  positionCarouselText: number,
  positionSubMainText: number,
  positionCarouselWrapperTextX: number,
  positionCarouselWrapperTextY: number,
  positionSubCarouselTextX: number,
  positionSubCarouselTextY: number,
  positionSubTextX: number,
  positionSubTextY: number,
  maxWidthSubtext: number,
  positionSubText: number,
  subTextMaxWidth: number
}

interface TroikaTextProps {
  text: string;
  fontSize?: number;
  fontWeight?: number | string;
  maxWidth?: number;
  anchorX?: "left" | "center" | "right";
  anchorY?: "top" | "middle" | "bottom";
  color?: string;
  fillOpacity?: number;
  position?: [number, number, number];
  refCallback?: (ref: Text | null) => void;
}

interface GroundMirror {
  cylinderRef: RefObject<Mesh<BufferGeometry<NormalBufferAttributes>, Material | Material[], THREE.Object3DEventMap> | null>,
  cylinderRadius: number
}

const TroikaText = ({ text,
  fontSize,
  fontWeight,
  maxWidth,
  anchorX,
  anchorY,
  color,
  fillOpacity,
  position,
  refCallback
}: TroikaTextProps) => {

  const textRef = useRef<Text>(null)
  useEffect(() => {
    if (textRef.current) {
      // textRef.current.text = text;
      // textRef.current.fontSize = fontSize;
      // textRef.current.fontWeight = fontWeight;
      // textRef.current.maxWidth = maxWidth;
      // textRef.current.anchorX = anchorX;
      // textRef.current.anchorY = anchorY;
      // textRef.current.color = color;
      // textRef.current.fillOpacity = fillOpacity
      // if (position) textRef.current.position.set(...position)
      textRef.current.sync()
      if (refCallback) refCallback(textRef.current)
      console.log(textRef.current)
    }
  }, [text, fontSize, fontWeight, maxWidth, anchorX, anchorY, color, fillOpacity, position, refCallback]);

  return (
    <mesh>
      {/* <Text ref={textRef} /> */}
      <DreiText
        fontSize={fontSize}
        fontWeight={fontWeight}
        maxWidth={maxWidth}
        anchorX={anchorX}
        anchorY={anchorY}
        color={color}
        fillOpacity={fillOpacity}
        position={position}
        ref={textRef}>
        {text}
      </DreiText>
    </mesh>
  )
};


function GroundMirror({ cylinderRef, cylinderRadius }: GroundMirror) {
  const { scene } = useThree();

  useEffect(() => {
    const geometry = new THREE.CircleGeometry(cylinderRadius, 100);
    const mirror = new Reflector(geometry, {
      clipBias: 0.003,
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
      color: new THREE.Color(0xb5b5b5),
    });

    mirror.rotation.x = Math.PI / 2;
    mirror.position.y = -0.11;

    scene.add(mirror);
    cylinderRef.current?.add(mirror);

    return () => {
      scene.remove(mirror);
      cylinderRef.current?.remove(mirror);

      geometry.dispose();
      if (Array.isArray(mirror.material)) {
        mirror.material.forEach(mat => mat.dispose());
      } else {
        mirror.material.dispose();
      }
    }

  }, [scene, cylinderRef, cylinderRadius]);

  return null;
}

function CylinderAnimation() {

  useEffect(() => {
    const originalWarn = console.warn;
    console.warn = (...args: any[]) => {
      if (typeof args[0] === 'string' && !args[0].includes('THREE.Color: Alpha component')) {
        originalWarn.apply(console, args);
      }
    };

    return () => {
      console.warn = originalWarn;
    };
  }, []);

  const cylinderRefs = [
    useRef<Mesh>(null),
    useRef<Mesh>(null),
    useRef<Mesh>(null)
  ];


  useFrame(({ clock }: RootState) => {
    const time = clock.getElapsedTime();

    cylinderRefs.forEach((cylinder) => {
      if (cylinder.current) {
        const positionValue = Math.sin(time) * .2;
        const rotationValue = Math.sin(time) * .1;
        cylinder.current.position.x = positionValue;
        cylinder.current.rotation.x = rotationValue;
      }
    })
  })

  const textRefs = useRef<Text[]>([]);
  const [isReady, setIsReady] = useState(false);

  const addToRefs = (el: Text | null) => {
    if (el && !textRefs.current.includes(el)) {
      textRefs.current.push(el);
      setIsReady(true);
    }
  }

  useGSAP(() => {
    if (!isReady || textRefs.current.length === 0) return

    const tl = gsap.timeline({ repeat: -1, smoothChildTiming: true });

    const ELEMENT_DURATION = 3.67;
    const FADE_IN_DURATION = 0.3;
    const FADE_OUT_DURATION = 0.09;
    const STAGGER_DELAY = 3;

    textRefs.current.forEach((text, i) => {
      const startTime = i * STAGGER_DELAY;

      tl.to(text, {
        fillOpacity: 1,
        duration: FADE_IN_DURATION,
      }, startTime);

      tl.fromTo(
        text.position,
        { y: -1 },
        {
          keyframes: [
            { y: 0, duration: 1.5 },
            { y: 0, duration: 1 },
            { y: 0.5, duration: 1.5 }
          ],
        }, startTime);

      tl.fromTo(
        text.rotation,
        { x: 90 * (Math.PI / 180) },
        {
          keyframes: [
            { x: 0, duration: 1.5 },
            { x: 0, duration: 1 },
            { x: -90 * (Math.PI / 180), duration: 1.5 }
          ]
        }, startTime);

      tl.fromTo(
        text,
        {},
        {
          keyframes: [
            { color: 'rgb(0, 174, 255)', duration: 1 },
            { color: 'rgb(251, 85, 243)', duration: 1 },
            { color: 'rgb(8, 0, 255)', duration: 1.5 }
          ]
        }, startTime);
      tl.to(text, {
        fillOpacity: 0,
        duration: .1,
        ease: "power2.inOut"
      }, startTime + ELEMENT_DURATION - FADE_OUT_DURATION);
    });

    const totalDuration = (textRefs.current.length - 1) * STAGGER_DELAY + ELEMENT_DURATION
    tl.totalDuration(totalDuration);
  }, [isReady]);

  const screenWidth = useWindowWidth()

  const [firstCylinderParameters, setFirstCylinderParameters] = useState<ICylinderParameters>({
    radius: 1.8,
    radialSegments: 100,
    mirrorRadius: 1.75,
    xPosition: -3,
    yPosition: -1
  })

  const [secondCylinderParameters, setSecondCylinderParameters] = useState<ICylinderParameters>({
    radius: 1.4,
    radialSegments: 32,
    mirrorRadius: 1.35,
    xPosition: -3.6,
    yPosition: .7
  })

  const [thirdCylinderParameters, setThirdCylinderParameters] = useState<ICylinderParameters>({
    radius: 1.4,
    radialSegments: 100,
    mirrorRadius: 1.35,
    xPosition: 6,
    yPosition: .2
  })

  const [textParameters, setTextParameters] = useState<ITextParameters>({
    mainTextSize: 1,
    subtextSize: 0.17,
    positionMainTextX: -9.5,
    positionMainTextY: 0.4,
    positionCarouselText: -4.5,
    positionCarouselWrapperTextX: 0,
    positionCarouselWrapperTextY: 0.4,
    positionSubCarouselTextX: -6.2,
    positionSubCarouselTextY: -1,
    positionSubMainText: -6.5,
    positionSubTextX: 0.5,
    positionSubTextY: -0.5,
    maxWidthSubtext: 6,
    positionSubText: 0.4,
    subTextMaxWidth: 6
  })

  useEffect(() => {
    if (screenWidth === null) return;

    if (screenWidth >= 1024 && screenWidth <= 1280) {
      setFirstCylinderParameters(prev => ({
        ...prev,
        radius: 1.5,
        radialSegments: 100,
        mirrorRadius: 1.45
      }))
      setSecondCylinderParameters(prev => ({
        ...prev,
        radius: 1.1,
        radialSegments: 32,
        mirrorRadius: 1.05
      }))
      setThirdCylinderParameters(prev => ({
        ...prev,
        radius: 1.1,
        radialSegments: 100,
        mirrorRadius: 1.05,
        xPosition: 5,
      }))
      setTextParameters(prev => ({
        ...prev,
        mainTextSize: 0.8,
        subtextSize: 0.15,
        positionCarouselText: -5.4,
        positionSubMainText: -6.5,
        positionSubCarouselTextX: -7
      }))

      if (textRefs.current.length > 0) {
        textRefs.current.forEach(item => {
          item.position.x = -5
        })
      }
    } else if (screenWidth >= 768 && screenWidth <= 1024) {
      setFirstCylinderParameters(prev => ({
        ...prev,
        radius: 1,
        radialSegments: 100,
        mirrorRadius: 0.95
      }))
      setSecondCylinderParameters(prev => ({
        ...prev,
        radius: 1.1,
        radialSegments: 32,
        mirrorRadius: 1.05
      }))
      setThirdCylinderParameters(prev => ({
        ...prev,
        radius: 1,
        radialSegments: 100,
        mirrorRadius: 0.95,
        xPosition: 4,
      }))
      setTextParameters(prev => ({
        ...prev,
        mainTextSize: 0.7,
        subtextSize: 0.15,
        positionCarouselText: -5.5,
        positionSubMainText: -7,
        subTextMaxWidth: 5,
        positionSubTextX: 0.1,
      }))
    }
    else if (screenWidth >= 640 && screenWidth <= 768) {
      setTextParameters(prev => ({
        ...prev,
        maxWidthSubtext: 5,
        positionSubText: 0.05
      }))
    }
    else if (screenWidth < 640) {
      setFirstCylinderParameters(prev => ({
        ...prev,
        radius: 1.2,
        mirrorRadius: 1.15,
        xPosition: -1.45,
        yPosition: -1.9
      }))
      setSecondCylinderParameters(prev => ({
        ...prev,
        xPosition: -1.5

      }))
      setThirdCylinderParameters(prev => ({
        ...prev,
        xPosition: 2.4,
      }))
      setTextParameters(prev => ({
        ...prev,
        mainTextSize: 0.5,
        positionMainTextX: -7,
        positionMainTextY: 1.3,
        positionCarouselWrapperTextX: -2.5,
        positionCarouselWrapperTextY: 0.3,
        positionSubCarouselTextY: -0.9,
        positionSubCarouselTextX: -7,
        positionSubTextX: 0.1,
        positionSubTextY: -0.9,
        subTextMaxWidth: 2.8
      }))
    }

  }, [screenWidth])

  return (
    <>
      <group position={[firstCylinderParameters.xPosition, firstCylinderParameters.yPosition, 0.5]}>
        <mesh ref={cylinderRefs[0]} rotation={[0, 10 * (Math.PI / 180), 140 * (Math.PI / 180)]}>
          <cylinderGeometry args={[firstCylinderParameters.radius,
          firstCylinderParameters.radius,
            .2,
          firstCylinderParameters.radialSegments]} />
          <meshPhysicalMaterial color="blue" metalness={.3} roughness={0.2} attach='material-0' />
          <meshPhysicalMaterial color="blue" metalness={.3} roughness={0.2} attach='material-2' />
        </mesh>
        <mesh >
          <GroundMirror cylinderRef={cylinderRefs[0]} cylinderRadius={firstCylinderParameters.mirrorRadius} />
        </mesh>
      </group>
      <group position={[secondCylinderParameters.xPosition, secondCylinderParameters.yPosition, -1.2]}>
        <mesh ref={cylinderRefs[1]} position={[0, 2, 0]} rotation={[0, -30 * (Math.PI / 180), 50 * (Math.PI / 180)]}>
          <cylinderGeometry args={[secondCylinderParameters.radius,
          secondCylinderParameters.radius,
            .2,
          secondCylinderParameters.radialSegments]} />
          <meshPhysicalMaterial color="blue" metalness={.3} roughness={0.2} attach='material-0' />
          <meshPhysicalMaterial color="blue" metalness={.3} roughness={0.2} attach='material-2' />
        </mesh>
        <mesh >
          <GroundMirror cylinderRef={cylinderRefs[1]} cylinderRadius={secondCylinderParameters.mirrorRadius} />
        </mesh>
      </group>
      <group position={[thirdCylinderParameters.xPosition, thirdCylinderParameters.yPosition, -.5]}>
        <mesh ref={cylinderRefs[2]} rotation={[0, 5 * (Math.PI / 180), -100 * (Math.PI / 180)]}>
          <cylinderGeometry args={[thirdCylinderParameters.radius,
          thirdCylinderParameters.radius,
            0.2,
          thirdCylinderParameters.radialSegments]} />
          <meshNormalMaterial attach='material-0' />
          <meshPhysicalMaterial color="#00bc10" metalness={.3} roughness={0.2} attach='material-2' />
        </mesh>
        <mesh >
          <GroundMirror cylinderRef={cylinderRefs[2]} cylinderRadius={thirdCylinderParameters.mirrorRadius} />
        </mesh>
      </group>
      <mesh position={[7, 1.5, -2]}>
        <TroikaText
          key={'power' + textParameters?.mainTextSize + '-' + textParameters?.positionCarouselText}
          text='Power'
          fontSize={textParameters.mainTextSize}
          fontWeight={400}
          maxWidth={10}
          anchorX='center'
          anchorY='middle'
          color='white'
          position={[textParameters.positionMainTextX, textParameters.positionMainTextY, 2]} />
        <mesh position={[textParameters.positionCarouselWrapperTextX, textParameters.positionCarouselWrapperTextY, 0]}>
          <TroikaText
            text='Enterprise AI'
            fontSize={textParameters.mainTextSize}
            fontWeight={400}
            maxWidth={10}
            anchorX='center'
            anchorY='middle'
            fillOpacity={0}
            refCallback={addToRefs}
            position={[textParameters.positionCarouselText, -0.5, 2]} />
          <TroikaText
            text='Productive AI'
            fontSize={textParameters.mainTextSize}
            fontWeight={400}
            maxWidth={10}
            anchorX='center'
            anchorY='middle'
            fillOpacity={0}
            refCallback={addToRefs}
            position={[textParameters.positionCarouselText, -0.5, 2]} />
          <TroikaText
            text='Generative AI'
            fontSize={textParameters.mainTextSize}
            fontWeight={400}
            maxWidth={10}
            anchorX='center'
            anchorY='middle'
            fillOpacity={0}
            refCallback={addToRefs}
            position={[textParameters.positionCarouselText, -0.5, 2]} />
        </mesh>
        <TroikaText
          key={'Data' + textParameters?.mainTextSize + '-' + textParameters?.positionCarouselText}
          text='With Your Data'
          fontSize={textParameters.mainTextSize}
          fontWeight={400}
          maxWidth={10}
          anchorX='center'
          anchorY='middle'
          position={[textParameters.positionSubCarouselTextX, textParameters.positionSubCarouselTextY, 2]} />
      </mesh>
      <group>
        <TroikaText
          text='Make the best models with the best data. Scale Data Engine powers nearly every major foundation model, and with Scale GenAI Platform, leverages your enterprise data to unlock the value of AI'
          fontSize={textParameters.subtextSize}
          fontWeight={600}
          maxWidth={textParameters.subTextMaxWidth}
          anchorX='center'
          anchorY='middle'
          color='white'
          position={[textParameters.positionSubTextX, textParameters.positionSubTextY, 1.6]} />
      </group>
    </>
  )
}


export default function Cylinders() {

  return (
    <>
      <div className="w-[100%]">
        <Canvas
          className="canvas max-[1536px]:!w-[1230px] 
                                  max-[1280px]:!w-[965px] 
                                  max-[1025px]:!w-[770px] 
                                  max-[768px]:!w-[100%]
                                  "
          camera={{ position: [0, 0, 5], fov: 75 }}
          style={{ width: "1400px", height: "600px" }}
          shadows
          gl={{ preserveDrawingBuffer: true }}>
          <ambientLight intensity={7} color='white' />

          <pointLight position={[-3, 5, 3]} intensity={1000} color='blue' />
          <pointLight position={[-5, 5, 3]} intensity={10} color='#00ff00' />

          <spotLight position={[3, -3, 1]} intensity={800} angle={0.7} penumbra={1} castShadow color='#f800cb' />
          <spotLight position={[-9, 8, 0]} intensity={5000} angle={0.2} penumbra={.5} castShadow color='#2600ff' />
          <CylinderAnimation />
        </Canvas>
      </div>
    </>
  );
}
