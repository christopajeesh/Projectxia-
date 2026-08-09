import React, { useEffect, useRef } from 'react';

const ThreeDCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement.clientHeight || 450);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // 3D Rotational Sphere of Particles & Tech Nodes
    const numParticles = 220;
    const particles = [];
    const radius = Math.min(width, height) * 0.38;

    for (let i = 0; i < numParticles; i++) {
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = Math.sqrt(numParticles * Math.PI) * theta;

      particles.push({
        x: radius * Math.sin(theta) * Math.cos(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(theta),
        size: Math.random() * 2 + 1.2,
        color: i % 4 === 0 ? '#00f0ff' : i % 4 === 1 ? '#00a884' : i % 4 === 2 ? '#8a2be2' : '#ffd700',
      });
    }

    let angleX = 0.003;
    let angleY = 0.005;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Rotate particles around 3D axes
      for (let i = 0; i < numParticles; i++) {
        const p = particles[i];

        // Rotate Y
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.z * cosY + p.x * sinY;

        // Rotate X
        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        const y1 = p.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.y * sinX;

        p.x = x1;
        p.y = y1;
        p.z = z2;

        // Perspective projection
        const fov = 350;
        const scale = fov / (fov + p.z);
        const projX = p.x * scale + cx;
        const projY = p.y * scale + cy;

        // Draw node
        ctx.beginPath();
        ctx.arc(projX, projY, Math.max(0.5, p.size * scale), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10 * scale;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connect 3D node meshes
        for (let j = i + 1; j < numParticles; j += 6) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y, p.z - p2.z);
          if (dist < 65) {
            const scale2 = fov / (fov + p2.z);
            const projX2 = p2.x * scale2 + cx;
            const projY2 = p2.y * scale2 + cy;

            ctx.beginPath();
            ctx.moveTo(projX, projY);
            ctx.lineTo(projX2, projY2);
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.2 * (1 - dist / 65) * scale})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[380px] sm:min-h-[460px] flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full" />
      {/* Center 3D Hologram Badge */}
      <div className="absolute inset-0 m-auto w-32 h-32 rounded-full border border-cyan-500/40 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center pointer-events-none shadow-neon-cyan animate-pulse">
        <span className="text-[10px] font-mono text-cyan-400 font-bold">PROJECTXIA</span>
        <span className="text-xs font-display font-black text-white">3D CORE</span>
        <span className="text-[9px] font-mono text-emerald-400">HARDWARE & SOFTWARE</span>
      </div>
    </div>
  );
};

export default ThreeDCanvas;
