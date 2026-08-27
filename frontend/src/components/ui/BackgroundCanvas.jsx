import React, { useEffect, useRef } from 'react';

const BackgroundCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouse = { x: width / 2, y: height / 2 };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // 3D Wireframe Parameters
    const gridCols = 32;
    const gridRows = 20;
    let rotationAngle = 0;
    let counterRotation = 0;

    // 120+ High-Tech Cyber Symbols & Glowing Quantum Particles
    const symbolTypes = ['</>', '{ }', '01', 'AI', '0x4F', '=>', '₹', 'λ', '10', 'GPU', 'AST'];
    const count = Math.min(Math.floor(width / 10), 120);
    
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      size: Math.random() * 3.2 + 1.5,
      color: Math.random() > 0.4 ? '#6366f1' : Math.random() > 0.5 ? '#00ffaa' : '#38bdf8',
      symbol: Math.random() > 0.5 ? symbolTypes[Math.floor(Math.random() * symbolTypes.length)] : null,
      alpha: Math.random() * 0.65 + 0.35,
    }));

    // Shooting Stars / Cyber Light Streaks
    const shootingStars = Array.from({ length: 6 }, () => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.6),
      length: Math.random() * 100 + 50,
      speed: Math.random() * 7 + 5,
      angle: Math.PI / 4,
      alpha: Math.random() * 0.8 + 0.35,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      rotationAngle += 0.008;
      counterRotation -= 0.006;

      const centerX = width * 0.5;
      const centerY = height * 0.45;

      // 1. PRIMARY ROTATING 3D WIREFRAME WAVE MESH
      ctx.save();
      ctx.lineWidth = 1.6;
      const radiusX = Math.min(width * 0.45, 520);
      const radiusY = Math.min(height * 0.35, 300);

      const points = [];

      for (let r = 0; r < gridRows; r++) {
        const rowPoints = [];
        const u = (r / gridRows) * Math.PI * 2;

        for (let c = 0; c < gridCols; c++) {
          const v = (c / gridCols) * Math.PI * 2;

          const R = radiusX * 0.65;
          const tubeR = radiusY * 0.4;
          const wave = Math.sin(u * 2.5 + rotationAngle * 2) * 36 + Math.cos(v * 3 + rotationAngle * 1.5) * 26;

          const x3d = (R + (tubeR + wave) * Math.cos(v)) * Math.cos(u + rotationAngle);
          const y3d = (R + (tubeR + wave) * Math.cos(v)) * Math.sin(u + rotationAngle);
          const z3d = (tubeR + wave) * Math.sin(v);

          const fov = 450;
          const scale = fov / (fov + z3d + 200);
          const projX = centerX + x3d * scale;
          const projY = centerY + y3d * scale * 0.62;

          rowPoints.push({ x: projX, y: projY, z: z3d, scale });
        }
        points.push(rowPoints);
      }

      // Draw Longitudinal & Latitudinal Lines
      for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
          const p1 = points[r][c];
          const p2 = points[r][(c + 1) % gridCols];
          const p3 = points[(r + 1) % gridRows][c];

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${0.48 * p1.scale})`;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.strokeStyle = `rgba(0, 255, 170, ${0.42 * p1.scale})`;
          ctx.stroke();

          if ((r + c) % 3 === 0) {
            ctx.beginPath();
            ctx.arc(p1.x, p1.y, 3 * p1.scale, 0, Math.PI * 2);
            ctx.fillStyle = (r % 2 === 0) ? '#00ffaa' : '#38bdf8';
            ctx.globalAlpha = 0.85 * p1.scale;
            ctx.fill();
          }
        }
      }
      ctx.restore();

      // 2. SECONDARY COUNTER-ROTATING 3D SPHERICAL CORE ORBIT RING
      ctx.save();
      ctx.lineWidth = 1.2;
      const coreRadius = Math.min(width * 0.2, 180);
      const coreCols = 16;
      const coreRows = 12;

      for (let i = 0; i < coreRows; i++) {
        const phi = (i / coreRows) * Math.PI;
        ctx.beginPath();
        for (let j = 0; j <= coreCols; j++) {
          const theta = (j / coreCols) * Math.PI * 2;
          const x = coreRadius * Math.sin(phi) * Math.cos(theta + counterRotation);
          const y = coreRadius * Math.cos(phi);
          const z = coreRadius * Math.sin(phi) * Math.sin(theta + counterRotation);

          const scale = 400 / (400 + z + 200);
          const px = centerX + x * scale;
          const py = centerY + y * scale * 0.7;

          if (j === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = `rgba(168, 85, 247, ${0.35 * (i / coreRows)})`;
        ctx.stroke();
      }
      ctx.restore();

      // 3. SHOOTING STARS / LIGHT STREAKS
      for (let i = 0; i < shootingStars.length; i++) {
        const s = shootingStars[i];
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;

        if (s.x > width || s.y > height) {
          s.x = Math.random() * (width * 0.8);
          s.y = -20;
          s.speed = Math.random() * 7 + 5;
        }

        ctx.save();
        ctx.beginPath();
        const gradient = ctx.createLinearGradient(
          s.x,
          s.y,
          s.x - Math.cos(s.angle) * s.length,
          s.y - Math.sin(s.angle) * s.length
        );
        gradient.addColorStop(0, '#00ffaa');
        gradient.addColorStop(0.5, '#6366f1');
        gradient.addColorStop(1, 'transparent');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2.2;
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - Math.cos(s.angle) * s.length, s.y - Math.sin(s.angle) * s.length);
        ctx.globalAlpha = s.alpha;
        ctx.stroke();
        ctx.restore();
      }

      // 4. CONSTELLATION LASER INTERCONNECTS
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const pA = particles[i];
          const pB = particles[j];
          const dist = Math.hypot(pA.x - pB.x, pA.y - pB.y);

          if (dist < 170) {
            ctx.beginPath();
            ctx.moveTo(pA.x, pA.y);
            ctx.lineTo(pB.x, pB.y);
            ctx.strokeStyle = `rgba(0, 255, 170, ${(1 - dist / 170) * 0.45})`;
            ctx.lineWidth = 1.1;
            ctx.stroke();
          }
        }
      }

      // 5. QUANTUM PARTICLES & CODE SYMBOLS WITH CURSOR REACTION
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 220 && dist > 0) {
          const force = (220 - dist) / 220;
          p.x -= (dx / dist) * force * 4.0;
          p.y -= (dy / dist) * force * 4.0;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.save();
        ctx.globalAlpha = p.alpha;

        if (p.symbol) {
          ctx.font = '13px "Space Mono", monospace';
          ctx.fillStyle = p.color;
          ctx.fillText(p.symbol, p.x, p.y);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 14;
          ctx.shadowColor = p.color;
          ctx.fill();
        }
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#030408]">
      {/* 40px Sub-pixel Cyber Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,170,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,170,0.035)_1px,transparent_1px)] bg-[size:40px_40px] z-[0]" />

      {/* Tactile Digital Noise Grain Overlay */}
      <div className="absolute inset-0 noise-bg-overlay opacity-50 z-[1]" />

      {/* Dual 3D Wireframe Mesh & Shooting Star Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-95 z-[2]" />

      {/* Low-Light Radial Aurora Mesh (Indigo, Mint, Purple, Cyan) */}
      <div className="absolute -top-32 -left-32 w-[750px] h-[750px] rounded-full bg-indigo-600/25 blur-[140px] animate-pulse-slow z-[3]" />
      <div className="absolute top-1/4 -right-32 w-[700px] h-[700px] rounded-full bg-[#00ffaa]/20 blur-[140px] animate-aurora-glow z-[3]" />
      <div className="absolute bottom-10 left-1/3 w-[650px] h-[650px] rounded-full bg-purple-600/25 blur-[140px] z-[3]" />
      <div className="absolute top-2/3 right-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/20 blur-[130px] z-[3]" />

      {/* Soft Edge Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030408]/60 via-transparent to-[#030408]/85 z-[4]" />
    </div>
  );
};

export default BackgroundCanvas;
