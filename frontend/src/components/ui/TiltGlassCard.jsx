import React, { useState } from 'react';
import { motion } from 'framer-motion';

const TiltGlassCard = ({ children, className = '', onClick }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const centerX = box.width / 2;
    const centerY = box.height / 2;

    const rotX = (centerY - y) / 18;
    const rotY = (x - centerX) / 18;

    const glareX = (x / box.width) * 100;
    const glareY = (y / box.height) * 100;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlarePos({ x: glareX, y: glareY, opacity: 0.25 });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <motion.div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      transition={{ type: 'spring', stiffness: 280, damping: 18 }}
      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/15 hover:border-[#00ffaa]/70 backdrop-blur-3xl transition-all duration-300 cursor-pointer shadow-2xl hover:shadow-[0_20px_50px_rgba(0,255,170,0.22)] ${className}`}
    >
      {/* Dynamic Specular Glass Glare Reflection Overlay */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: glarePos.opacity,
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.22) 0%, rgba(0, 255, 170, 0.1) 35%, transparent 70%)`,
        }}
      />

      {/* 3D Elevated Content Layer */}
      <div style={{ transform: 'translateZ(25px)' }} className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default TiltGlassCard;
