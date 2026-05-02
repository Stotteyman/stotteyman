import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Direct contact methods and the fastest ways to reach Gary Lee McCullouch Jr. through the Stotteyman portfolio.',
};

export default function ContactPage() {
  return <ContactClient />;
}