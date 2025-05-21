import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMoleculeStore } from '../hooks/useMoleculeStore';

interface MoleculeCardProps {
  id: string;
  name: string;
  smiles: string;
  description: string;
}

const MoleculeCard = ({ id, name, smiles, description }: MoleculeCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [svgData, setSvgData] = useState<string | null>(null);
  const { setInputValue, renderMolecule } = useMoleculeStore();
  
  // Fetch 2D SVG representation on component mount
  React.useEffect(() => {
    const fetchSvg = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://127.0.0.1:8080/molecule', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            smiles: smiles,
            optimize_3d: false,
            include_hydrogens: false
          }),
        });
        
        const data = await response.json();
        if (data.success && data.svg) {
          setSvgData(data.svg);
        }
      } catch (error) {
        console.error('Error fetching SVG:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSvg();
  }, [smiles]);
  
  const handleViewClick = () => {
    setInputValue(smiles);
    // Redirect to home page and render the molecule
    window.location.href = '/';
    // This will run after redirect
    setTimeout(() => {
      renderMolecule();
    }, 100);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
      <div className="p-4">
        <h3 className="text-lg font-bold mb-1">{name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{description}</p>
        
        <div className="flex justify-center mb-3 h-32 bg-gray-100 dark:bg-gray-700 rounded-md p-2">
          {isLoading ? (
            <div className="flex items-center justify-center w-full h-full">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : svgData ? (
            <div dangerouslySetInnerHTML={{ __html: svgData }} />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <p className="text-gray-500">No preview available</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400 max-w-[180px] truncate">
            {smiles}
          </div>
          <button
            onClick={handleViewClick}
            className="px-3 py-1 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700"
          >
            View in 3D
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoleculeCard;