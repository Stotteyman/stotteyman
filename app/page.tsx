'use client';
import { useEffect, useState } from 'react';
import IntroAnimation from '@/components/IntroAnimation';
import PortfolioMenu from '@/components/PortfolioMenu';
import AboutPage from '@/components/AboutPage';
import SocialsPage from '@/components/SocialsPage';
// Blog routes are now handled by /blog and /blog/[slug]
import ProjectsPage from '@/components/ProjectsPage';
import ContactPage from '@/components/ContactPage';

type Screen = 'intro' | 'menu' | 'about' | 'socials' | 'projects' | 'contact';

export default function HomePage() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [respectMotionPreference] = useState<boolean>(true);

  // Determine if intro can be skipped
  const [canSkipIntro, setCanSkipIntro] = useState(false);
  useEffect(() => {
    try {
      setCanSkipIntro(localStorage.getItem('stotteyman_intro_seen') === 'true');
    } catch {}
  }, []);

  const handleIntroComplete = () => {
    try { 
      localStorage.setItem('stotteyman_intro_seen', 'true'); 
    } catch {}
    setScreen('menu');
  };

  const handleNavigate = (page: string) => {
    if (page === 'blog') {
      // Redirect to /blog route
      window.location.href = '/blog';
    } else {
      setScreen(page as Screen);
    }
  };

  const handleBackToMenu = () => {
    setScreen('menu');
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {screen === 'intro' && (
        <IntroAnimation
          respectMotionPreference={respectMotionPreference}
          onComplete={handleIntroComplete}
        />
      )}

      {screen === 'menu' && (
        <PortfolioMenu
          respectMotionPreference={respectMotionPreference}
          onNavigate={handleNavigate}
        />
      )}

      {screen === 'about' && (
        <AboutPage
          respectMotionPreference={respectMotionPreference}
          onBack={handleBackToMenu}
        />
      )}

      {screen === 'socials' && (
        <SocialsPage
          respectMotionPreference={respectMotionPreference}
          onBack={handleBackToMenu}
        />
      )}

      {/* Blog routes are now handled by /blog and /blog/[slug] */}

      {screen === 'projects' && (
        <ProjectsPage
          respectMotionPreference={respectMotionPreference}
          onBack={handleBackToMenu}
        />
      )}

      {screen === 'contact' && (
        <ContactPage
          respectMotionPreference={respectMotionPreference}
          onBack={handleBackToMenu}
        />
      )}
    </div>
  );
}
