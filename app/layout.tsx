import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { FloatingCTA } from '@/components/FloatingCTA'
import { Navigation } from '@/components/Navigation'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
})

const jetbrains = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${playfair.variable} ${jetbrains.variable} font-sans bg-black text-white overflow-x-hidden`}>
        <Navigation />
        <main className="relative">
          {children}
        </main>
        <FloatingCTA />
        <Analytics />
      </body>
    </html>
  )
}
