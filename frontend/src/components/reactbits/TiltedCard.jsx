import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * TiltedCard - React Bits & Motion 3D perspective card with specular glare
 * Calculates real-time 3D rotation based on mouse coordinates relative to card center.
 */
export const TiltedCard = ({
  children,
  className = '',
  maxTilt = 15,
  scale = 1.04,
  glareEnable = true,
  glareMaxOpacity = 0.35,
  glareColor = '#00f0ff',
  ...props
}) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Raw mouse coordinates normalized from -0.5 to 0.5
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for rotation
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt]), {
    stiffness: 260,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt]), {
    stiffness: 260,
    damping: 20,
  });

  const glareX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      style={{ perspective: 1000 }}
      className="inline-block w-full"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          scale: isHovered ? scale : 1,
        }}
        transition={{ duration: 0.2 }}
        className={`relative overflow-hidden rounded-2xl border border-slate-800 bg-[#080e1e]/90 backdrop-blur-xl transition-shadow duration-300 ${className}`}
        {...props}
      >
        {/* Card Content with 3D Pop depth */}
        <div className="relative z-10" style={{ transform: 'translateZ(25px)' }}>
          {children}
        </div>

        {/* Specular Glare Overlay */}
        {glareEnable && isHovered && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 mix-blend-overlay transition-opacity duration-300 rounded-2xl"
            style={{
              opacity: glareMaxOpacity,
              background: `radial-gradient(circle at ${glareX} ${glareY}, ${glareColor}, transparent 70%)`,
            }}
          />
        )}
      </motion.div>
    </div>
  );
};

export default TiltedCard;
