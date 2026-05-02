import type { Metadata } from 'next';
import EventsClient from './EventsClient';

export const metadata: Metadata = {
  title: 'Events',
  description: 'Upcoming live sessions, checkpoints, and community touchpoints connected to the Stotteyman brand.',
};

export default function EventsPage() {
  return <EventsClient />;
}