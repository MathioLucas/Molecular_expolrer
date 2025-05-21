from rdkit import Chem
from rdkit.Chem import Descriptors, Lipinski, QED, rdMolDescriptors

def calculate_all_descriptors(mol):
    """Calculate a comprehensive set of molecular descriptors."""
    descriptors = {
        # Basic properties
        "MolecularWeight": round(Descriptors.MolWt(mol), 2),
        "HeavyAtomCount": Descriptors.HeavyAtomCount(mol),
        "AromaticAtomCount": len([atom for atom in mol.GetAtoms() if atom.GetIsAromatic()]),
        
        # Lipophilicity
        "LogP": round(Descriptors.MolLogP(mol), 2),
        "MolMR": round(Descriptors.MolMR(mol), 2),
        
        # Topological properties
        "TPSA": round(Descriptors.TPSA(mol), 2),
        "RotatableBondCount": Descriptors.NumRotatableBonds(mol),
        "HBondDonorCount": Descriptors.NumHDonors(mol),
        "HBondAcceptorCount": Descriptors.NumHAcceptors(mol),
        
        # Ring information
        "RingCount": Descriptors.RingCount(mol),
        "AromaticRingCount": rdMolDescriptors.CalcNumAromaticRings(mol),
        
        # Drug-likeness
        "QEDScore": round(QED.qed(mol), 3),
        
        # Lipinski Rule of 5 violations
        "LipinskiHBD": Lipinski.NumHDonors(mol) > 5,
        "LipinskiHBA": Lipinski.NumHAcceptors(mol) > 10,
        "LipinskiMWT": Descriptors.MolWt(mol) > 500,
        "LipinskiLogP": Descriptors.MolLogP(mol) > 5,  # Changed from Lipinski.MolLogP to Descriptors.MolLogP
        "LipinskiViolations": sum([
            1 if Lipinski.NumHDonors(mol) > 5 else 0,
            1 if Lipinski.NumHAcceptors(mol) > 10 else 0,
            1 if Descriptors.MolWt(mol) > 500 else 0,
            1 if Descriptors.MolLogP(mol) > 5 else 0  # Changed from Lipinski.MolLogP to Descriptors.MolLogP
        ]),
        
        # Atom counts by element
        "AtomCounts": {
            element: sum(1 for atom in mol.GetAtoms() if atom.GetSymbol() == element)
            for element in set(atom.GetSymbol() for atom in mol.GetAtoms())
        },
        
        # Formula and exact mass
        "Formula": rdMolDescriptors.CalcMolFormula(mol),
        "ExactMass": round(Descriptors.ExactMolWt(mol), 4)
    }
    
    return descriptors