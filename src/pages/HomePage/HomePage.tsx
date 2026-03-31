import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchNovels } from '../../api/segments';
import type { NovelSummary } from '../../types/segments';
import MyShelf from './components/MyShelf';
import styles from './HomePage.module.css';

export function HomePage() {
  const [novels, setNovels] = useState<NovelSummary[]>([]);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNovels().then(setNovels);
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.container}>
      <div className={`${styles.header} ${visible ? styles.visible : ''}`}>
        <div className={styles.subtitle}>A literary exploration</div>
        <h1 className={styles.title}>
          Inter<span className={styles.titleAccent}>text</span>
        </h1>
      </div>

      <MyShelf visible={visible} />

      <div className={`${styles.prompt} ${visible ? styles.visible : ''}`}>
        Available Books
      </div>

      <div className={styles.list}>
        {novels.map((novel, i) => (
          <div
            key={novel.id}
            className={`${styles.listItem} ${visible ? styles.visible : ''}`}
            style={{
              transition: `all 0.8s ease ${0.3 + i * 0.1}s, border-color 0.2s, background 0.2s`,
            }}
            onClick={() => navigate(`/novel/${novel.id}`)}
          >
            <p className={styles.novelTitle}>{novel.title}</p>
            <div className={styles.novelDetail}>
              {novel.author}
              {novel.publication_year ? `, ${novel.publication_year}` : ''}
            </div>
          </div>
        ))}
      </div>

      <div className={`${styles.exploreLink} ${visible ? styles.visible : ''}`}>
        <span className={styles.exploreDivider}>or</span>
        <button
          className={styles.exploreButton}
          onClick={() => navigate('/explore')}
        >
          Explore random passages
        </button>
      </div>
    </div>
  );
}
