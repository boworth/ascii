import NeonIsometricMaze from "./neon-isometric-maze"

export default function Home() {
  return (
    <main className="w-full h-screen overflow-hidden bg-black relative">
      <NeonIsometricMaze />
      <h1 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-bold text-white text-center z-10 pointer-events-none">
        QuantifyX
      </h1>
    </main>
  )
}
