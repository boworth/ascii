"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import NeonIsometricMaze from "./neon-isometric-maze"
import { motion } from "framer-motion"

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isGlitchComplete, setIsGlitchComplete] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleLoadComplete = useCallback(() => {
    console.log("Maze loaded, showing content")
    setIsLoading(false)
  }, [])

  const handleButtonClick = useCallback(() => {
    console.log("Button clicked, starting animation")
  }, [])

  const handleGlitchComplete = useCallback(() => {
    console.log("Glitch effect completed, starting fade to black and scroll")
    setIsGlitchComplete(true)
    // Start scroll after a brief delay
    setTimeout(() => {
      setIsScrolling(true)
    }, 1500)
  }, [])

  const handleScrollComplete = useCallback(() => {
    console.log("Scroll animation completed, navigating to wallet")
    setTimeout(() => {
      router.push("/wallet")
    }, 500)
  }, [router])


  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 overflow-hidden bg-black select-none"
    >
      {/* Loading Screen */}
      {isLoading && (
        <div className="absolute inset-0 bg-black z-50 flex items-center justify-center">
          <div className="text-8xl font-bold text-white flex font-mono">
            <motion.span
              animate={{
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0
              }}
            >
              =
            </motion.span>
            <motion.span
              animate={{
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2
              }}
            >
              +
            </motion.span>
            <motion.span
              animate={{
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4
              }}
            >
              #
            </motion.span>
          </div>
        </div>
      )}

      {/* Scrollable container */}
      <div className="fixed inset-0">
        {/* Landing Page Section */}
        <motion.div 
          className="fixed inset-0"
          initial={{ y: 0 }}
          animate={isScrolling ? { y: "-100vh" } : { y: 0 }}
          transition={{ 
            duration: 2.0,
            ease: [0.33, 1, 0.68, 1], // easeOutCubic - smooth deceleration
            type: "tween"
          }}
          style={{ 
            backfaceVisibility: "hidden", 
            transform: "translateZ(0)",
            willChange: isScrolling ? "transform" : "auto"
          }}
        >
          {/* Maze with fade-in */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={!isLoading ? { opacity: isScrolling ? 0 : 1 } : { opacity: 0 }}
            transition={{ duration: isScrolling ? 0.3 : 0.5 }}
            style={{ display: isScrolling ? 'none' : 'block' }}
          >
            <NeonIsometricMaze 
              onGlitchComplete={handleGlitchComplete} 
              onButtonClick={handleButtonClick}
              onLoadComplete={handleLoadComplete}
              isScrolling={isScrolling}
            />
          </motion.div>
          
          {/* White overlay that fades in */}
          <motion.div
            className="absolute inset-0 bg-white z-20 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={isGlitchComplete ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          
          {/* Text and buttons - only show after loading */}
          {/* Title is now rendered inside NeonIsometricMaze component */}
        </motion.div>

        {/* Wallet Page Section - Transition to actual wallet */}
        <motion.div 
          className="fixed inset-0 flex items-center justify-center bg-gray-200"
          initial={{ y: "100vh" }}
          animate={isScrolling ? { y: 0 } : { y: "100vh" }}
          transition={{ 
            duration: 2.0,
            ease: [0.33, 1, 0.68, 1],
            type: "tween"
          }}
          onAnimationComplete={() => {
            if (isScrolling) {
              handleScrollComplete()
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={isScrolling ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center"
          >
            <div className="text-8xl font-bold text-black flex justify-center font-mono">
              <motion.span
                animate={{
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0
                }}
              >
                =
              </motion.span>
              <motion.span
                animate={{
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2
                }}
              >
                +
              </motion.span>
              <motion.span
                animate={{
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4
                }}
              >
                #
              </motion.span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
