export type ExportFormat = 'png' | 'jpg' | 'webp';
export type CropMode = 'original' | 'square';
export type SquareFit = 'center' | 'stretch';

export interface ImageInfo {
  src: string;
  file: File;
  width: number;
  height: number;
  originalName: string;
}

export interface GridSettings {
  rows: number;
  cols: number;
  format: ExportFormat;
  cropMode: CropMode;
  squareFit: SquareFit;
  // Transformed properties
  // scaleX/Y: Multiplier (1 = 100%)
  scaleX: number;
  scaleY: number;
  // offsetX/Y: Percentage of viewport width/height (-0.5 to 0.5 usually)
  offsetX: number;
  offsetY: number;
  // Padding (margin) settings in pixels
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  // File naming
  filePrefix: string;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number; // 0-100
  error: string | null;
}