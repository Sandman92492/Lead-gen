import React from 'react';

interface ScribbleUnderlineProps {
  children: string;
  className?: string;
  color?: string;
}

const ScribbleUnderline: React.FC<ScribbleUnderlineProps> = ({ children, className = '', color = 'rgb(255, 165, 0)' }) => {
  // Generate a smooth wave-like path using cubic bezier curves
  const generateScribblePath = (length: number) => {
    const numWaves = Math.max(2, Math.floor(length / 8));
    const waveHeight = 2;
    const points: { x: number; y: number }[] = [];
    
    for (let i = 0; i <= numWaves * 4; i++) {
      const x = (i / (numWaves * 4)) * 100;
      const wavePhase = (i / (numWaves * 4)) * Math.PI * 2 * numWaves;
      const y = 3 + Math.sin(wavePhase) * waveHeight;
      points.push({ x, y });
    }
    
    // Generate smooth cubic bezier path
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const p2 = points[i + 1] || points[i];
      
      const cp1x = p0.x + (p1.x - p0.x) / 3;
      const cp1y = p0.y + (p1.y - p0.y) / 3;
      const cp2x = p1.x - (p2.x - p0.x) / 3;
      const cp2y = p1.y - (p2.y - p0.y) / 3;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    
    return path;
  };

  return (
    <span className={`relative inline-block ${className}`}>
      {children}
      <svg
        className="absolute -bottom-2 left-0 w-full h-5 overflow-visible"
        preserveAspectRatio="none"
        viewBox="0 0 100 6"
        style={{ pointerEvents: 'none' }}
      >
        <path
          d={generateScribblePath(children.length)}
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
        />
      </svg>
    </span>
  );
};

export default ScribbleUnderline;
