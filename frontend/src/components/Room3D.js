import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';

export function Room3D() {
  const room = useRef();
  
  // Gentle floating animation
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    room.current.rotation.y += 0.01; // Continuous spin
    room.current.rotation.x = Math.sin(t / 4) / 16; // Slight tilt animation
    room.current.position.y = Math.sin(t / 2) / 15; // Gentle float
  });

  return (
    <>
      <Float
        speed={1.5}
        rotationIntensity={0.2}
        floatIntensity={0.3}
      >
        <mesh ref={room} position={[0, 0, 0]} scale={1.2}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial 
            color="#3b82f6"
            transparent
            opacity={0.9}
            metalness={0.4}
            roughness={0.1}
          />
        </mesh>
      </Float>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
    </>
  );
} 