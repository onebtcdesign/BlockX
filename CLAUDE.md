# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BlockSlice is a web-based image slicing tool built with React, TypeScript, and Vite. It allows users to upload images, divide them into customizable grids, and export selected slices as a ZIP archive. The app features interactive preview with pan/zoom controls, independent X/Y scaling, and supports both original aspect ratio and square crop modes.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (default: http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

### Core Components

- **App.tsx**: Root component managing global state (image info, grid settings, selection, processing state)
- **GridPreview**: Interactive canvas with mouse drag (pan) and wheel (zoom) controls. Renders the sliced grid overlay and handles cell selection
- **Sidebar**: Control panel for grid configuration (rows/cols), crop mode, independent X/Y scaling, format selection, and download trigger
- **ImageUploader**: Drag-and-drop file input with validation (max 10MB, supported formats: PNG/JPEG/WebP)

### Key Files

- **types.ts**: TypeScript interfaces for `ImageInfo`, `GridSettings`, `ProcessingState`
- **constants.ts**: Default settings and validation constants
- **utils/imageProcessing.ts**: Core slicing logic using Canvas API
  - `getViewportDimensions()`: Calculates output dimensions based on crop mode
  - `processAndDownload()`: Generates sliced images and packages them into a ZIP using JSZip

### State Management

All state is managed via React hooks in App.tsx:
- `imageInfo`: Current uploaded image metadata
- `settings`: Grid configuration (rows, cols, scaleX, scaleY, offsetX, offsetY, cropMode, format)
- `selectedIndices`: Set of selected cell indices for partial export
- `processingState`: Download progress tracking

### Transform System

The app uses a percentage-based transform system to maintain consistent behavior across window resizes:

- **scaleX/scaleY**: Independent horizontal/vertical scaling (0.5-3.0, 1.0 = 100%)
- **offsetX/offsetY**: Pan offset as percentage of viewport dimensions (-0.5 to 0.5 typical range)
- Transforms are applied in GridPreview.tsx using CSS `transform: translate(${offsetX * 100}%, ${offsetY * 100}%) scale(${scaleX}, ${scaleY})`
- Percentage-based positioning prevents the "cut bug" when the browser window is resized

### Slicing Logic

1. Calculate viewport dimensions based on crop mode (square = min(width, height), original = full dimensions)
2. Create master canvas at viewport size
3. Draw transformed image (with scale and offset) onto master canvas
4. Slice master canvas into grid cells (width/cols × height/rows)
5. Export selected or all cells to individual files
6. Package into ZIP with naming pattern: `{filename}_{row}_{col}.{ext}`

## Styling

- Tailwind CSS with custom Apple-inspired color palette (defined in tailwind.config.js)
- Custom colors: `apple-gray`, `apple-blue`, `apple-border`, `apple-text`, `apple-subtext`
- Responsive design with mobile-first breakpoints

## Important Notes

- The app uses import maps in index.html to load React 19 and other dependencies from CDN
- Images are processed entirely client-side using Canvas API
- File size limit is 10MB (MAX_FILE_SIZE_BYTES in constants.ts)
- Grid supports up to 20×20 cells
- Export formats: PNG (default), JPG, WebP
- Vercel Analytics is integrated for usage tracking
