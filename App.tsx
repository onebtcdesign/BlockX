import React, { useState, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import GridPreview from './components/GridPreview';
import Sidebar from './components/Sidebar';
import { ImageInfo, GridSettings, ProcessingState } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { AlertCircle, Upload, CheckSquare, XSquare, RefreshCw } from 'lucide-react';
import Button from './components/ui/Button';

const App: React.FC = () => {
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [settings, setSettings] = useState<GridSettings>(DEFAULT_SETTINGS);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    error: null
  });
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Reset when new image loads
  const handleImageSelected = useCallback((info: ImageInfo) => {
    setImageInfo(info);
    setSettings(prev => ({ ...DEFAULT_SETTINGS, rows: prev.rows, cols: prev.cols }));
    setSelectedIndices(new Set());
    setGlobalError(null);
  }, []);

  const handleReset = () => {
    setImageInfo(null);
    setSelectedIndices(new Set());
    setProcessingState({ isProcessing: false, progress: 0, error: null });
  };

  const handleError = (msg: string) => {
    setGlobalError(msg);
    setTimeout(() => setGlobalError(null), 5000);
  };

  const handleSelectAll = () => {
    const total = settings.rows * settings.cols;
    const newSet = new Set<number>();
    for(let i = 0; i < total; i++) {
        newSet.add(i);
    }
    setSelectedIndices(newSet);
  };

  const handleSelectNone = () => {
    setSelectedIndices(new Set());
  };

  return (
    <div className="min-h-screen w-full bg-apple-gray p-2 md:p-4 flex items-center justify-center font-sans">
      <div className="w-full max-w-7xl flex flex-col md:flex-row gap-3 md:h-[90vh]">
        
        {/* Global Error Toast */}
        {globalError && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-md border border-red-200 text-red-600 px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
            <AlertCircle size={18} />
            <span className="font-medium text-sm">{globalError}</span>
          </div>
        )}

        {/* LEFT PANEL: Preview / Upload */}
        {/* Mobile: fixed height (50vh) or min-height. Desktop: full height. */}
        <div className="flex-1 bg-white rounded-[24px] md:rounded-[32px] border border-apple-border/60 p-3 md:p-5 shadow-sm relative overflow-hidden flex flex-col h-[55vh] md:h-full min-h-[400px]">
          
          {/* Header with Traffic Lights & Actions */}
          <div className="flex justify-between items-center mb-2 flex-shrink-0 min-h-[32px]">
             <div className="flex items-center gap-2">
               <div className="flex gap-1.5 mr-2">
                 <div className="w-3 h-3 rounded-full bg-red-400"></div>
                 <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                 <div className="w-3 h-3 rounded-full bg-green-400"></div>
               </div>
               <span className="text-xs font-medium text-apple-subtext uppercase tracking-widest hidden sm:inline-block">
                 预览
               </span>
             </div>

             {/* Top Actions (Moved from Sidebar) */}
             {imageInfo && (
               <div className="flex items-center gap-2">
                 <Button 
                   variant="ghost" 
                   onClick={handleSelectAll} 
                   className="h-7 px-2 text-xs flex items-center gap-1 hover:bg-gray-100 rounded-lg text-apple-text"
                   title="全选"
                 >
                   <CheckSquare size={14} />
                   <span className="hidden sm:inline">全选</span>
                 </Button>
                 <Button 
                   variant="ghost" 
                   onClick={handleSelectNone} 
                   className="h-7 px-2 text-xs flex items-center gap-1 hover:bg-gray-100 rounded-lg text-apple-text"
                   title="重置选中"
                 >
                   <XSquare size={14} />
                   <span className="hidden sm:inline">重置</span>
                 </Button>
                 <div className="w-px h-4 bg-gray-200 mx-1"></div>
                 <Button 
                   variant="ghost" 
                   onClick={handleReset} 
                   className="h-7 px-2 text-xs flex items-center gap-1 hover:bg-gray-100 rounded-lg text-apple-blue font-medium"
                   title="重新上传"
                 >
                   <Upload size={14} />
                   <span className="hidden sm:inline">重新上传</span>
                 </Button>
               </div>
             )}
          </div>

          <div className="flex-1 min-h-0 w-full relative">
            {imageInfo ? (
              <GridPreview 
                imageInfo={imageInfo}
                settings={settings}
                selectedIndices={selectedIndices}
                onSelectionChange={setSelectedIndices}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                 <div className="w-full max-w-md p-4">
                    <ImageUploader onImageSelected={handleImageSelected} onError={handleError} />
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Controls */}
        <div className="w-full md:w-[340px] flex-shrink-0 flex flex-col h-auto md:h-full">
           <Sidebar 
             imageInfo={imageInfo}
             settings={settings}
             setSettings={setSettings}
             onReset={handleReset} 
             selectedCount={selectedIndices.size}
             totalSlices={settings.rows * settings.cols}
             processingState={processingState}
             setProcessingState={setProcessingState}
             selectedIndices={selectedIndices}
           />
        </div>
      </div>
    </div>
  );
};

export default App;