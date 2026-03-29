import { useState, useEffect } from 'react';
import {
  useParams,
  useNavigate,
  useLocation,
  useViewTransitionState,
} from 'react-router-dom';
import Markdown from 'react-markdown';
import { fetchSegment, fetchSimilarSegments } from '../../api/segments';
import { getMoodColor } from '../../utils/moodColors';
import type { FullSegment, SimilarSegmentPreview } from '../../types/segments';
import { LoadingIndicator } from '../LoadingIndicator/LoadingIndicator';
import styles from './ReadingScreen.module.css';

type Phase = 'entering' | 'reading' | 'revealing' | 'choosing';

export function ReadingScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isTransitioning = useViewTransitionState(`/segment/${id}`);
  useEffect(() => {
    console.log('isTransitioning', isTransitioning);
  }, [isTransitioning]);

  const fromNovel = (location.state as { fromNovel?: number } | null)
    ?.fromNovel;
  const fromExplore = (location.state as { fromExplore?: boolean } | null)
    ?.fromExplore;

  const [segment, setSegment] = useState<FullSegment | null>(null);
  const [phase, setPhase] = useState<Phase>('entering');
  const [nextOptions, setNextOptions] = useState<SimilarSegmentPreview[]>([]);
  const [error, setError] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const scrollThreshold = 60;

  useEffect(() => {
    let rafId: number;
    function checkScroll() {
      setScrolled(window.scrollY > scrollThreshold);
    }
    function onScroll() {
      rafId = requestAnimationFrame(checkScroll);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    checkScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    async function handleFetchSegment() {
      if (!id) {
        return;
      }

      setPhase('entering');
      setNextOptions([]);
      setError(false);

      try {
        const data = await fetchSegment(Number(id));
        setSegment(data);
        setTimeout(() => setPhase('reading'), 600);
      } catch {
        setError(true);
      }
    }

    handleFetchSegment();
  }, [id]);

  async function handleReveal() {
    if (!segment) return;
    setPhase('revealing');
    const options = await fetchSimilarSegments(segment.id, 3);
    setNextOptions(options);
    setPhase('choosing');
  }

  function handleNext(option: SimilarSegmentPreview) {
    navigate(`/segment/${option.id}`, { state: { fromExplore: true } });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handlePrevSegment() {
    if (!segment?.prev_segment_id) return;
    navigate(`/segment/${segment.prev_segment_id}`, { state: location.state });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleNextSegment() {
    if (!segment?.next_segment_id) return;
    navigate(`/segment/${segment.next_segment_id}`, {
      state: location.state,
      viewTransition: true,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function getBackTarget(): { path: string; label: string } {
    if (fromExplore) {
      return { path: '/explore', label: '← Begin again' };
    }
    if (fromNovel) {
      return {
        path: `/novel/${fromNovel}`,
        label: `← ${segment?.novel_title ?? 'Back'}`,
      };
    }
    if (segment) {
      return {
        path: `/novel/${segment.novel_id}`,
        label: `← ${segment.novel_title}`,
      };
    }
    return { path: '/', label: '← Home' };
  }

  function handleBack() {
    navigate(getBackTarget().path);
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div
          className={styles.content}
          style={{ textAlign: 'center', paddingTop: '120px' }}
        >
          <p className={styles.paragraph}>Segment not found.</p>
          <button
            className={styles.backButton}
            onClick={() => navigate('/')}
            style={{ marginTop: '24px' }}
          >
            ← Home
          </button>
        </div>
      </div>
    );
  }

  if (!segment) return <LoadingIndicator />;

  const moodColor = getMoodColor(segment.mood);
  const isVisible = phase !== 'entering';

  return (
    <div className={styles.container}>
      {/* Top bar */}
      <div
        className={`${styles.topBar} ${isVisible ? styles.visible : ''} ${scrolled ? styles.compact : ''}`}
      >
        <button className={styles.backButton} onClick={handleBack}>
          {getBackTarget().label}
        </button>

        <div className={styles.topBarSpacer} />
      </div>

      {/* Main content */}
      <div className={styles.content}>
        {/* Novel info badge */}
        <div
          className={`${styles.novelInfo} ${isVisible ? styles.visible : ''}`}
        >
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

        {/* Text body */}
        <div
          className={`${styles.textBody} ${isVisible ? styles.visible : ''}`}
        >
          {segment.content.split('\n\n').map((para, i) => (
            <p key={i} className={styles.paragraph}>
              {i === 0 ? (
                <>
                  <span className={styles.dropCap} style={{ color: moodColor }}>
                    <Markdown>{para[0]}</Markdown>
                  </span>
                  <Markdown>{para.slice(1)}</Markdown>
                </>
              ) : (
                <Markdown>{para}</Markdown>
              )}
            </p>
          ))}
        </div>

        {/* Scene info */}
        {(segment.place !== 'unknown' || segment.characters.length > 0) && (
          <div className={styles.sceneInfo}>
            {segment.place !== 'unknown' && (
              <span className={styles.scenePlace}>{segment.place}</span>
            )}
            {segment.place !== 'unknown' && segment.characters.length > 0 && (
              <span className={styles.sceneDot}>·</span>
            )}
            {segment.characters.length > 0 && (
              <span className={styles.sceneCharacters}>
                {segment.characters.join(', ')}
              </span>
            )}
          </div>
        )}

        <div className={styles.seqNav}>
          <button
            type="button"
            className={styles.seqNavLink}
            disabled={segment.prev_segment_id == null}
            onClick={handlePrevSegment}
            aria-label="Previous segment"
          >
            ← Prev
          </button>
          <button
            type="button"
            className={styles.seqNavLink}
            disabled={segment.next_segment_id == null}
            onClick={handleNextSegment}
            aria-label="Next segment"
          >
            Next →
          </button>
        </div>

        {/* Explore similar / loading */}
        {['reading', 'revealing'].includes(phase) && (
          <div className={styles.ctaWrapper}>
            {phase === 'reading' ? (
              <button
                className={styles.ctaButton}
                onClick={handleReveal}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = moodColor;
                  e.currentTarget.style.color = moodColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--muted)';
                }}
              >
                Explore similar passages
              </button>
            ) : (
              <div
                className={styles.ctaLoading}
                style={{ borderColor: moodColor }}
                aria-label="Loading similar passages"
              >
                <span className={styles.ctaLoadingDot} />
                <span className={styles.ctaLoadingDot} />
                <span className={styles.ctaLoadingDot} />
              </div>
            )}
          </div>
        )}

        {/* Where next? options */}
        {phase === 'choosing' && (
          <div className={styles.nextSection}>
            <div className={styles.nextHeading}>Similar passages</div>
            <div className={styles.nextOptions}>
              {nextOptions.map((opt, i) => {
                const optMoodColor = getMoodColor(opt.mood);
                return (
                  <div
                    key={opt.id}
                    className={styles.nextItem}
                    style={{ animationDelay: `${i * 0.12}s` }}
                    onClick={() => handleNext(opt)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderLeftColor = optMoodColor;
                      e.currentTarget.style.background =
                        'rgba(255,255,255,0.03)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderLeftColor = 'transparent';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div className={styles.nextOdiveningLine}>
                      <Markdown>{opt.opening_line}</Markdown>
                    </div>
                    <div
                      className={styles.nextDetail}
                      style={{ color: optMoodColor }}
                    >
                      {opt.mood} · {opt.novel_title} · {opt.author}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
