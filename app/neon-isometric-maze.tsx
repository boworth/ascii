"use client"

import React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

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
  isGlitchComplete?: boolean
}

const NeonIsometricMaze: React.FC<IsometricMazeProps> = ({ onGlitchComplete, onButtonClick, onLoadComplete, isGlitchComplete: isGlitchCompleteProp = false }) => {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [isSplineLoaded, setIsSplineLoaded] = useState(false)
  const [isGlitching, setIsGlitching] = useState(false)
  const [titleColor, setTitleColor] = useState('#ffffff')
  const titleRef = useRef<HTMLHeadingElement>(null)
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
  const [isTitleAnimating, setIsTitleAnimating] = useState(false)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920)
  const mobileBreakpoint = 1400 // Switch to mobile layout much earlier
  
  // Initialize title color - now handled directly via DOM manipulation in draw function
  useEffect(() => {
    // Use a small delay to ensure the ref is attached
    const timer = setTimeout(() => {
      if (titleRef.current) {
        titleRef.current.style.setProperty('color', '#ffffff', 'important')
        console.log('Title ref initialized, set to white')
      } else {
        console.log('Title ref not found during initialization!')
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  // Listen for Spline iframe load with improved detection
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let splineReady = false
    
    // Listen for messages from Spline iframe
    const handleMessage = (event: MessageEvent) => {
      // Spline sends various messages, we'll consider it loaded after any message
      if (event.origin === 'https://my.spline.design' || event.data?.type === 'spline') {
        if (!splineReady) {
          console.log('Spline message received, marking as ready')
          splineReady = true
          setIsSplineLoaded(true)
        }
      }
    }
    
    window.addEventListener('message', handleMessage)
    
    // Fallback: If no message received, wait for iframe load + extra time for 3D rendering
    const iframe = document.getElementById('spline-iframe') as HTMLIFrameElement
    if (iframe) {
      const handleIframeLoad = () => {
        console.log('Spline iframe HTML loaded, waiting for 3D content...')
        // Wait an additional 2 seconds after iframe loads for Spline content to render
        timeoutId = setTimeout(() => {
          if (!splineReady) {
            console.log('Spline timeout fallback - marking as loaded')
            splineReady = true
            setIsSplineLoaded(true)
          }
        }, 2000)
      }
      
      iframe.addEventListener('load', handleIframeLoad)
      
      // Check if already loaded
      if (iframe.contentDocument?.readyState === 'complete') {
        handleIframeLoad()
      }
      
      return () => {
        iframe.removeEventListener('load', handleIframeLoad)
        window.removeEventListener('message', handleMessage)
        if (timeoutId) clearTimeout(timeoutId)
      }
    }
    
    return () => {
      window.removeEventListener('message', handleMessage)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  // Call onLoadComplete only when both video and Spline are loaded
  useEffect(() => {
    if (isVideoLoaded && isSplineLoaded) {
      console.log('Both video and Spline loaded, calling onLoadComplete')
      onLoadComplete?.()
    }
  }, [isVideoLoaded, isSplineLoaded, onLoadComplete])

  // Send message to Spline when title animation starts
  useEffect(() => {
    const iframe = document.getElementById('spline-iframe') as HTMLIFrameElement
    if (iframe && iframe.contentWindow) {
      if (isTitleAnimating) {
        // Send start animation event to Spline
        iframe.contentWindow.postMessage({
          type: 'triggerAnimation',
          action: 'start'
        }, '*')
        console.log('Sent animation start message to Spline')
      } else {
        // Send stop/reset animation event to Spline (optional)
        iframe.contentWindow.postMessage({
          type: 'triggerAnimation',
          action: 'stop'
        }, '*')
      }
    }
  }, [isTitleAnimating])

  // Pre-define character arrays to avoid recreating them
  const glitchSequenceChars = ["+", "=", "-", ":", ".", " "]
  const randomGlitchChars = ["#", "$", "!", "?", "&", "%", "@", "/", "\\", "|", "<", ">"]
  const asciiChars = ["@", "%", "#", "*", "+", "=", "-", ":", ".", " "]

  const startGlitchAnimation = useCallback(() => {
    if (!isGlitching) {
      setIsGlitching(true)
      frameCountRef.current = 0
      processingOffsetRef.current = 0 // Reset processing offset
      glitchCompleteRef.current = false // Reset completion tracker

      if (canvasRef.current) {
        // Dynamically adjust columns based on screen width for consistent performance
        const aspectRatio = window.innerWidth / window.innerHeight
        const maxCells = 10000 // Cap total cells for performance
        
        // Adjust columns based on screen width
        let fixedCols = Math.min(140, Math.floor(window.innerWidth / 12))
        let fixedRows = Math.floor(fixedCols / aspectRatio)
        
        // If too many cells, reduce columns
        if (fixedCols * fixedRows > maxCells) {
          fixedCols = Math.floor(Math.sqrt(maxCells * aspectRatio))
          fixedRows = Math.floor(fixedCols / aspectRatio)
        }
        
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

  const handleDocsClick = useCallback(() => {
    setShowButtons(false)
    setIsCollapsing(true)
    
    // Start title scaling immediately
    setTimeout(() => {
      setIsTitleAnimating(true)
    }, 100)
    
    // Then start glitch animation after a brief delay
    setTimeout(() => {
      onButtonClick()
      startGlitchAnimation()
    }, 800)
  }, [onButtonClick, startGlitchAnimation])

  const handleButtonClick = useCallback(() => {
    setIsCollapsing(true)
    onButtonClick()
    console.log("Button clicked, calling onButtonClick")
    setTimeout(() => {
      setShowButtons(false)
      startGlitchAnimation()
    }, 100)
  }, [startGlitchAnimation, onButtonClick])

  // Track window width for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Dynamic column calculation based on viewport
    const calculateOptimalGrid = () => {
      const aspectRatio = window.innerWidth / window.innerHeight
      const maxCells = 10000 // Cap total cells for performance
      
      let cols = Math.min(140, Math.floor(window.innerWidth / 12))
      let rows = Math.floor(cols / aspectRatio)
      
      // If too many cells, reduce columns
      if (cols * rows > maxCells) {
        cols = Math.floor(Math.sqrt(maxCells * aspectRatio))
        rows = Math.floor(cols / aspectRatio)
      }
      
      return { cols, rows }
    }
    
    let { cols: fixedCols, rows: fixedRows } = calculateOptimalGrid()

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
      
      // Recalculate optimal grid on resize
      const newGrid = calculateOptimalGrid()
      fixedCols = newGrid.cols
      fixedRows = newGrid.rows
      
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
      const isComplete = completionPercentage > 99 || frameCountRef.current > 150

      if (isComplete && frameCountRef.current > 70) { // Navigate immediately when glitch completes
        console.log(
          `Glitch complete at frame ${frameCountRef.current}: ${blackCount}/${infectedCount} cells (${completionPercentage.toFixed(2)}%)`,
        )
        onGlitchComplete()
      }

      return isComplete
    }

    let frameSkipCounter = 0
    const FRAME_SKIP = 2 // Skip every other frame to reduce CPU usage
    
    // Create temp canvas once and reuse it
    const tempCanvas = document.createElement("canvas")
    const initialGrid = calculateOptimalGrid()
    tempCanvas.width = initialGrid.cols
    tempCanvas.height = initialGrid.rows
    const tempCtx = tempCanvas.getContext("2d", { alpha: false, willReadFrequently: true })
    if (!tempCtx) return
    tempCtx.imageSmoothingEnabled = false
    
    const draw = () => {
      if (!ctx || !video || !isVideoLoaded) return
      
      // Fade removed - no need to check fadeCompleteRef

      // Skip frames to reduce CPU usage
      frameSkipCounter++
      if (!isGlitching && frameSkipCounter % FRAME_SKIP !== 0) {
        animationFrameRef.current = requestAnimationFrame(draw)
        return
      }

      const cellWidth = canvas.width / fixedCols
      const cellHeight = canvas.height / fixedRows

      // Update temp canvas size if needed
      if (tempCanvas.width !== fixedCols || tempCanvas.height !== fixedRows) {
        tempCanvas.width = fixedCols
        tempCanvas.height = fixedRows
      }

      // Draw video to temp canvas with lower quality
      tempCtx.drawImage(video, 0, 0, fixedCols, fixedRows)
      const currentImageData = tempCtx.getImageData(0, 0, fixedCols, fixedRows)

      // Capture initial frame when starting the glitch
      if (isGlitching && !initialImageDataRef.current) {
        // Create a deep copy of the image data
        const copy = tempCtx.createImageData(fixedCols, fixedRows)
        copy.data.set(currentImageData.data)
        initialImageDataRef.current = copy
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

          // Fade removed - navigate directly when glitch completes
        }
      } catch (error) {
        console.error("Error in draw function:", error)
      }

      // Continue animation loop regardless of glitch state
      animationFrameRef.current = requestAnimationFrame(draw)
    }

    const handleVideoLoad = () => {
      setIsVideoLoaded(true)
      // Slow down video to reduce resource usage
      video.playbackRate = 0.5
      video.play().catch((err) => console.error("Error playing video:", err))

      // Start animation loop immediately
      resize()

      // Initialize the glitch map for normal display
      const optimalGrid = calculateOptimalGrid()
      const fixedCols = optimalGrid.cols
      const fixedRows = optimalGrid.rows
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
    <React.Fragment>
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full block z-10" />
      <video
        ref={videoRef}
        src="/ocean-compressed.mp4"
        loop
        muted
        playsInline
        className="hidden"
        preload="metadata"
        width="240"
        height="160"
      />
      {/* Always show the title container, but conditionally render buttons/modals */}
      <div 
        className="fixed inset-0 flex items-center justify-center"
        style={{ 
          zIndex: 100,
          pointerEvents: showLoginModal || showRegisterModal ? 'auto' : 'none',
          display: windowWidth < mobileBreakpoint && (showLoginModal || showRegisterModal) ? 'none' : 'flex'
        }}
      >
        {/* Mobile Layout - Centered title with Docs button below */}
        {windowWidth < 768 && !showLoginModal && !showRegisterModal && showButtons && (
          <div className="fixed inset-0 flex flex-col items-center justify-center z-[10002]" style={{ pointerEvents: 'auto' }}>
            <h1 className="text-6xl font-bold text-white mb-8" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", system-ui, sans-serif' }}>
              TRNG.le
            </h1>
            <button
              onClick={handleDocsClick}
              className="px-8 py-3 bg-transparent text-white text-lg hover:bg-white hover:text-black border-2 border-white transition-all duration-200 rounded-lg"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", system-ui, sans-serif' }}
            >
              Docs
            </button>
          </div>
        )}

        {/* Desktop Layout - Top Left Title */}
        {windowWidth >= 768 && !showLoginModal && !showRegisterModal && showButtons && (
          <div className="fixed top-8 left-8 z-[10002]" style={{ pointerEvents: 'auto' }}>
            <h1 className="text-8xl font-bold text-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", system-ui, sans-serif' }}>
              TRNG.le
            </h1>
          </div>
        )}

        {/* Desktop Layout - Top Right Docs Button */}
        <AnimatePresence mode="wait">
          {windowWidth >= 768 && !showLoginModal && !showRegisterModal && showButtons && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed top-8 right-8 z-[10002] flex gap-3"
              style={{ pointerEvents: 'auto' }}
            >
              <button
                onClick={handleDocsClick}
                className="px-6 py-2 bg-transparent text-white text-base hover:bg-white hover:text-black border-2 border-white transition-all duration-200 rounded-lg"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", system-ui, sans-serif' }}
              >
                Docs
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spline Background - Desktop only */}
        {windowWidth >= 768 && (
          <motion.div 
            ref={titleRef}
            className="fixed inset-0 flex items-center justify-center"
            animate={{
              x: (showRegisterModal || showLoginModal) && windowWidth > mobileBreakpoint ? -450 : 0,
              scale: isTitleAnimating ? 1.3 : 1
            }}
            transition={{
              x: {
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1]
              },
              scale: {
                duration: isTitleAnimating ? 6.0 : 0.5,
                ease: isTitleAnimating ? "linear" : [0.4, 0, 0.2, 1]
              }
            }}
            style={{
              width: '100vw',
              height: '100vh',
              zIndex: 1,
              position: 'fixed',
              top: 0,
              left: 0,
              opacity: 1
            }}
          >
            <iframe 
              id="spline-iframe"
              src='https://my.spline.design/weirdbubblecopy-4Gvk9sRNR2GYKCwZtbv4jlf2/?controls=false&orbit=false' 
              frameBorder='0' 
              width='100%' 
              height='100%'
              style={{
                border: 'none',
                borderRadius: '0',
                background: 'transparent',
                display: 'block',
                pointerEvents: 'auto'
              }}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            />
            
          </motion.div>
        )}
      </div>

    </React.Fragment>
  )
}

export default NeonIsometricMaze

