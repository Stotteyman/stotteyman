import type { Metadata } from 'next'
import ClientPage from './ClientPage'

export const metadata: Metadata = {
  title: 'Stotteyman Enterprises | People-First Startup Innovation',
  description: 'Startup genius Gary Lee McCullouch Jr. builds intelligent, community-focused ventures that invite bold investment and inspire social good.',
  openGraph: {
    title: 'Stotteyman Enterprises | People-First Startup Innovation',
    description: 'Startup genius Gary Lee McCullouch Jr. builds intelligent, community-focused ventures that invite bold investment and inspire social good.',
    images: ['/og'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stotteyman Enterprises | People-First Startup Innovation',
    description: 'Startup genius Gary Lee McCullouch Jr. builds intelligent, community-focused ventures that invite bold investment and inspire social good.',
    images: ['/og'],
  },
}

export default function HomePage() {
  return <ClientPage />
}

