import React, { useState, useRef, useEffect } from 'react';

interface DrawingProps {
  isActive: boolean;
  workspaceId?: string;
  initialDrawingData?: string;
  onDrawingChange?: (drawingData: string) => void;
}

const FreeDrawing: React.FC<DrawingProps> = ({ 
  isActive, 
  workspaceId, 
  initialDrawingData, 
  onDrawingChange 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState({ x: 0, y: 0 });

  // Load initial drawing data from workspace
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;

    // Load initial drawing data if available
    if (initialDrawingData) {
      try {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = initialDrawingData;
      } catch (error) {
        console.error('Error loading initial drawing data:', error);
      }
    }
  }, [initialDrawingData, workspaceId]);

  // Save drawing data when canvas changes
  const saveDrawingData = () => {
    const canvas = canvasRef.current;
    if (!canvas || !onDrawingChange) return;

    const dataURL = canvas.toDataURL();
    onDrawingChange(dataURL);
  };

  const startDrawing = (e: React.MouseEvent) => {
    if (!isActive) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setLastPoint({ x, y });
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    setLastPoint({ x: currentX, y: currentY });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    saveDrawingData();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveDrawingData();
  };

  return (
    <div className={`absolute inset-0 ${isActive ? 'z-20' : 'z-0 pointer-events-none'}`}>
      {/* Clear Button */}
      {isActive && (
        <div className="absolute top-4 right-4 z-30">
          <button
            onClick={clearCanvas}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors backdrop-blur-sm bg-white bg-opacity-10 rounded-full border border-gray-200 border-opacity-30 hover:bg-opacity-20"
          >
            Clear
          </button>
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${isActive ? 'cursor-crosshair' : 'cursor-default'}`}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
};

export default FreeDrawing;
