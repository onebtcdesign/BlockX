import React from 'react';
import { GridSettings, ImageInfo, ProcessingState } from '../types';
import { Card } from './ui/Card';
import Button from './ui/Button';
import { Download, Grid, Crop, AlertCircle, ImageOff } from 'lucide-react';
import { processAndDownload } from '../utils/imageProcessing';

interface SidebarProps {
  imageInfo: ImageInfo | null;
  settings: GridSettings;
  setSettings: React.Dispatch<React.SetStateAction<GridSettings>>;
  onReset: () => void;
  selectedCount: number;
  totalSlices: number;
  processingState: ProcessingState;
  setProcessingState: React.Dispatch<React.SetStateAction<ProcessingState>>;
  selectedIndices: Set<number>;
}

const Sidebar: React.FC<SidebarProps> = ({
  imageInfo,
  settings,
  setSettings,
  selectedCount,
  totalSlices,
  processingState,
  setProcessingState,
  selectedIndices
}) => {
  const isDisabled = !imageInfo;

  const handleDownload = async () => {
    if (!imageInfo) return;

    setProcessingState({ isProcessing: true, progress: 0, error: null });
    try {
      await processAndDownload(
        imageInfo, 
        settings, 
        selectedIndices, 
        (p) => setProcessingState(prev => ({ ...prev, progress: p }))
      );
    } catch (e) {
      setProcessingState(prev => ({ ...prev, error: '下载失败，请重试。' }));
    } finally {
      setTimeout(() => {
        setProcessingState({ isProcessing: false, progress: 0, error: null });
      }, 1000);
    }
  };

  const handleInputChange = (field: keyof GridSettings, value: number | string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  // 减小了 flex gap 和 padding
  return (
    <div className={`flex flex-col gap-3 h-full md:overflow-y-auto pr-0 md:pr-1 pb-10 transition-opacity duration-300 ${isDisabled ? 'opacity-75' : 'opacity-100'}`}>
      
      {/* 1. Image Info Module */}
      <Card className="py-4 px-5">
        <div className="flex justify-between items-start">
          <div className="flex-1 overflow-hidden">
            <h4 className="font-semibold text-xs text-apple-subtext uppercase tracking-wider mb-1">图片来源</h4>
            {imageInfo ? (
              <>
                <p className="font-medium truncate text-sm text-apple-text" title={imageInfo.originalName}>
                  {imageInfo.originalName}
                </p>
                <p className="text-[10px] text-apple-subtext mt-0.5">
                  {imageInfo.width} × {imageInfo.height} px
                </p>
              </>
            ) : (
              <div className="flex items-center gap-2 text-apple-subtext py-1">
                <ImageOff size={16} />
                <span className="text-sm">等待上传...</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 2. Slicing Parameters */}
      <Card className="py-4 px-5">
         <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-xs text-apple-subtext uppercase tracking-wider flex items-center gap-2">
                <Grid size={14} /> 网格布局
            </h4>
         </div>
         
         <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
               <label className={`text-[10px] font-medium transition-colors ${isDisabled ? 'text-apple-subtext' : 'text-apple-text'}`}>列数 (横向)</label>
               <input 
                 type="number" 
                 min="1" 
                 max="20"
                 disabled={isDisabled}
                 value={settings.cols}
                 onChange={(e) => handleInputChange('cols', Math.max(1, parseInt(e.target.value) || 1))}
                 className="w-full px-2 py-2 bg-apple-gray rounded-lg text-center font-semibold text-base focus:outline-none focus:ring-2 focus:ring-apple-blue/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
               />
            </div>
            <div className="space-y-1">
               <label className={`text-[10px] font-medium transition-colors ${isDisabled ? 'text-apple-subtext' : 'text-apple-text'}`}>行数 (纵向)</label>
               <input 
                 type="number" 
                 min="1" 
                 max="20"
                 disabled={isDisabled}
                 value={settings.rows}
                 onChange={(e) => handleInputChange('rows', Math.max(1, parseInt(e.target.value) || 1))}
                 className="w-full px-2 py-2 bg-apple-gray rounded-lg text-center font-semibold text-base focus:outline-none focus:ring-2 focus:ring-apple-blue/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
               />
            </div>
         </div>

         <div className="mt-3 pt-3 border-t border-apple-border/40 flex justify-between items-center">
            <span className="text-xs text-apple-subtext">切片总数</span>
            <span className="font-semibold text-apple-text text-sm">{settings.cols * settings.rows}</span>
         </div>
      </Card>

      {/* 3. Crop & Format */}
      <Card className="py-4 px-5">
        <h4 className="font-semibold text-xs text-apple-subtext uppercase tracking-wider mb-3 flex items-center gap-2">
            <Crop size={14} /> 设置
         </h4>

         <div className="space-y-3">
            <div className="flex flex-col gap-1.5">
               <label className={`text-[10px] font-medium transition-colors ${isDisabled ? 'text-apple-subtext' : 'text-apple-text'}`}>裁剪模式</label>
               <div className="flex bg-apple-gray p-1 rounded-xl">
                  <button 
                    disabled={isDisabled}
                    onClick={() => handleInputChange('cropMode', 'original')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all disabled:cursor-not-allowed disabled:opacity-50 ${settings.cropMode === 'original' ? 'bg-white shadow-sm text-apple-text' : 'text-apple-subtext hover:text-apple-text'}`}
                  >
                    原比例
                  </button>
                  <button 
                    disabled={isDisabled}
                    onClick={() => handleInputChange('cropMode', 'square')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all disabled:cursor-not-allowed disabled:opacity-50 ${settings.cropMode === 'square' ? 'bg-white shadow-sm text-apple-text' : 'text-apple-subtext hover:text-apple-text'}`}
                  >
                    正方形
                  </button>
               </div>
            </div>

            <div className="flex flex-col gap-1.5">
               <label className={`text-[10px] font-medium transition-colors ${isDisabled ? 'text-apple-subtext' : 'text-apple-text'}`}>导出格式</label>
               <div className="flex bg-apple-gray p-1 rounded-xl">
                  {(['png', 'jpg', 'webp'] as const).map(fmt => (
                    <button 
                      key={fmt}
                      disabled={isDisabled}
                      onClick={() => handleInputChange('format', fmt)}
                      className={`flex-1 py-1.5 text-xs font-medium uppercase rounded-lg transition-all disabled:cursor-not-allowed disabled:opacity-50 ${settings.format === fmt ? 'bg-white shadow-sm text-apple-text' : 'text-apple-subtext hover:text-apple-text'}`}
                    >
                      {fmt}
                    </button>
                  ))}
               </div>
            </div>
         </div>
      </Card>

      {/* 4. Download Action */}
      <div className="mt-auto pt-2">
        {processingState.error && (
            <div className="mb-3 p-2 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={14} />
                {processingState.error}
            </div>
        )}

        <Button 
            onClick={handleDownload} 
            variant="primary" 
            className="w-full h-12 text-sm shadow-lg shadow-apple-blue/20"
            isLoading={processingState.isProcessing}
            disabled={isDisabled || processingState.isProcessing}
        >
            {!processingState.isProcessing && (
                <>
                    <Download size={18} className="mr-2" />
                    {selectedCount > 0 
                      ? `下载选中 (${selectedCount})` 
                      : `下载全部 (${totalSlices})`
                    }
                </>
            )}
        </Button>
        
        {processingState.isProcessing && (
            <div className="mt-3">
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-apple-blue transition-all duration-300 ease-out"
                        style={{ width: `${processingState.progress}%` }}
                    />
                </div>
                <p className="text-center text-[10px] text-apple-subtext mt-1">正在打包 ZIP... {processingState.progress}%</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;