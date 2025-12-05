/**
 * Image viewer component - displays image with zoom and annotation overlay.
 *
 * Supports multiple tool calls with different colors per action type,
 * crosshair indicators, and tolerance boxes.
 *
 * Copyright (c) 2025 Tylt LLC. All Rights Reserved.
 */

'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/ui/primitives/components/button.component';
import type { ToolCall } from '@/domain/datasets/value-objects/tool-call.value-object';
import { getActionColor } from '@/domain/datasets/value-objects/tool-call.value-object';

interface ImageViewerProps {
  imageSrc: string | null;
  toolCall: ToolCall | null;
  imageSize?: [number, number];
  tolerance?: [number, number];
}

const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4];
const DEFAULT_ZOOM_INDEX = 3;

interface AnnotationParams {
  ctx: CanvasRenderingContext2D;
  toolCall: ToolCall;
  imageSize: [number, number];
  scale: number;
  offset: [number, number];
  tolerance?: [number, number];
}

/** Draw a single tool call annotation */
function drawAnnotation(params: AnnotationParams): void {
  const { ctx, toolCall, imageSize, scale, offset, tolerance } = params;
  const { action, coordinate, pixels, text } = toolCall.arguments;
  const color = getActionColor(action);

  // Convert RU (0-1000) to display coordinates
  const ruScale = 1000 / Math.max(imageSize[0], imageSize[1]);

  ctx.save();

  if (coordinate) {
    const pixelX = coordinate[0] / ruScale;
    const pixelY = coordinate[1] / ruScale;
    const displayX = pixelX * scale + offset[0];
    const displayY = pixelY * scale + offset[1];

    // Draw tolerance box if provided
    if (tolerance) {
      const tolW = (tolerance[0] / ruScale) * scale;
      const tolH = (tolerance[1] / ruScale) * scale;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(
        displayX - tolW / 2,
        displayY - tolH / 2,
        tolW,
        tolH
      );
      ctx.setLineDash([]);
    }

    // Draw based on action type
    if (action.includes('click') || action === 'mouse_move') {
      drawCrosshair(ctx, displayX, displayY, color);
    } else if (action === 'scroll' || action === 'hscroll') {
      drawScrollArrow(ctx, displayX, displayY, color, action, pixels ?? 0);
    } else if (action === 'left_click_drag') {
      drawDragIndicator(ctx, displayX, displayY, color);
    }
  }

  // Draw text indicator for type action
  if (action === 'type' && text) {
    ctx.fillStyle = color;
    ctx.font = 'bold 12px monospace';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 3;
    const displayText = text.length > 30 ? text.slice(0, 30) + '...' : text;
    ctx.fillText(`type: "${displayText}"`, offset[0] + 10, offset[1] + 24);
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

function drawCrosshair(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string
): void {
  const crossSize = 20;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  // Crosshair lines
  ctx.beginPath();
  ctx.moveTo(x - crossSize, y);
  ctx.lineTo(x + crossSize, y);
  ctx.moveTo(x, y - crossSize);
  ctx.lineTo(x, y + crossSize);
  ctx.stroke();

  // Center dot
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawScrollArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  action: string,
  pixels: number
): void {
  const isHorizontal = action === 'hscroll';
  const direction = pixels > 0 ? 1 : -1;
  const arrowLen = 35;
  const headSize = 12;

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;

  ctx.beginPath();
  if (isHorizontal) {
    ctx.moveTo(x - arrowLen * direction, y);
    ctx.lineTo(x + arrowLen * direction, y);
    // Arrowhead
    ctx.lineTo(x + (arrowLen - headSize) * direction, y - headSize);
    ctx.moveTo(x + arrowLen * direction, y);
    ctx.lineTo(x + (arrowLen - headSize) * direction, y + headSize);
  } else {
    ctx.moveTo(x, y - arrowLen * direction);
    ctx.lineTo(x, y + arrowLen * direction);
    // Arrowhead
    ctx.lineTo(x - headSize, y + (arrowLen - headSize) * direction);
    ctx.moveTo(x, y + arrowLen * direction);
    ctx.lineTo(x + headSize, y + (arrowLen - headSize) * direction);
  }
  ctx.stroke();
}

function drawDragIndicator(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  // Draw start point
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.stroke();

  // Draw drag arrow
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 30, y + 20);
  ctx.stroke();

  // Arrowhead
  ctx.beginPath();
  ctx.moveTo(x + 30, y + 20);
  ctx.lineTo(x + 20, y + 15);
  ctx.moveTo(x + 30, y + 20);
  ctx.lineTo(x + 25, y + 10);
  ctx.stroke();
}

export function ImageViewer({
  imageSrc,
  toolCall,
  imageSize,
  tolerance
}: ImageViewerProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);

  // Pan state for click-drag navigation
  const [pan, setPan] = useState<[number, number]>([0, 0]);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<[number, number]>([0, 0]);
  const panStartRef = useRef<[number, number]>([0, 0]);

  const zoom = ZOOM_LEVELS[zoomIndex];

  // Load image and reset pan
  useEffect(() => {
    if (!imageSrc) {
      setLoadedImage(null);
      return;
    }

    // Reset pan when image changes
    setPan([0, 0]);

    const img = new Image();
    img.onload = () => setLoadedImage(img);
    img.onerror = () => setLoadedImage(null);
    img.src = imageSrc;
  }, [imageSrc]);

  // Draw canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !loadedImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to container
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate scale to fit image in container
    const fitScale = Math.min(
      canvas.width / loadedImage.width,
      canvas.height / loadedImage.height
    );

    // At 100% zoom (1.0), don't scale beyond natural size
    // Only scale up when zoom > 1.0
    const maxFitScale = zoom <= 1 ? Math.min(fitScale, 1) : fitScale;
    const scale = maxFitScale * zoom;

    // Center image with pan offset
    const scaledWidth = loadedImage.width * scale;
    const scaledHeight = loadedImage.height * scale;
    const offsetX = (canvas.width - scaledWidth) / 2 + pan[0];
    const offsetY = (canvas.height - scaledHeight) / 2 + pan[1];

    // Draw image
    ctx.drawImage(loadedImage, offsetX, offsetY, scaledWidth, scaledHeight);

    // Draw annotation
    const imgSize = imageSize ?? [loadedImage.width, loadedImage.height];
    if (toolCall) {
      drawAnnotation({
        ctx,
        toolCall,
        imageSize: imgSize,
        scale,
        offset: [offsetX, offsetY],
        tolerance
      });
    }
  }, [loadedImage, zoom, pan, toolCall, imageSize, tolerance]);

  // Redraw on changes
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Redraw on resize
  useEffect(() => {
    const handleResize = (): void => {
      drawCanvas();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawCanvas]);

  const handleZoomOut = (): void => {
    setZoomIndex((i) => Math.max(0, i - 1));
    setPan([0, 0]); // Reset pan on zoom change
  };

  const handleZoomFit = (): void => {
    setZoomIndex(DEFAULT_ZOOM_INDEX);
    setPan([0, 0]); // Reset pan on zoom reset
  };

  const handleZoomIn = (): void => {
    setZoomIndex((i) => Math.min(ZOOM_LEVELS.length - 1, i + 1));
  };

  // Mouse handlers for click-drag panning
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>): void => {
    // Only enable panning when zoomed in beyond fit
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStartRef.current = [e.clientX, e.clientY];
    panStartRef.current = pan;
  }, [zoom, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>): void => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current[0];
    const dy = e.clientY - dragStartRef.current[1];
    setPan([panStartRef.current[0] + dx, panStartRef.current[1] + dy]);
  }, [isDragging]);

  const handleMouseUp = useCallback((): void => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback((): void => {
    setIsDragging(false);
  }, []);

  return (
    <div className="relative flex-1 flex flex-col">
      <div ref={containerRef} className="flex-1 overflow-hidden bg-zinc-900 rounded-lg">
        <canvas
          ref={canvasRef}
          className={`w-full h-full ${zoom > 1 ? 'cursor-grab' : ''} ${isDragging ? 'cursor-grabbing' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        />
        {!loadedImage && imageSrc && (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
            Loading image...
          </div>
        )}
        {!imageSrc && (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
            Select a dataset to view records
          </div>
        )}
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-zinc-800 rounded-lg p-1">
        <Button variant="ghost" size="sm" onClick={handleZoomOut} disabled={zoomIndex === 0}>
          −
        </Button>
        <Button variant="ghost" size="sm" onClick={handleZoomFit}>
          {Math.round(zoom * 100)}%
        </Button>
        <Button variant="ghost" size="sm" onClick={handleZoomIn} disabled={zoomIndex === ZOOM_LEVELS.length - 1}>
          +
        </Button>
      </div>

      {/* Action legend */}
      {toolCall && (
        <div className="absolute top-4 left-4 bg-zinc-800/90 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getActionColor(toolCall.arguments.action) }}
            />
            <span className="text-xs text-zinc-300 font-medium">
              {toolCall.arguments.action}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
