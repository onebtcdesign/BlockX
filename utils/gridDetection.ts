/**
 * Analyzes an image and suggests optimal grid dimensions
 * Based on image aspect ratio and common grid patterns
 */

export interface GridSuggestion {
  rows: number;
  cols: number;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

/**
 * Suggests grid dimensions based on image aspect ratio and size
 */
export const suggestGridDimensions = (width: number, height: number): GridSuggestion => {
  const aspectRatio = width / height;
  const totalPixels = width * height;

  // Common aspect ratios and their typical use cases
  if (Math.abs(aspectRatio - 1) < 0.1) {
    // Square image (1:1)
    if (totalPixels > 2000 * 2000) {
      return { rows: 4, cols: 4, confidence: 'high', reason: '大尺寸方形图片，建议 4×4 网格' };
    }
    return { rows: 3, cols: 3, confidence: 'high', reason: '方形图片，建议 3×3 网格' };
  }

  if (aspectRatio > 2) {
    // Wide panoramic (e.g., 3:1, 4:1)
    const suggestedCols = Math.min(Math.round(aspectRatio * 2), 8);
    return { rows: 2, cols: suggestedCols, confidence: 'medium', reason: '宽幅图片，建议横向切割' };
  }

  if (aspectRatio < 0.5) {
    // Tall vertical image
    const suggestedRows = Math.min(Math.round((1 / aspectRatio) * 2), 8);
    return { rows: suggestedRows, cols: 2, confidence: 'medium', reason: '竖幅图片，建议纵向切割' };
  }

  if (aspectRatio > 1.3 && aspectRatio < 1.8) {
    // 16:9 or similar landscape
    return { rows: 3, cols: 4, confidence: 'high', reason: '16:9 横向图片，建议 3×4 网格' };
  }

  if (aspectRatio > 0.5 && aspectRatio < 0.8) {
    // Portrait orientation (e.g., 3:4, 9:16)
    return { rows: 4, cols: 3, confidence: 'high', reason: '9:16 竖向图片，建议 4×3 网格' };
  }

  // Default fallback based on orientation
  if (aspectRatio > 1) {
    return { rows: 3, cols: 4, confidence: 'low', reason: '横向图片，默认 3×4 网格' };
  } else {
    return { rows: 4, cols: 3, confidence: 'low', reason: '竖向图片，默认 4×3 网格' };
  }
};

/**
 * Advanced grid detection using edge detection
 * This analyzes pixel data to detect grid lines
 */
export const detectGridLines = async (imageElement: HTMLImageElement): Promise<GridSuggestion | null> => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Downsample for performance
    const maxDim = 800;
    const scale = Math.min(1, maxDim / Math.max(imageElement.width, imageElement.height));
    canvas.width = imageElement.width * scale;
    canvas.height = imageElement.height * scale;

    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Detect vertical and horizontal edges
    const verticalEdges = detectEdges(data, canvas.width, canvas.height, 'vertical');
    const horizontalEdges = detectEdges(data, canvas.width, canvas.height, 'horizontal');

    // Find regular patterns in edge positions
    const cols = findRegularPattern(verticalEdges, canvas.width);
    const rows = findRegularPattern(horizontalEdges, canvas.height);

    if (cols > 1 && rows > 1 && cols <= 10 && rows <= 10) {
      return {
        rows,
        cols,
        confidence: 'high',
        reason: `检测到 ${rows}×${cols} 网格线`
      };
    }

    return null;
  } catch (error) {
    console.error('Grid detection failed:', error);
    return null;
  }
};

/**
 * Detect edges in a specific direction
 */
const detectEdges = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  direction: 'vertical' | 'horizontal'
): number[] => {
  const edges: number[] = [];
  const threshold = 40; // Edge detection threshold

  if (direction === 'vertical') {
    for (let x = 1; x < width - 1; x++) {
      let edgeStrength = 0;
      for (let y = 0; y < height; y++) {
        const idx = (y * width + x) * 4;
        const prevIdx = (y * width + (x - 1)) * 4;
        const nextIdx = (y * width + (x + 1)) * 4;

        // Calculate gradient
        const gradient = Math.abs(
          (data[nextIdx] - data[prevIdx]) +
          (data[nextIdx + 1] - data[prevIdx + 1]) +
          (data[nextIdx + 2] - data[prevIdx + 2])
        ) / 3;

        if (gradient > threshold) edgeStrength++;
      }
      if (edgeStrength > height * 0.3) edges.push(x);
    }
  } else {
    for (let y = 1; y < height - 1; y++) {
      let edgeStrength = 0;
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const prevIdx = ((y - 1) * width + x) * 4;
        const nextIdx = ((y + 1) * width + x) * 4;

        const gradient = Math.abs(
          (data[nextIdx] - data[prevIdx]) +
          (data[nextIdx + 1] - data[prevIdx + 1]) +
          (data[nextIdx + 2] - data[prevIdx + 2])
        ) / 3;

        if (gradient > threshold) edgeStrength++;
      }
      if (edgeStrength > width * 0.3) edges.push(y);
    }
  }

  return edges;
};

/**
 * Find regular patterns in edge positions
 */
const findRegularPattern = (edges: number[], dimension: number): number => {
  if (edges.length < 2) return 1;

  // Calculate distances between consecutive edges
  const distances: number[] = [];
  for (let i = 1; i < edges.length; i++) {
    distances.push(edges[i] - edges[i - 1]);
  }

  // Find the most common distance (mode)
  const distanceMap = new Map<number, number>();
  const tolerance = dimension * 0.05; // 5% tolerance

  distances.forEach(dist => {
    let found = false;
    for (const [key, count] of distanceMap) {
      if (Math.abs(dist - key) < tolerance) {
        distanceMap.set(key, count + 1);
        found = true;
        break;
      }
    }
    if (!found) {
      distanceMap.set(dist, 1);
    }
  });

  // Find most frequent distance
  let maxCount = 0;
  let commonDistance = 0;
  for (const [dist, count] of distanceMap) {
    if (count > maxCount) {
      maxCount = count;
      commonDistance = dist;
    }
  }

  // Calculate grid count based on common distance
  if (commonDistance > 0 && maxCount >= 2) {
    const gridCount = Math.round(dimension / commonDistance);
    return Math.max(1, Math.min(10, gridCount));
  }

  return 1;
};
