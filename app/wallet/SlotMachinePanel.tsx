
"use client"

import { motion, AnimatePresence } from 'framer-motion';
import { Wallet } from './WalletContext';

interface SlotMachinePanelProps {
  isOpen: boolean;
  onClose: () => void;
  theme: string;
  currentWallet: Wallet;
  cursorPosition: { x: number; y: number };
}

export default function SlotMachinePanel({ isOpen, onClose, theme, currentWallet, cursorPosition }: SlotMachinePanelProps) {
  // Calculate colors from three gradient planes based on cursor position
  const getGradientColors = () => {
    const x = cursorPosition.x / (typeof window !== 'undefined' ? window.innerWidth : 1);
    const y = cursorPosition.y / (typeof window !== 'undefined' ? window.innerHeight : 1);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="spin"
          initial={{ scale: 0, opacity: 0, rotateY: -90 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          exit={{ scale: 0, opacity: 0, rotateY: 90 }}
          transition={{
            duration: 0.8,
            ease: [0.43, 0.13, 0.23, 0.96]
          }}
          className="fixed inset-0 z-30 flex items-center justify-center swap-btn-reactive"
          style={
            {
              '--layer1-color': gradientColors.layer1,
              '--layer2-color': gradientColors.layer2,
              '--layer3-color': gradientColors.layer3,
            } as React.CSSProperties
          }
        >
          <div className="relative pointer-events-auto">
            {/* Close Button */}
            <button
              onClick={onClose}
              className={`absolute -top-14 right-0 p-3 rounded-full transition-all z-40 ${
                theme === 'dark'
                  ? 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white border-2 border-[#4a4a4a]'
                  : 'bg-white hover:bg-gray-100 text-black border-2 border-gray-400'
              } shadow-md`}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Large Slot Machine */}
            <motion.div
              className={`relative ${
                theme === 'dark'
                  ? 'bg-transparent border-4 border-[#5a5a5a]'
                  : 'bg-transparent border-4 border-gray-500'
              } rounded-3xl p-8 pb-10 shadow-2xl backdrop-blur-lg`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
            >
              {/* Title */}
              <motion.h1
                className={`text-4xl font-bold text-center mb-8 ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                TRIANGLE SLOTS
              </motion.h1>

              {/* Slot Machine Display Window */}
              <div className={`relative rounded-2xl p-6 mb-8 ${
                theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-gray-100'
              } border-4 ${
                theme === 'dark' ? 'border-[#4a4a4a]' : 'border-gray-400'
              }`}>
                <div className="flex gap-4 justify-center">
                  {/* Slot Reels */}
                  {[0, 1, 2].map((index) => (
                    <motion.div
                      key={index}
                      className={`w-32 h-40 rounded-xl flex items-center justify-center font-bold text-6xl ${
                        theme === 'dark'
                          ? 'bg-gradient-to-b from-white to-gray-200 text-black border-4 border-gray-600 shadow-inner'
                          : 'bg-gradient-to-b from-white to-gray-100 text-black border-4 border-gray-400 shadow-inner'
                      }`}
                      initial={{ y: -50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                    >
                      <motion.div
                        animate={{
                          y: [0, -40, 80, -30, 50, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          repeatDelay: 4,
                          delay: index * 0.3,
                          ease: "easeInOut"
                        }}
                        className="font-mono"
                      >
                        {['7', '💎', '🍒'][index % 3]}
                      </motion.div>
                    </motion.div>
                  ))}
                </div>

                {/* Win Line Indicator */}
                <div className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 ${
                  theme === 'dark' ? 'bg-yellow-400' : 'bg-yellow-500'
                } opacity-30`}></div>
              </div>

              {/* Control Panel */}
              <div className="flex justify-between items-center mb-6">
                {/* Balance Display */}
                <div className={`px-6 py-3 rounded-lg ${
                  theme === 'dark' ? 'bg-[#2a2a2a] border-2 border-[#4a4a4a]' : 'bg-gray-200 border-2 border-gray-400'
                }`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-[#999]' : 'text-gray-600'}`}>BALANCE</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    {currentWallet.balance.cc.toFixed(2)} CC
                  </p>
                </div>

                {/* Bet Display */}
                <div className={`px-6 py-3 rounded-lg ${
                  theme === 'dark' ? 'bg-[#2a2a2a] border-2 border-[#4a4a4a]' : 'bg-gray-200 border-2 border-gray-400'
                }`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-[#999]' : 'text-gray-600'}`}>BET</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    10.00 CC
                  </p>
                </div>
              </div>

              {/* Spin Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-6 rounded-xl font-bold text-3xl transition-all ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-black shadow-md hover:from-yellow-500 hover:to-yellow-400'
                    : 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-black shadow-md hover:from-yellow-400 hover:to-yellow-300'
                }`}
              >
                SPIN TO WIN
              </motion.button>

              {/* Side Lever */}
              <div className={`absolute -right-4 top-1/2 -translate-y-1/2 w-3 h-24 rounded-full ${
                theme === 'dark' ? 'bg-[#5a5a5a]' : 'bg-gray-500'
              } shadow-md`}>
                <motion.div
                  className={`absolute -top-4 -right-2 w-8 h-8 rounded-full ${
                    theme === 'dark' ? 'bg-red-600' : 'bg-red-500'
                  } shadow-md`}
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
