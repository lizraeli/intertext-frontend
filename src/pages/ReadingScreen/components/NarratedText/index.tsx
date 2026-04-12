import {
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
                activeIndex,
              })
            : children}
        </p>
      ),
    }),
    [content, wordTimings, activeIndex],
  );

  return <Markdown components={components}>{content}</Markdown>;
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
  activeIndex,
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
  /** Index of the currently spoken word, or -1 */
  activeIndex: number;
}): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === 'string') {
      return wrapTextNode({
        text: child,
        rawText,
        rawPosition,
        timings,
        activeIndex,
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
            activeIndex,
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
  activeIndex,
}: {
  /** The rendered text content of this React text node */
  text: string;
  /** The original markdown source string for this paragraph */
  rawText: string;
  /** Mutable cursor tracking the current index in rawText */
  rawPosition: { current: number };
  /** Word timings for this paragraph (paragraph-relative char offsets) */
  timings: WordTiming[];
  /** Index of the currently spoken word, or -1 */
  activeIndex: number;
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
            activeIndex,
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
            activeIndex,
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
        activeIndex,
        key: segmentStart,
      }),
    );
  }

  return elements;
}

function makeSegment({
  text,
  timingIndex,
  activeIndex,
  key,
}: {
  text: string;
  timingIndex: number;
  activeIndex: number;
  key: number;
}): ReactNode {
  if (timingIndex < 0) {
    return text;
  }

  return (
    <span
      key={key}
      className={timingIndex === activeIndex ? styles.wordActive : undefined}
    >
      {text}
    </span>
  );
}
