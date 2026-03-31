import type { FullSegment } from '../../../types/segments';
import styles from '../ReadingScreen.module.css';

type NovelInfoBadgeProps = {
  segment: FullSegment;
  moodColor: string;
  isVisible: boolean;
};

export default function NovelInfoBadge({
  segment,
  moodColor,
  isVisible,
}: NovelInfoBadgeProps) {
  return (
    <div className={`${styles.novelInfo} ${isVisible ? styles.visible : ''}`}>
      <div
        className={styles.badge}
        style={{
          border: `1px solid ${moodColor}22`,
          borderLeft: `2px solid ${moodColor}`,
        }}
      >
        <div className={styles.badgeText}>
          <span className={styles.badgeMood} style={{ color: moodColor }}>
            {segment.chapter_title}
          </span>
          <span className={styles.badgeDot}>·</span>
          <span className={styles.badgeProgress}>
            {segment.segment_index} of {segment.chapter_segment_count}
          </span>
          <span className={styles.badgeDot}>·</span>
          <span className={styles.badgeTitle}>{segment.novel_title}</span>
          <span className={styles.badgeAuthor}>
            {segment.author}
            {segment.year ? `, ${segment.year}` : ''}
          </span>
        </div>
        <div className={styles.chapterProgressTrack}>
          <div
            className={styles.chapterProgressFill}
            style={{
              width: `${(segment.segment_index / segment.chapter_segment_count) * 100}%`,
              background: moodColor,
            }}
          />
        </div>
      </div>
    </div>
  );
}
