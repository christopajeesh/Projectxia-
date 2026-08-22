import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

/**
 * FloatingDock - Motion Primitives & React Bits Magnification Dock
 * Icons smoothly enlarge based on proximity to mouse cursor with spring damping.
 */
export const FloatingDock = ({ items = [], className = '', desktopClassName = '' }) => {
  const mouseX = useMotionValue(Infinity);

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto ${className}`}>
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className={`flex items-end gap-3 px-4 py-3 rounded-2xl bg-[#080e1e]/90 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(0,240,255,0.2)] ${desktopClassName}`}
      >
        {items.map((item, idx) => (
          <DockIcon key={idx} mouseX={mouseX} {...item} />
        ))}
      </motion.div>
    </div>
  );
};

const DockIcon = ({ mouseX, title, icon: Icon, onClick, href, badge, active }) => {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-120, 0, 120], [42, 64, 42]);
  const heightSync = useTransform(distance, [-120, 0, 120], [42, 64, 42]);

  const width = useSpring(widthSync, { mass: 0.1, stiffness: 160, damping: 12 });
  const height = useSpring(heightSync, { mass: 0.1, stiffness: 160, damping: 12 });

  const iconScale = useTransform(width, [42, 64], [1, 1.4]);

  const Component = href ? 'a' : 'button';

  return (
    <div className="relative group">
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: '-50%' }}
            animate={{ opacity: 1, y: -8, x: '-50%' }}
            exit={{ opacity: 0, y: 4, x: '-50%' }}
            className="absolute left-1/2 -top-8 px-2.5 py-1 rounded-lg bg-slate-900/95 border border-cyan-500/40 text-[11px] font-mono font-bold text-cyan-300 whitespace-nowrap shadow-lg pointer-events-none z-30"
          >
            {title}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
        whileTap={{ scale: 0.88 }}
        className={`flex items-center justify-center rounded-xl cursor-pointer relative transition-colors ${
          active
            ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-black shadow-neon-cyan'
            : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-400/60'
        }`}
      >
        <motion.div style={{ scale: iconScale }} className="flex items-center justify-center">
          {Icon && <Icon className="w-5 h-5" />}
        </motion.div>

        {badge && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-400 text-[9px] font-bold text-black ring-2 ring-slate-900">
            {badge}
          </span>
        )}
      </motion.div>
    </div>
  );
};

export default FloatingDock;
