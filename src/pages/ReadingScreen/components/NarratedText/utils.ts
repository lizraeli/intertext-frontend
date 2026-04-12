import type { WordTiming } from '../../../../types/segments';

/**
 * Find the index of the word being spoken at the given time.
 * Returns -1 if no word's range contains currentTimeMs.
 */
export function findActiveWordIndex({
  timings,
  currentTimeMs,
}: {
  /** Sorted word timings for the paragraph */
  timings: WordTiming[];
  /** Current audio playback position in milliseconds */
  currentTimeMs: number;
}): number {
  for (let i = 0; i < timings.length; i++) {
    if (
      currentTimeMs >= timings[i].start_ms &&
      currentTimeMs < timings[i].end_ms
    ) {
      return i;
    }
  }

  return -1;
}

/**
 * Find which word timing (if any) contains the given raw character index.
 * Returns the timing's index, or -1 if the character is between or outside words.
 * Exits early once timings are past the given position (assumes sorted timings).
 */
export function findTimingForChar({
  rawCharIndex,
  timings,
}: {
  /** Character index in the raw markdown source string */
  rawCharIndex: number;
  /** Sorted word timings for the paragraph */
  timings: WordTiming[];
}): number {
  for (let i = 0; i < timings.length; i++) {
    if (timings[i].char_start > rawCharIndex) {
      break;
    }

    if (
      rawCharIndex >= timings[i].char_start &&
      rawCharIndex < timings[i].char_end
    ) {
      return i;
    }
  }

  return -1;
}

/**
 * Check whether a character in the raw markdown source matches a character
 * in the rendered text. Handles the case where markdown renders a newline
 * as a space (soft line break).
 */
export function charsMatch({
  rawChar,
  renderedChar,
}: {
  /** A character from the raw markdown source string */
  rawChar: string;
  /** A character from the rendered text node */
  renderedChar: string;
}): boolean {
  if (rawChar === renderedChar) {
    return true;
  }

  if (rawChar === '\n' && renderedChar === ' ') {
    return true;
  }

  return false;
}

/**
 * Split segment-level word timings into per-paragraph arrays.
 * Adjusts char offsets from segment-relative to paragraph-relative,
 * accounting for the "\n\n" separator between paragraphs (+2 chars).
 */
export function splitTimingsByParagraph({
  content,
  wordTimings,
}: {
  /** The full segment content string (paragraphs joined by "\n\n") */
  content: string;
  /** Word timings with segment-relative char offsets, or null */
  wordTimings: WordTiming[] | null;
}): WordTiming[][] {
  const paragraphs = content.split('\n\n');
  if (!wordTimings || wordTimings.length === 0) {
    return paragraphs.map(() => []);
  }

  const result: WordTiming[][] = [];
  let offset = 0;

  for (const para of paragraphs) {
    const paraEnd = offset + para.length;
    const paraTimings: WordTiming[] = [];

    for (const timing of wordTimings) {
      if (timing.char_start >= offset && timing.char_start < paraEnd) {
        paraTimings.push({
          char_start: timing.char_start - offset,
          char_end: timing.char_end - offset,
          start_ms: timing.start_ms,
          end_ms: timing.end_ms,
        });
      }
    }

    result.push(paraTimings);
    offset = paraEnd + 2;
  }

  return result;
}
