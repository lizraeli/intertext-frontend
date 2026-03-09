import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRandomSegments } from '../../api/segments';
import { useJourney } from '../../context/useJourney';
import { getMoodColor } from '../../utils/moodColors';
import type { SegmentPreview } from '../../types/segments';
import styles from './OpeningScreen.module.css';
import Markdown from 'react-markdown';

export function OpeningScreen() {
  const [segments, setSegments] = useState<SegmentPreview[]>([]);
  const [visible, setVisible] = useState(false);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { resetTrail, addToTrail } = useJourney();

  useEffect(() => {
    fetchRandomSegments(5).then(setSegments);
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  function handleSelect(segment: SegmentPreview) {
    resetTrail();
    addToTrail(segment.id, segment.mood);
    navigate(`/segment/${segment.id}`);
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.header} ${visible ? styles.visible : ''}`}>
        <div className={styles.subtitle}>A literary journey</div>
        <h1 className={styles.title}>
          Where will the words
          <br />
          <span className={styles.titleAccent}>take you?</span>
        </h1>
      </div>

      <div className={`${styles.prompt} ${visible ? styles.visible : ''}`}>
        Choose an opening line
      </div>

      <div className={styles.lines}>
        {segments.map((seg, i) => {
          const moodColor = getMoodColor(seg.mood);
          const isHovered = hoveredId === seg.id;

          return (
            <div
              key={seg.id}
              className={`${styles.lineItem} ${visible ? styles.visible : ''}`}
              style={{
                borderLeftColor: isHovered ? moodColor : 'transparent',
                transition: `all 0.8s ease ${0.3 + i * 0.08}s, border-color 0.2s, background 0.2s`,
              }}
              onClick={() => handleSelect(seg)}
              onMouseEnter={() => setHoveredId(seg.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <p className={styles.openingLine}>
                <Markdown>{seg.opening_line}</Markdown>
              </p>

              <div
                className={styles.lineDetail}
                style={{ color: isHovered ? moodColor : undefined }}
              >
                {isHovered ? `${seg.mood}` : '· · ·'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
