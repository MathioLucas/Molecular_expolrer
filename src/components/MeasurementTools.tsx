import React from 'react';
import { useMeasurements } from '../hooks/useMeasurements';

const MeasurementTools = () => {
  const { mode, setMode, clearSelection, measurementResult } = useMeasurements();
  
  const tools = [
    { id: 'none', label: 'No Measurement', icon: '⬛' },
    { id: 'distance', label: 'Distance (2 atoms)', icon: '📏' },
    { id: 'angle', label: 'Angle (3 atoms)', icon: '📐' },
    { id: 'dihedral', label: 'Dihedral (4 atoms)', icon: '🔄' }
  ];
  
  return (
    <div className="w-full">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Measurement Tools</h3>
          {mode !== 'none' && (
            <button
              onClick={clearSelection}
              className="text-sm px-2 py-1 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Clear selection
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setMode(tool.id as any)}
              className={`px-3 py-2 rounded-md text-sm flex items-center gap-1 ${
                mode === tool.id
                  ? 'bg-primary-600 text-white dark:bg-primary-700'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span>{tool.icon}</span>
              <span>{tool.label}</span>
            </button>
          ))}
        </div>
        
        {mode !== 'none' && (
          <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {mode === 'distance' && 'Click on two atoms to measure the distance between them.'}
              {mode === 'angle' && 'Click on three atoms in sequence to measure the angle.'}
              {mode === 'dihedral' && 'Click on four atoms in sequence to measure the dihedral angle.'}
            </p>
            
            {measurementResult !== null && (
              <p className="mt-2 font-medium">
                Result: {measurementResult.toFixed(2)}
                {mode === 'distance' ? ' Å' : '°'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeasurementTools;