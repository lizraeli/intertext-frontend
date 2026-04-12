import { describe, it, expect } from 'vitest';
import type { WordTiming } from '../../../../types/segments';
import {
  findActiveWordIndex,
  findTimingForChar,
  charsMatch,
  splitTimingsByParagraph,
} from './utils';

describe('findActiveWordIndex', () => {
  const timings: WordTiming[] = [
    { char_start: 0, char_end: 5, start_ms: 1000, end_ms: 1500 },
    { char_start: 6, char_end: 9, start_ms: 1500, end_ms: 1800 },
    { char_start: 10, char_end: 15, start_ms: 2000, end_ms: 2500 },
  ];

  it('returns the index of the word being spoken', () => {
    expect(findActiveWordIndex({ timings, currentTimeMs: 1200 })).toBe(0);
    expect(findActiveWordIndex({ timings, currentTimeMs: 1500 })).toBe(1);
    expect(findActiveWordIndex({ timings, currentTimeMs: 2300 })).toBe(2);
  });

  it('returns -1 when currentTimeMs is before all words', () => {
    expect(findActiveWordIndex({ timings, currentTimeMs: 500 })).toBe(-1);
  });

  it('returns -1 when currentTimeMs falls in a gap between words', () => {
    expect(findActiveWordIndex({ timings, currentTimeMs: 1900 })).toBe(-1);
  });

  it('returns -1 when currentTimeMs is after all words', () => {
    expect(findActiveWordIndex({ timings, currentTimeMs: 3000 })).toBe(-1);
  });

  it('returns -1 for zero currentTimeMs', () => {
    expect(findActiveWordIndex({ timings, currentTimeMs: 0 })).toBe(-1);
  });

  it('returns -1 for empty timings', () => {
    expect(findActiveWordIndex({ timings: [], currentTimeMs: 1000 })).toBe(-1);
  });

  it('treats start_ms as inclusive and end_ms as exclusive', () => {
    expect(findActiveWordIndex({ timings, currentTimeMs: 1000 })).toBe(0);
    expect(findActiveWordIndex({ timings, currentTimeMs: 1499 })).toBe(0);
    expect(findActiveWordIndex({ timings, currentTimeMs: 2499 })).toBe(2);
    expect(findActiveWordIndex({ timings, currentTimeMs: 2500 })).toBe(-1);
  });
});

describe('findTimingForChar', () => {
  const timings: WordTiming[] = [
    { char_start: 0, char_end: 5, start_ms: 0, end_ms: 0 },
    { char_start: 6, char_end: 9, start_ms: 0, end_ms: 0 },
    { char_start: 10, char_end: 19, start_ms: 0, end_ms: 0 },
  ];

  it('returns the index for a char within a timing range', () => {
    expect(findTimingForChar({ rawCharIndex: 0, timings })).toBe(0);
    expect(findTimingForChar({ rawCharIndex: 4, timings })).toBe(0);
    expect(findTimingForChar({ rawCharIndex: 7, timings })).toBe(1);
    expect(findTimingForChar({ rawCharIndex: 15, timings })).toBe(2);
  });

  it('returns -1 for a char between timing ranges', () => {
    expect(findTimingForChar({ rawCharIndex: 5, timings })).toBe(-1);
    expect(findTimingForChar({ rawCharIndex: 9, timings })).toBe(-1);
  });

  it('returns -1 for a char after all timings', () => {
    expect(findTimingForChar({ rawCharIndex: 20, timings })).toBe(-1);
  });

  it('returns -1 for empty timings', () => {
    expect(findTimingForChar({ rawCharIndex: 0, timings: [] })).toBe(-1);
  });

  it('uses early exit when char_start exceeds rawCharIndex', () => {
    expect(findTimingForChar({ rawCharIndex: 5, timings })).toBe(-1);
  });
});

describe('charsMatch', () => {
  it('matches identical characters', () => {
    expect(charsMatch({ rawChar: 'a', renderedChar: 'a' })).toBe(true);
    expect(charsMatch({ rawChar: ' ', renderedChar: ' ' })).toBe(true);
  });

  it('does not match different characters', () => {
    expect(charsMatch({ rawChar: 'a', renderedChar: 'b' })).toBe(false);
    expect(charsMatch({ rawChar: '*', renderedChar: 'a' })).toBe(false);
  });

  it('matches raw newline to rendered space', () => {
    expect(charsMatch({ rawChar: '\n', renderedChar: ' ' })).toBe(true);
  });

  it('does not match raw space to rendered newline', () => {
    expect(charsMatch({ rawChar: ' ', renderedChar: '\n' })).toBe(false);
  });
});

describe('splitTimingsByParagraph', () => {
  it('splits timings into per-paragraph arrays with adjusted offsets', () => {
    const content = 'Alice was\n\nbeginning to';
    const wordTimings: WordTiming[] = [
      { char_start: 0, char_end: 5, start_ms: 1000, end_ms: 1500 },
      { char_start: 6, char_end: 9, start_ms: 1500, end_ms: 1800 },
      { char_start: 11, char_end: 20, start_ms: 2000, end_ms: 2500 },
      { char_start: 21, char_end: 23, start_ms: 2500, end_ms: 2800 },
    ];

    const result = splitTimingsByParagraph({ content, wordTimings });

    expect(result).toHaveLength(2);

    expect(result[0]).toEqual([
      { char_start: 0, char_end: 5, start_ms: 1000, end_ms: 1500 },
      { char_start: 6, char_end: 9, start_ms: 1500, end_ms: 1800 },
    ]);

    expect(result[1]).toEqual([
      { char_start: 0, char_end: 9, start_ms: 2000, end_ms: 2500 },
      { char_start: 10, char_end: 12, start_ms: 2500, end_ms: 2800 },
    ]);
  });

  it('returns empty arrays for each paragraph when wordTimings is null', () => {
    const result = splitTimingsByParagraph({
      content: 'para one\n\npara two',
      wordTimings: null,
    });
    expect(result).toEqual([[], []]);
  });

  it('returns empty arrays for each paragraph when wordTimings is empty', () => {
    const result = splitTimingsByParagraph({
      content: 'para one\n\npara two',
      wordTimings: [],
    });
    expect(result).toEqual([[], []]);
  });

  it('handles a single paragraph', () => {
    const content = 'hello world';
    const wordTimings: WordTiming[] = [
      { char_start: 0, char_end: 5, start_ms: 100, end_ms: 200 },
      { char_start: 6, char_end: 11, start_ms: 200, end_ms: 300 },
    ];

    const result = splitTimingsByParagraph({ content, wordTimings });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual([
      { char_start: 0, char_end: 5, start_ms: 100, end_ms: 200 },
      { char_start: 6, char_end: 11, start_ms: 200, end_ms: 300 },
    ]);
  });

  it('handles three paragraphs with correct +2 separator offset', () => {
    const content = 'AA\n\nBB\n\nCC';
    const wordTimings: WordTiming[] = [
      { char_start: 0, char_end: 2, start_ms: 100, end_ms: 200 },
      { char_start: 4, char_end: 6, start_ms: 300, end_ms: 400 },
      { char_start: 8, char_end: 10, start_ms: 500, end_ms: 600 },
    ];

    const result = splitTimingsByParagraph({ content, wordTimings });

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual([
      { char_start: 0, char_end: 2, start_ms: 100, end_ms: 200 },
    ]);
    expect(result[1]).toEqual([
      { char_start: 0, char_end: 2, start_ms: 300, end_ms: 400 },
    ]);
    expect(result[2]).toEqual([
      { char_start: 0, char_end: 2, start_ms: 500, end_ms: 600 },
    ]);
  });

  it('assigns empty array to paragraphs with no timings', () => {
    const content = 'first\n\nsecond\n\nthird';
    const wordTimings: WordTiming[] = [
      { char_start: 0, char_end: 5, start_ms: 100, end_ms: 200 },
      { char_start: 15, char_end: 20, start_ms: 500, end_ms: 600 },
    ];

    const result = splitTimingsByParagraph({ content, wordTimings });

    expect(result).toHaveLength(3);
    expect(result[0]).toHaveLength(1);
    expect(result[1]).toHaveLength(0);
    expect(result[2]).toHaveLength(1);
  });
});
