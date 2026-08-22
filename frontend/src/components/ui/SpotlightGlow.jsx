import React, { useEffect, useState } from 'react';

const SpotlightGlow = () => {
  const [position, setPosition] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    let frameId;
    let target = { x: -1000, y: -1000 };
    let current = { x: -1000, y: -1000 };

    const handleMouseMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };

    const update = () => {
      current.x += (target.x - current.x) * 0.15;
      current.y += (target.y - current.y) * 0.15;
      setPosition({ x: current.x, y: current.y });
      frameId = requestAnimationFrame(update);
    };

    window.addEventListener('mousemove', handleMouseMove);
    frameId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[5] hidden md:block select-none"
      style={{
        background: `
          radial-gradient(380px circle at ${position.x}px ${position.y}px, rgba(0, 255, 170, 0.05), rgba(99, 102, 241, 0.03) 45%, transparent 75%)
        `,
      }}
    />
  );
};

export default SpotlightGlow;
