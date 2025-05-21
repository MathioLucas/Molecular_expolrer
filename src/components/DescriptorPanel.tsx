import React from 'react';
import { useMoleculeStore } from '../hooks/useMoleculeStore';

interface DescriptorGroupProps {
  title: string;
  children: React.ReactNode;
}

const DescriptorGroup = ({ title, children }: DescriptorGroupProps) => (
  <div className="mb-4">
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <div className="space-y-1">{children}</div>
  </div>
);

interface DescriptorItemProps {
  label: string;
  value: React.ReactNode;
}

const DescriptorItem = ({ label, value }: DescriptorItemProps) => (
  <div className="flex justify-between">
    <span className="text-gray-600 dark:text-gray-400">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const DescriptorPanel = () => {
  const { descriptors, smiles } = useMoleculeStore();
  
  if (!descriptors) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        Render a molecule to view properties
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4">Molecule Properties</h2>
      
      <DescriptorGroup title="Basic Information">
        <DescriptorItem label="Formula" value={descriptors.Formula} />
        <DescriptorItem label="Molecular Weight" value={`${descriptors.MolecularWeight} g/mol`} />
        <DescriptorItem label="Heavy Atoms" value={descriptors.HeavyAtomCount} />
      </DescriptorGroup>
      
      <DescriptorGroup title="Physical Properties">
        <DescriptorItem label="LogP" value={descriptors.LogP} />
        <DescriptorItem label="TPSA" value={`${descriptors.TPSA} Å²`} />
        <DescriptorItem label="Molar Refractivity" value={descriptors.MolMR} />
      </DescriptorGroup>
      
      <DescriptorGroup title="Structural Features">
        <DescriptorItem label="Rotatable Bonds" value={descriptors.RotatableBondCount} />
        <DescriptorItem label="H-Bond Donors" value={descriptors.HBondDonorCount} />
        <DescriptorItem label="H-Bond Acceptors" value={descriptors.HBondAcceptorCount} />
        <DescriptorItem label="Ring Count" value={descriptors.RingCount} />
        <DescriptorItem label="Aromatic Rings" value={descriptors.AromaticRingCount} />
      </DescriptorGroup>
      
      <DescriptorGroup title="Drug-likeness">
        <DescriptorItem label="QED Score" value={descriptors.QEDScore} />
        <DescriptorItem 
          label="Lipinski Violations" 
          value={descriptors.LipinskiViolations > 0 ? 
            `${descriptors.LipinskiViolations}` : 
            '0 (passes)'
          } 
        />
      </DescriptorGroup>
      
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
        <h3 className="text-lg font-medium mb-2">SMILES String</h3>
        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md overflow-x-auto">
          <code className="text-sm">{smiles}</code>
        </div>
      </div>
    </div>
  );
};

export default DescriptorPanel;