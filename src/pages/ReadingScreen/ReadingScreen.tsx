import { useState, useEffect, useMemo, type CSSProperties } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Markdown from 'react-markdown';
import { fetchSegment, fetchSimilarSegments } from '../../api/segments';
import {
  isOnShelf,
  addToShelf,
  removeFromShelf,
  updateShelfProgress,
} from '../../shelf/shelfStorage';
import { getMoodColor } from '../../utils/moodColors';
import type { FullSegment, SimilarSegmentPreview } from '../../types/segments';
import { LoadingIndicator } from '../../components/LoadingIndicator/LoadingIndicator';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import TopBar from './components/TopBar';
import NovelInfoBadge from './components/NovelInfoBadge';
import { NarratedText } from './components/NarratedText';
import { splitTimingsByParagraph } from './components/NarratedText/utils';
import SceneMeta from './components/SceneMeta';
import SequentialNav from './components/SequentialNav';
import SimilarPassages from './components/SimilarPassages';
import { getBackTarget, type ReadingLocationState } from './utils';
import styles from './ReadingScreen.module.css';

type Phase = 'entering' | 'reading' | 'revealing' | 'choosing';

export function ReadingScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const routeState = location.state as ReadingLocationState;
  const fromNovel = routeState?.fromNovel;
  const fromExplore = routeState?.fromExplore;

  const [segment, setSegment] = useState<FullSegment | null>(null);
  const [phase, setPhase] = useState<Phase>('entering');
  const [nextOptions, setNextOptions] = useState<SimilarSegmentPreview[]>([]);
  const [error, setError] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [onShelf, setOnShelf] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const hasAudio = segment?.audio_url != null;

  const {
    isPlaying,
    isBuffering,
    currentTimeMs,
    toggle: toggleAudio,
    pause: pauseAudio,
  } = useAudioPlayer({
    audioUrl: segment?.audio_url ?? null,
    startMs: segment?.audio_start_ms ?? null,
    endMs: segment?.audio_end_ms ?? null,
  });

  const paragraphTimings = useMemo(
    () =>
      segment
        ? splitTimingsByParagraph({
            content: segment.content,
            wordTimings: segment.word_timings,
          })
        : [],
    [segment],
  );

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
    let timeoutId: ReturnType<typeof setTimeout>;

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
        setOnShelf(isOnShelf(data.novel_id));
        updateShelfProgress(data);

        if (!hasLoaded) {
          timeoutId = setTimeout(() => setPhase('reading'), 100);
          setHasLoaded(true);
        } else {
          setPhase('reading');
        }
      } catch {
        setError(true);
      }
    }

    handleFetchSegment();

    return () => clearTimeout(timeoutId);
  }, [id, hasLoaded]);

  async function handleReveal() {
    if (!segment) return;
    setPhase('revealing');
    const options = await fetchSimilarSegments(segment.id, 3);
    setNextOptions(options);
    setPhase('choosing');
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function navigateToSegment(params: {
    id: number;
    state?: ReadingLocationState;
    viewTransition?: boolean;
  }) {
    navigate(`/segment/${params.id}`, {
      state: params.state,
      viewTransition: params.viewTransition,
    });
    pauseAudio();
    scrollToTop();
  }

  function navigateToSimilarSegment(option: SimilarSegmentPreview) {
    navigateToSegment({
      id: option.id,
      state: { fromExplore: true },
    });
  }

  function navigateToPreviousSegment() {
    if (!segment?.prev_segment_id) return;
    navigateToSegment({
      id: segment.prev_segment_id,
      state: routeState,
      viewTransition: true,
    });
  }

  function navigateToNextSegment() {
    if (!segment?.next_segment_id) return;
    navigateToSegment({
      id: segment.next_segment_id,
      state: routeState,
    });
  }

  function toggleShelf() {
    if (!segment) return;
    if (onShelf) {
      removeFromShelf(segment.novel_id);
    } else {
      addToShelf(segment);
    }
    setOnShelf(!onShelf);
  }

  const backTarget = getBackTarget({ segment, fromNovel, fromExplore });

  function navigateToBackTarget() {
    navigate(backTarget.path, { viewTransition: true });
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
      <TopBar
        isVisible={isVisible || hasLoaded}
        scrolled={scrolled}
        backLabel={backTarget.label}
        onNavigateBack={navigateToBackTarget}
        onShelf={onShelf}
        onToggleShelf={toggleShelf}
        isPlaying={hasAudio ? isPlaying : undefined}
        isBuffering={hasAudio ? isBuffering : undefined}
        onToggleAudio={hasAudio ? toggleAudio : undefined}
      />

      {/* Main content */}
      <div className={styles.content}>
        <NovelInfoBadge
          segment={segment}
          moodColor={moodColor}
          isVisible={isVisible || hasLoaded}
        />

        {/* Text body */}
        <div
          key={segment.id}
          className={`${styles.textBody} ${isVisible ? styles.visible : ''}`}
        >
          {segment.content.split('\n\n').map((para, i) => (
            <div key={i} className={styles.paragraph}>
              {hasAudio ? (
                <NarratedText
                  content={para}
                  wordTimings={paragraphTimings[i] ?? []}
                  currentTimeMs={currentTimeMs}
                />
              ) : (
                <Markdown>{para}</Markdown>
              )}
            </div>
          ))}
        </div>

        <SceneMeta place={segment.place} characters={segment.characters} />

        <SequentialNav
          hasPrev={segment.prev_segment_id != null}
          hasNext={segment.next_segment_id != null}
          onNavigatePrevious={navigateToPreviousSegment}
          onNavigateNext={navigateToNextSegment}
        />

        {/* Explore similar / loading */}
        {['reading', 'revealing'].includes(phase) && (
          <div className={styles.ctaWrapper}>
            {phase === 'reading' ? (
              <button
                className={styles.ctaButton}
                onClick={handleReveal}
                style={{ '--accent': moodColor } as CSSProperties}
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
          <SimilarPassages
            options={nextOptions}
            onNavigateToSimilarSegment={navigateToSimilarSegment}
          />
        )}
      </div>
    </div>
  );
}
