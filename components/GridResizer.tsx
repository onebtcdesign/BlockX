import React, { useState, useRef } from 'react';
import { GripVertical, GripHorizontal } from 'lucide-react';

interface GridResizerProps {
  rows: number;
  cols: number;
  onGridChange: (rows: number, cols: number) => void;
}

/**
 * Interactive grid resizer overlay
 * Allows users to drag to adjust grid dimensions
 */
const GridResizer: React.FC<GridResizerProps> = ({ rows, cols, onGridChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'rows' | 'cols' | null>(null);
  const [tempValue, setTempValue] = useState<number | null>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startValueRef = useRef(0);

  const handleMouseDown = (type: 'rows' | 'cols', e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragType(type);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startValueRef.current = type === 'rows' ? rows : cols;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dragType) return;

    const delta = dragType === 'rows'
      ? (e.clientY - startPosRef.current.y) / 50  // Sensitivity adjustment
      : (e.clientX - startPosRef.current.x) / 50;

    const newValue = Math.max(1, Math.min(20, Math.round(startValueRef.current + delta)));
    setTempValue(newValue);
  };

  const handleMouseUp = () => {
    if (tempValue !== null && dragType) {
      if (dragType === 'rows') {
        onGridChange(tempValue, cols);
      } else {
        onGridChange(rows, tempValue);
      }
    }
    setIsDragging(false);
    setDragType(null);
    setTempValue(null);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragType, tempValue]);

  const displayRows = tempValue !== null && dragType === 'rows' ? tempValue : rows;
  const displayCols = tempValue !== null && dragType === 'cols' ? tempValue : cols;

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {/* Row adjuster - Right edge */}
      <div
        className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-auto cursor-row-resize hover:bg-apple-blue/10 transition-colors group"
        onMouseDown={(e) => handleMouseDown('rows', e)}
      >
        <div className="flex flex-col items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-3 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
          <GripHorizontal size={16} className="text-apple-blue" />
          <span className="text-xs font-semibold text-apple-text">{displayRows}</span>
          <span className="text-[9px] text-apple-subtext">行</span>
        </div>
      </div>

      {/* Column adjuster - Bottom edge */}
      <div
        className="absolute bottom-0 left-0 right-0 h-12 flex items-center justify-center pointer-events-auto cursor-col-resize hover:bg-apple-blue/10 transition-colors group"
        onMouseDown={(e) => handleMouseDown('cols', e)}
      >
        <div className="flex flex-row items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical size={16} className="text-apple-blue" />
          <span className="text-xs font-semibold text-apple-text">{displayCols}</span>
          <span className="text-[9px] text-apple-subtext">列</span>
        </div>
      </div>

      {/* Active drag feedback */}
      {isDragging && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-apple-blue text-white px-6 py-3 rounded-xl shadow-2xl text-lg font-bold z-50 pointer-events-none">
          {displayRows} × {displayCols}
        </div>
      )}
    </div>
  );
};

export default GridResizer;
