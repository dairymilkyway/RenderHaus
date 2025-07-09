import React, { useEffect } from 'react';
import { Canvas as ThreeCanvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import './css/Canvas.css';

// Create stable textures outside of component
const createStableTexture = (type) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512; // Increased resolution
  canvas.height = 512;
  const context = canvas.getContext('2d');
  const seed = type === 'grass' ? 12345 : 67890; // Fixed seeds for consistency

  // Pseudo-random number generator with seed
  const seededRandom = (seed) => {
    let value = seed;
    return () => {
      value = (value * 16807) % 2147483647;
      return (value - 1) / 2147483646;
    };
  };

  const random = seededRandom(seed);

  if (type === 'grass') {
    // Create stable grass pattern
    // Base gradient
    const gradient = context.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, '#4a8505');
    gradient.addColorStop(1, '#2d5c01');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);

    // Add stable noise pattern
    for (let y = 0; y < 512; y += 4) {
      for (let x = 0; x < 512; x += 4) {
        if (random() > 0.5) {
          context.fillStyle = random() > 0.5 ? '#5c9c0c' : '#3b6b03';
          context.fillRect(x, y, 4, 4);
        }
      }
    }
  } else {
    // Create stable dirt texture with less noise and more structure
    // Base color
    context.fillStyle = '#5c4033';
    context.fillRect(0, 0, 512, 512);

    // Add subtle vertical gradient for depth
    const gradient = context.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, 'rgba(92, 64, 51, 0.95)');  // Slightly lighter at top
    gradient.addColorStop(1, 'rgba(74, 51, 40, 0.95)');  // Slightly darker at bottom
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);

    // Add subtle structured pattern
    const patternSize = 16;
    for (let y = 0; y < 512; y += patternSize) {
      for (let x = 0; x < 512; x += patternSize) {
        if (random() > 0.3) {
          // Create larger, more subtle variations
          const alpha = random() * 0.15 + 0.05; // Very subtle opacity
          context.fillStyle = `rgba(${random() > 0.5 ? '107, 68, 35' : '74, 51, 40'}, ${alpha})`;
          context.fillRect(x, y, patternSize, patternSize);
        }
      }
    }

    // Add very subtle noise for texture
    context.globalAlpha = 0.1;
    for (let y = 0; y < 512; y += 4) {
      for (let x = 0; x < 512; x += 4) {
        if (random() > 0.7) {
          context.fillStyle = random() > 0.5 ? '#6b4423' : '#4a3328';
          context.fillRect(x, y, 4, 4);
        }
      }
    }
    context.globalAlpha = 1.0;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(type === 'grass' ? 6 : 2, type === 'grass' ? 6 : 1);
  return texture;
};

// Create textures once
const grassTexture = createStableTexture('grass');
const dirtTexture = createStableTexture('dirt');

const Platform = () => {
  const platformSize = 15;
  const platformHeight = 0.5;

  return (
    <group position={[0, 0, 0]}>
      {/* Top surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, platformHeight, 0]} receiveShadow castShadow>
        <planeGeometry args={[platformSize, platformSize]} />
        <meshStandardMaterial 
          map={grassTexture}
          roughness={0.8}
          metalness={0}
        />
      </mesh>

      {/* Side walls */}
      <group>
        {/* Front */}
        <mesh position={[0, platformHeight/2, platformSize/2]} castShadow>
          <boxGeometry args={[platformSize, platformHeight, 0.2]} />
          <meshStandardMaterial 
            map={dirtTexture} 
            roughness={0.9}
            metalness={0}
            transparent={true}
            opacity={0.99} // Helps blend the texture
          />
        </mesh>
        {/* Back */}
        <mesh position={[0, platformHeight/2, -platformSize/2]} castShadow>
          <boxGeometry args={[platformSize, platformHeight, 0.2]} />
          <meshStandardMaterial 
            map={dirtTexture} 
            roughness={0.9}
            metalness={0}
            transparent={true}
            opacity={0.99}
          />
        </mesh>
        {/* Left */}
        <mesh position={[-platformSize/2, platformHeight/2, 0]} rotation={[0, Math.PI/2, 0]} castShadow>
          <boxGeometry args={[platformSize, platformHeight, 0.2]} />
          <meshStandardMaterial 
            map={dirtTexture} 
            roughness={0.9}
            metalness={0}
            transparent={true}
            opacity={0.99}
          />
        </mesh>
        {/* Right */}
        <mesh position={[platformSize/2, platformHeight/2, 0]} rotation={[0, Math.PI/2, 0]} castShadow>
          <boxGeometry args={[platformSize, platformHeight, 0.2]} />
          <meshStandardMaterial 
            map={dirtTexture} 
            roughness={0.9}
            metalness={0}
            transparent={true}
            opacity={0.99}
          />
        </mesh>
      </group>
      
      {/* Grid helper */}
      <Grid
        position={[0, platformHeight + 0.01, 0]}
        args={[platformSize, platformSize]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#6b7280"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#475569"
        fadeDistance={20}
        fadeStrength={1}
        followCamera={false}
      />
    </group>
  );
};

const Scene = () => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(8, 8, 8);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[8, 8, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight
        position={[-5, 6, -8]}
        intensity={0.5}
        castShadow
      />
      <hemisphereLight
        skyColor="#b1e1ff"
        groundColor="#000000"
        intensity={0.5}
      />
      <Platform />
      <OrbitControls 
        maxPolarAngle={Math.PI / 2.1}
        minDistance={5}
        maxDistance={30}
      />
    </>
  );
};

const Canvas = () => {
  return (
    <div className="design-canvas">
      <ThreeCanvas
        shadows
        camera={{ position: [8, 8, 8], fov: 50 }}
        gl={{ antialias: true }}
      >
        <Scene />
      </ThreeCanvas>
    </div>
  );
};

export default Canvas; 