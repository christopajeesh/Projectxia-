import React, { useEffect, useRef } from 'react';

const AuroraBackground = ({ theme = 'cyan', className = '' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse interactivity
    const mouse = { x: width / 2, y: height / 2, active: false };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 1. 3D Floating Wireframe Geometry (Icosahedrons, Cubes, Octahedrons)
    const shapes = [
      { x: width * 0.12, y: height * 0.22, size: 75, rx: 0.3, ry: 0.5, rz: 0.1, drx: 0.007, dry: 0.011, color: '#00f0ff', type: 'cube' },
      { x: width * 0.88, y: height * 0.18, size: 90, rx: 0.6, ry: 0.2, rz: 0.4, drx: -0.009, dry: 0.008, color: '#9d4edd', type: 'icosahedron' },
      { x: width * 0.08, y: height * 0.82, size: 95, rx: 0.2, ry: 0.9, rz: 0.3, drx: 0.006, dry: -0.01, color: '#10b981', type: 'pyramid' },
      { x: width * 0.92, y: height * 0.78, size: 85, rx: 0.8, ry: 0.4, rz: 0.6, drx: -0.008, dry: -0.007, color: '#ff007f', type: 'cube' },
      { x: width * 0.5, y: height * 0.1, size: 70, rx: 0.5, ry: 0.7, rz: 0.3, drx: 0.01, dry: 0.012, color: '#ffd700', type: 'icosahedron' },
    ];

    // 2. High-Density Constellation Particles
    const particleCount = Math.min(Math.floor((width * height) / 9000), 120);
    const particles = [];
    const colorPalette = ['#00f0ff', '#0df5e3', '#9d4edd', '#7928ca', '#ff007f', '#ffd700', '#10b981'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.9,
        vy: (Math.random() - 0.5) * 0.9,
        radius: Math.random() * 2.4 + 1.2,
        color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
        alpha: Math.random() * 0.6 + 0.35,
        pulseSpeed: Math.random() * 0.04 + 0.015,
        pulseVal: Math.random() * Math.PI * 2,
      });
    }

    let time = 0;

    // Helper: Draw 3D Cube
    const drawCube = (cube) => {
      const s = cube.size / 2;
      const vertices = [
        [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
        [-s, -s, s],  [s, -s, s],  [s, s, s],  [-s, s, s],
      ];

      const rotated = vertices.map(([x, y, z]) => {
        let y1 = y * Math.cos(cube.rx) - z * Math.sin(cube.rx);
        let z1 = y * Math.sin(cube.rx) + z * Math.cos(cube.rx);
        let x2 = x * Math.cos(cube.ry) + z1 * Math.sin(cube.ry);
        let z2 = -x * Math.sin(cube.ry) + z1 * Math.cos(cube.ry);
        let x3 = x2 * Math.cos(cube.rz) - y1 * Math.sin(cube.rz);
        let y3 = x2 * Math.sin(cube.rz) + y1 * Math.cos(cube.rz);
        return [cube.x + x3, cube.y + y3];
      });

      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7],
      ];

      ctx.save();
      ctx.strokeStyle = cube.color;
      ctx.lineWidth = 2;
      ctx.shadowColor = cube.color;
      ctx.shadowBlur = 18;
      ctx.globalAlpha = 0.65;

      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(rotated[i][0], rotated[i][1]);
        ctx.lineTo(rotated[j][0], rotated[j][1]);
        ctx.stroke();
      });
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

      const rotated = vertices.map(([x, y, z]) => {
        let y1 = y * Math.cos(ico.rx) - z * Math.sin(ico.rx);
        let z1 = y * Math.sin(ico.rx) + z * Math.cos(ico.rx);
        let x2 = x * Math.cos(ico.ry) + z1 * Math.sin(ico.ry);
        let z2 = -x * Math.sin(ico.ry) + z1 * Math.cos(ico.ry);
        let x3 = x2 * Math.cos(ico.rz) - y1 * Math.sin(ico.rz);
        let y3 = x2 * Math.sin(ico.rz) + y1 * Math.cos(ico.rz);
        return [ico.x + x3, ico.y + y3];
      });

      const edges = [
        [0, 11], [0, 5], [0, 1], [0, 7], [0, 10],
        [1, 5], [5, 11], [11, 10], [10, 7], [7, 1],
        [3, 9], [3, 4], [3, 2], [3, 6], [3, 8],
        [4, 9], [2, 4], [6, 2], [8, 6], [9, 8],
        [4, 5], [5, 9], [9, 1], [1, 8], [8, 7],
        [7, 6], [6, 10], [10, 2], [2, 11], [11, 4],
      ];

      ctx.save();
      ctx.strokeStyle = ico.color;
      ctx.lineWidth = 1.8;
      ctx.shadowColor = ico.color;
      ctx.shadowBlur = 20;
      ctx.globalAlpha = 0.6;

      edges.forEach(([i, j]) => {
        if (rotated[i] && rotated[j]) {
          ctx.beginPath();
          ctx.moveTo(rotated[i][0], rotated[i][1]);
          ctx.lineTo(rotated[j][0], rotated[j][1]);
          ctx.stroke();
        }
      });
      ctx.restore();
    };

    // Helper: Draw 3D Pyramid
    const drawPyramid = (pyr) => {
      const s = pyr.size / 2;
      const vertices = [
        [-s, s, -s], [s, s, -s], [s, s, s], [-s, s, s],
        [0, -s * 1.2, 0], // Top Apex
      ];

      const rotated = vertices.map(([x, y, z]) => {
        let y1 = y * Math.cos(pyr.rx) - z * Math.sin(pyr.rx);
        let z1 = y * Math.sin(pyr.rx) + z * Math.cos(pyr.rx);
        let x2 = x * Math.cos(pyr.ry) + z1 * Math.sin(pyr.ry);
        let z2 = -x * Math.sin(pyr.ry) + z1 * Math.cos(pyr.ry);
        let x3 = x2 * Math.cos(pyr.rz) - y1 * Math.sin(pyr.rz);
        let y3 = x2 * Math.sin(pyr.rz) + y1 * Math.cos(pyr.rz);
        return [pyr.x + x3, pyr.y + y3];
      });

      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [0, 4], [1, 4], [2, 4], [3, 4],
      ];

      ctx.save();
      ctx.strokeStyle = pyr.color;
      ctx.lineWidth = 1.8;
      ctx.shadowColor = pyr.color;
      ctx.shadowBlur = 14;
      ctx.globalAlpha = 0.55;

      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(rotated[i][0], rotated[i][1]);
        ctx.lineTo(rotated[j][0], rotated[j][1]);
        ctx.stroke();
      });
      ctx.restore();
    };

    // Animation Loop
    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Layer 1: Ambient Glowing Radial Nebulas
      const grad1 = ctx.createRadialGradient(width * 0.25, height * 0.35, 10, width * 0.25, height * 0.35, width * 0.45);
      grad1.addColorStop(0, 'rgba(0, 240, 255, 0.15)');
      grad1.addColorStop(0.5, 'rgba(168, 85, 247, 0.08)');
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const grad2 = ctx.createRadialGradient(width * 0.75, height * 0.65, 10, width * 0.75, height * 0.65, width * 0.5);
      grad2.addColorStop(0, 'rgba(168, 85, 247, 0.15)');
      grad2.addColorStop(0.5, 'rgba(0, 240, 255, 0.07)');
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Layer 2: Flowing Glowing Cyber Waves
      for (let wave = 0; wave < 3; wave++) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, height * (0.4 + wave * 0.2));

        const waveColor = wave === 0 ? '#00f0ff' : wave === 1 ? '#a855f7' : '#10b981';
        const waveOffset = wave * 1.8;
        const waveAmp = 35 + wave * 15;

        for (let x = 0; x < width; x += 14) {
          const y =
            height * (0.4 + wave * 0.2) +
            Math.sin(x * 0.0025 + time + waveOffset) * waveAmp +
            Math.cos(x * 0.0018 - time * 0.7) * (waveAmp * 0.6);
          ctx.lineTo(x, y);
        }

        ctx.strokeStyle = waveColor;
        ctx.lineWidth = 2.2;
        ctx.shadowColor = waveColor;
        ctx.shadowBlur = 18;
        ctx.globalAlpha = 0.4;
        ctx.stroke();
        ctx.restore();
      }

      // Layer 3: 3D Rotating Geometric Wireframes
      shapes.forEach((shape) => {
        shape.rx += shape.drx;
        shape.ry += shape.dry;
        if (shape.type === 'cube') {
          drawCube(shape);
        } else if (shape.type === 'icosahedron') {
          drawIcosahedron(shape);
        } else {
          drawPyramid(shape);
        }
      });

      // Layer 4: Interactive Starfield Constellation
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.pulseVal += p.pulseSpeed;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentAlpha = p.alpha + Math.sin(p.pulseVal) * 0.25;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.globalAlpha = Math.max(0.2, currentAlpha);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connect nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const lineAlpha = (1 - dist / 110) * 0.35;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Connect to mouse cursor
        if (mouse.active) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 140) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = '#00f0ff';
            ctx.globalAlpha = (1 - mdist / 140) * 0.6;
            ctx.lineWidth = 1.4;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <div className={`absolute inset-0 pointer-events-none z-0 overflow-hidden ${className}`}>
      {/* 1. Real-Time 60fps 3D Geometric & Constellation Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-10" />

      {/* 2. Cyber Horizon Grid Scanlines */}
      <div
        className="absolute inset-0 z-20 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 240, 255, 0.45) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 240, 255, 0.45) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
};

export default AuroraBackground;
