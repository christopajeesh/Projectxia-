import React, { useEffect, useRef } from 'react';

const AuroraBackground = ({ theme = 'cyan', className = '' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId;
    let isPaused = false;

    // Detect mobile device or small screen for ultra-performance mode
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Pause rendering when tab/screen is hidden
    const handleVisibilityChange = () => {
      isPaused = document.hidden;
      if (!isPaused) {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Pause canvas updates during active scrolling so GPU dedicates 100% bandwidth to scrolling
    let isScrolling = false;
    let scrollTimer = null;
    const handleScroll = () => {
      isScrolling = true;
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        isScrolling = false;
        lastTime = performance.now();
        if (!isPaused) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = requestAnimationFrame(render);
        }
      }, 90);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Mouse interactivity (Desktop only)
    const mouse = { x: width / 2, y: height / 2, active: false };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    // 1. 3D Floating Wireframe Geometry
    // On mobile, render only 2 lightweight shapes; on desktop, 4 shapes
    const shapes = isMobile
      ? [
          { x: width * 0.15, y: height * 0.25, size: 55, rx: 0.3, ry: 0.5, rz: 0.1, drx: 0.005, dry: 0.008, color: '#00f0ff', type: 'cube' },
          { x: width * 0.85, y: height * 0.75, size: 65, rx: 0.6, ry: 0.2, rz: 0.4, drx: -0.006, dry: 0.006, color: '#9d4edd', type: 'pyramid' },
        ]
      : [
          { x: width * 0.12, y: height * 0.22, size: 75, rx: 0.3, ry: 0.5, rz: 0.1, drx: 0.007, dry: 0.011, color: '#00f0ff', type: 'cube' },
          { x: width * 0.88, y: height * 0.18, size: 90, rx: 0.6, ry: 0.2, rz: 0.4, drx: -0.009, dry: 0.008, color: '#9d4edd', type: 'icosahedron' },
          { x: width * 0.08, y: height * 0.82, size: 95, rx: 0.2, ry: 0.9, rz: 0.3, drx: 0.006, dry: -0.01, color: '#10b981', type: 'pyramid' },
          { x: width * 0.92, y: height * 0.78, size: 85, rx: 0.8, ry: 0.4, rz: 0.6, drx: -0.008, dry: -0.007, color: '#ff007f', type: 'cube' },
        ];

    // 2. High-Performance Constellation Particles (16 on mobile vs 70 on desktop)
    const maxParticles = isMobile ? 16 : 65;
    const particleCount = Math.min(Math.floor((width * height) / (isMobile ? 35000 : 12000)), maxParticles);
    const particles = [];
    const colorPalette = ['#00f0ff', '#0df5e3', '#9d4edd', '#ff007f', '#10b981'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (isMobile ? 0.4 : 0.7),
        vy: (Math.random() - 0.5) * (isMobile ? 0.4 : 0.7),
        radius: Math.random() * 1.8 + 1,
        color: colorPalette[i % colorPalette.length],
        alpha: Math.random() * 0.5 + 0.3,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        pulseVal: Math.random() * Math.PI * 2,
      });
    }

    let time = 0;
    let lastTime = performance.now();

    // Helper: Draw 3D Cube
    const drawCube = (cube) => {
      const s = cube.size / 2;
      const vertices = [
        [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
        [-s, -s, s],  [s, -s, s],  [s, s, s],  [-s, s, s],
      ];

      const cosY = Math.cos(cube.ry), sinY = Math.sin(cube.ry);
      const cosX = Math.cos(cube.rx), sinX = Math.sin(cube.rx);

      const rotated = vertices.map(([x, y, z]) => {
        let y1 = y * cosX - z * sinX;
        let z1 = y * sinX + z * cosX;
        let x2 = x * cosY + z1 * sinY;
        return [cube.x + x2, cube.y + y1];
      });

      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7],
      ];

      ctx.save();
      ctx.strokeStyle = cube.color;
      ctx.lineWidth = isMobile ? 1.2 : 1.8;
      if (!isMobile) {
        ctx.shadowColor = cube.color;
        ctx.shadowBlur = 12;
      }
      ctx.globalAlpha = isMobile ? 0.45 : 0.6;

      ctx.beginPath();
      for (let k = 0; k < edges.length; k++) {
        const [i, j] = edges[k];
        ctx.moveTo(rotated[i][0], rotated[i][1]);
        ctx.lineTo(rotated[j][0], rotated[j][1]);
      }
      ctx.stroke();
      ctx.restore();
    };

    // Helper: Draw 3D Icosahedron
    const drawIcosahedron = (ico) => {
      const phi = (1 + Math.sqrt(5)) / 2;
      const s = ico.size / 2.5;
      const vertices = [
        [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
        [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
        [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1],
      ].map(([x, y, z]) => [x * s, y * s, z * s]);

      const cosY = Math.cos(ico.ry), sinY = Math.sin(ico.ry);
      const cosX = Math.cos(ico.rx), sinX = Math.sin(ico.rx);

      const rotated = vertices.map(([x, y, z]) => {
        let y1 = y * cosX - z * sinX;
        let z1 = y * sinX + z * cosX;
        let x2 = x * cosY + z1 * sinY;
        return [ico.x + x2, ico.y + y1];
      });

      const edges = [
        [0, 11], [0, 5], [0, 1], [0, 7], [0, 10],
        [1, 5], [5, 11], [11, 10], [10, 7], [7, 1],
        [3, 9], [3, 4], [3, 2], [3, 6], [3, 8],
        [4, 9], [2, 4], [6, 2], [8, 6], [9, 8],
        [4, 5], [5, 9], [9, 1], [1, 8], [8, 7],
      ];

      ctx.save();
      ctx.strokeStyle = ico.color;
      ctx.lineWidth = 1.5;
      if (!isMobile) {
        ctx.shadowColor = ico.color;
        ctx.shadowBlur = 14;
      }
      ctx.globalAlpha = 0.55;

      ctx.beginPath();
      for (let k = 0; k < edges.length; k++) {
        const [i, j] = edges[k];
        if (rotated[i] && rotated[j]) {
          ctx.moveTo(rotated[i][0], rotated[i][1]);
          ctx.lineTo(rotated[j][0], rotated[j][1]);
        }
      }
      ctx.stroke();
      ctx.restore();
    };

    // Helper: Draw 3D Pyramid
    const drawPyramid = (pyr) => {
      const s = pyr.size / 2;
      const vertices = [
        [-s, s, -s], [s, s, -s], [s, s, s], [-s, s, s],
        [0, -s * 1.2, 0],
      ];

      const cosY = Math.cos(pyr.ry), sinY = Math.sin(pyr.ry);
      const cosX = Math.cos(pyr.rx), sinX = Math.sin(pyr.rx);

      const rotated = vertices.map(([x, y, z]) => {
        let y1 = y * cosX - z * sinX;
        let z1 = y * sinX + z * cosX;
        let x2 = x * cosY + z1 * sinY;
        return [pyr.x + x2, pyr.y + y1];
      });

      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [0, 4], [1, 4], [2, 4], [3, 4],
      ];

      ctx.save();
      ctx.strokeStyle = pyr.color;
      ctx.lineWidth = isMobile ? 1.2 : 1.5;
      if (!isMobile) {
        ctx.shadowColor = pyr.color;
        ctx.shadowBlur = 10;
      }
      ctx.globalAlpha = isMobile ? 0.4 : 0.5;

      ctx.beginPath();
      for (let k = 0; k < edges.length; k++) {
        const [i, j] = edges[k];
        ctx.moveTo(rotated[i][0], rotated[i][1]);
        ctx.lineTo(rotated[j][0], rotated[j][1]);
      }
      ctx.stroke();
      ctx.restore();
    };

    // Main 60fps Render Loop
    const render = (now) => {
      if (isPaused || isScrolling) return;

      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      time += delta * 1.2;

      ctx.clearRect(0, 0, width, height);

      // Layer 1: Ambient Glowing Radial Nebulas (Lightweight)
      const grad1 = ctx.createRadialGradient(width * 0.3, height * 0.35, 10, width * 0.3, height * 0.35, width * (isMobile ? 0.6 : 0.45));
      grad1.addColorStop(0, 'rgba(0, 240, 255, 0.12)');
      grad1.addColorStop(0.5, 'rgba(168, 85, 247, 0.05)');
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const grad2 = ctx.createRadialGradient(width * 0.75, height * 0.65, 10, width * 0.75, height * 0.65, width * (isMobile ? 0.6 : 0.45));
      grad2.addColorStop(0, 'rgba(168, 85, 247, 0.12)');
      grad2.addColorStop(0.5, 'rgba(0, 240, 255, 0.05)');
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Layer 2: Glowing Cyber Waves (1 wave on mobile, 2 on desktop)
      const waveCount = isMobile ? 1 : 2;
      for (let wave = 0; wave < waveCount; wave++) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, height * (0.45 + wave * 0.2));

        const waveColor = wave === 0 ? '#00f0ff' : '#a855f7';
        const waveOffset = wave * 1.8;
        const waveAmp = isMobile ? 20 : 30;
        const step = isMobile ? 24 : 16;

        for (let x = 0; x < width; x += step) {
          const y =
            height * (0.45 + wave * 0.2) +
            Math.sin(x * 0.0025 + time + waveOffset) * waveAmp +
            Math.cos(x * 0.0018 - time * 0.7) * (waveAmp * 0.5);
          ctx.lineTo(x, y);
        }

        ctx.strokeStyle = waveColor;
        ctx.lineWidth = isMobile ? 1.5 : 2;
        if (!isMobile) {
          ctx.shadowColor = waveColor;
          ctx.shadowBlur = 12;
        }
        ctx.globalAlpha = isMobile ? 0.25 : 0.35;
        ctx.stroke();
        ctx.restore();
      }

      // Layer 3: 3D Geometric Wireframes
      for (let s = 0; s < shapes.length; s++) {
        const shape = shapes[s];
        shape.rx += shape.drx;
        shape.ry += shape.dry;
        if (shape.type === 'cube') {
          drawCube(shape);
        } else if (shape.type === 'icosahedron') {
          drawIcosahedron(shape);
        } else {
          drawPyramid(shape);
        }
      }

      // Layer 4: Constellation Particles
      const maxConnectDist = isMobile ? 70 : 95;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.pulseVal += p.pulseSpeed;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentAlpha = p.alpha + Math.sin(p.pulseVal) * 0.2;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.15, Math.min(currentAlpha, 0.8));
        ctx.fill();

        // Connect nearby nodes (Desktop only for full $O(N^2)$ checks)
        if (!isMobile) {
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < maxConnectDist * maxConnectDist) {
              const dist = Math.sqrt(distSq);
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = p.color;
              ctx.globalAlpha = (1 - dist / maxConnectDist) * 0.25;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (!isMobile) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <div className={`absolute inset-0 pointer-events-none z-0 overflow-hidden ${className}`}>
      {/* 1. Real-Time 60fps 3D Geometric & Constellation Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-10" />

      {/* 2. Cyber Horizon Grid Scanlines */}
      <div
        className="absolute inset-0 z-20 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 240, 255, 0.35) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 240, 255, 0.35) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
};

export default AuroraBackground;
