import * as THREE from 'three';
import { Vector3 } from 'three';

// Calculate the bond length between two atoms
export function calculateBondLength(atom1: Vector3, atom2: Vector3): number {
  return atom1.distanceTo(atom2);
}

// Calculate the angle between three atoms (in degrees)
export function calculateBondAngle(atom1: Vector3, atom2: Vector3, atom3: Vector3): number {
  const v1 = new Vector3().subVectors(atom1, atom2);
  const v2 = new Vector3().subVectors(atom3, atom2);
  
  v1.normalize();
  v2.normalize();
  
  const angle = Math.acos(v1.dot(v2));
  return (angle * 180) / Math.PI; // Convert to degrees
}

// Calculate the dihedral angle between four atoms (in degrees)
export function calculateDihedralAngle(atom1: Vector3, atom2: Vector3, atom3: Vector3, atom4: Vector3): number {
  const b1 = new Vector3().subVectors(atom2, atom1);
  const b2 = new Vector3().subVectors(atom3, atom2);
  const b3 = new Vector3().subVectors(atom4, atom3);
  
  // Normal vectors to the planes
  const n1 = new Vector3().crossVectors(b1, b2).normalize();
  const n2 = new Vector3().crossVectors(b2, b3).normalize();
  
  // Calculate the dihedral angle
  const x = n1.dot(n2);
  const y = new Vector3().crossVectors(n1, n2).dot(b2.normalize());
  
  const angle = Math.atan2(y, x);
  return (angle * 180) / Math.PI; // Convert to degrees
}

// Calculate the center of a molecule
export function calculateMoleculeCenter(atoms: Array<{ x: number; y: number; z: number }>): Vector3 {
  if (atoms.length === 0) return new Vector3(0, 0, 0);
  
  let sumX = 0, sumY = 0, sumZ = 0;
  
  atoms.forEach(atom => {
    sumX += atom.x;
    sumY += atom.y;
    sumZ += atom.z;
  });
  
  return new Vector3(
    sumX / atoms.length,
    sumY / atoms.length,
    sumZ / atoms.length
  );
}

// Get a suitable camera distance based on molecule size
export function calculateCameraDistance(atoms: Array<{ x: number; y: number; z: number }>): number {
  if (atoms.length === 0) return 10;
  
  const center = calculateMoleculeCenter(atoms);
  let maxDistance = 0;
  
  atoms.forEach(atom => {
    const distance = new Vector3(atom.x, atom.y, atom.z).distanceTo(center);
    if (distance > maxDistance) {
      maxDistance = distance;
    }
  });
  
  // Return a suitable camera distance (with some padding)
  return Math.max(5, maxDistance * 3);
}