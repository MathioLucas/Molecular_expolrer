import React, { useRef } from 'react';
import { useMoleculeStore } from '../hooks/useMoleculeStore';
import { exportAsPDB, exportAsScreenshot, exportAsSVG, exportAsJSON } from '../utils/exportFormats';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

const ExportButton = ({ onClick, icon, label, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex items-center gap-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <span>{icon}</span>
    <span>{label}</span>
  </button>
);

// This component gets the Three.js renderer and camera from the scene
const ExportScreenshotButton = ({ onExport, disabled }) => {
  const { gl, scene, camera } = useThree();
  
  const handleClick = () => {
    onExport(gl, scene, camera);
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className="flex items-center gap-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span>📸</span>
      <span>PNG</span>
    </button>
  );
};

// Wrapper component that conditionally renders the Three.js-dependent button
const ScreenshotButton = ({ disabled }) => {
  const handleExport = (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) => {
    exportAsScreenshot(renderer, scene, camera);
  };
  
  if (disabled) {
    return (
      <ExportButton 
        onClick={() => {}} 
        icon="📸" 
        label="PNG" 
        disabled={true} 
      />
    );
  }
  
  // This component will be injected into the Three.js canvas context
  const ScreenshotButtonWithContext = () => (
    <ExportScreenshotButton onExport={handleExport} disabled={disabled} />
  );
  
  return <ScreenshotButtonWithContext />;
};

const ExportOptions = () => {
  const { smiles, atoms, bonds, descriptors, svg } = useMoleculeStore();
  const isExportable = atoms.length > 0 && smiles.trim() !== '';
  
  const handleExportPDB = () => {
    if (!isExportable) return;
    exportAsPDB(smiles);
  };
  
  const handleExportSVG = () => {
    if (!isExportable || !svg) return;
    exportAsSVG(svg);
  };
  
  const handleExportJSON = () => {
    if (!isExportable) return;
    const data = { atoms, bonds, descriptors };
    exportAsJSON(data);
  };
  
  return (
    <div className="w-full">
      <h3 className="text-lg font-medium mb-3">Export</h3>
      
      <div className="flex flex-wrap gap-2">
        <ExportButton 
          onClick={handleExportPDB} 
          icon="🧪" 
          label="PDB" 
          disabled={!isExportable} 
        />
        
        <ExportButton 
          onClick={handleExportSVG} 
          icon="🖼️" 
          label="SVG" 
          disabled={!isExportable || !svg} 
        />
        
        <ExportButton 
          onClick={handleExportJSON} 
          icon="📊" 
          label="JSON" 
          disabled={!isExportable} 
        />
      </div>
      
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Export your molecule in various formats for use in other applications
      </p>
    </div>
  );
};

export default ExportOptions;