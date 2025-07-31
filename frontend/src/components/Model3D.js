import React, { useRef, useState, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Inner component that uses useGLTF hook properly
const ModelMesh = ({ url, position, scale, rotation, isSelected, color, selectedObject }) => {
  const meshRef = useRef();
  
  // useGLTF must be called unconditionally at the top level
  const { scene } = useGLTF(url);
  
  // Clone the scene to avoid conflicts if the same model is used multiple times
  const clonedScene = scene.clone();
  
  // Ensure materials are properly set up
  clonedScene.traverse((child) => {
    if (child.isMesh && child.material) {
      child.castShadow = true;
      child.receiveShadow = true;
      
      // Handle material properly to avoid uniform errors
      const handleMaterial = (material) => {
        if (material) {
          // Create a new material instance to avoid shared state issues
          const newMaterial = material.clone();
          
          // Apply color if provided
          if (color) {
            newMaterial.color = new THREE.Color(color);
          }
          
          // Safely set emissive property
          if (newMaterial.emissive !== undefined) {
            newMaterial.emissive = isSelected ? new THREE.Color(0x444444) : new THREE.Color(0x000000);
          }
          
          newMaterial.needsUpdate = true;
          return newMaterial;
        }
        return material;
      };
      
      if (Array.isArray(child.material)) {
        child.material = child.material.map(handleMaterial);
      } else {
        child.material = handleMaterial(child.material);
      }
    }
  });

  return (
    <primitive
      ref={meshRef}
      object={clonedScene}
      position={position}
      scale={scale}
      rotation={rotation}
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
const Model3D = ({ url, position = [0, 0, 0], scale = [1, 1, 1], rotation = [0, 0, 0], isSelected = false, color, selectedObject }) => {
  const [error, setError] = useState(false);
  
  if (!url) {
    console.warn('No URL provided for 3D model');
    return <ErrorFallback position={position} />;
  }
  
  if (error) {
    console.error('Error loading 3D model:', url);
    return <ErrorFallback position={position} />;
  }
  
  console.log('Loading 3D model from:', url);
  
  return (
    <Suspense fallback={<LoadingFallback position={position} />}>
      <ModelMesh 
        url={url} 
        position={position} 
        scale={scale}
        rotation={rotation}
        isSelected={isSelected}
        color={color}
        selectedObject={selectedObject}
      />
    </Suspense>
  );
};

export default Model3D;
