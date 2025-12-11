import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TRNG.le API Documentation",
  description: "Proprietary RFQ on Canton Network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
