import styles from '../ReadingScreen.module.css';

type SequentialNavProps = {
  hasPrev: boolean;
  hasNext: boolean;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
};

export default function SequentialNav({
  hasPrev,
  hasNext,
  onNavigatePrevious,
  onNavigateNext,
}: SequentialNavProps) {
  return (
    <div className={styles.seqNav}>
      <button
        type="button"
        className={styles.seqNavLink}
        disabled={!hasPrev}
        onClick={onNavigatePrevious}
        aria-label="Previous segment"
      >
        ← Prev
      </button>
      <button
        type="button"
        className={styles.seqNavLink}
        disabled={!hasNext}
        onClick={onNavigateNext}
        aria-label="Next segment"
      >
        Next →
      </button>
    </div>
  );
}
