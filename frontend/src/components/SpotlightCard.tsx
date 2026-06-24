"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function SpotlightCard({ children, className = "", delay = 0 }: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <motion.div
      ref={divRef}
      initial={{ opacity: 0, y: 20, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.8, 
        delay, 
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={{ 
        y: -3, 
        scale: 1.005,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
      }}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden group ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(500px circle at ${position.x}px ${position.y}px, rgba(56, 189, 248, 0.08) 0%, rgba(139, 92, 246, 0.04) 40%, transparent 70%)`,
        }}
      />
      
      {/* Subtle glowing border that tracks mouse */}
      <div 
        className="pointer-events-none absolute inset-0 z-10 rounded-2xl transition duration-300 opacity-0 group-hover:opacity-100"
        style={{
          opacity: opacity * 0.55,
          background: `radial-gradient(350px circle at ${position.x}px ${position.y}px, rgba(56, 189, 248, 0.3) 0%, rgba(139, 92, 246, 0.15) 50%, transparent 100%)`,
          WebkitMaskImage: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          WebkitMaskComposite: `xor`,
          maskComposite: `exclude`,
          padding: `1px`
        }}
      />

      <div className="relative z-20 h-full">
        {children}
      </div>
    </motion.div>
  );
}
