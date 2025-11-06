
"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import NeonIsometricMaze from "./neon-isometric-maze"
import { motion } from "framer-motion"

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isGlitchComplete, setIsGlitchComplete] = useState(false)

  const handleLoadComplete = useCallback(() => {
    console.log("Maze loaded, showing content")
    setIsLoading(false)
  }, [])

  const handleButtonClick = useCallback(() => {
    console.log("Button clicked, starting animation")
  }, [])

  const handleGlitchComplete = useCallback(() => {
    console.log("Glitch effect completed, navigating to wallet")
    setIsGlitchComplete(true)
    // Navigate directly to wallet after a brief pause
    setTimeout(() => {
      router.push("/wallet")
    }, 1500)
  }, [router])


  return (
    <div 
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

      {/* Main container */}
      <div className="fixed inset-0">
        {/* Landing Page Section */}
        <motion.div 
          className="fixed inset-0"
        >
          {/* Maze with fade-in */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={!isLoading ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <NeonIsometricMaze 
              onGlitchComplete={handleGlitchComplete} 
              onButtonClick={handleButtonClick}
              onLoadComplete={handleLoadComplete}
              isGlitchComplete={isGlitchComplete}
            />
          </motion.div>
        </motion.div>
        
      </div>
    </div>
  )
}
