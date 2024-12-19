import React, { useEffect, useRef, useState } from 'react';
import { useDrawStore, DrawingShape } from '../../shared/store';
import '../styles/cursors.css';

interface Point {
  x: number;
  y: number;
}

export const DrawingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tempCanvasState = useRef<HTMLCanvasElement | null>(null);
  const [isPainting, setIsPainting] = useState(false);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);
  const { currentTool, color, lineWidth, isDrawing, currentShape, setCurrentShape } = useDrawStore();

  const getCursorClass = () => {
    if (!isDrawing) return 'cursor-default';
    if (currentTool === 'eraser') return 'cursor-eraser';
    return 'cursor-pencil';
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const { width, height } = window.screen;
      const ctx = canvas.getContext('2d');
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx && ctx) {
        tempCtx.drawImage(canvas, 0, 0);
      }

      canvas.width = width;
      canvas.height = height;
      
      if (ctx && tempCtx) {
        ctx.drawImage(tempCanvas, 0, 0);
        setupContext(ctx);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const setupContext = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const point = getCanvasPoint(e);
    setIsPainting(true);
    setLastPoint(point);

    if (currentTool === 'rectangle' || currentTool === 'circle' || currentTool === 'arrow') {
      setCurrentShape({
        type: currentTool,
        startX: point.x,
        startY: point.y,
        endX: point.x,
        endY: point.y,
      });
      tempCanvasState.current = null;
    }
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number) => {
    const headLength = 20;
    const dx = endX - startX;
    const dy = endY - startY;
    const angle = Math.atan2(dy, dx);
    
    // Draw the main line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // Draw the arrow head
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - headLength * Math.cos(angle - Math.PI / 6),
      endY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - headLength * Math.cos(angle + Math.PI / 6),
      endY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  const drawShape = (ctx: CanvasRenderingContext2D, shape: DrawingShape) => {
    const { startX, startY, endX = startX, endY = startY } = shape;
    
    ctx.beginPath();
    switch (shape.type) {
      case 'rectangle':
        ctx.rect(startX, startY, endX - startX, endY - startY);
        ctx.stroke();
        break;
      case 'circle':
        const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        ctx.arc(startX, startY, radius, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'arrow':
        drawArrow(ctx, startX, startY, endX, endY);
        break;
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPainting || !isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const currentPoint = getCanvasPoint(e);

    if (currentTool === 'pen' || currentTool === 'eraser') {
      if (!lastPoint) return;
      
      setupContext(ctx);
      
      if (currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      }

      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();

      if (currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'source-over';
      }
      
      setLastPoint(currentPoint);
    } else if (currentShape) {
      if (!tempCanvasState.current) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.drawImage(canvas, 0, 0);
          tempCanvasState.current = tempCanvas;
        }
      }

      // Clear the canvas and restore the previous state
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (tempCanvasState.current) {
        ctx.drawImage(tempCanvasState.current, 0, 0);
      }

      // Draw the current shape
      setupContext(ctx);
      setCurrentShape({
        ...currentShape,
        endX: currentPoint.x,
        endY: currentPoint.y,
      });
      drawShape(ctx, { ...currentShape, endX: currentPoint.x, endY: currentPoint.y });
    }
  };

  const endDrawing = () => {
    setIsPainting(false);
    setLastPoint(null);
    setCurrentShape(null);
    tempCanvasState.current = null;
  };

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 ${getCursorClass()}`}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={endDrawing}
      onMouseLeave={endDrawing}
    />
  );
};
