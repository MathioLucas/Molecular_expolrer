import { create } from 'zustand';

interface Atom {
  index: number;
  element: string;
  x: number;
  y: number;
  z: number;
  charge: number;
  is_aromatic: boolean;
  is_in_ring: boolean;
}

interface Bond {
  begin: number;
  end: number;
  bond_type: string;
  is_aromatic: boolean;
  is_conjugated: boolean;
  is_in_ring: boolean;
}

interface MoleculeState {
  smiles: string;
  setSmiles: (smiles: string) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  atoms: Atom[];
  setAtoms: (atoms: Atom[]) => void;
  bonds: Bond[];
  setBonds: (bonds: Bond[]) => void;
  descriptors: Record<string, any> | null;
  setDescriptors: (descriptors: Record<string, any> | null) => void;
  svg: string | null;
  setSvg: (svg: string | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  renderMolecule: () => Promise<void>;
  showHydrogens: boolean;
  setShowHydrogens: (show: boolean) => void;
}

export const useMoleculeStore = create<MoleculeState>((set, get) => ({
  smiles: '',
  setSmiles: (smiles) => set({ smiles }),
  
  inputValue: 'CCO', // Default to ethanol
  setInputValue: (value) => set({ inputValue: value }),
  
  atoms: [],
  setAtoms: (atoms) => set({ atoms }),
  
  bonds: [],
  setBonds: (bonds) => set({ bonds }),
  
  descriptors: null,
  setDescriptors: (descriptors) => set({ descriptors }),
  
  svg: null,
  setSvg: (svg) => set({ svg }),
  
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  
  error: null,
  setError: (error) => set({ error }),
  
  showHydrogens: true,
  setShowHydrogens: (show) => set({ showHydrogens: show }),
  
  renderMolecule: async () => {
    const { inputValue, showHydrogens } = get();
    if (!inputValue.trim()) {
      set({ error: 'Please enter a SMILES string' });
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      // Updated URL to match the new route
      const response = await fetch('http://127.0.0.1:8080/molecule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          smiles: inputValue,
          optimize_3d: true,
          include_hydrogens: showHydrogens
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        set({
          smiles: inputValue,
          atoms: data.atoms,
          bonds: data.bonds,
          descriptors: data.descriptors,
          svg: data.svg,
          error: null
        });
      } else {
        set({ error: data.message || 'Error processing molecule' });
      }
    } catch (error) {
      set({ error: 'Network error: Failed to process molecule' });
      console.error('Error rendering molecule:', error);
    } finally {
      set({ isLoading: false });
    }
  }
}));