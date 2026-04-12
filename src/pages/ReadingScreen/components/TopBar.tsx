import type { SVGProps } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../ReadingScreen.module.css';

type TopBarProps = {
  isVisible: boolean;
  scrolled: boolean;
  backLabel: string;
  onNavigateBack: () => void;
  onShelf: boolean;
  onToggleShelf: () => void;
  isPlaying?: boolean;
  isBuffering?: boolean;
  onToggleAudio?: () => void;
};

export default function TopBar({
  isVisible,
  scrolled,
  backLabel,
  onNavigateBack,
  onShelf,
  onToggleShelf,
  isPlaying,
  isBuffering,
  onToggleAudio,
}: TopBarProps) {
  const navigate = useNavigate();

  return (
    <div
      className={`${styles.topBar} ${isVisible ? styles.visible : ''} ${scrolled ? styles.compact : ''}`}
    >
      <button className={styles.backButton} onClick={onNavigateBack}>
        {backLabel}
      </button>
      <div className={styles.topBarActions}>
        {onToggleAudio && (
          <button
            className={`${styles.audioButton} ${isBuffering ? styles.audioBuffering : ''}`}
            onClick={onToggleAudio}
            aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
            title={isPlaying ? 'Pause narration' : 'Play narration'}
          >
            {isPlaying ? <PauseCircleIcon /> : <PlayCircleIcon />}
          </button>
        )}
        <button
          className={`${styles.bookmarkButton} ${onShelf ? styles.bookmarkActive : ''}`}
          onClick={onToggleShelf}
          aria-label={onShelf ? 'Remove from shelf' : 'Add to shelf'}
          title={onShelf ? 'Remove from shelf' : 'Add to shelf'}
        >
          {onShelf ? <BookMarkedIcon /> : <BookPlusIcon />}
        </button>
        <button className={styles.homeButton} onClick={() => navigate('/')}>
          Home
        </button>
      </div>
    </div>
  );
}

function PlayCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="10,8 16,12 10,16" />
    </svg>
  );
}

function PauseCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="10" y1="9" x2="10" y2="15" />
      <line x1="14" y1="9" x2="14" y2="15" />
    </svg>
  );
}

function BookMarkedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M10 2v8l3-3 3 3V2" />
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
    </svg>
  );
}

function BookPlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 7v6" />
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
      <path d="M9 10h6" />
    </svg>
  );
}
