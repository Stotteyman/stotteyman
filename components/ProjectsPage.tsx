'use client';

import { useEffect, useState } from 'react';
import { useMenuNavigation } from '@/hooks/useMenuNavigation';

interface ProjectsPageProps {
  onBack: () => void;
  respectMotionPreference: boolean;
}

interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  status: 'completed' | 'in-progress' | 'concept';
  url?: string;
  github?: string;
}

const projects: Project[] = [
  {
    id: '1',
    title: 'Education Platform',
    description: 'A comprehensive learning platform where you can learn lots of different things in different ways. Interactive courses, hands-on projects, and personalized learning paths.',
    tech: ['Next.js', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AI/ML'],
    status: 'in-progress',
    url: 'https://learn.stotteyman.com'
  }
];

export default function ProjectsPage({ onBack, respectMotionPreference }: ProjectsPageProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Create menu items from projects
  const menuItems = projects.map(project => ({
    id: project.id,
    label: project.title,
    action: () => handleProjectClick(project)
  }));

  const { selectedIndex, handleItemClick, handleItemHover } = useMenuNavigation({
    items: menuItems,
    onItemSelect: (item) => {
      if (item.action) item.action();
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Keyboard navigation for back button
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'in-progress':
        return 'text-yellow-400';
      case 'concept':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const handleProjectClick = (project: Project) => {
    if (project.url) {
      window.open(project.url, '_blank', 'noopener,noreferrer');
    } else if (project.github) {
      window.open(project.github, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="h-full w-full bg-black flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 relative z-10">
        <button
          onClick={onBack}
          className="absolute top-8 left-8 text-gray-400 hover:text-white transition-colors duration-300 z-10"
          aria-label="Go back to menu"
        >
          ← Back
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className={`max-w-4xl mx-auto px-8 py-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-light text-white mb-6 tracking-wide">
            Projects
          </h1>
          <div className="w-24 h-px bg-white mx-auto"></div>
          <p className="text-gray-400 mt-6 max-w-2xl mx-auto">
            Current projects and ongoing development work
          </p>
        </div>

        <div className="space-y-2 max-w-3xl mx-auto">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className={`p-6 transition-all duration-300 cursor-pointer group ${
                index === selectedIndex
                  ? 'bg-white/10 border-l-4 border-white'
                  : 'hover:bg-white/5'
              }`}
              onClick={() => handleItemClick(menuItems[index], index)}
              onMouseEnter={() => handleItemHover(index)}
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className={`text-xl font-light transition-colors ${
                  index === selectedIndex
                    ? 'text-white'
                    : 'text-gray-300 group-hover:text-white'
                }`}>
                  {project.title}
                </h2>
                <span className={`text-sm uppercase tracking-wide ${getStatusColor(project.status)}`}>
                  {project.status.replace('-', ' ')}
                </span>
              </div>
              
              <p className="text-gray-400 mb-4 leading-relaxed">
                {project.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 text-xs text-gray-500 border border-gray-600 rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  {project.url && (
                    <span className="text-sm text-gray-500 group-hover:text-white transition-colors">
                      Live Demo →
                    </span>
                  )}
                  {project.github && (
                    <span className="text-sm text-gray-500 group-hover:text-white transition-colors">
                      View Code →
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Press ESC to go back
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
