'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface WireHeadProps {
  emotion?: {
    arousal: number; // 0-1, energy level
    valence: number; // 0-1, positive/negative
  };
  isBreathing?: boolean;
  respectMotionPreference?: boolean;
  className?: string;
}

// Wireframe head component
function WireHeadMesh({ 
  emotion = { arousal: 0.5, valence: 0.5 }, 
  isBreathing = true,
  respectMotionPreference = false 
}: WireHeadProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Create wireframe geometry
  const { geometry, material } = useMemo(() => {
    // Create a sphere geometry for the head
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    
    // Create wireframe material
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x00ffff),
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });

    return { geometry: sphereGeometry, material: wireframeMaterial };
  }, []);

  // Animation loop
  useFrame((state) => {
    if (!meshRef.current || !groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // Breathing animation
    if (isBreathing && !respectMotionPreference) {
      const breathScale = 1 + Math.sin(time * 2) * 0.05;
      groupRef.current.scale.setScalar(breathScale);
    }

    // Emotion-based color and intensity
    const { arousal, valence } = emotion;
    
    // Color based on valence (hue)
    const hue = (valence * 120) / 360; // 0-120 degrees (red to green)
    const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
    
    // Intensity based on arousal
    const intensity = 0.3 + arousal * 0.7;
    material.color = color;
    material.opacity = intensity;

    // Subtle rotation
    if (!respectMotionPreference) {
      groupRef.current.rotation.y = time * 0.1;
    }

    // Pulsing effect based on arousal
    if (arousal > 0.7) {
      const pulse = 1 + Math.sin(time * 4) * 0.1;
      meshRef.current.scale.setScalar(pulse);
    } else {
      meshRef.current.scale.setScalar(1);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} geometry={geometry} material={material} />
      
      {/* Eyes */}
      <mesh position={[0.3, 0.2, 0.8]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={0x00ffff} />
      </mesh>
      <mesh position={[-0.3, 0.2, 0.8]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={0x00ffff} />
      </mesh>
      
      {/* Mouth */}
      <mesh position={[0, -0.3, 0.8]}>
        <torusGeometry args={[0.2, 0.05, 4, 8]} />
        <meshBasicMaterial color={0x00ffff} />
      </mesh>
    </group>
  );
}

// Main WireHead component
export default function WireHead({ 
  emotion = { arousal: 0.5, valence: 0.5 }, 
  isBreathing = true,
  respectMotionPreference = false,
  className = ''
}: WireHeadProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]} // Limit pixel ratio for performance
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.6} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        
        {/* Wireframe head */}
        <WireHeadMesh 
          emotion={emotion} 
          isBreathing={isBreathing}
          respectMotionPreference={respectMotionPreference}
        />
        
        {/* Optional orbit controls for debugging */}
        {process.env.NODE_ENV === 'development' && (
          <OrbitControls enableZoom={false} enablePan={false} />
        )}
        
        {/* Background grid */}
        <gridHelper args={[10, 10, 0x00ffff, 0x00ffff]} position={[0, -2, 0]} />
      </Canvas>
    </div>
  );
}

// Fallback component for when WebGL is not available
export function WireHeadFallback({ 
  emotion = { arousal: 0.5, valence: 0.5 },
  className = ''
}: WireHeadProps) {
  const { arousal, valence } = emotion;
  
  // Create color based on emotion
  const hue = (valence * 120) / 360;
  const saturation = 80;
  const lightness = 30 + arousal * 40;
  
  return (
    <div className={`w-full h-full flex items-center justify-center ${className}`}>
      <div className="relative">
        {/* Static wireframe representation */}
        <div 
          className="w-32 h-32 border-2 border-cyan-400 rounded-full relative"
          style={{
            borderColor: `hsl(${hue * 360}, ${saturation}%, ${lightness}%)`,
            opacity: 0.3 + arousal * 0.7,
          }}
        >
          {/* Eyes */}
          <div 
            className="absolute w-3 h-3 rounded-full top-8 left-8"
            style={{ backgroundColor: `hsl(${hue * 360}, ${saturation}%, ${lightness}%)` }}
          />
          <div 
            className="absolute w-3 h-3 rounded-full top-8 right-8"
            style={{ backgroundColor: `hsl(${hue * 360}, ${saturation}%, ${lightness}%)` }}
          />
          
          {/* Mouth */}
          <div 
            className="absolute w-8 h-1 rounded-full bottom-8 left-1/2 transform -translate-x-1/2"
            style={{ backgroundColor: `hsl(${hue * 360}, ${saturation}%, ${lightness}%)` }}
          />
        </div>
        
        {/* Breathing animation */}
        <div 
          className="absolute inset-0 border border-cyan-400 rounded-full animate-pulse"
          style={{
            borderColor: `hsl(${hue * 360}, ${saturation}%, ${lightness}%)`,
            opacity: 0.3,
          }}
        />
      </div>
    </div>
  );
}
