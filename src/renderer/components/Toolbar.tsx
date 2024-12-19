import React from 'react';
import { Tool, useDrawStore } from '../../shared/store';

export const Toolbar: React.FC = () => {
  const {
    currentTool,
    color,
    lineWidth,
    isExpanded,
    toolbarPosition,
    setTool,
    setColor,
    setLineWidth,
    setExpanded,
    setToolbarPosition,
    setDragging,
  } = useDrawStore();

  const tools: { id: Tool; icon: string; label: string }[] = [
    { id: 'pen', icon: '✏️', label: 'Draw' },
    { id: 'rectangle', icon: '⬜', label: 'Rectangle' },
    { id: 'circle', icon: '⭕', label: 'Circle' },
    { id: 'arrow', icon: '➡️', label: 'Arrow' },
    { id: 'eraser', icon: '🧹', label: 'Eraser' },
  ];

  const colors = [
    '#000000', // Black
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFFFFF', // White
  ];

  const startDrag = (e: React.MouseEvent) => {
    // Don't start dragging if clicking on interactive elements
    if (
      e.target instanceof HTMLButtonElement ||
      e.target instanceof HTMLInputElement ||
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('input')
    ) {
      return;
    }

    e.preventDefault();
    const startX = e.pageX - toolbarPosition.x;
    const startY = e.pageY - toolbarPosition.y;
    setDragging(true);

    const onMouseMove = (e: MouseEvent) => {
      setToolbarPosition({
        x: Math.max(0, Math.min(window.innerWidth - 300, e.pageX - startX)),
        y: Math.max(0, Math.min(window.innerHeight - 400, e.pageY - startY)),
      });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      setDragging(false);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  if (!isExpanded) {
    return (
      <div
        className="fixed flex items-center gap-2 bg-black/80 backdrop-blur-lg rounded-full p-1.5 cursor-move"
        style={{ top: `${toolbarPosition.y}px`, left: `${toolbarPosition.x}px` }}
        onMouseDown={startDrag}
      >
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
          onClick={() => setExpanded(true)}
          title="Expand toolbar"
        >
          🎨
        </button>
      </div>
    );
  }

  return (
    <div
      className="fixed flex items-center gap-2 bg-black/80 backdrop-blur-lg rounded-full p-1.5 cursor-move"
      style={{ top: `${toolbarPosition.y}px`, left: `${toolbarPosition.x}px` }}
      onMouseDown={startDrag}
    >
      {/* Tools */}
      <div className="flex items-center gap-1 relative">
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              currentTool === tool.id
                ? 'bg-white/20 text-white scale-110'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
            onClick={() => setTool(tool.id)}
            title={tool.label}
          >
            <span className="text-lg">{tool.icon}</span>
          </button>
        ))}

        {/* Vertical separator */}
        <div className="w-px h-6 bg-white/20 mx-1" />

        {/* Color buttons */}
        <div className="flex gap-1">
          {colors.map((c) => (
            <button
              key={c}
              className={`w-6 h-6 rounded-full transition-all duration-200 ${
                color === c ? 'scale-110 ring-2 ring-white' : 'hover:scale-105'
              }`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
              title={`Use ${c} color`}
            />
          ))}
        </div>

        {/* Vertical separator */}
        <div className="w-px h-6 bg-white/20 mx-1" />

        {/* Line width */}
        <input
          type="range"
          min="1"
          max="20"
          value={lineWidth}
          defaultValue="10"
          onChange={(e) => setLineWidth(Number(e.target.value))}
          className="w-24 accent-white"
          title={`Line width: ${lineWidth}px`}
        />

        {/* Collapse button */}
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
          onClick={() => setExpanded(false)}
          title="Collapse toolbar"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
