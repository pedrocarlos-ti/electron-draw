import React, { useEffect } from 'react';
import { DrawingCanvas } from './components/DrawingCanvas';
import { Toolbar } from './components/Toolbar';
import { useDrawStore } from '../shared/store';

const App: React.FC = () => {
  const { isDrawing, setDrawing } = useDrawStore();

  useEffect(() => {
    // Listen for drawing mode changes from main process
    window.electron.onDrawingModeChanged((drawing) => {
      setDrawing(drawing);
    });

    // Listen for canvas clear command
    window.electron.onClearCanvas(() => {
      const canvas = document.querySelector('canvas');
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }
    });
  }, [setDrawing]);

  return (
    <div className={`h-screen w-screen overflow-hidden ${isDrawing ? 'drawing-mode' : ''}`}>
      <DrawingCanvas />
      {isDrawing && <Toolbar />}
    </div>
  );
};

export default App;
