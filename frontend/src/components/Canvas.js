import React, { useEffect, useState, useRef } from 'react';
import { Canvas as ThreeCanvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, useDragControls } from '@react-three/drei';
import * as THREE from 'three';
import Model3D from './Model3D';
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

// Simple positioned model component (no drag & drop)
const PositionedModel = ({ model, isSelected, onModelSelect, onObjectSelect, selectedObject }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    onModelSelect(model); // For backward compatibility
    if (onObjectSelect) {
      onObjectSelect(model); // For object properties panel
    }
  };

  return (
    <group
      position={model.position}
      rotation={model.rotation || [0, 0, 0]}
      scale={model.scale || [1, 1, 1]}
      onClick={handleClick}
    >
      <Model3D
        url={model.url}
        position={[0, 0, 0]}
        scale={[1, 1, 1]} // Use group scale instead
        rotation={[0, 0, 0]} // Use group rotation instead
        isSelected={isSelected}
        color={model.color} // Pass color to Model3D
        selectedObject={selectedObject}
      />
      
      {/* Visual indicator when selected */}
      {isSelected && (
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.5, 32]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
};

const Room = ({ model }) => {
  const { width, length, height, walls = [], furniture = [], floor = {} } = model;

  // Floor material based on type
  const getFloorMaterial = () => {
    const baseColor = floor.color || '#f0f0f0';
    
    switch (floor.material) {
      case 'hardwood':
        return (
          <meshStandardMaterial
            color={baseColor}
            roughness={0.7}
            metalness={0.1}
            bumpScale={0.1}
          />
        );
      case 'tile':
        return (
          <meshStandardMaterial
            color={baseColor}
            roughness={0.3}
            metalness={0.2}
            bumpScale={0.05}
          />
        );
      case 'carpet':
        return (
          <meshStandardMaterial
            color={baseColor}
            roughness={0.9}
            metalness={0}
            bumpScale={0.2}
          />
        );
      case 'concrete':
        return (
          <meshStandardMaterial
            color={baseColor}
            roughness={0.8}
            metalness={0.1}
            bumpScale={0.05}
          />
        );
      default:
        return <meshStandardMaterial color={baseColor} />;
    }
  };

  // Calculate wall thickness offset
  const wallThickness = 0.2;
  const innerWidth = width - wallThickness;
  const innerLength = length - wallThickness;

  return (
    <group position={[0, 0, 0]}>
      {/* Base platform (bottom layer) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <planeGeometry args={[width + 1, length + 1]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.8} />
      </mesh>

      {/* Template-specific floor (middle layer) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[innerWidth, innerLength]} />
        {getFloorMaterial()}
      </mesh>

      {/* Floor edges */}
      <group position={[0, -0.1, 0]}>
        {/* Front edge */}
        <mesh position={[0, 0, length/2 - wallThickness/2]}>
          <boxGeometry args={[width - wallThickness, 0.02, wallThickness/2]} />
          <meshStandardMaterial color={floor.color} />
        </mesh>
        {/* Back edge */}
        <mesh position={[0, 0, -length/2 + wallThickness/2]}>
          <boxGeometry args={[width - wallThickness, 0.02, wallThickness/2]} />
          <meshStandardMaterial color={floor.color} />
        </mesh>
        {/* Left edge */}
        <mesh position={[-width/2 + wallThickness/2, 0, 0]}>
          <boxGeometry args={[wallThickness/2, 0.02, length - wallThickness]} />
          <meshStandardMaterial color={floor.color} />
        </mesh>
        {/* Right edge */}
        <mesh position={[width/2 - wallThickness/2, 0, 0]}>
          <boxGeometry args={[wallThickness/2, 0.02, length - wallThickness]} />
          <meshStandardMaterial color={floor.color} />
        </mesh>
      </group>

      {/* Room structure (top layer) */}
      <group position={[0, 0, 0]}>
        {/* Walls */}
        {walls.map((wall, index) => {
          const isHorizontal = wall.position === 'front' || wall.position === 'back';
          const wallWidth = isHorizontal ? width : length;
          const wallHeight = wall.height || height;
          const wallPosition = {
            front: [0, wallHeight / 2, length / 2],
            back: [0, wallHeight / 2, -length / 2],
            left: [-width / 2, wallHeight / 2, 0],
            right: [width / 2, wallHeight / 2, 0]
          }[wall.position];
          const wallRotation = isHorizontal ? [0, 0, 0] : [0, Math.PI / 2, 0];

          return (
            <mesh
              key={index}
              position={wallPosition}
              rotation={wallRotation}
            >
              <boxGeometry args={[wallWidth, wallHeight, wallThickness]} />
              <meshStandardMaterial 
                color="#ffffff"
                transparent={true}
                opacity={0.85}
              />
            </mesh>
          );
        })}

        {/* No ceiling for open space concept */}
        {model.type !== 'house' && (
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height, 0]}>
            <planeGeometry args={[width, length]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        )}

        {/* Furniture */}
        {furniture.map((item, index) => {
          const scale = item.scale || [1, 1, 1];
          const position = item.position || [0, 0, 0];
          const adjustedPosition = [position[0], position[1] + scale[1] / 2, position[2]];
          
          let geometry;
          let color;

          switch (item.type) {
            case 'sofa':
              geometry = <boxGeometry args={[1, 1, 1]} />;
              color = "#8B4513";
              break;
            case 'chair':
              geometry = <boxGeometry args={[1, 1, 1]} />;
              color = "#A0522D";
              break;
            case 'table':
            case 'coffeeTable':
            case 'outdoorTable':
              geometry = <boxGeometry args={[1, 1, 1]} />;
              color = "#DEB887";
              break;
            case 'bed':
              geometry = <boxGeometry args={[1, 1, 1]} />;
              color = "#F5DEB3";
              break;
            case 'desk':
              geometry = <boxGeometry args={[1, 1, 1]} />;
              color = "#D2691E";
              break;
            case 'bookshelf':
              geometry = <boxGeometry args={[1, 1, 1]} />;
              color = "#8B4513";
              break;
            case 'counter':
            case 'sink':
              geometry = <boxGeometry args={[1, 1, 1]} />;
              color = "#B8860B";
              break;
            case 'stove':
              geometry = <boxGeometry args={[1, 1, 1]} />;
              color = "#696969";
              break;
            default:
              geometry = <boxGeometry args={[1, 1, 1]} />;
              color = "#808080";
          }

          return (
            <mesh
              key={index}
              position={adjustedPosition}
              scale={scale}
            >
              {geometry}
              <meshStandardMaterial color={color} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};

const House = ({ model }) => {
  const { width, length, height, roof } = model;

  return (
    <group position={[0, height / 2, 0]}>
      {/* Base structure similar to Room */}
      <Room model={model} />

      {/* Roof */}
      {roof && (
        <mesh position={[0, height / 2 + 0.1, 0]} receiveShadow castShadow>
          <coneGeometry args={[Math.max(width, length) / 1.5, height / 2, 4]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
      )}
    </group>
  );
};

const Platform = () => {
  const platformWidth = 6; // 6 units wide
  const platformDepth = 5; // 5 units deep  
  const platformHeight = 0.5;

  return (
    <group position={[0, 0, 0]}>
      {/* Top surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, platformHeight, 0]} receiveShadow castShadow>
        <planeGeometry args={[platformWidth, platformDepth]} />
        <meshStandardMaterial 
          map={grassTexture}
          roughness={0.8}
          metalness={0}
        />
      </mesh>

      {/* Side walls */}
      <group>
        {/* Front */}
        <mesh position={[0, platformHeight/2, platformDepth/2]} castShadow>
          <boxGeometry args={[platformWidth, platformHeight, 0.2]} />
          <meshStandardMaterial 
            map={dirtTexture} 
            roughness={0.9}
            metalness={0}
            transparent={true}
            opacity={0.99}
          />
        </mesh>
        {/* Back */}
        <mesh position={[0, platformHeight/2, -platformDepth/2]} castShadow>
          <boxGeometry args={[platformWidth, platformHeight, 0.2]} />
          <meshStandardMaterial 
            map={dirtTexture} 
            roughness={0.9}
            metalness={0}
            transparent={true}
            opacity={0.99}
          />
        </mesh>
        {/* Left */}
        <mesh position={[-platformWidth/2, platformHeight/2, 0]} rotation={[0, Math.PI/2, 0]} castShadow>
          <boxGeometry args={[platformDepth, platformHeight, 0.2]} />
          <meshStandardMaterial 
            map={dirtTexture} 
            roughness={0.9}
            metalness={0}
            transparent={true}
            opacity={0.99}
          />
        </mesh>
        {/* Right */}
        <mesh position={[platformWidth/2, platformHeight/2, 0]} rotation={[0, Math.PI/2, 0]} castShadow>
          <boxGeometry args={[platformDepth, platformHeight, 0.2]} />
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
        args={[platformWidth, platformDepth]}
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

const Scene = ({ selectedTemplate, modelScales = { furniture: 0.08, roomTemplate: 0.8 }, selectedModel, onModelSelect, onAddModel, placedModels: externalPlacedModels, onObjectSelect, selectedObject }) => {
  const { camera, gl } = useThree();
  const [placedModels, setPlacedModels] = useState([]);

  // Handle clicking on empty space to deselect
  const handleBackgroundClick = (e) => {
    // Only deselect if clicking directly on the background (not on models)
    onModelSelect(null);
  };

  useEffect(() => {
    camera.position.set(8, 8, 8);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Sync internal placedModels with external ones
  useEffect(() => {
    if (externalPlacedModels) {
      setPlacedModels(externalPlacedModels);
    }
  }, [externalPlacedModels]);

  // Update selected model's scale when it changes
  useEffect(() => {
    if (selectedModel) {
      setPlacedModels(prevModels => 
        prevModels.map(model => 
          model.id === selectedModel.id ? { ...model, scale: selectedModel.scale } : model
        )
      );
    }
  }, [selectedModel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Force garbage collection of WebGL resources
      if (gl) {
        gl.dispose();
      }
    };
  }, [gl]);

  // Handle new model selection (both 3D models and room templates)
  useEffect(() => {
    if (selectedTemplate && (selectedTemplate.type === 'model' || selectedTemplate.type === 'room')) {
      console.log('Adding template to scene:', selectedTemplate);
      
      // Get the model URL from different possible sources
      let modelUrl = null;
      
      if (selectedTemplate.type === 'model') {
        // For components: check fileUrl or modelFile.url
        modelUrl = selectedTemplate.fileUrl || selectedTemplate.modelFile?.url;
      } else if (selectedTemplate.type === 'room') {
        // For room templates: check modelFile.url first, then fallback to thumbnail
        modelUrl = selectedTemplate.modelFile?.url || selectedTemplate.thumbnail;
      }
      
      if (modelUrl) {
        // Apply different scaling based on model type using the passed scales
        let modelScale;
        if (selectedTemplate.type === 'model') {
          // Components/furniture - use the furniture scale from props
          modelScale = [modelScales.furniture, modelScales.furniture, modelScales.furniture];
        } else if (selectedTemplate.type === 'room') {
          // Room templates - use the room template scale from props
          modelScale = [modelScales.roomTemplate, modelScales.roomTemplate, modelScales.roomTemplate];
        } else {
          // Default scale
          modelScale = [modelScales.roomTemplate, modelScales.roomTemplate, modelScales.roomTemplate];
        }
        
        const newModel = {
          ...selectedTemplate, // Preserve all original properties including _id
          id: Date.now() + Math.random(), // More unique ID to prevent conflicts (local instance ID)
          name: selectedTemplate.name,
          url: modelUrl,
          position: [0, 0.6, 0], // Position on top of the platform (platform height is 0.5)
          scale: modelScale,
          rotation: [0, 0, 0], // Initial rotation (no rotation)
          type: selectedTemplate.type, // Store the type for scale updates
          category: selectedTemplate.category // Preserve category
        };
        
        // Add to external list via callback
        if (onAddModel) {
          onAddModel(newModel);
        }
        
        console.log('Template added to scene:', newModel);
      } else {
        console.warn('No URL found for template:', selectedTemplate);
      }
    }
  }, [selectedTemplate, modelScales]); // Removed onAddModel from dependencies

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
      
      {/* Invisible background mesh for deselection */}
      <mesh 
        position={[0, -0.1, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={handleBackgroundClick}
      >
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      <Platform />
      
      {/* Render all placed models (both 3D models and room templates) */}
      {placedModels.map(model => (
        <PositionedModel
          key={model.id}
          model={model}
          isSelected={selectedModel?.id === model.id}
          onModelSelect={onModelSelect}
          onObjectSelect={onObjectSelect}
          selectedObject={selectedObject}
        />
      ))}
      
      {/* Handle room templates (existing functionality for legacy templates without modelFile) */}
      {selectedTemplate && selectedTemplate.type === 'room' && !selectedTemplate.modelFile?.url && selectedTemplate.model && (
        selectedTemplate.model.type === 'house' ? (
          <House model={selectedTemplate.model} />
        ) : (
          <Room model={selectedTemplate.model} />
        )
      )}
      
      <OrbitControls 
        maxPolarAngle={Math.PI / 2.1}
        minDistance={5}
        maxDistance={30}
      />
    </>
  );
};

const Canvas = ({ 
  selectedTemplate, 
  modelScales, 
  selectedModel, 
  onModelSelect, 
  onAddModel, 
  placedModels,
  onObjectSelect,
  selectedObject
}) => {
  return (
    <div className="design-canvas">
      <ThreeCanvas
        shadows
        camera={{ position: [8, 8, 8], fov: 50 }}
        gl={{ 
          antialias: true, 
          preserveDrawingBuffer: true 
        }}
      >
        <Scene 
          selectedTemplate={selectedTemplate} 
          modelScales={modelScales} 
          selectedModel={selectedModel}
          onModelSelect={onModelSelect}
          onAddModel={onAddModel}
          placedModels={placedModels}
          onObjectSelect={onObjectSelect}
          selectedObject={selectedObject}
        />
      </ThreeCanvas>
    </div>
  );
};

export default Canvas; 