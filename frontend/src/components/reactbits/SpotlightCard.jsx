import React, { useRef, useState } from 'react';

/**
 * SpotlightCard - React Bits inspired spotlight card
 * Creates a radial gradient spotlight effect that smoothly tracks cursor coordinates.
 */
export const SpotlightCard = ({
  children,
  className = '',
  spotlightColor = 'rgba(0, 240, 255, 0.18)',
  borderColor = 'rgba(0, 240, 255, 0.35)',
  radius = 350,
  ...props
}) => {
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => setOpacity(1);
  const handleBlur = () => setOpacity(0);
  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#080e1e]/85 backdrop-blur-xl transition-all duration-300 ${className}`}
      style={{
        boxShadow: opacity ? `0 16px 40px -10px rgba(0,0,0,0.7)` : 'none',
      }}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Layer */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0"
        style={{
          opacity,
          background: `radial-gradient(${radius}px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      {/* Border Highlight Overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300 z-0"
        style={{
          opacity,
          border: `1px solid ${borderColor}`,
          maskImage: `radial-gradient(${radius * 0.8}px circle at ${position.x}px ${position.y}px, black 40%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(${radius * 0.8}px circle at ${position.x}px ${position.y}px, black 40%, transparent 100%)`,
        }}
      />
      {/* Card Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default SpotlightCard;
