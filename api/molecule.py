from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Union, Any
from rdkit import Chem
from rdkit.Chem import AllChem, Draw, Descriptors
import numpy as np
import base64
import io
from utils.descriptors import calculate_all_descriptors

# Create FastAPI app without any path prefix
app = FastAPI()

# Add CORS middleware with broader permissions
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MoleculeRequest(BaseModel):
    smiles: str
    optimize_3d: bool = True
    include_hydrogens: bool = True

class AtomPosition(BaseModel):
    index: int
    element: str
    x: float
    y: float
    z: float
    charge: float = 0.0
    is_aromatic: bool = False
    is_in_ring: bool = False

class BondInfo(BaseModel):
    begin: int
    end: int
    bond_type: str
    is_aromatic: bool = False
    is_conjugated: bool = False
    is_in_ring: bool = False

class MoleculeResponse(BaseModel):
    success: bool
    message: str = ""
    atoms: Optional[List[AtomPosition]] = None
    bonds: Optional[List[BondInfo]] = None
    descriptors: Optional[Dict[str, Any]] = None
    svg: Optional[str] = None

# Change the route to not include /api prefix since it's not included in base URL
@app.post("/molecule", response_model=MoleculeResponse)
async def process_molecule(request: MoleculeRequest):
    # Rest of your code remains the same
    try:
        # Parse SMILES to RDKit molecule
        mol = Chem.MolFromSmiles(request.smiles)
        if mol is None:
            return MoleculeResponse(success=False, message="Invalid SMILES string")
        
        # Add hydrogens if requested
        if request.include_hydrogens:
            mol = Chem.AddHs(mol)
        
        # Generate 3D coordinates
        if request.optimize_3d:
            AllChem.EmbedMolecule(mol, randomSeed=42)
            AllChem.MMFFOptimizeMolecule(mol)
        else:
            AllChem.EmbedMolecule(mol)
        
        # Get conformer
        if mol.GetNumConformers() == 0:
            return MoleculeResponse(success=False, message="Failed to generate 3D coordinates")
        
        conf = mol.GetConformer()
        
        # Extract atom positions and properties
        atoms = []
        for i, atom in enumerate(mol.GetAtoms()):
            pos = conf.GetAtomPosition(i)
            atoms.append(AtomPosition(
                index=i,
                element=atom.GetSymbol(),
                x=float(pos.x),
                y=float(pos.y),
                z=float(pos.z),
                charge=float(atom.GetFormalCharge()),
                is_aromatic=atom.GetIsAromatic(),
                is_in_ring=atom.IsInRing()
            ))
        
        # Extract bond information
        bonds = []
        for bond in mol.GetBonds():
            bond_type_dict = {
                Chem.rdchem.BondType.SINGLE: "single",
                Chem.rdchem.BondType.DOUBLE: "double",
                Chem.rdchem.BondType.TRIPLE: "triple",
                Chem.rdchem.BondType.AROMATIC: "aromatic"
            }
            bond_type = bond_type_dict.get(bond.GetBondType(), "unknown")
            
            bonds.append(BondInfo(
                begin=bond.GetBeginAtomIdx(),
                end=bond.GetEndAtomIdx(),
                bond_type=bond_type,
                is_aromatic=bond.GetIsAromatic(),
                is_conjugated=bond.GetIsConjugated(),
                is_in_ring=bond.IsInRing()
            ))
        
        # Calculate molecular descriptors
        descriptors = calculate_all_descriptors(mol)
        
        # Generate 2D SVG for thumbnail
        mol_2d = Chem.Mol(mol)
        if request.include_hydrogens:
            mol_2d = Chem.RemoveHs(mol_2d)  # SVG looks better without H's
        AllChem.Compute2DCoords(mol_2d)
        drawer = Draw.MolDraw2DSVG(300, 300)
        drawer.DrawMolecule(mol_2d)
        drawer.FinishDrawing()
        svg = drawer.GetDrawingText()
        
        return MoleculeResponse(
            success=True,
            atoms=atoms,
            bonds=bonds,
            descriptors=descriptors,
            svg=svg
        )
    
    except Exception as e:
        return MoleculeResponse(success=False, message=f"Error processing molecule: {str(e)}")

# Also update the paths for these routes
@app.get("/examples/{molecule_name}")
async def get_example_molecule(molecule_name: str):
    examples = {
        "caffeine": "CN1C=NC2=C1C(=O)N(C(=O)N2C)C",
        "aspirin": "CC(=O)OC1=CC=CC=C1C(=O)O",
        "penicillin": "CC1(C)SC2C(NC(=O)CC3=CC=CC=C3)C(=O)N2C1C(=O)O",
        "graphene": "C1=CC=C2C=CC=CC2=C1",
        "glucose": "C(C1C(C(C(C(O1)O)O)O)O)O",
        "adrenaline": "CNC[C@H](O)C1=CC(O)=C(O)C=C1"
    }
    
    if molecule_name not in examples:
        return {"success": False, "message": "Example molecule not found"}
    
    return {"success": True, "smiles": examples[molecule_name]}

@app.get("/export/pdb/{smiles}")
async def export_pdb(smiles: str):
    try:
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return {"success": False, "message": "Invalid SMILES string"}
        
        mol = Chem.AddHs(mol)
        AllChem.EmbedMolecule(mol)
        AllChem.MMFFOptimizeMolecule(mol)
        
        pdb_string = Chem.MolToPDBBlock(mol)
        
        return {"success": True, "pdb": pdb_string}
    
    except Exception as e:
        return {"success": False, "message": f"Error exporting PDB: {str(e)}"}