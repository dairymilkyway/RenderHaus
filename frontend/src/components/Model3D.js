import React, { useRef, useState, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Inner component that uses useGLTF hook properly
const ModelMesh = ({ url, position, scale }) => {
  const meshRef = useRef();
  
  // useGLTF must be called unconditionally at the top level
  const { scene } = useGLTF(url);
  
  // Clone the scene to avoid conflicts if the same model is used multiple times
  const clonedScene = scene.clone();
  
  // Ensure materials are properly set up
  clonedScene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      
      // Fix material if needed
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(material => {
            material.needsUpdate = true;
          });
        } else {
          child.material.needsUpdate = true;
        }
      }
    }
  });

  return (
    <primitive
      ref={meshRef}
      object={clonedScene}
      position={position}
      scale={scale}
    />
  );
};

// Error fallback component
const ErrorFallback = ({ position }) => (
  <mesh position={position}>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#ff6b6b" />
  </mesh>
);

// Loading fallback component
const LoadingFallback = ({ position }) => (
  <mesh position={position}>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#74c0fc" />
  </mesh>
);

// Main component that handles loading states and errors
const Model3D = ({ url, position = [0, 0, 0], scale = [1, 1, 1] }) => {
  const [error, setError] = useState(false);
  
  if (!url) {
    console.warn('No URL provided for 3D model');
    return <ErrorFallback position={position} />;
  }
  
  console.log('Loading 3D model from:', url);
  
  return (
    <Suspense fallback={<LoadingFallback position={position} />}>
      <ModelMesh 
        url={url} 
        position={position} 
        scale={scale}
        onError={() => setError(true)}
      />
    </Suspense>
  );
};

export default Model3D;
