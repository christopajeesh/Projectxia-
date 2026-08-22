import React from 'react';
import { motion } from 'framer-motion';

/**
 * BlurText - React Bits & Motion inspired typography reveal
 * Animates text with spring physics, opacity, and gaussian blur reduction.
 */
export const BlurText = ({
  text = '',
  delay = 50,
  animateBy = 'words', // 'words' | 'letters'
  direction = 'top', // 'top' | 'bottom'
  className = '',
  threshold = 0.1,
  rootMargin = '0px',
  onAnimationComplete,
}) => {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');

  const getInitialY = () => {
    if (direction === 'top') return -24;
    if (direction === 'bottom') return 24;
    return 0;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: delay / 1000, delayChildren: 0.05 * i },
    }),
  };

  const childVariants = {
    hidden: {
      opacity: 0,
      filter: 'blur(10px)',
      y: getInitialY(),
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 18,
        stiffness: 140,
      },
    },
  };

  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold, margin: rootMargin }}
      onAnimationComplete={onAnimationComplete}
      className={`inline-flex flex-wrap ${className}`}
    >
      {elements.map((segment, index) => (
        <motion.span
          key={index}
          variants={childVariants}
          className="inline-block"
          style={{ willChange: 'transform, filter, opacity' }}
        >
          {segment}
          {animateBy === 'words' && index < elements.length - 1 && (
            <span className="inline-block">&nbsp;</span>
          )}
        </motion.span>
      ))}
    </motion.span>
  );
};

export default BlurText;
