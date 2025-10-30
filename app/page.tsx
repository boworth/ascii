"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import NeonIsometricMaze from "./neon-isometric-maze"
import { motion, useAnimation } from "framer-motion"

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isGlitchComplete, setIsGlitchComplete] = useState(false)
  const [isScalingStarted, setIsScalingStarted] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const textControls = useAnimation()
  const containerRef = useRef<HTMLDivElement>(null)

  const handleLoadComplete = useCallback(() => {
    console.log("Maze loaded, showing content")
    setIsLoading(false)
  }, [])

  const handleButtonClick = useCallback(() => {
    console.log("Button clicked, starting scaling animation")
    setIsScalingStarted(true)
  }, [])

  const handleGlitchComplete = useCallback(() => {
    console.log("Glitch effect completed, starting fade to black and scroll")
    setIsGlitchComplete(true)
  }, [])

  const handleScrollComplete = useCallback(() => {
    console.log("Scroll animation completed, navigating to wallet")
    setTimeout(() => {
      router.push("/wallet")
    }, 500)
  }, [router])

  useEffect(() => {
    if (isScalingStarted) {
      console.log("Starting scaling animation")
      textControls.start({
        scale: [1, 1.5],
        transition: { duration: 15, ease: "linear" },
      })
    }
  }, [isScalingStarted, textControls])

  useEffect(() => {
    if (isGlitchComplete) {
      console.log("Glitch complete, stopping scaling and starting fade to black")
      textControls.stop()
      
      // Fade text to black
      textControls.start({
        color: ["rgba(255,255,255,1)", "rgba(0,0,0,1)"],
        transition: { duration: 1.5, ease: "easeInOut" },
      })
      
      // Start scroll after a brief delay
      setTimeout(() => {
        setIsScrolling(true)
      }, 1500)
    }
  }, [isGlitchComplete, textControls])

  return (
    <div 
      ref={containerRef}
      className="w-screen h-screen overflow-hidden bg-black relative select-none"
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
      <motion.div
        className="w-full h-[200vh]"
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
        onAnimationComplete={() => {
          if (isScrolling) {
            handleScrollComplete()
          }
        }}
      >
        {/* Landing Page Section */}
        <div className="w-screen h-screen relative">
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
          {!isLoading && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                initial={{ color: "white", scale: 1 }}
                animate={textControls}
                style={{
                  transformOrigin: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
                }}
              >
                <h1 className="text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] xl:text-[12rem] 2xl:text-[14rem] font-bold text-center leading-none whitespace-nowrap">
                  Ascii
                </h1>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Wallet Page Section - Transition to actual wallet */}
        <div 
          className="w-screen h-screen relative flex items-center justify-center bg-gray-200"
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
        </div>
      </motion.div>
    </div>
  )
}
