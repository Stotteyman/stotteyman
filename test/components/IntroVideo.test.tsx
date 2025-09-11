import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import IntroVideo from '@/components/IntroVideo';

// Mock video element
const mockVideo = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  currentTime: 0,
  duration: 10,
  load: vi.fn(),
};

Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  writable: true,
  value: mockVideo.play,
});

Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  writable: true,
  value: mockVideo.pause,
});

Object.defineProperty(HTMLMediaElement.prototype, 'addEventListener', {
  writable: true,
  value: mockVideo.addEventListener,
});

Object.defineProperty(HTMLMediaElement.prototype, 'removeEventListener', {
  writable: true,
  value: mockVideo.removeEventListener,
});

describe('IntroVideo', () => {
  const mockOnComplete = vi.fn();
  const mockOnSkip = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders video element', () => {
    render(
      <IntroVideo
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
        canSkip={false}
        respectMotionPreference={false}
      />
    );

    const video = screen.getByRole('img', { hidden: true });
    expect(video).toBeInTheDocument();
  });

  it('shows skip button when canSkip is true', () => {
    render(
      <IntroVideo
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
        canSkip={true}
        respectMotionPreference={false}
      />
    );

    const skipButton = screen.getByText('Skip Intro');
    expect(skipButton).toBeInTheDocument();
  });

  it('calls onSkip when skip button is clicked', () => {
    render(
      <IntroVideo
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
        canSkip={true}
        respectMotionPreference={false}
      />
    );

    const skipButton = screen.getByText('Skip Intro');
    fireEvent.click(skipButton);

    expect(mockOnSkip).toHaveBeenCalled();
  });

  it('shows loading state initially', () => {
    render(
      <IntroVideo
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
        canSkip={false}
        respectMotionPreference={false}
      />
    );

    expect(screen.getByText('Loading Experience...')).toBeInTheDocument();
  });

  it('handles video error gracefully', async () => {
    // Mock video error
    mockVideo.addEventListener.mockImplementation((event, callback) => {
      if (event === 'error') {
        setTimeout(() => callback(), 100);
      }
    });

    render(
      <IntroVideo
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
        canSkip={false}
        respectMotionPreference={false}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Video Loading Error')).toBeInTheDocument();
    });
  });
});
