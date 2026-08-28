import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

const SmoothScroll = ({ children }) => {
  const location = useLocation();
  const lenisRef = useRef(null);

  useEffect(() => {
    // Initialize Lenis smooth scroll with high-precision physics
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 2.0,
      infinite: false,
    });

    lenisRef.current = lenis;

    let frameId;
    function raf(time) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }

    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Scroll to top on route change using Lenis; stop Lenis on /chat to allow native chat scrolling
  useEffect(() => {
    if (lenisRef.current) {
      if (location.pathname === '/chat') {
        lenisRef.current.stop();
      } else {
        lenisRef.current.start();
        lenisRef.current.scrollTo(0, { immediate: true });
      }
    } else if (location.pathname !== '/chat') {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return <>{children}</>;
};

export default SmoothScroll;
