"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"

const NeonIsometricMaze: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const asciiChars = [" ", ".", ":", "-", "=", "+", "*", "#", "%", "@"]

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      draw()
    }

    const draw = () => {
      if (!ctx || !video || !isVideoLoaded) return

      const scale = 0.1
      const cellSize = Math.floor(Math.min(canvas.width, canvas.height) / 100)
      const cols = Math.floor(canvas.width / cellSize)
      const rows = Math.floor(canvas.height / cellSize)

      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.drawImage(video, 0, 0, cols, rows)
      const imageData = ctx.getImageData(0, 0, cols, rows)
      ctx.fillStyle = "white"
      ctx.font = `${cellSize}px monospace`

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const index = (y * cols + x) * 4
          const r = imageData.data[index]
          const g = imageData.data[index + 1]
          const b = imageData.data[index + 2]
          const brightness = (r + g + b) / 3

          const charIndex = Math.floor((brightness / 255) * (asciiChars.length - 1))
          const char = asciiChars[charIndex]

          const screenX = x * cellSize
          const screenY = y * cellSize

          const distanceFromCenter = Math.sqrt(Math.pow(x - cols / 2, 2) + Math.pow(y - rows / 2, 2))
          const maxDistance = Math.sqrt(Math.pow(cols / 2, 2) + Math.pow(rows / 2, 2))
          const normalizedDistance = distanceFromCenter / maxDistance

          const waveEffect = Math.sin(normalizedDistance * 10 + performance.now() * 0.002) * cellSize * 0.5

          ctx.fillText(char, screenX, screenY + waveEffect)
        }
      }

      requestAnimationFrame(draw)
    }

    const handleVideoLoad = () => {
      setIsVideoLoaded(true)
      video.play()
      draw()
    }

    video.addEventListener("loadeddata", handleVideoLoad)
    window.addEventListener("resize", resize)
    resize()

    return () => {
      window.removeEventListener("resize", resize)
      video.removeEventListener("loadeddata", handleVideoLoad)
    }
  }, [isVideoLoaded])

  return (
    <>
      <canvas ref={canvasRef} className="block w-full h-full" />
      <video
        ref={videoRef}
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ocean-hcaQt7mvEjAw2pQzF3FSrtLoxu45ZX.mp4"
        loop
        muted
        playsInline
        className="hidden"
        crossOrigin="anonymous"
      />
    </>
  )
}

export default NeonIsometricMaze
