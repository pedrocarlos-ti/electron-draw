import { create } from "zustand";

export type Tool = "pen" | "rectangle" | "circle" | "arrow" | "eraser";
export type DrawingShape = {
  type: Tool;
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
};

interface DrawStore {
  currentTool: Tool;
  color: string;
  lineWidth: number;
  isDrawing: boolean;
  isDragging: boolean;
  toolbarPosition: { x: number; y: number };
  isExpanded: boolean;
  currentShape: DrawingShape | null;
  setTool: (tool: Tool) => void;
  setColor: (color: string) => void;
  setLineWidth: (width: number) => void;
  setDrawing: (drawing: boolean) => void;
  setDragging: (dragging: boolean) => void;
  setToolbarPosition: (position: { x: number; y: number }) => void;
  setExpanded: (expanded: boolean) => void;
  setCurrentShape: (shape: DrawingShape | null) => void;
}

export const useDrawStore = create<DrawStore>((set) => ({
  currentTool: "pen",
  color: "#000000",
  lineWidth: 10,
  isDrawing: false,
  isDragging: false,
  toolbarPosition: { x: window.innerWidth / 2 - 300, y: 70 },
  isExpanded: false,
  currentShape: null,
  setTool: (tool) => set({ currentTool: tool }),
  setColor: (color) => set({ color }),
  setLineWidth: (width) => set({ lineWidth: width }),
  setDrawing: (drawing) => set({ isDrawing: drawing }),
  setDragging: (dragging) => set({ isDragging: dragging }),
  setToolbarPosition: (position) => set({ toolbarPosition: position }),
  setExpanded: (expanded) => set({ isExpanded: expanded }),
  setCurrentShape: (shape) => set({ currentShape: shape }),
}));
