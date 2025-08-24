import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import dynamic from 'next/dynamic'
import './globals.css'
import { Navigation } from '@/components/Navigation'

const FloatingCTA = dynamic(
  () => import('@/components/FloatingCTA').then((mod) => mod.FloatingCTA),
  { ssr: false }
)

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
        <a href="#main" className="sr-only focus:not-sr-only skip-link">Skip to content</a>
        <Navigation />
        <main id="main" className="relative">
          {children}
        </main>
        <FloatingCTA />
      </body>
    </html>
  )
}

