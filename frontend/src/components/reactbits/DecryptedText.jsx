import React, { useState, useEffect, useRef } from 'react';

/**
 * DecryptedText - React Bits inspired cyberpunk text decryptor
 * Animates text scrambling with randomized glyphs before resolving into clean characters.
 */
export const DecryptedText = ({
  text,
  speed = 40,
  maxIterations = 12,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><',
  className = '',
  parentClassName = '',
  encryptedClassName = 'text-cyan-400 font-mono opacity-80',
  animateOn = 'hover', // 'view' | 'hover' | 'both'
  sequential = true,
  ...props
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);
  const [isScrambling, setIsScrambling] = useState(false);
  const containerRef = useRef(null);
  const intervalRef = useRef(null);

  const scramble = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    let iteration = 0;
    setIsScrambling(true);

    intervalRef.current = setInterval(() => {
      setDisplayText((prev) =>
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (sequential) {
              if (index < iteration / (maxIterations / text.length)) {
                return text[index];
              }
            } else {
              if (iteration >= maxIterations) {
                return text[index];
              }
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join('')
      );

      iteration += 1;

      if (iteration > (sequential ? maxIterations * (text.length / 4) : maxIterations)) {
        clearInterval(intervalRef.current);
        setDisplayText(text);
        setIsScrambling(false);
      }
    }, speed);
  };

  useEffect(() => {
    if (animateOn === 'view' || animateOn === 'both') {
      scramble();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text]);

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (animateOn === 'hover' || animateOn === 'both') {
      scramble();
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <span
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`inline-block select-none cursor-pointer ${parentClassName}`}
      {...props}
    >
      <span className={isScrambling ? encryptedClassName : className}>
        {displayText}
      </span>
    </span>
  );
};

export default DecryptedText;
