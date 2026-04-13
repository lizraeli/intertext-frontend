import {
  createContext,
  useContext,
  useMemo,
  Children,
  isValidElement,
  cloneElement,
  type ReactNode,
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
              })
            : children}
        </p>
      ),
    }),
    [content, wordTimings],
  );

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
}): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === 'string') {
      return wrapTextNode({
        text: child,
        rawText,
        rawPosition,
        timings,
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
}: {
  /** The rendered text content of this React text node */
  text: string;
  /** The original markdown source string for this paragraph */
  rawText: string;
  /** Mutable cursor tracking the current index in rawText */
  rawPosition: { current: number };
  /** Word timings for this paragraph (paragraph-relative char offsets) */
  timings: WordTiming[];
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
      }),
    );
  }

  return elements;
}

function makeSegment({
  text,
  timingIndex,
  key,
}: {
  text: string;
  timingIndex: number;
  key: number;
}): ReactNode {
  if (timingIndex < 0) {
    return text;
  }

  return <WordSpan key={key} timingIndex={timingIndex}>{text}</WordSpan>;
}

function WordSpan({
  timingIndex,
  children,
}: {
  timingIndex: number;
  children: ReactNode;
}) {
  const activeIndex = useContext(ActiveWordContext);
  const className =
    timingIndex === activeIndex
      ? `${styles.wordTimed} ${styles.wordActive}`
      : styles.wordTimed;

  return <span className={className}>{children}</span>;
}
