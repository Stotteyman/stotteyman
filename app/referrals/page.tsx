import ReferralsClient from './ReferralsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Referral Deals | Stotteyman Enterprises',
  description: 'Discover exclusive referral opportunities and earn commissions with our curated selection of deals.',
}

export default function ReferralsPage() {
  return <ReferralsClient />
}