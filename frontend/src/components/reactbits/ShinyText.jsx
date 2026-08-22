import React from 'react';

/**
 * ShinyText - React Bits inspired light reflection across typography
 */
export const ShinyText = ({
  text,
  disabled = false,
  speed = 5,
  className = '',
  shimmerColor = '#ffffff',
  textColor = '#00f0ff',
  ...props
}) => {
  return (
    <span
      className={`inline-block font-black relative overflow-hidden bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: disabled
          ? 'none'
          : `linear-gradient(120deg, ${textColor} 0%, ${textColor} 35%, ${shimmerColor} 50%, ${textColor} 65%, ${textColor} 100%)`,
        backgroundSize: '250% 100%',
        animation: disabled ? 'none' : `shineSweep ${speed}s linear infinite`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
      {...props}
    >
      {text}
      <style>{`
        @keyframes shineSweep {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>
    </span>
  );
};

export default ShinyText;
