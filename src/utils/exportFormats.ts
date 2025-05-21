import { saveAs } from 'file-saver';
import * as THREE from 'three';

export interface MoleculeData {
  atoms: Array<{
    index: number;
    element: string;
    x: number;
    y: number;
    z: number;
  }>;
  bonds: Array<{
    begin: number;
    end: number;
    bond_type: string;
  }>;
  descriptors: {
    Formula: string;
    [key: string]: any;
  };
}

export async function exportAsPDB(smiles: string, filename: string = 'molecule.pdb') {
  try {
    const encodedSmiles = encodeURIComponent(smiles);
    const response = await fetch(`http://127.0.0.1:8080/export/pdb/${encodedSmiles}`);
    const data = await response.json();
    
    if (data.success && data.pdb) {
      const blob = new Blob([data.pdb], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, filename);
      return true;
    } else {
      console.error('Error generating PDB:', data.message);
      return false;
    }
  } catch (error) {
    console.error('Error exporting as PDB:', error);
    return false;
  }
}

export function exportAsScreenshot(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  filename: string = 'molecule.png'
) {
  try {
    // Render the scene
    renderer.render(scene, camera);
    
    // Get the canvas element
    const canvas = renderer.domElement;
    
    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, filename);
      }
    }, 'image/png');
    
    return true;
  } catch (error) {
    console.error('Error taking screenshot:', error);
    return false;
  }
}

export function exportAsSVG(svgData: string, filename: string = 'molecule.svg') {
  if (!svgData) return false;
  
  try {
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    saveAs(blob, filename);
    return true;
  } catch (error) {
    console.error('Error exporting as SVG:', error);
    return false;
  }
}

export function exportAsJSON(data: MoleculeData, filename: string = 'molecule.json') {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    saveAs(blob, filename);
    return true;
  } catch (error) {
    console.error('Error exporting as JSON:', error);
    return false;
  }
}