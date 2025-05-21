import React, { useEffect, useRef } from 'react';

interface Molecule2DFallbackProps {
  smiles: string;
}

const Molecule2DFallback: React.FC<Molecule2DFallbackProps> = ({ smiles }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!smiles) return;
    
    // Generate a URL to get a 2D molecule image
    // This uses the NCI CACTUS service, but you could use any other service
    const imageUrl = `https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(smiles)}/image`;
    
    // Load the image and draw it on the canvas
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate the scale to fit the image
      const scale = Math.min(
        canvas.width / img.width,
        canvas.height / img.height
      ) * 0.9;
      
      // Calculate centered position
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;
      
      // Draw the image
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    };
    
    img.onerror = () => {
      // If the image fails to load, draw a message
            // If the image fails to load, draw a message
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = '16px Arial';
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Unable to load 2D structure', canvas.width / 2, canvas.height / 2 - 20);
      ctx.fillText(`SMILES: ${smiles}`, canvas.width / 2, canvas.height / 2 + 20);
    };
    
    // Start loading the image
    img.src = imageUrl;
    
    // Fallback in case the service is down
    const timeout = setTimeout(() => {
      if (!img.complete) {
        img.onerror(new Event('timeout'));
      }
    }, 5000);
    
    return () => {
      clearTimeout(timeout);
    };
  }, [smiles]);
  
  return (
    <div className="molecule-2d-fallback">
      <div className="mb-4 text-center text-lg font-medium">
        2D Structure (Fallback Mode)
      </div>
      <div className="border border-gray-300 rounded-lg p-2 bg-white">
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={300}
          className="w-full"
        />
      </div>
      <div className="mt-3 text-sm text-gray-500 text-center">
        <p>SMILES: {smiles}</p>
        <p className="mt-2">3D visualization is not available due to WebGL limitations.</p>
      </div>
    </div>
  );
};

export default Molecule2DFallback;