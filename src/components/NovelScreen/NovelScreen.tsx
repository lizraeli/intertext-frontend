import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';
import { fetchNovelChapters } from '../../api/segments';
import type { NovelChaptersResponse } from '../../types/segments';
import styles from './NovelScreen.module.css';

export function NovelScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<NovelChaptersResponse | null>(null);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchNovelChapters(Number(id))
      .then(setData)
      .catch(() => setError(true));
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, [id]);

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContent}>
          <p className={styles.errorText}>Novel not found.</p>
          <button className={styles.backButton} onClick={() => navigate('/')}>
            ← Back to home
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingDots}>
            <span className={styles.loadingDot} />
            <span className={styles.loadingDot} />
            <span className={styles.loadingDot} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.topBar} ${visible ? styles.visible : ''}`}>
        <button className={styles.backButton} onClick={() => navigate('/')}>
          ← Home
        </button>
      </div>

      <div className={styles.content}>
        <div className={`${styles.header} ${visible ? styles.visible : ''}`}>
          <h1 className={styles.title}>{data.novel_title}</h1>
          <div className={styles.author}>
            {data.author}
            {data.publication_year ? `, ${data.publication_year}` : ''}
          </div>
        </div>

        <div className={`${styles.prompt} ${visible ? styles.visible : ''}`}>
          {data.chapters.length} {data.chapters.length === 1 ? 'chapter' : 'chapters'}
        </div>

        <div className={styles.chapters}>
          {data.chapters.map((chapter, i) => (
            <div
              key={chapter.id}
              className={`${styles.chapterItem} ${visible ? styles.visible : ''}`}
              style={{
                transition: `all 0.8s ease ${0.3 + i * 0.06}s, border-color 0.2s, background 0.2s`,
              }}
              onClick={() => {
                if (chapter.first_segment_id != null) {
                  navigate(`/segment/${chapter.first_segment_id}`, {
                    state: { fromNovel: Number(id) },
                  });
                }
              }}
            >
              <div className={styles.chapterTitle}>{chapter.title}</div>

              {chapter.opening_line && (
                <div className={styles.openingLine}>
                  <Markdown>{chapter.opening_line}</Markdown>
                </div>
              )}

              {chapter.places.length > 0 && (
                <div className={styles.chapterMeta}>
                  <span className={styles.metaPlaces}>
                    {chapter.places.join(', ')}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
