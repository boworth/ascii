
"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import NeonIsometricMaze from "./neon-isometric-maze"
import { motion } from "framer-motion"

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isGlitchComplete, setIsGlitchComplete] = useState(false)
  const [contentLoaded, setContentLoaded] = useState(false)
  const [minimumTimeElapsed, setMinimumTimeElapsed] = useState(false)

  // Set minimum loading time of 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinimumTimeElapsed(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Hide loading screen only when both content is loaded AND minimum time has elapsed
  useEffect(() => {
    if (contentLoaded && minimumTimeElapsed) {
      console.log("Minimum time elapsed and content loaded, hiding loading screen")
      setIsLoading(false)
    }
  }, [contentLoaded, minimumTimeElapsed])

  const handleLoadComplete = useCallback(() => {
    console.log("Maze loaded")
    setContentLoaded(true)
  }, [])

  const handleButtonClick = useCallback(() => {
    console.log("Button clicked, starting animation")
  }, [])

  const handleGlitchComplete = useCallback(() => {
    console.log("Glitch effect completed, navigating to docs")
    setIsGlitchComplete(true)
    // Navigate directly to docs immediately
    router.push("/docs")
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
