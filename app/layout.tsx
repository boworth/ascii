import type React from "react"
import { Inter, Roboto_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
})

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono"
})

export const metadata = {
  generator: 'v0.app',
  title: 'TRNG.le',
  icons: {
    icon: '/favicon-32.png',
    shortcut: '/favicon-32.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon-32.png" />
      </head>
      <body className={`${inter.variable} ${robotoMono.variable} font-sans overflow-hidden`}>{children}</body>
    </html>
  )
}
