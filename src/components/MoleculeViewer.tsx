import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useMoleculeStore } from '../hooks/useMoleculeStore';
import { useMeasurements } from '../hooks/useMeasurements';
import { getAtomColor, getAtomSize } from '../utils/atomColors';
import { calculateMoleculeCenter, calculateCameraDistance } from '../utils/moleculeUtils';
import { checkWebGLSupport } from '../utils/webgl-detection';
import Molecule2DFallback from './Molecule2DFallback';

// Component to render individual atoms
const Atom = ({ position, element, index, selected = false, onClick }) => {
  const atomColor = getAtomColor(element);
  const atomSize = getAtomSize(element);
  
  return (
    <mesh position={position} onClick={(e) => onClick(e, index)}>
      <sphereGeometry args={[atomSize, 32, 32]} />
      <meshStandardMaterial 
        color={atomColor}
        emissive={selected ? "#ffffff" : "#000000"}
        emissiveIntensity={selected ? 0.3 : 0}
        metalness={0.2}
        roughness={0.3}
      />
      {selected && (
        <Html position={[0, atomSize + 0.2, 0]} center>
          <div className="px-2 py-1 bg-primary-600 text-white text-xs rounded-md">
            {element}{index}
          </div>
        </Html>
      )}
    </mesh>
  );
};

// Component to render bonds between atoms
const Bond = ({ start, end, bondType, selected = false }) => {
  // Calculate the midpoint and direction of the bond
  const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const direction = new THREE.Vector3().subVectors(end, start).normalize();
  
  // Calculate the length of the bond
  const length = start.distanceTo(end);
  
  // Create a quaternion to rotate the cylinder to align with the bond direction
  const quaternion = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  quaternion.setFromUnitVectors(up, direction);
  
  // Calculate bond thickness based on type
  const bondThickness = 0.07;
  const offset = bondType === 'double' ? 0.15 : bondType === 'triple' ? 0.2 : 0;
  
  // For single or aromatic bonds
  if (bondType === 'single' || bondType === 'aromatic') {
    return (
      <mesh position={midpoint} quaternion={quaternion}>
        <cylinderGeometry args={[bondThickness, bondThickness, length, 12]} />
        <meshStandardMaterial 
          color={selected ? "#ff9900" : "#cccccc"} 
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>
    );
  }
  
  // For double or triple bonds
  const bonds = [];
  
  // Helper to create a bond at an offset
  const createOffsetBond = (offsetMultiplier: number) => {
    // Calculate perpendicular offset direction
    const offsetDir = new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion);
    offsetDir.multiplyScalar(offset * offsetMultiplier);
    
    // Calculate the offset positions
    const offsetMidpoint = midpoint.clone().add(offsetDir);
    
    return (
      <mesh key={`bond-${offsetMultiplier}`} position={offsetMidpoint} quaternion={quaternion}>
        <cylinderGeometry args={[bondThickness, bondThickness, length, 12]} />
        <meshStandardMaterial 
          color={selected ? "#ff9900" : "#cccccc"} 
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>
    );
  };
  
  if (bondType === 'double') {
    bonds.push(createOffsetBond(-1));
    bonds.push(createOffsetBond(1));
  } else if (bondType === 'triple') {
    bonds.push(createOffsetBond(-1));
    bonds.push(createOffsetBond(0));
    bonds.push(createOffsetBond(1));
  }
  
  return <>{bonds}</>;
};

// Component to display measurement lines and results
const MeasurementOverlay = ({ selectedAtoms, atomPositions, result }) => {
  if (selectedAtoms.length < 2) return null;
  
  // Create line segments between selected atoms
  const points = selectedAtoms.map((index: string | number) => atomPositions[index]);
  
  return (
    <>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={points.length}
            array={new Float32Array(points.flatMap((p: { x: any; y: any; z: any; }) => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ffff00" linewidth={2} />
      </line>
      
      {result !== null && (
        <Html position={points[Math.floor(points.length / 2)]} center>
          <div className="px-2 py-1 bg-yellow-500 text-black text-sm rounded-md">
            {result.toFixed(2)}
            {selectedAtoms.length === 2 ? ' Å' : selectedAtoms.length >= 3 ? '°' : ''}
          </div>
        </Html>
      )}
    </>
  );
};

// Main scene component
const MoleculeScene = () => {
  const { atoms, bonds, smiles } = useMoleculeStore();
  const { mode, selectedAtoms, selectAtom, calculateMeasurement, setMeasurementResult } = useMeasurements();
  const { camera } = useThree();
  const [localResult, setLocalResult] = useState(null);
  
  // Convert atom data to Three.js positions
  const atomPositions = atoms.map(atom => new THREE.Vector3(atom.x, atom.y, atom.z));
  
  // Focus camera on molecule when it changes
  useEffect(() => {
    if (atoms.length > 0) {
      const center = calculateMoleculeCenter(atoms);
      const distance = calculateCameraDistance(atoms);
      
      // Update camera position
      camera.position.set(distance, distance, distance);
      camera.lookAt(center.x, center.y, center.z);
    }
  }, [atoms, camera]);
  
  // Calculate measurement when necessary, but don't update state in the effect
  useEffect(() => {
    if (selectedAtoms.length >= 2 && mode !== 'none' && atomPositions.length > 0) {
      // Calculate but don't store in Zustand yet
      const result = calculateMeasurement(atomPositions);
      setLocalResult(result);
      
      // Use a timeout to avoid state updates during render
      if (result !== null) {
        const timer = setTimeout(() => {
          setMeasurementResult(result);
        }, 0);
        return () => clearTimeout(timer);
      }
    } else {
      setLocalResult(null);
    }
  }, [selectedAtoms, mode, atomPositions, calculateMeasurement, setMeasurementResult]);
  
  // Handle atom selection
  const handleAtomClick = (e, index) => {
    e.stopPropagation();
    selectAtom(index);
  };
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      {/* Atoms */}
      {atoms.map((atom) => (
        <Atom
          key={`atom-${atom.index}`}
          position={[atom.x, atom.y, atom.z]}
          element={atom.element}
          index={atom.index}
          selected={selectedAtoms.includes(atom.index)}
          onClick={handleAtomClick}
        />
      ))}
      
      {/* Bonds */}
      {bonds.map((bond, i) => {
        const startAtom = atoms[bond.begin];
        const endAtom = atoms[bond.end];
        
        if (!startAtom || !endAtom) return null;
        
        const start = new THREE.Vector3(startAtom.x, startAtom.y, startAtom.z);
        const end = new THREE.Vector3(endAtom.x, endAtom.y, endAtom.z);
        
        const isSelected = selectedAtoms.includes(bond.begin) && 
                            selectedAtoms.includes(bond.end) &&
                            Math.abs(selectedAtoms.indexOf(bond.begin) - selectedAtoms.indexOf(bond.end)) === 1;
        
        return (
          <Bond
            key={`bond-${i}`}
            start={start}
            end={end}
            bondType={bond.bond_type}
            selected={isSelected}
          />
        );
      })}
      
      {/* Measurement overlay - use localResult for immediate feedback */}
      {mode !== 'none' && (
        <MeasurementOverlay
          selectedAtoms={selectedAtoms}
          atomPositions={atomPositions}
          result={localResult}
        />
      )}
      
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
    </>
  );
};

// Main viewer component
const MoleculeViewer = () => {
  const { atoms, isLoading, error, smiles } = useMoleculeStore();
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [webGLChecked, setWebGLChecked] = useState(false);
  
  // Check WebGL support
  useEffect(() => {
    setWebGLSupported(checkWebGLSupport());
    setWebGLChecked(true);
  }, []);
  
  if (!webGLChecked) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-primary-600 dark:text-primary-400">
          Checking system compatibility...
        </div>
      </div>
    );
  }
  
  if (!webGLSupported) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-xl text-red-600 dark:text-red-400 mb-4">
          WebGL is not available on your system
        </div>
        <div className="text-gray-600 dark:text-gray-300 mb-6 max-w-md text-center">
          <p>Your browser or environment doesn't support WebGL, which is required for 3D molecular visualization.</p>
          <p className="mt-2">Try using a different browser with hardware acceleration enabled.</p>
        </div>
        
        {/* Show 2D fallback if we have a molecule */}
        {atoms.length > 0 && <Molecule2DFallback smiles={smiles} />}
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-primary-600 dark:text-primary-400">
          Loading molecule...
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-red-600 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }
  
  if (atoms.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-gray-500 dark:text-gray-400">
          Enter a SMILES string and click "Render" to visualize a molecule
        </div>
      </div>
    );
  }
  
  // Try rendering a simple test scene first to see if Three.js works at all
  const useTestScene = false;
  
  const TestScene = () => (
    <>
      <ambientLight intensity={0.5} />
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="blue" />
      </mesh>
      <OrbitControls />
    </>
  );
  
  return (
    <Canvas 
      style={{ width: '100%', height: '100%' }}
      gl={{
        powerPreference: "default",
        antialias: false,
        stencil: false,
        depth: true,
        alpha: true,
      }}
      onCreated={({ gl }) => {
        console.log("WebGL context created successfully");
      }}
      onContextLost={(event) => {
        console.error("WebGL context lost:", event);
        setWebGLSupported(false);
      }}
      dpr={1}
    >
      <ErrorBoundary fallback={<WebGLErrorMessage />}>
        {useTestScene ? <TestScene /> : <MoleculeScene />}
      </ErrorBoundary>
    </Canvas>
  );
};

// Error boundary component to catch rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error in 3D rendering:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return React.cloneElement(this.props.fallback, { 
        errorMessage: this.state.errorMessage 
      });
    }
    return this.props.children;
  }
}

// Enhanced error message component that shows the actual error
const WebGLErrorMessage = ({ errorMessage = "" }) => (
  <Html center>
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 max-w-md">
      <h3 className="text-lg font-semibold mb-2">Rendering Error</h3>
      <p>There was a problem rendering the 3D molecule.</p>
      {errorMessage && (
        <div className="mt-2 p-2 bg-red-100 rounded text-sm overflow-auto max-h-32">
          <code>{errorMessage}</code>
        </div>
      )}
      <p className="mt-3">Try the following:</p>
      <ul className="list-disc list-inside mt-1">
        <li>Refresh the page</li>
        <li>Try a simpler molecule</li>
        <li>Use a different browser</li>
      </ul>
    </div>
  </Html>
);

export default MoleculeViewer;