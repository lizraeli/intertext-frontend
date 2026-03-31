import styles from '../ReadingScreen.module.css';

type TopBarProps = {
  isVisible: boolean;
  scrolled: boolean;
  backLabel: string;
  onNavigateBack: () => void;
};

export default function TopBar({
  isVisible,
  scrolled,
  backLabel,
  onNavigateBack,
}: TopBarProps) {
  return (
    <div
      className={`${styles.topBar} ${isVisible ? styles.visible : ''} ${scrolled ? styles.compact : ''}`}
    >
      <button className={styles.backButton} onClick={onNavigateBack}>
        {backLabel}
      </button>
      <div className={styles.topBarSpacer} />
    </div>
  );
}
