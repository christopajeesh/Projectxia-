import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Cpu, RotateCcw, Zap, Layers, Activity, Eye, Maximize2, ShieldCheck } from 'lucide-react';
import { useSound } from '../../context/SoundContext';

const Interactive3DViewer = ({ projectTitle = 'ESP32-S3 AI Vision Neural Node', className = '' }) => {
  const canvasRef = useRef(null);
  const { playClick, playShield } = useSound();
  const [rotationSpeed, setRotationSpeed] = useState(0.012);
  const [isRotating, setIsRotating] = useState(true);
  const [activePin, setActivePin] = useState(null);
  const [renderMode, setRenderMode] = useState('hologram'); // 'hologram', 'schematic', 'solid'
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = 360);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 360;
    };
    window.addEventListener('resize', handleResize);

    let angleX = 0.4;
    let angleY = 0.6;
    let angleZ = 0.1;

    // Mouse & Touch drag rotation
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    const onMouseDown = (e) => {
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;
      angleY += deltaX * 0.008;
      angleX += deltaY * 0.008;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - lastMouseX;
      const deltaY = e.touches[0].clientY - lastMouseY;
      angleY += deltaX * 0.008;
      angleX += deltaY * 0.008;
      lastMouseX = e.touches[0].clientX;
      lastMouseY = e.touches[0].clientY;
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // 3D PCB Board Definition
    const pcbWidth = 180;
    const pcbHeight = 12;
    const pcbDepth = 120;

    // Integrated Circuit (Main SoC)
    const chipSize = 55;
    const chipHeight = 16;

    // Pin header nodes
    const pins = [
      { id: 'GPIO_1', name: 'UART0_TX (Pin 43)', x: -70, y: -pcbHeight / 2 - 4, z: -40, color: '#00f0ff' },
      { id: 'GPIO_2', name: 'UART0_RX (Pin 44)', x: -70, y: -pcbHeight / 2 - 4, z: -20, color: '#00f0ff' },
      { id: 'I2C_SDA', name: 'I2C_SDA (Pin 21)', x: -70, y: -pcbHeight / 2 - 4, z: 0, color: '#10b981' },
      { id: 'I2C_SCL', name: 'I2C_SCL (Pin 22)', x: -70, y: -pcbHeight / 2 - 4, z: 20, color: '#10b981' },
      { id: 'SPI_MOSI', name: 'SPI_MOSI (Pin 23)', x: 70, y: -pcbHeight / 2 - 4, z: -30, color: '#9d4edd' },
      { id: 'SPI_CLK', name: 'SPI_SCK (Pin 18)', x: 70, y: -pcbHeight / 2 - 4, z: 0, color: '#9d4edd' },
      { id: 'VCC_3V3', name: '3.3V Power Rail', x: 70, y: -pcbHeight / 2 - 4, z: 30, color: '#ffd700' },
      { id: 'GND', name: 'Digital Ground', x: 70, y: -pcbHeight / 2 - 4, z: 50, color: '#ef4444' },
    ];

    let t = 0;

    const project3D = (x, y, z) => {
      // Rotation around X
      let y1 = y * Math.cos(angleX) - z * Math.sin(angleX);
      let z1 = y * Math.sin(angleX) + z * Math.cos(angleX);

      // Rotation around Y
      let x2 = x * Math.cos(angleY) + z1 * Math.sin(angleY);
      let z2 = -x * Math.sin(angleY) + z1 * Math.cos(angleY);

      // Rotation around Z
      let x3 = x2 * Math.cos(angleZ) - y1 * Math.sin(angleZ);
      let y3 = x2 * Math.sin(angleZ) + y1 * Math.cos(angleZ);

      // Perspective Projection
      const fov = 420;
      const scale = (fov / (fov + z2 + 200)) * zoom;
      return {
        x: width / 2 + x3 * scale,
        y: height / 2 + y3 * scale,
        scale,
        depth: z2,
      };
    };

    const render = () => {
      t += 0.03;
      if (isRotating && !isDragging) {
        angleY += rotationSpeed;
      }

      ctx.clearRect(0, 0, width, height);

      // Draw Grid Matrix floor
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 320;
      const gridStep = 40;
      for (let gx = -gridSize; gx <= gridSize; gx += gridStep) {
        const p1 = project3D(gx, 60, -gridSize);
        const p2 = project3D(gx, 60, gridSize);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
      for (let gz = -gridSize; gz <= gridSize; gz += gridStep) {
        const p1 = project3D(-gridSize, 60, gz);
        const p2 = project3D(gridSize, 60, gz);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
      ctx.restore();

      // 1. Draw PCB Substrate (Box)
      const halfW = pcbWidth / 2;
      const halfH = pcbHeight / 2;
      const halfD = pcbDepth / 2;

      const corners = [
        [-halfW, -halfH, -halfD], [halfW, -halfH, -halfD], [halfW, halfH, -halfD], [-halfW, halfH, -halfD],
        [-halfW, -halfH, halfD],  [halfW, -halfH, halfD],  [halfW, halfH, halfD],  [-halfW, halfH, halfD],
      ].map(([x, y, z]) => project3D(x, y, z));

      const pcbEdges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7],
      ];

      // Draw PCB Faces
      ctx.save();
      if (renderMode === 'hologram') {
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 14;
        ctx.fillStyle = 'rgba(0, 240, 255, 0.06)';
      } else if (renderMode === 'schematic') {
        ctx.strokeStyle = '#9d4edd';
        ctx.lineWidth = 1.5;
        ctx.fillStyle = 'rgba(157, 78, 221, 0.08)';
      } else {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      }

      pcbEdges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(corners[i].x, corners[i].y);
        ctx.lineTo(corners[j].x, corners[j].y);
        ctx.stroke();
      });

      // Top Face Fill
      ctx.beginPath();
      ctx.moveTo(corners[0].x, corners[0].y);
      ctx.lineTo(corners[1].x, corners[1].y);
      ctx.lineTo(corners[5].x, corners[5].y);
      ctx.lineTo(corners[4].x, corners[4].y);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 2. Draw Main Microchip (SoC)
      const cHalf = chipSize / 2;
      const chipCorners = [
        [-cHalf, -halfH - chipHeight, -cHalf], [cHalf, -halfH - chipHeight, -cHalf],
        [cHalf, -halfH, -cHalf], [-cHalf, -halfH, -cHalf],
        [-cHalf, -halfH - chipHeight, cHalf], [cHalf, -halfH - chipHeight, cHalf],
        [cHalf, -halfH, cHalf], [-cHalf, -halfH, cHalf],
      ].map(([x, y, z]) => project3D(x, y, z));

      ctx.save();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 16;
      ctx.fillStyle = 'rgba(255, 215, 0, 0.18)';

      pcbEdges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(chipCorners[i].x, chipCorners[i].y);
        ctx.lineTo(chipCorners[j].x, chipCorners[j].y);
        ctx.stroke();
      });

      ctx.beginPath();
      ctx.moveTo(chipCorners[0].x, chipCorners[0].y);
      ctx.lineTo(chipCorners[1].x, chipCorners[1].y);
      ctx.lineTo(chipCorners[5].x, chipCorners[5].y);
      ctx.lineTo(chipCorners[4].x, chipCorners[4].y);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 3. Draw Laser Traces on PCB Surface
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = -t * 8;

      pins.forEach((pin) => {
        const pinPos = project3D(pin.x, pin.y, pin.z);
        const centerPos = project3D(0, -halfH, 0);

        ctx.beginPath();
        ctx.moveTo(pinPos.x, pinPos.y);
        ctx.lineTo(centerPos.x, centerPos.y);
        ctx.stroke();

        // Draw Interactive Pin Nodes
        ctx.save();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(pinPos.x, pinPos.y, 4.5 * pinPos.scale, 0, Math.PI * 2);
        ctx.fillStyle = pin.color;
        ctx.shadowColor = pin.color;
        ctx.shadowBlur = 12;
        ctx.fill();

        // Pulse ring
        ctx.beginPath();
        ctx.arc(pinPos.x, pinPos.y, (6 + Math.sin(t * 3) * 2) * pinPos.scale, 0, Math.PI * 2);
        ctx.strokeStyle = pin.color;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      });
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      cancelAnimationFrame(animationFrameId);
    };
  }, [rotationSpeed, isRotating, renderMode, zoom]);

  return (
    <div className={`relative rounded-3xl bg-gray-950/90 border border-cyan-500/40 backdrop-blur-2xl shadow-2xl overflow-hidden ${className}`}>
      {/* Top HUD Controls */}
      <div className="p-4 border-b border-cyan-500/30 bg-gradient-to-r from-gray-950 via-cyan-950/40 to-gray-950 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
            <Cpu className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold block">
              3D Interactive Hardware Inspector
            </span>
            <h4 className="text-sm font-display font-black text-white line-clamp-1">{projectTitle}</h4>
          </div>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-1.5 bg-gray-900/80 p-1 rounded-xl border border-slate-800 text-[11px] font-mono">
          <button
            onClick={() => {
              playClick();
              setRenderMode('hologram');
            }}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              renderMode === 'hologram' ? 'bg-cyan-500 text-black font-bold shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Hologram
          </button>
          <button
            onClick={() => {
              playClick();
              setRenderMode('schematic');
            }}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              renderMode === 'schematic' ? 'bg-purple-500 text-black font-bold shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Schematic
          </button>
          <button
            onClick={() => {
              playClick();
              setRenderMode('solid');
            }}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              renderMode === 'solid' ? 'bg-emerald-500 text-black font-bold shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Solid PCB
          </button>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div className="relative w-full h-[360px] bg-gradient-to-b from-[#030712] via-[#050b1a] to-[#030712] flex items-center justify-center cursor-grab active:cursor-grabbing">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Real-Time HUD Overlay Indicators */}
        <div className="absolute top-3 left-4 text-[10px] font-mono text-cyan-400/80 space-y-1 pointer-events-none">
          <p className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>RENDER ENGINE: 60 FPS WEBGL VECTOR MESH</span>
          </p>
          <p className="text-slate-400">ROTATION: {isRotating ? 'ACTIVE (DRAG TO ROTATE)' : 'PAUSED'}</p>
        </div>

        {/* Bottom Tool Palette */}
        <div className="absolute bottom-3 right-4 flex items-center gap-2">
          <button
            onClick={() => {
              playClick();
              setIsRotating(!isRotating);
            }}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-[11px] flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isRotating ? 'Pause Orbit' : 'Resume Orbit'}</span>
          </button>

          <button
            onClick={() => {
              playClick();
              setZoom((prev) => (prev >= 1.4 ? 0.9 : prev + 0.25));
            }}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-[11px] transition-all cursor-pointer backdrop-blur-md"
          >
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Pinout Specs Footer Bar */}
      <div className="p-4 bg-gray-950 border-t border-slate-900 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
        <div className="p-2.5 rounded-xl bg-gray-900/80 border border-slate-800">
          <span className="text-slate-500 block text-[9px]">MICROCONTROLLER</span>
          <span className="text-cyan-300 font-bold">ESP32-S3 Dual-Core</span>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-900/80 border border-slate-800">
          <span className="text-slate-500 block text-[9px]">CLOCK & RAM</span>
          <span className="text-purple-300 font-bold">240MHz • 8MB PSRAM</span>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-900/80 border border-slate-800">
          <span className="text-slate-500 block text-[9px]">PCB LAYERS</span>
          <span className="text-emerald-300 font-bold">4-Layer High-Density</span>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-900/80 border border-slate-800">
          <span className="text-slate-500 block text-[9px]">SCHEMATICS</span>
          <span className="text-yellow-300 font-bold">KiCAD v8 & Gerber Ready</span>
        </div>
      </div>
    </div>
  );
};

export default Interactive3DViewer;
