import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Molecule2DProps {
  svgBase64: string;
}

export default function Molecule2D({ svgBase64 }: Molecule2DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && svgBase64) {
      try {
        const svgString = atob(svgBase64);
        containerRef.current.innerHTML = svgString;
        
        // Make SVG responsive
        const svg = containerRef.current.querySelector('svg');
        if (svg) {
          svg.setAttribute('width', '100%');
          svg.setAttribute('height', 'auto');
          svg.style.maxWidth = '100%';
          svg.style.height = 'auto';
        }
      } catch (error) {
        console.error('Error decoding SVG:', error);
      }
    }
  }, [svgBase64]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      ref={containerRef}
      className="w-full h-full flex items-center justify-center"
      style={{ minHeight: '400px' }}
    />
  );
}
