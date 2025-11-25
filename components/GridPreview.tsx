import React, { useState, useEffect, useMemo } from 'react';
import { GridSettings, ImageInfo } from '../types';
import { getProcessedDimensions } from '../utils/imageProcessing';

interface GridPreviewProps {
  imageInfo: ImageInfo;
  settings: GridSettings;
  selectedIndices: Set<number>;
  onSelectionChange: (indices: Set<number>) => void;
}

const GridPreview: React.FC<GridPreviewProps> = ({ 
  imageInfo, 
  settings, 
  selectedIndices, 
  onSelectionChange 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'select' | 'deselect'>('select');

  // Calculate processed dimensions mainly for the text info at the bottom
  const processedDims = useMemo(() => {
    return getProcessedDimensions(imageInfo.width, imageInfo.height, settings.cropMode);
  }, [imageInfo, settings.cropMode]);

  const blockWidth = Math.round(processedDims.width / settings.cols);
  const blockHeight = Math.round(processedDims.height / settings.rows);

  const toggleSelection = (index: number, forceState?: boolean) => {
    const newSet = new Set(selectedIndices);
    const isSelected = newSet.has(index);
    const shouldSelect = forceState !== undefined ? forceState : !isSelected;

    if (shouldSelect) {
      newSet.add(index);
    } else {
      newSet.delete(index);
    }
    onSelectionChange(newSet);
  };

  const handleMouseDown = (index: number) => {
    setIsDragging(true);
    setDragMode(selectedIndices.has(index) ? 'deselect' : 'select');
    toggleSelection(index);
  };

  const handleMouseEnter = (index: number) => {
    if (isDragging) {
      toggleSelection(index, dragMode === 'select');
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Image Display Area */}
      <div className="flex-1 flex items-center justify-center min-h-0 w-full relative overflow-hidden p-0 md:p-1">
        <div className="relative inline-block shadow-sm" style={{ maxWidth: '100%', maxHeight: '100%' }}>
          
          {/* Main Image */}
          <img 
            src={imageInfo.src} 
            alt="Preview"
            draggable={false}
            className="block max-w-full max-h-full w-auto h-auto object-contain select-none"
            style={{
              // For square mode, we force the aspect ratio to 1:1 and cover the area (center crop simulation)
              aspectRatio: settings.cropMode === 'square' ? '1/1' : 'auto',
              objectFit: settings.cropMode === 'square' ? 'cover' : 'contain',
              // Dynamic height constraint: adapt to parent container
              maxHeight: '100%' 
            }}
          />

          {/* Grid Overlay - Positioned absolutely over the image */}
          <div 
            className="absolute inset-0 grid z-10"
            style={{
              gridTemplateColumns: `repeat(${settings.cols}, 1fr)`,
              gridTemplateRows: `repeat(${settings.rows}, 1fr)`,
            }}
            onMouseLeave={() => setIsDragging(false)}
          >
            {Array.from({ length: settings.rows * settings.cols }).map((_, i) => {
              const isSelected = selectedIndices.has(i);
              return (
                <div
                  key={i}
                  onMouseDown={() => handleMouseDown(i)}
                  onMouseEnter={() => handleMouseEnter(i)}
                  className={`
                    relative border border-dashed border-red-500/60 cursor-pointer 
                    transition-colors duration-75
                    hover:bg-red-500/10
                    ${isSelected ? 'bg-red-500/20 ring-1 ring-inset ring-red-500 z-20 border-solid' : ''}
                  `}
                  onDragStart={(e) => e.preventDefault()}
                >
                  {isSelected && (
                     <div className="absolute top-0.5 left-0.5 bg-red-500 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-sm font-bold">
                       ✓
                     </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="flex-shrink-0 mt-1 md:mt-2 pt-2 border-t border-apple-border/40 flex items-center justify-between text-[10px] md:text-xs text-apple-subtext px-1 md:px-2">
        <div className="flex gap-2 md:gap-4">
          <span>原始: {imageInfo.width} × {imageInfo.height}</span>
          <span>模式: {settings.cropMode === 'square' ? '正方形' : '原比例'}</span>
        </div>
        <div className="font-medium text-apple-text">
          单块: {blockWidth} × {blockHeight}px
        </div>
      </div>
    </div>
  );
};

export default GridPreview;