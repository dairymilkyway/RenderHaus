import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Model3D from './Model3D';

// Simple ground plane for mini canvas
const MiniGround = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[8, 8]} />
      <meshStandardMaterial color="#f0f0f0" />
    </mesh>
  );
};

// Positioned model for mini canvas (non-interactive)
const MiniModel = ({ model }) => {
  if (!model.url && !model.fileUrl) return null;
  
  const url = model.url || model.fileUrl;
  const position = Array.isArray(model.position) ? model.position : [0, 0, 0];
  const rotation = Array.isArray(model.rotation) ? model.rotation : [0, 0, 0];
  const scale = Array.isArray(model.scale) ? model.scale : [0.1, 0.1, 0.1];

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <Model3D
        url={url}
        position={[0, 0, 0]}
        scale={[1, 1, 1]}
        rotation={[0, 0, 0]}
        isSelected={false}
        castShadow
        receiveShadow
      />
    </group>
  );
};

// Mini scene setup
const MiniScene = ({ models }) => {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={0.8} 
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      
      {/* Ground */}
      <MiniGround />
      
      {/* Models */}
      {models?.map((model, index) => (
        <MiniModel key={model.id || index} model={model} />
      ))}
    </>
  );
};

const MiniCanvas = ({ 
  project, 
  width = 200, 
  height = 150, 
  className = "" 
}) => {
  // Extract models from project data
  const getModelsFromProject = () => {
    if (!project) return [];
    
    // Handle different project data structures
    if (project.placedModels && Array.isArray(project.placedModels)) {
      return project.placedModels;
    }
    
    if (project.objects && Array.isArray(project.objects)) {
      return project.objects.map(obj => {
        // Convert project object format to placed model format
        const modelData = obj.modelId || {};
        return {
          id: obj.instanceId || obj._id,
          name: modelData.name || 'Model',
          url: modelData.fileUrl || modelData.url,
          fileUrl: modelData.fileUrl,
          position: obj.position ? [
            obj.position.x || 0,
            obj.position.y || 0.5,
            obj.position.z || 0
          ] : [0, 0.5, 0],
          rotation: obj.rotation ? [
            obj.rotation.x || 0,
            obj.rotation.y || 0,
            obj.rotation.z || 0
          ] : [0, 0, 0],
          scale: obj.scale ? [
            obj.scale.x || 0.1,
            obj.scale.y || 0.1,
            obj.scale.z || 0.1
          ] : [0.1, 0.1, 0.1]
        };
      });
    }
    
    return [];
  };

  const models = getModelsFromProject();
  
  // Auto-calculate camera position based on models
  const getCameraPosition = () => {
    if (models.length === 0) return [3, 3, 3];
    
    // Find the bounds of all models
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    
    models.forEach(model => {
      const pos = Array.isArray(model.position) ? model.position : [0, 0, 0];
      minX = Math.min(minX, pos[0]);
      maxX = Math.max(maxX, pos[0]);
      minZ = Math.min(minZ, pos[2]);
      maxZ = Math.max(maxZ, pos[2]);
    });
    
    // Calculate center and distance
    const centerX = (minX + maxX) / 2;
    const centerZ = (minZ + maxZ) / 2;
    const range = Math.max(maxX - minX, maxZ - minZ) + 2;
    
    return [centerX + range * 0.8, range * 0.8, centerZ + range * 0.8];
  };

  const cameraPosition = getCameraPosition();

  return (
    <div 
      className={`mini-canvas ${className}`}
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#f8fafc'
      }}
    >
      <Canvas
        camera={{ 
          position: cameraPosition,
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        shadows
        style={{ 
          pointerEvents: 'none', // Make it non-interactive
          cursor: 'default'
        }}
      >
        <Suspense fallback={null}>
          <MiniScene models={models} />
        </Suspense>
        
        {/* Non-interactive orbit controls for auto-rotation */}
        <OrbitControls
          enabled={false} // Disable user interaction
          autoRotate={true}
          autoRotateSpeed={0.5}
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
        />
      </Canvas>
      
      {/* Overlay showing model count */}
      <div style={{
        position: 'absolute',
        bottom: '4px',
        right: '4px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '10px',
        fontFamily: 'Arial, sans-serif'
      }}>
        {models.length} items
      </div>
    </div>
  );
};

export default MiniCanvas;
