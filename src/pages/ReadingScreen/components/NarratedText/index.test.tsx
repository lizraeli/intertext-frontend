import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { WordTiming } from '../../../../types/segments';
import { NarratedText } from './index';
import styles from '../../ReadingScreen.module.css';

describe('NarratedText', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders plain text without timings', () => {
    render(
      <NarratedText content="Hello world" wordTimings={[]} currentTimeMs={0} />,
    );

    const helloWorldSpan = screen.getByText('Hello world', {
      selector: 'p',
    });
    expect(helloWorldSpan).not.toHaveClass(styles.wordActive);
  });

  it('highlights the active word with wordActive class', () => {
    const timings: WordTiming[] = [
      { char_start: 0, char_end: 5, start_ms: 0, end_ms: 500 },
      { char_start: 6, char_end: 11, start_ms: 500, end_ms: 1000 },
    ];

    render(
      <NarratedText
        content="Hello world"
        wordTimings={timings}
        currentTimeMs={600}
      />,
    );

    const helloSpan = screen.getByText('Hello', { selector: 'span' });
    expect(helloSpan).not.toHaveClass(styles.wordActive);

    const worldSpan = screen.getByText('world', { selector: 'span' });
    expect(worldSpan).toHaveClass(styles.wordActive);
  });

  it('highlights the first word when time is within its range', () => {
    const timings: WordTiming[] = [
      { char_start: 0, char_end: 5, start_ms: 100, end_ms: 400 },
      { char_start: 6, char_end: 9, start_ms: 400, end_ms: 700 },
      { char_start: 10, char_end: 19, start_ms: 700, end_ms: 1200 },
    ];

    render(
      <NarratedText
        content="Alice was beginning"
        wordTimings={timings}
        currentTimeMs={200}
      />,
    );

    const aliceSpan = screen.getByText('Alice', { selector: 'span' });
    expect(aliceSpan).toHaveClass(styles.wordActive);

    const wasSpan = screen.getByText('was', { selector: 'span' });
    expect(wasSpan).not.toHaveClass(styles.wordActive);

    const beginningSpan = screen.getByText('beginning', { selector: 'span' });
    expect(beginningSpan).not.toHaveClass(styles.wordActive);
  });

  it('handles markdown emphasis without breaking word alignment', () => {
    const content = 'She felt *very* tired';
    const timings: WordTiming[] = [
      { char_start: 0, char_end: 3, start_ms: 0, end_ms: 300 },
      { char_start: 4, char_end: 8, start_ms: 300, end_ms: 600 },
      { char_start: 9, char_end: 15, start_ms: 600, end_ms: 1000 },
      { char_start: 16, char_end: 21, start_ms: 1000, end_ms: 1400 },
    ];

    render(
      <NarratedText
        content={content}
        wordTimings={timings}
        currentTimeMs={700}
      />,
    );

    const sheSpan = screen.getByText('She', { selector: 'span' });
    expect(sheSpan).not.toHaveClass(styles.wordActive);

    const feltSpan = screen.getByText('felt', { selector: 'span' });
    expect(feltSpan).not.toHaveClass(styles.wordActive);

    const verySpan = screen.getByText('very', { selector: 'span' });
    expect(verySpan).toHaveClass(styles.wordActive);
    expect(verySpan.parentElement?.tagName).toBe('EM');

    const tiredSpan = screen.getByText('tired', { selector: 'span' });
    expect(tiredSpan).not.toHaveClass(styles.wordActive);
  });

  it('handles markdown bold without breaking word alignment', () => {
    const content = 'A **bold** move';
    const timings: WordTiming[] = [
      { char_start: 0, char_end: 1, start_ms: 0, end_ms: 200 },
      { char_start: 2, char_end: 10, start_ms: 200, end_ms: 600 },
      { char_start: 11, char_end: 15, start_ms: 600, end_ms: 1000 },
    ];

    render(
      <NarratedText
        content={content}
        wordTimings={timings}
        currentTimeMs={400}
      />,
    );

    const aSpan = screen.getByText('A', { selector: 'span' });
    expect(aSpan).not.toHaveClass(styles.wordActive);

    const boldSpan = screen.getByText('bold', { selector: 'span' });
    expect(boldSpan).toHaveClass(styles.wordActive);
    expect(boldSpan.parentElement?.tagName).toBe('STRONG');

    const moveSpan = screen.getByText('move', { selector: 'span' });
    expect(moveSpan).not.toHaveClass(styles.wordActive);
  });

  it('does not highlight any word when time is outside all ranges', () => {
    const timings: WordTiming[] = [
      { char_start: 0, char_end: 5, start_ms: 100, end_ms: 300 },
      { char_start: 6, char_end: 11, start_ms: 400, end_ms: 600 },
    ];

    render(
      <NarratedText
        content="Hello world"
        wordTimings={timings}
        currentTimeMs={350}
      />,
    );

    const helloSpan = screen.getByText('Hello', { selector: 'span' });
    expect(helloSpan).not.toHaveClass(styles.wordActive);

    const worldSpan = screen.getByText('world', { selector: 'span' });
    expect(worldSpan).not.toHaveClass(styles.wordActive);
  });
});
