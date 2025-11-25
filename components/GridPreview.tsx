import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GridSettings, ImageInfo } from '../types';
import { getViewportDimensions } from '../utils/imageProcessing';

interface GridPreviewProps {
  imageInfo: ImageInfo;
  settings: GridSettings;
  selectedIndices: Set<number>;
  onSelectionChange: (indices: Set<number>) => void;
  onSettingsChange?: (newSettings: Partial<GridSettings>) => void;
}

const GridPreview: React.FC<GridPreviewProps> = ({ 
  imageInfo, 
  settings, 
  selectedIndices, 
  onSelectionChange,
  onSettingsChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Interaction state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialOffset, setInitialOffset] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  // 1. Calculate Viewport Logical Dimensions
  const viewportDims = useMemo(() => {
    return getViewportDimensions(imageInfo.width, imageInfo.height, settings.cropMode);
  }, [imageInfo, settings.cropMode]);

  // UI Grid dimensions
  const blockWidth = Math.round(viewportDims.width / settings.cols);
  const blockHeight = Math.round(viewportDims.height / settings.rows);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setHasMoved(false);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialOffset({ x: settings.offsetX, y: settings.offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !onSettingsChange) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      setHasMoved(true);
    }

    // Convert screen pixel movement to image transformation
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Calculate scale ratio (Viewport Logical Width / Screen Rendered Width)
        const ratio = viewportDims.width / rect.width;
        
        onSettingsChange({
            offsetX: initialOffset.x + dx * ratio,
            offsetY: initialOffset.y + dy * ratio
        });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleGridClick = (index: number) => {
    // Only select if it was a click, not a drag
    if (hasMoved) return; 
    
    const newSet = new Set(selectedIndices);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    onSelectionChange(newSet);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [isDragging]);

  // 1x1 Transparent SVG for Square Mode Layout Driver
  const SQUARE_SVG_DATA = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiIHZpZXdCb3g9IjAgMCAxIDEiPjwvc3ZnPg==";

  return (
    <div className="flex flex-col h-full w-full select-none">
      
      {/* Container Area */}
      {/* Centering wrapper with padding */}
      <div className="flex-1 flex items-center justify-center min-h-0 w-full relative overflow-hidden bg-apple-gray/30 rounded-lg p-0 md:p-1">
        
        {/* The Viewport Wrapper */}
        <div 
            ref={containerRef}
            className="relative shadow-sm overflow-hidden bg-white flex items-center justify-center"
            style={{
                // We rely on the Phantom Image to drive dimensions now
                // This is more robust than aspect-ratio in flex containers
                maxWidth: '100%',
                maxHeight: '100%',
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
        >
            {/* PHANTOM DRIVER IMAGE (Invisible) */}
            {/* This ensures the container expands to the correct aspect ratio and fits within parent */}
            <img
                src={settings.cropMode === 'square' ? SQUARE_SVG_DATA : imageInfo.src}
                alt="layout-driver"
                className="opacity-0 pointer-events-none block"
                style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain'
                }}
            />

            {/* REAL IMAGE LAYER */}
            {/* Absolutely positioned over the driver */}
            <img 
                src={imageInfo.src}
                alt="preview"
                draggable={false}
                className="absolute inset-0 w-full h-full pointer-events-none select-none"
                style={{
                    // FIX: use 'contain' instead of 'fill' for original mode to prevent vertical stretching/compression
                    objectFit: settings.cropMode === 'square' ? 'cover' : 'contain', 
                    transform: `translate(${settings.offsetX}px, ${settings.offsetY}px) scale(${settings.scale})`,
                    transformOrigin: 'center',
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                }}
            />
            
            {/* GRID OVERLAY */}
            <div 
                className="absolute inset-0 grid z-20"
                style={{
                    gridTemplateColumns: `repeat(${settings.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${settings.rows}, 1fr)`,
                }}
            >
                {Array.from({ length: settings.rows * settings.cols }).map((_, i) => {
                    const isSelected = selectedIndices.has(i);
                    return (
                        <div
                            key={i}
                            onMouseUp={() => handleGridClick(i)}
                            className={`
                                relative border border-dashed border-red-500/60 
                                transition-colors duration-75
                                hover:bg-red-500/10
                                ${isSelected ? 'bg-red-500/20 ring-1 ring-inset ring-red-500 border-solid' : ''}
                            `}
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
      <div className="flex-shrink-0 mt-2 pt-2 border-t border-apple-border/40 flex items-center justify-between text-[10px] md:text-xs text-apple-subtext px-2">
        <div className="flex items-center gap-3">
            <span>原图: {imageInfo.width}×{imageInfo.height}</span>
            <span className="text-apple-text/80">
                {hasMoved || settings.scale !== 1 ? '(已调整)' : ''}
            </span>
        </div>
        <div className="font-medium text-apple-text">
          单块: {blockWidth} × {blockHeight}px
        </div>
      </div>
    </div>
  );
};

export default GridPreview;