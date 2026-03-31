import { type CSSProperties } from 'react';
import Markdown from 'react-markdown';
import { getMoodColor } from '../../../utils/moodColors';
import type { SimilarSegmentPreview } from '../../../types/segments';
import styles from '../ReadingScreen.module.css';

type SimilarPassagesProps = {
  options: SimilarSegmentPreview[];
  onNavigateToSimilarSegment: (option: SimilarSegmentPreview) => void;
};

export default function SimilarPassages({
  options,
  onNavigateToSimilarSegment,
}: SimilarPassagesProps) {
  return (
    <div className={styles.similarPassagesSection}>
      <div className={styles.similarPassagesHeading}>Similar passages</div>
      <div className={styles.similarPassagesOptions}>
        {options.map((option, i) => {
          const optionMoodColor = getMoodColor(option.mood);
          return (
            <div
              key={option.id}
              className={styles.similarPassage}
              style={
                {
                  animationDelay: `${i * 0.12}s`,
                  '--accent': optionMoodColor,
                } as CSSProperties
              }
              onClick={() => onNavigateToSimilarSegment(option)}
            >
              <div className={styles.similarPassageOpeningLine}>
                <Markdown>{option.opening_line}</Markdown>
              </div>
              <div className={styles.similarPassageDetail}>
                {option.mood} · {option.novel_title} · {option.author}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
