import React from 'react';

/**
 * StarBorder - React Bits animated glowing perimeter border wrapper
 */
export const StarBorder = ({
  as: Component = 'button',
  className = '',
  color = '#00f0ff',
  speed = '6s',
  children,
  ...props
}) => {
  return (
    <Component
      className={`relative inline-block py-[1px] px-[1px] overflow-hidden rounded-2xl bg-transparent ${className}`}
      {...props}
    >
      <div
        className="absolute w-[300%] h-[50%] opacity-75 bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div
        className="absolute w-[300%] h-[50%] opacity-75 top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div className="relative z-10 bg-[#060d1f]/90 rounded-2xl p-4 h-full w-full backdrop-blur-xl border border-slate-800">
        {children}
      </div>

      <style>{`
        @keyframes star-movement-bottom {
          0% { transform: translate(0%, 0%); opacity: 1; }
          100% { transform: translate(-100%, 0%); opacity: 0; }
        }
        @keyframes star-movement-top {
          0% { transform: translate(0%, 0%); opacity: 1; }
          100% { transform: translate(100%, 0%); opacity: 0; }
        }
        .animate-star-movement-bottom {
          animation: star-movement-bottom linear infinite alternate;
        }
        .animate-star-movement-top {
          animation: star-movement-top linear infinite alternate;
        }
      `}</style>
    </Component>
  );
};

export default StarBorder;
