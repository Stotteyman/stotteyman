import type { Metadata } from 'next';
import FollowClient from './FollowClient';

export const metadata: Metadata = {
  title: 'Follow',
  description: 'Social platforms, community links, and the fastest ways to keep up with Stotteyman.',
};

export default function FollowPage() {
  return <FollowClient />;
}