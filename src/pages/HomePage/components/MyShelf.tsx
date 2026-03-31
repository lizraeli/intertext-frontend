import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getShelf, type ShelfEntry } from '../../../shelf/shelfStorage';
import styles from '../HomePage.module.css';

type MyShelfProps = {
  visible: boolean;
};

export default function MyShelf({ visible }: MyShelfProps) {
  const entries = useMemo(() => getShelf().entries, []);
  const navigate = useNavigate();

  if (entries.length === 0) {
    return null;
  }

  function handleClick(entry: ShelfEntry) {
    navigate(`/segment/${entry.lastSegmentId}`, {
      state: { fromNovel: entry.novelId },
    });
  }

  return (
    <div className={`${styles.shelf} ${visible ? styles.visible : ''}`}>
      <div className={styles.shelfHeading}>My shelf</div>

      <div className={styles.shelfList}>
        {entries.map((entry, i) => (
          <div
            key={entry.novelId}
            className={`${styles.shelfItem} ${visible ? styles.visible : ''}`}
            style={{
              transition: `all 0.8s ease ${0.15 + i * 0.1}s, border-color 0.2s, background 0.2s`,
            }}
            onClick={() => handleClick(entry)}
          >
            <p className={styles.shelfTitle}>{entry.novelTitle}</p>
            <div className={styles.shelfDetail}>
              {entry.chapterTitle}
              <span className={styles.shelfDot}> · </span>
              {entry.segmentIndex} of {entry.chapterSegmentCount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
