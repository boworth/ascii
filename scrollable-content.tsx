import type React from "react"

const ScrollableContent: React.FC = () => {
  return (
    <div className="min-h-screen p-8 text-white bg-black bg-opacity-80">
      <h2 className="text-4xl font-bold mb-6">Welcome to Ascii</h2>
      <p className="mb-4">Scroll down to explore more content...</p>
      {[...Array(10)].map((_, index) => (
        <section key={index} className="mb-12">
          <h3 className="text-2xl font-semibold mb-4">Section {index + 1}</h3>
          <p className="mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisi vel consectetur interdum, nisl
            nunc egestas nunc, vitae tincidunt nisl nunc euismod nunc.
          </p>
          <p className="mb-4">
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        </section>
      ))}
    </div>
  )
}

export default ScrollableContent
