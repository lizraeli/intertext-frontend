import {
  createContext,
  useContext,
  useMemo,
  Children,
  isValidElement,
  cloneElement,
  type ReactNode,
  useRef,
  useEffect,
} from 'react';
import Markdown from 'react-markdown';
import type { WordTiming } from '../../../../types/segments';
import styles from '../../ReadingScreen.module.css';
import { charsMatch, findActiveWordIndex, findTimingForChar } from './utils';

const ActiveWordContext = createContext(-1);

interface NarratedTextProps {
  content: string;
  wordTimings: WordTiming[];
  currentTimeMs: number;
}

export function NarratedText({
  content,
  wordTimings,
  currentTimeMs,
}: NarratedTextProps) {
  const activeWordRef = useRef<HTMLSpanElement>(null);
  const activeIndex = useMemo(
    () => findActiveWordIndex({ timings: wordTimings, currentTimeMs }),
    [wordTimings, currentTimeMs],
  );

  const components = useMemo(
    () => ({
      p: ({ children }: { children?: ReactNode }) => (
        <p>
          {wordTimings.length > 0
            ? wrapChildren({
                children,
                rawText: content,
                rawPosition: { current: 0 },
                timings: wordTimings,
                activeWordRef,
              })
            : children}
        </p>
      ),
    }),
    [content, wordTimings],
  );

  useEffect(() => {
    if (activeWordRef.current) {
      activeWordRef.current.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      });
    }
  }, [activeIndex]);

  return (
    <ActiveWordContext.Provider value={activeIndex}>
      <Markdown components={components}>{content}</Markdown>
    </ActiveWordContext.Provider>
  );
}

/**
 * Recursively walk react-markdown's children tree, wrapping text nodes
 * with word-timing spans.
 */
function wrapChildren({
  children,
  rawText,
  rawPosition,
  timings,
  activeWordRef,
}: {
  /** React children produced by react-markdown */
  children: ReactNode;
  /** The original markdown source string for this paragraph */
  rawText: string;
  /**
   * Mutable cursor tracking the current index in rawText,
   * shared across recursive calls so it advances through the entire paragraph
   */
  rawPosition: { current: number };
  /** Word timings for this paragraph (paragraph-relative char offsets) */
  timings: WordTiming[];
  /** Ref to the active word span */
  activeWordRef: React.RefObject<HTMLSpanElement | null>;
}): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === 'string') {
      return wrapTextNode({
        text: child,
        rawText,
        rawPosition,
        timings,
        activeWordRef,
      });
    }

    if (isValidElement(child)) {
      const childProps = child.props as Record<string, unknown>;
      if ('children' in childProps) {
        return cloneElement(
          child,
          {},
          wrapChildren({
            children: childProps.children as ReactNode,
            rawText,
            rawPosition,
            timings,
            activeWordRef,
          }),
        );
      }
    }

    return child;
  });
}

/**
 * Process a single rendered text node, splitting it into spans based on
 * word timings. Advances rawPosition past any markdown syntax characters
 * (like *) that don't appear in the rendered text.
 */
function wrapTextNode({
  text,
  rawText,
  rawPosition,
  timings,
  activeWordRef,
}: {
  /** The rendered text content of this React text node */
  text: string;
  /** The original markdown source string for this paragraph */
  rawText: string;
  /** Mutable cursor tracking the current index in rawText */
  rawPosition: { current: number };
  /** Word timings for this paragraph (paragraph-relative char offsets) */
  timings: WordTiming[];
  /** Ref to the active word span */
  activeWordRef: React.RefObject<HTMLSpanElement | null>;
}): ReactNode[] {
  const elements: ReactNode[] = [];
  let segmentStart = 0;
  let currentTimingIndex = -1;

  for (let i = 0; i < text.length; i++) {
    while (
      rawPosition.current < rawText.length &&
      !charsMatch({
        rawChar: rawText[rawPosition.current],
        renderedChar: text[i],
      })
    ) {
      rawPosition.current++;
    }

    if (rawPosition.current >= rawText.length) {
      if (i > segmentStart) {
        elements.push(
          makeSegment({
            text: text.slice(segmentStart, i),
            timingIndex: currentTimingIndex,
            key: segmentStart,
            activeWordRef,
          }),
        );
      }

      elements.push(text.slice(i));
      return elements;
    }

    const rawCharIndex = rawPosition.current;
    rawPosition.current++;

    const timingIndex = findTimingForChar({
      rawCharIndex,
      timings,
    });

    if (timingIndex !== currentTimingIndex) {
      if (i > segmentStart) {
        elements.push(
          makeSegment({
            text: text.slice(segmentStart, i),
            timingIndex: currentTimingIndex,
            key: segmentStart,
            activeWordRef,
          }),
        );
      }
      segmentStart = i;
      currentTimingIndex = timingIndex;
    }
  }

  if (segmentStart < text.length) {
    elements.push(
      makeSegment({
        text: text.slice(segmentStart),
        timingIndex: currentTimingIndex,
        key: segmentStart,
        activeWordRef,
      }),
    );
  }

  return elements;
}

function makeSegment({
  text,
  timingIndex,
  key,
  activeWordRef,
}: {
  text: string;
  timingIndex: number;
  key: number;
  activeWordRef: React.RefObject<HTMLSpanElement | null>;
}): ReactNode {
  if (timingIndex < 0) {
    return text;
  }

  return (
    <WordSpan key={key} timingIndex={timingIndex} activeWordRef={activeWordRef}>
      {text}
    </WordSpan>
  );
}

function WordSpan({
  timingIndex,
  children,
  activeWordRef,
}: {
  timingIndex: number;
  children: ReactNode;
  activeWordRef: React.RefObject<HTMLSpanElement | null>;
}) {
  const activeIndex = useContext(ActiveWordContext);
  const isActiveWord = timingIndex === activeIndex;
  const className = isActiveWord
    ? `${styles.wordTimed} ${styles.wordActive}`
    : styles.wordTimed;

  return (
    <span className={className} ref={isActiveWord ? activeWordRef : undefined}>
      {children}
    </span>
  );
}
