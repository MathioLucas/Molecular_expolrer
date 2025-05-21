import { create } from 'zustand';
import { Vector3 } from 'three';
import { calculateBondLength, calculateBondAngle, calculateDihedralAngle } from '../utils/moleculeUtils';

type MeasurementType = 'none' | 'distance' | 'angle' | 'dihedral';

interface MeasurementState {
  mode: MeasurementType;
  setMode: (mode: MeasurementType) => void;
  
  selectedAtoms: number[];
  selectAtom: (atomIndex: number) => void;
  clearSelection: () => void;
  
  measurementResult: number | null;
  setMeasurementResult: (result: number | null) => void;
  
  // This will calculate without updating state
  calculateMeasurement: (positions: Vector3[]) => number | null;
}

export const useMeasurements = create<MeasurementState>((set, get) => ({
  mode: 'none',
  setMode: (mode) => set({ mode, selectedAtoms: [], measurementResult: null }),
  
  selectedAtoms: [],
  selectAtom: (atomIndex) => {
    const { mode, selectedAtoms } = get();
    
    // Don't add the same atom twice
    if (selectedAtoms.includes(atomIndex)) return;
    
    // Add the atom to selection based on measurement mode
    const maxAtoms = mode === 'distance' ? 2 : mode === 'angle' ? 3 : mode === 'dihedral' ? 4 : 0;
    
    if (maxAtoms === 0) return; // No measurement mode active
    
    const newSelection = [...selectedAtoms, atomIndex];
    
    // If we've reached the max atoms for this measurement type, keep only the last maxAtoms
    if (newSelection.length > maxAtoms) {
      newSelection.shift(); // Remove the first atom
    }
    
    set({ selectedAtoms: newSelection });
  },
  
  clearSelection: () => set({ selectedAtoms: [], measurementResult: null }),
  
  measurementResult: null,
  setMeasurementResult: (result) => set({ measurementResult: result }),
  
  // Pure calculation function that doesn't update state
  calculateMeasurement: (positions) => {
    const { mode, selectedAtoms } = get();
    
    if (selectedAtoms.length === 0 || mode === 'none') {
      return null;
    }
    
    // Get selected positions
    const selectedPositions = [];
    for (const index of selectedAtoms) {
      if (index >= 0 && index < positions.length) {
        selectedPositions.push(positions[index]);
      } else {
        return null;
      }
    }
    
    try {
      if (mode === 'distance' && selectedPositions.length >= 2) {
        return calculateBondLength(selectedPositions[0], selectedPositions[1]);
      } else if (mode === 'angle' && selectedPositions.length >= 3) {
        return calculateBondAngle(selectedPositions[0], selectedPositions[1], selectedPositions[2]);
      } else if (mode === 'dihedral' && selectedPositions.length >= 4) {
        return calculateDihedralAngle(selectedPositions[0], selectedPositions[1], selectedPositions[2], selectedPositions[3]);
      }
    } catch (error) {
      console.error("Error calculating measurement:", error);
    }
    
    return null;
  }
}));