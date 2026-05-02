import type { Metadata } from 'next';
import AchievementsClient from './AchievementsClient';

export const metadata: Metadata = {
  title: 'Achievements',
  description: 'Documented wins, visible contributions, and the projects that deserve clear credit.',
};

export default function AchievementsPage() {
  return <AchievementsClient />;
}