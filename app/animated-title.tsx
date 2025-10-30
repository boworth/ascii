"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, useAnimate } from "framer-motion"

interface AnimatedTitleProps {
  onAnimationComplete: () => void
}

const AnimatedTitle: React.FC<AnimatedTitleProps> = ({ onAnimationComplete }) => {
  const [quantifyText, setQuantifyText] = useState("Quantify")
  const [scope, animate] = useAnimate()
  const initialPositionRef = useRef<DOMRect | null>(null)
  const equalXRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    // Capture the initial position of the equalX element
    if (equalXRef.current) {
      initialPositionRef.current = equalXRef.current.getBoundingClientRect()
    }

    const animateSequence = async () => {
      // Add a small delay to ensure rendering is complete
      await new Promise((resolve) => setTimeout(resolve, 50))

      // Delete "Quantify" character by character
      for (let i = "Quantify".length; i >= 0; i--) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        setQuantifyText((prev) => prev.slice(0, -1))
      }

      // Add a 400ms pause after text deletion
      await new Promise((resolve) => setTimeout(resolve, 400))

      // Get the current position of the equalX element (which should be center)
      const equalXElement = document.getElementById("equalX")
      if (equalXElement) {
        const rect = equalXElement.getBoundingClientRect()

        // Get window center coordinates
        const windowWidth = window.innerWidth
        const windowHeight = window.innerHeight
        const windowCenterX = windowWidth / 2
        const windowCenterY = windowHeight / 2

        // Calculate the center of the element
        const elementCenterX = rect.left + rect.width / 2
        const elementCenterY = rect.top + rect.height / 2

        // Check if element needs to be centered first
        if (Math.abs(elementCenterX - windowCenterX) > 5 || Math.abs(elementCenterY - windowCenterY) > 5) {
          // Center the element first
          await animate(
            "#equalX",
            {
              x: windowCenterX - elementCenterX,
              y: windowCenterY - elementCenterY,
            },
            {
              duration: 0.3,
              ease: "easeOut",
            },
          )

          // Short pause at center
          await new Promise((resolve) => setTimeout(resolve, 200))
        }

        // Now move "=X" to top right corner with a smooth animation
        await animate(
          "#equalX",
          {
            x: windowWidth - elementCenterX - 20 - rect.width / 2,
            y: 20 - elementCenterY + rect.height / 2,
            scale: 0.5,
          },
          {
            duration: 0.7,
            ease: "easeInOut",
          },
        )

        // Once animation completes, fix it in position
        await animate(
          "#equalX",
          {
            position: "fixed",
            top: "20px",
            right: "20px",
            x: 0,
            y: 0,
          },
          { duration: 0.01 },
        )
      }

      // Call the completion callback
      onAnimationComplete()
    }

    animateSequence()
  }, [animate, onAnimationComplete])

  return (
    <div ref={scope} className="absolute inset-0 flex items-center justify-center">
      <div className="relative flex items-center justify-center text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] font-bold text-white">
        {/* Container for both elements to keep them centered */}
        <div className="flex items-center justify-center">
          {/* Fixed position container for Quantify text */}
          <div className="relative">
            <motion.span className="block" initial={{ opacity: 1 }} animate={{ opacity: 1 }}>
              {quantifyText}
            </motion.span>
          </div>

          {/* =X that will move to the top right corner */}
          <motion.span
            id="equalX"
            ref={equalXRef}
            className="block"
            initial={{ opacity: 1, position: "relative" }}
            animate={{ opacity: 1 }}
            style={{ transformOrigin: "center" }}
          >
            =X
          </motion.span>
        </div>
      </div>
    </div>
  )
}

export default AnimatedTitle
