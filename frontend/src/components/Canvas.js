import React from 'react';
import { Canvas as ThreeCanvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import './css/Canvas.css';

const Platform = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#f0f0f0" />
    </mesh>
  );
};

const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <Platform />
      <OrbitControls />
    </>
  );
};

const Canvas = () => {
  return (
    <div className="design-canvas">
      <ThreeCanvas
        shadows
        camera={{ position: [5, 5, 5], fov: 75 }}
      >
        <Scene />
      </ThreeCanvas>
    </div>
  );
};

export default Canvas; 