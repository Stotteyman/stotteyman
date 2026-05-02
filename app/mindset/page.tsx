import type { Metadata } from 'next';
import MindsetClient from './MindsetClient';

export const metadata: Metadata = {
  title: 'Mindset',
  description: 'The principles, posture, and operating style behind the Stotteyman portfolio and public work.',
};

export default function MindsetPage() {
  return <MindsetClient />;
}