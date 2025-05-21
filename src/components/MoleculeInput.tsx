import React, { useState } from 'react';
import { useMoleculeStore } from '../hooks/useMoleculeStore';

const MoleculeInput = () => {
  const { 
    inputValue, 
    setInputValue, 
    renderMolecule, 
    isLoading,
    showHydrogens,
    setShowHydrogens
  } = useMoleculeStore();
  
  const examples = [
    { name: 'Ethanol', smiles: 'CCO' },
    { name: 'Caffeine', smiles: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C' },
    { name: 'Aspirin', smiles: 'CC(=O)OC1=CC=CC=C1C(=O)O' }
  ];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    renderMolecule();
  };
  
  const handleExampleClick = (smiles: string) => {
    setInputValue(smiles);
    renderMolecule();
  };
  
  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-grow">
            <label htmlFor="smiles-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              SMILES or InChI String
            </label>
            <input
              id="smiles-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter a SMILES or InChI string (e.g., CCO for ethanol)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 dark:bg-primary-700 dark:hover:bg-primary-600"
            >
              {isLoading ? 'Rendering...' : 'Render'}
            </button>
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            id="show-hydrogens"
            type="checkbox"
            checked={showHydrogens}
            onChange={(e) => setShowHydrogens(e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="show-hydrogens" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Show hydrogen atoms
          </label>
        </div>
      </form>
      
      <div className="mt-4">
        <span className="text-sm text-gray-700 dark:text-gray-300 mr-2">Examples:</span>
        <div className="flex flex-wrap gap-2 mt-1">
          {examples.map((example) => (
            <button
              key={example.name}
              onClick={() => handleExampleClick(example.smiles)}
              className="text-sm px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {example.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoleculeInput;