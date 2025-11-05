
"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SlotPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SlotPopup({ isOpen, onClose }: SlotPopupProps) {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  // Track mouse position for gradient effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Calculate colors from three gradient planes based on cursor position
  const getGradientColors = () => {
    const { x, y } = mousePos;

    // Layer 1: Vibrant Red-Orange to Bright Cyan gradient (horizontal)
    // Red-Orange (255, 85, 30) -> Bright Cyan (30, 220, 255)
    const layer1 = {
      r: Math.round(255 + (30 - 255) * x),
      g: Math.round(85 + (220 - 85) * x),
      b: Math.round(30 + (255 - 30) * x),
    };

    // Layer 2: Hot Magenta to Vibrant Yellow gradient (vertical)
    // Hot Magenta (255, 50, 180) -> Vibrant Yellow (255, 235, 50)
    const layer2 = {
      r: Math.round(255),
      g: Math.round(50 + (245 - 50) * y),
      b: Math.round(180 + (50 - 180) * y),
    };

    // Layer 3: Electric Lime to Bright Blue gradient (diagonal)
    // Electric Lime (150, 255, 50) -> Bright Blue (50, 140, 255)
    const diag = (x + y) / 2;
    const layer3 = {
      r: Math.round(150 + (50 - 150) * diag),
      g: Math.round(255 + (130 - 255) * diag),
      b: Math.round(50 + (255 - 50) * diag),
    };

    return {
      layer1: `rgb(${layer1.r}, ${layer1.g}, ${layer1.b})`,
      layer2: `rgb(${layer2.r}, ${layer2.g}, ${layer2.b})`,
      layer3: `rgb(${layer3.r}, ${layer3.g}, ${layer3.b})`,
    };
  };

  const gradientColors = getGradientColors();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative rounded-2xl p-6 w-[90vw] max-w-sm bg-[#1a1a1a]"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Slot Popup</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors hover:bg-[#2a2a2a]"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="mt-5">
              <button
                className="w-full py-5 rounded-2xl font-bold text-3xl text-white swap-btn-reactive"
                style={
                  {
                    '--layer1-color': gradientColors.layer1,
                    '--layer2-color': gradientColors.layer2,
                    '--layer3-color': gradientColors.layer3,
                  } as React.CSSProperties
                }
              >
                <span className="content">Spin</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
