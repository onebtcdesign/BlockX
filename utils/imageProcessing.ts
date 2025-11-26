import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { GridSettings, ImageInfo } from '../types';

/**
 * loads an image from a source string into an HTMLImageElement
 */
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

/**
 * Calculates the dimensions of the "Viewport" (The final output area)
 */
export const getViewportDimensions = (
  imgWidth: number,
  imgHeight: number,
  cropMode: string
) => {
  if (cropMode === 'square') {
    const minDim = Math.min(imgWidth, imgHeight);
    return { width: minDim, height: minDim };
  }
  return { width: imgWidth, height: imgHeight };
};

export const processAndDownload = async (
  imageInfo: ImageInfo,
  settings: GridSettings,
  selectedIndices: Set<number>,
  onProgress: (percent: number) => void
) => {
  const { src, originalName } = imageInfo;
  const { rows, cols, format, cropMode, scaleX, scaleY, offsetX, offsetY,
          paddingTop, paddingBottom, paddingLeft, paddingRight } = settings;

  try {
    const img = await loadImage(src);
    const zip = new JSZip();
    
    // 1. Determine Viewport Dimensions (The total size of the grid)
    const viewport = getViewportDimensions(img.width, img.height, cropMode);
    
    // 2. Create a canvas representing the Viewport
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Could not create canvas context");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // 3. Draw the image onto the viewport with transformations
    // Clear background
    ctx.clearRect(0, 0, viewport.width, viewport.height);
    
    // Calculate draw dimensions based on independent scales
    const drawWidth = img.width * scaleX;
    const drawHeight = img.height * scaleY;

    // Calculate centering offsets base
    // In both modes, we initially center the image in the viewport
    const baseX = (viewport.width - drawWidth) / 2;
    const baseY = (viewport.height - drawHeight) / 2;

    // Apply user pan offsets (converted from percentage to pixels)
    const finalX = baseX + (offsetX * viewport.width);
    const finalY = baseY + (offsetY * viewport.height);

    // Draw the processed image to the master canvas
    ctx.drawImage(img, finalX, finalY, drawWidth, drawHeight);

    // 4. Slice Generation
    // Calculate the usable area after excluding padding
    const usableWidth = viewport.width - paddingLeft - paddingRight;
    const usableHeight = viewport.height - paddingTop - paddingBottom;

    const sliceWidth = usableWidth / cols;
    const sliceHeight = usableHeight / rows;

    const totalSlices = rows * cols;
    const slicesToExport = selectedIndices.size > 0 
      ? Array.from(selectedIndices) 
      : Array.from({ length: totalSlices }, (_, i) => i);

    let processedCount = 0;

    const sliceCanvas = document.createElement('canvas');
    const sliceCtx = sliceCanvas.getContext('2d');
    if (!sliceCtx) throw new Error("Ctx error");

    sliceCanvas.width = sliceWidth;
    sliceCanvas.height = sliceHeight;

    for (const index of slicesToExport) {
      const row = Math.floor(index / cols);
      const col = index % cols;

      sliceCtx.clearRect(0, 0, sliceWidth, sliceHeight);

      // Draw from master canvas to slice canvas, starting from padding offset
      sliceCtx.drawImage(
        canvas,
        paddingLeft + col * sliceWidth, paddingTop + row * sliceHeight, sliceWidth, sliceHeight, // Source
        0, 0, sliceWidth, sliceHeight    // Dest
      );

      const blob = await new Promise<Blob | null>((resolve) => {
        const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
        sliceCanvas.toBlob(resolve, mimeType, 0.92);
      });

      if (blob) {
        const ext = format === 'jpg' ? 'jpg' : format;
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
        const filename = `${nameWithoutExt}_${row + 1}_${col + 1}.${ext}`;
        zip.file(filename, blob);
      }

      processedCount++;
      onProgress(Math.round((processedCount / slicesToExport.length) * 50)); 
    }

    onProgress(60);
    const content = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        onProgress(60 + Math.round(metadata.percent * 0.4));
    });

    onProgress(100);
    const zipName = `${originalName.substring(0, originalName.lastIndexOf('.')) || 'sliced'}_grid.zip`;
    
    const saveAs = (FileSaver as any).saveAs || FileSaver;
    saveAs(content, zipName);

  } catch (error) {
    console.error("Slice generation failed", error);
    throw error;
  }
};