"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import RegistrationModal from "./RegistrationModal"

interface GlitchCell {
  isInfected: boolean
  glitchStage: number
  fullyBlack: boolean
  glitchSpeed: number // Property for individual speed
  lastUpdated: number // Track when this cell was last updated
}

interface IsometricMazeProps {
  onGlitchComplete: () => void
  onButtonClick: () => void
  onLoadComplete?: () => void
}

const NeonIsometricMaze: React.FC<IsometricMazeProps> = ({ onGlitchComplete, onButtonClick, onLoadComplete }) => {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [isGlitching, setIsGlitching] = useState(false)
  const glitchMapRef = useRef<GlitchCell[]>([])
  const frameCountRef = useRef(0)
  const initialImageDataRef = useRef<ImageData | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const processingOffsetRef = useRef(0)
  const glitchCompleteRef = useRef(false)
  const [isCollapsing, setIsCollapsing] = useState(false)
  const [showButtons, setShowButtons] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")

  // Pre-define character arrays to avoid recreating them
  const glitchSequenceChars = ["+", "=", "-", ":", ".", " "]
  const randomGlitchChars = ["#", "$", "!", "?", "&", "%", "@", "/", "\\", "|", "<", ">"]
  const asciiChars = ["@", "%", "#", "*", "+", "=", "-", ":", ".", " "]

  const handleLogin = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    // Simple test credentials for now
    if (username === "test" && password === "test") {
      setLoginError("")
      setShowButtons(false)
      setIsCollapsing(true)
      onButtonClick()
      
      setTimeout(() => {
        startGlitchAnimation()
      }, 500)
    } else {
      setLoginError("Invalid username or password")
    }
  }, [username, password, onButtonClick])

  const handleLoginClick = useCallback(() => {
    setShowLoginModal(true)
  }, [])

  const handleCreateWalletClick = useCallback(() => {
    setShowRegisterModal(true)
  }, [])

  const handleRegistrationSuccess = useCallback(() => {
    setShowRegisterModal(false)
    // Show a message or redirect to login
    // For now, just close the modal - user will need to verify email first
  }, [])

  const startGlitchAnimation = useCallback(() => {
    if (!isGlitching) {
      setIsGlitching(true)
      frameCountRef.current = 0
      processingOffsetRef.current = 0 // Reset processing offset
      glitchCompleteRef.current = false // Reset completion tracker

      if (canvasRef.current) {
        // Use a lower fixedCols value for larger ASCII characters
        const fixedCols = 180
        const aspectRatio = window.innerWidth / window.innerHeight
        const fixedRows = Math.floor(fixedCols / aspectRatio)
        const totalCells = fixedCols * fixedRows

        // Reset each cell's state instead of replacing the whole array
        for (let i = 0; i < glitchMapRef.current.length; i++) {
          if (glitchMapRef.current[i]) {
            glitchMapRef.current[i].isInfected = false
            glitchMapRef.current[i].glitchStage = 0
            glitchMapRef.current[i].fullyBlack = false
          }
        }

        // Initialize infections along the edges with random speeds
        const initialInfections = 100

        // Function to add infections along a specific edge
        const addEdgeInfections = (edgeType: "top" | "bottom" | "left" | "right", count: number) => {
          for (let i = 0; i < count; i++) {
            let cellIndex: number

            switch (edgeType) {
              case "top":
                // Top edge - random column in the first 2 rows
                cellIndex = Math.floor(Math.random() * fixedCols) + Math.floor(Math.random() * 2) * fixedCols
                break
              case "bottom":
                // Bottom edge - random column in the last 2 rows
                cellIndex =
                  Math.floor(Math.random() * fixedCols) + (fixedRows - 2 + Math.floor(Math.random() * 2)) * fixedCols
                break
              case "left":
                // Left edge - first 2 columns, random row
                cellIndex = Math.floor(Math.random() * 2) + Math.floor(Math.random() * fixedRows) * fixedCols
                break
              case "right":
                // Right edge - last 2 columns, random row
                cellIndex =
                  fixedCols - 2 + Math.floor(Math.random() * 2) + Math.floor(Math.random() * fixedRows) * fixedCols
                break
              default:
                cellIndex = Math.floor(Math.random() * totalCells)
            }

            if (cellIndex >= 0 && cellIndex < totalCells && glitchMapRef.current[cellIndex]) {
              glitchMapRef.current[cellIndex].isInfected = true
              // Assign a random glitch speed between 0.7 and 1.3
              glitchMapRef.current[cellIndex].glitchSpeed = 0.7 + Math.random() * 0.6
              glitchMapRef.current[cellIndex].lastUpdated = frameCountRef.current
            }
          }
        }

        // Distribute infections along all edges
        addEdgeInfections("top", initialInfections * 0.25)
        addEdgeInfections("bottom", initialInfections * 0.25)
        addEdgeInfections("left", initialInfections * 0.25)
        addEdgeInfections("right", initialInfections * 0.25)

        // Force reset the initial image data to ensure fresh capture
        initialImageDataRef.current = null
      }
    }
  }, [isGlitching])

  const handleButtonClick = useCallback(() => {
    setIsCollapsing(true)
    onButtonClick()
    console.log("Button clicked, calling onButtonClick")
    setTimeout(() => {
      setShowButtons(false)
      startGlitchAnimation()
    }, 100)
  }, [startGlitchAnimation, onButtonClick])

  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const fixedCols = 180
    let fixedRows: number

    // Pre-compute neighbor offsets to avoid recreating them
    const neighborOffsets = [
      { dx: -1, dy: -1 },
      { dx: 0, dy: -1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: -1, dy: 1 },
      { dx: 0, dy: 1 },
      { dx: 1, dy: 1 },
    ]

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      const aspectRatio = canvas.width / canvas.height
      fixedRows = Math.floor(fixedCols / aspectRatio)
      initialImageDataRef.current = null
    }

    const checkGlitchCompletion = () => {
      // Remove the initial frame check to allow earlier completion

      // Get total number of infected cells
      const infectedCount = glitchMapRef.current.filter((cell) => cell && cell.isInfected).length

      // If nothing is infected yet, we're not complete
      if (infectedCount === 0) return false

      // Count fully black cells
      const blackCount = glitchMapRef.current.filter((cell) => cell && cell.fullyBlack).length

      // Calculate completion percentage
      const completionPercentage = (blackCount / infectedCount) * 100

      // Consider complete if we're at 99%+ completion or at frame 150+
      // Reduced from 345 to 150 to trigger earlier
      const isComplete = completionPercentage > 99 || frameCountRef.current > 150

      if (isComplete) {
        console.log(
          `Glitch complete at frame ${frameCountRef.current}: ${blackCount}/${infectedCount} cells (${completionPercentage.toFixed(2)}%)`,
        )
        onGlitchComplete()
      }

      return isComplete
    }

    const draw = () => {
      if (!ctx || !video || !isVideoLoaded) return

      const cellWidth = canvas.width / fixedCols
      const cellHeight = canvas.height / fixedRows

      // Create temp canvas for image processing
      const tempCanvas = document.createElement("canvas")
      tempCanvas.width = fixedCols
      tempCanvas.height = fixedRows
      const tempCtx = tempCanvas.getContext("2d")
      if (!tempCtx) return

      // Draw video to temp canvas
      tempCtx.drawImage(video, 0, 0, fixedCols, fixedRows)
      const currentImageData = tempCtx.getImageData(0, 0, fixedCols, fixedRows)

      // Capture initial frame when starting the glitch
      if (isGlitching && !initialImageDataRef.current) {
        initialImageDataRef.current = currentImageData.slice
          ? currentImageData.slice()
          : tempCtx.getImageData(0, 0, fixedCols, fixedRows)
      }

      // Clear canvas with solid black to avoid ghosting
      ctx.fillStyle = "rgba(0, 0, 0, 1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Set up text rendering
      const fontSize = Math.floor(Math.min(cellWidth, cellHeight) * 1.2)
      ctx.font = `${fontSize}px monospace`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      try {
        // Process infection and rendering in a single pass to improve performance
        if (isGlitching) {
          const newInfections: number[] = []
          const totalCells = fixedRows * fixedCols

          // Process infection logic until we're 120 frames in (handles spread)
          const shouldProcessInfections = frameCountRef.current < 120

          // Calculate how many cells to process per frame to reduce load
          const processEveryNthCell = frameCountRef.current < 30 ? 1 : frameCountRef.current < 60 ? 2 : 3

          // MAJOR FIX: Rotating offset pattern to ensure all cells get processed
          // Increment the offset each frame, wrapping it to the stride
          processingOffsetRef.current = (processingOffsetRef.current + 1) % processEveryNthCell

          // Process cells with rotating offset to catch all cells
          for (let cellIndex = processingOffsetRef.current; cellIndex < totalCells; cellIndex += processEveryNthCell) {
            const cell = glitchMapRef.current[cellIndex]
            if (!cell) continue

            // Process infections - enable infection spread
            if (shouldProcessInfections && cell.isInfected && !cell.fullyBlack) {
              const y = Math.floor(cellIndex / fixedCols)
              const x = cellIndex % fixedCols

              // Infect all neighbors in later frames to ensure complete coverage
              const laterFrames = frameCountRef.current > 100
              const infectionProbability = laterFrames ? 0.8 : 0.4 // Higher probability in later frames

              for (const offset of neighborOffsets) {
                const nx = x + offset.dx
                const ny = y + offset.dy

                if (nx >= 0 && nx < fixedCols && ny >= 0 && ny < fixedRows) {
                  const neighborIndex = ny * fixedCols + nx
                  const neighborCell = glitchMapRef.current[neighborIndex]

                  // Higher probability of infection as animation progresses
                  if (neighborCell && !neighborCell.isInfected && Math.random() < infectionProbability) {
                    newInfections.push(neighborIndex)
                  }
                }
              }
            }

            // Update infected cells - with enhanced logic
            if (cell.isInfected && !cell.fullyBlack) {
              // Enhanced update strategy - calculate frame requirements based on speed
              const framesNeeded = Math.max(1, Math.round(2.0 / cell.glitchSpeed))

              // Check if this cell is due for an update
              // The critical fix is using the modulo operation to ensure regular updates
              if (
                frameCountRef.current % framesNeeded === 0 ||
                frameCountRef.current - cell.lastUpdated >= framesNeeded
              ) {
                // Regular incremental update
                cell.glitchStage += 1
                cell.lastUpdated = frameCountRef.current

                // Complete at a consistent threshold
                if (cell.glitchStage >= 13) {
                  cell.fullyBlack = true
                }
              }

              // Backup failsafe for any cell not updating in too long
              // Only as a safety net - the modulo approach should prevent this
              const maxStuckFrames = 20
              if (frameCountRef.current - cell.lastUpdated > maxStuckFrames) {
                cell.glitchStage += 1
                cell.lastUpdated = frameCountRef.current

                if (cell.glitchStage >= 13) {
                  cell.fullyBlack = true
                }
              }
            }
          }

          // Apply new infections
          for (const index of newInfections) {
            if (glitchMapRef.current[index]) {
              glitchMapRef.current[index].isInfected = true
              // Give newly infected cells a random speed
              glitchMapRef.current[index].glitchSpeed = 0.7 + Math.random() * 0.6
              glitchMapRef.current[index].lastUpdated = frameCountRef.current
            }
          }

          // Add monitoring logs
          if (frameCountRef.current % 50 === 0 || frameCountRef.current === 0) {
            const infectedCount = glitchMapRef.current.filter((cell) => cell && cell.isInfected).length
            const blackCount = glitchMapRef.current.filter((cell) => cell && cell.fullyBlack).length
            const incompleteCount = infectedCount - blackCount
            console.log(
              `Frame ${frameCountRef.current}: ${blackCount}/${infectedCount} cells complete, ${incompleteCount} still pending`,
            )
          }

          // Check for glitch completion
          if (!glitchCompleteRef.current && checkGlitchCompletion()) {
            glitchCompleteRef.current = true

            // Call the onGlitchComplete callback if provided
            if (onGlitchComplete) {
              onGlitchComplete()
            }
          }
        }

        // Render cells - always do this regardless of glitch state
        for (let y = 0; y < fixedRows; y++) {
          for (let x = 0; x < fixedCols; x++) {
            const cellIndex = y * fixedCols + x

            // Initialize glitchMapRef for any missing cells if needed
            if (!glitchMapRef.current[cellIndex]) {
              // Create empty cells for initial render
              glitchMapRef.current[cellIndex] = {
                isInfected: false,
                glitchStage: 0,
                fullyBlack: false,
                glitchSpeed: 1.0,
                lastUpdated: 0,
              }
            }

            // Skip rendering if out of bounds
            if (cellIndex >= glitchMapRef.current.length) continue

            const cell = glitchMapRef.current[cellIndex]
            if (!cell) continue

            const screenX = x * cellWidth + cellWidth / 2
            const screenY = y * cellHeight + cellHeight / 2

            const index = (y * fixedCols + x) * 4

            // Use appropriate image data source
            const useInitialData = isGlitching && cell.isInfected && initialImageDataRef.current
            const imageData = useInitialData ? initialImageDataRef.current! : currentImageData

            // Skip processing if out of bounds
            if (index + 2 >= imageData.data.length) continue

            const r = imageData.data[index]
            const g = imageData.data[index + 1]
            const b = imageData.data[index + 2]
            const brightness = (r + g + b) / 3

            let displayChar: string

            if (isGlitching && cell.isInfected) {
              if (cell.fullyBlack) {
                displayChar = " "
                ctx.fillStyle = "rgb(0, 0, 0)"
              } else if (cell.glitchStage >= 5) {
                // Increased from 3 to 5 for slower transition
                const sequenceIndex = Math.min(cell.glitchStage - 3, glitchSequenceChars.length - 1)
                displayChar = glitchSequenceChars[sequenceIndex]

                const grayValue = Math.floor(brightness)
                ctx.fillStyle = `rgb(${grayValue}, ${grayValue}, ${grayValue})`
              } else {
                // Get a random but consistent character for this cell
                const randomIndex = (cellIndex + cell.glitchStage) % randomGlitchChars.length
                displayChar = randomGlitchChars[randomIndex]

                const grayValue = Math.floor(brightness)
                ctx.fillStyle = `rgb(${grayValue}, ${grayValue}, ${grayValue})`
              }
            } else {
              const charIndex = Math.min(
                Math.max(Math.floor((brightness / 255) * (asciiChars.length - 1)), 0),
                asciiChars.length - 1,
              )
              displayChar = asciiChars[charIndex]

              const grayValue = Math.floor(brightness)
              ctx.fillStyle = `rgb(${grayValue}, ${grayValue}, ${grayValue})`
            }

            ctx.fillText(displayChar, screenX, screenY)
          }
        }

        // Update frame counter and check for completion
        if (isGlitching) {
          frameCountRef.current++

          // Reduce the glitch effect duration from 350 to 200 frames
          if (frameCountRef.current > 200) {
            ctx.fillStyle = "rgba(0, 0, 0, 1)"
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            setTimeout(() => {
              setIsGlitching(false)
              frameCountRef.current = 0
              initialImageDataRef.current = null
              processingOffsetRef.current = 0 // Reset processing offset
              glitchCompleteRef.current = false // Reset completion tracker

              // Don't completely reset the glitchMapRef, just reset the states
              for (let i = 0; i < glitchMapRef.current.length; i++) {
                if (glitchMapRef.current[i]) {
                  glitchMapRef.current[i].isInfected = false
                  glitchMapRef.current[i].glitchStage = 0
                  glitchMapRef.current[i].fullyBlack = false
                }
              }
            }, 200)
          }
        }
      } catch (error) {
        console.error("Error in draw function:", error)
      }

      // Continue animation loop regardless of glitch state
      animationFrameRef.current = requestAnimationFrame(draw)
    }

    const handleVideoLoad = () => {
      setIsVideoLoaded(true)
      onLoadComplete?.()
      video.play().catch((err) => console.error("Error playing video:", err))

      // Start animation loop immediately
      resize()

      // Initialize the glitch map for normal display
      const fixedCols = 180
      const aspectRatio = window.innerWidth / window.innerHeight
      const fixedRows = Math.floor(fixedCols / aspectRatio)
      const totalCells = fixedCols * fixedRows

      // Only initialize if not already done
      if (!glitchMapRef.current.length) {
        // Create empty cells for initial render
        glitchMapRef.current = new Array(totalCells).fill(null).map(() => ({
          isInfected: false,
          glitchStage: 0,
          fullyBlack: false,
          glitchSpeed: 1.0, // Default speed
          lastUpdated: 0,
        }))
      }

      // Start the animation immediately without delay
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      animationFrameRef.current = requestAnimationFrame(draw)
    }

    video.addEventListener("loadeddata", handleVideoLoad)
    window.addEventListener("resize", resize)

    resize()

    if (video.readyState >= 2) {
      handleVideoLoad()
    }

    return () => {
      window.removeEventListener("resize", resize)
      video.removeEventListener("loadeddata", handleVideoLoad)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isVideoLoaded, isGlitching, onGlitchComplete])

  return (
    <>
      <canvas ref={canvasRef} className="block w-full h-full" />
      <video
        ref={videoRef}
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ocean-YsEsoctKOSQZhvFu9EDVMH7VFxXqn4.mp4"
        loop
        muted
        playsInline
        className="hidden"
        crossOrigin="anonymous"
      />
      {showButtons && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 flex items-center justify-center gap-16">
          {/* Title and Buttons Container */}
          <motion.div 
            className={`button-container ${isCollapsing ? "collapsing" : ""} text-center`}
            animate={{
              x: showRegisterModal ? -200 : 0
            }}
            transition={{
              duration: 0.5,
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            {/* Ascii Title */}
            <h1 className="text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] xl:text-[12rem] 2xl:text-[14rem] font-bold text-white leading-none whitespace-nowrap mb-4">
              Ascii
            </h1>
            
            {!showLoginModal && !showRegisterModal && (
              <p className="text-white text-2xl mb-6 font-sans">Worlds First Canton On Ramp</p>
            )}
            
            {!showLoginModal && !showRegisterModal ? (
              <div className="flex gap-6 justify-center">
                <button
                  onClick={handleLoginClick}
                  className="px-8 py-3 bg-transparent border-2 border-white text-white text-lg font-sans hover:bg-white hover:text-black transition-all duration-200 rounded-lg"
                >
                  Login
                </button>
                <button
                  onClick={handleCreateWalletClick}
                  className="px-8 py-3 bg-white text-black text-lg font-sans hover:bg-transparent hover:text-white border-2 border-white transition-all duration-200 rounded-lg"
                >
                  Create Wallet
                </button>
              </div>
            ) : showLoginModal ? (
              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{
                    duration: 0.25,
                    ease: [0.16, 1, 0.3, 1],
                    type: "tween"
                  }}
                  className="bg-black bg-opacity-20 border-2 border-white rounded-lg p-6 w-96"
                >
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => {
                            setUsername(e.target.value)
                            if (loginError) setLoginError("")
                          }}
                          className={`w-full px-4 py-3 bg-black bg-opacity-30 border rounded-lg focus:outline-none focus:ring-2 text-white placeholder-gray-400 font-sans ${
                            loginError ? 'border-red-400 focus:ring-red-400' : 'border-white focus:ring-white'
                          }`}
                          placeholder="Username"
                          autoFocus
                        />
                      </div>
                      <div>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value)
                            if (loginError) setLoginError("")
                          }}
                          className={`w-full px-4 py-3 bg-black bg-opacity-30 border rounded-lg focus:outline-none focus:ring-2 text-white placeholder-gray-400 font-sans ${
                            loginError ? 'border-red-400 focus:ring-red-400' : 'border-white focus:ring-white'
                          }`}
                          placeholder="Password"
                        />
                      </div>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowLoginModal(false)
                            setLoginError("")
                            setUsername("")
                            setPassword("")
                          }}
                          className="flex-1 px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-black transition-all duration-200 font-sans"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-transparent hover:text-white border-2 border-white transition-all duration-200 font-sans"
                        >
                          Login
                        </button>
                      </div>
                  </form>
                </motion.div>
              </AnimatePresence>
            ) : null}
          </motion.div>

          {/* Registration Modal - positioned absolutely to slide in */}
          {showRegisterModal && (
            <motion.div
              className="absolute"
              style={{ left: 'calc(50% + 200px)' }}
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1]
              }}
            >
              <RegistrationModal
                isOpen={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                onSuccess={handleRegistrationSuccess}
              />
            </motion.div>
          )}
        </div>
      )}

      <style jsx>{`
        @font-face {
          font-family: 'VT323';
          src: url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        }

        .ascii-password-form {
          font-family: 'Nimbus Sans L', Arial, sans-serif;
          font-size: 1.5rem;
          line-height: 1;
        }

        
        .password-container {
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          color: white;
          position: relative;
          overflow: hidden;
        }
        
        .password-bracket {
          color: white;
          padding: 0;
          line-height: 1;
          position: relative;
          z-index: 2;
          transition: transform 0.1s ease-in-out;
        }
        
        .password-input {
          background: transparent;
          color: white;
          border: none;
          outline: none;
          width: 200px;
          text-align: center;
          font-family: 'Nimbus Sans L', Arial, sans-serif;
          font-size: 1.5rem;
          padding: 0;
          margin: 0;
          height: 1.2em;
          line-height: 1;
          transition: all 0.1s ease-in-out;
          position: relative;
          overflow: hidden;
        }
        
        .password-input::placeholder {
          color: rgba(255, 255, 255, 0.7);
          text-align: center;
        }
        
        .wrong-password {
          animation: flash-red 0.5s;
        }
        
        @keyframes flash-red {
          0%, 100% { background-color: transparent; color: #ff0000; }
          50% { background-color: rgba(255, 0, 0, 0.5); color: white; }
        }

        .collapsing .password-input {
          width: 0;
          padding: 0;
          opacity: 0;
        }

        .collapsing .left-bracket {
          transform: translateX(100px);
        }

        .collapsing .right-bracket {
          transform: translateX(-100px);
        }

        .collapsing .password-input::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(to right, transparent, transparent, transparent);
          animation: wipe 0.1s forwards;
        }

        @keyframes wipe {
          to { left: 100%; }
        }

        .button-container {
          transition: opacity 0.1s ease-in-out;
        }
        
        .collapsing {
          opacity: 0;
        }
      `}</style>
    </>
  )
}

export default NeonIsometricMaze
