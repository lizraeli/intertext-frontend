import type { FullSegment } from '../types/segments';

export interface ShelfEntry {
  novelId: number;
  novelTitle: string;
  author: string;
  year: number | null;
  lastSegmentId: number;
  chapterTitle: string;
  segmentIndex: number;
  chapterSegmentCount: number;
  addedAt: string;
  lastReadAt: string;
}

export interface ShelfData {
  entries: ShelfEntry[];
}

const STORAGE_KEY = 'intertext-shelf';

function isShelfData(value: unknown): value is ShelfData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'entries' in value &&
    Array.isArray((value as ShelfData).entries)
  );
}

function readShelf(): ShelfData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { entries: [] };
    }

    const parsed: unknown = JSON.parse(raw);
    if (isShelfData(parsed)) {
      return parsed;
    }

    return { entries: [] };
  } catch {
    return { entries: [] };
  }
}

function writeShelf(data: ShelfData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function entryFromSegment(segment: FullSegment): ShelfEntry {
  const now = new Date().toISOString();
  return {
    novelId: segment.novel_id,
    novelTitle: segment.novel_title,
    author: segment.author,
    year: segment.year,
    lastSegmentId: segment.id,
    chapterTitle: segment.chapter_title,
    segmentIndex: segment.segment_index,
    chapterSegmentCount: segment.chapter_segment_count,
    addedAt: now,
    lastReadAt: now,
  };
}

export function getShelf(): ShelfData {
  return readShelf();
}

export function isOnShelf(novelId: number): boolean {
  return readShelf().entries.some((e) => e.novelId === novelId);
}

export function addToShelf(segment: FullSegment): void {
  const shelf = readShelf();
  const index = shelf.entries.findIndex(
    (entry) => entry.novelId === segment.novel_id,
  );

  if (index >= 0) {
    shelf.entries[index] = {
      ...entryFromSegment(segment),
      addedAt: shelf.entries[index].addedAt,
    };
  } else {
    shelf.entries.push(entryFromSegment(segment));
  }
  writeShelf(shelf);
}

export function updateShelfProgress(segment: FullSegment): void {
  const shelf = readShelf();
  const idx = shelf.entries.findIndex((e) => e.novelId === segment.novel_id);
  if (idx < 0) return;

  shelf.entries[idx] = {
    ...shelf.entries[idx],
    lastSegmentId: segment.id,
    chapterTitle: segment.chapter_title,
    segmentIndex: segment.segment_index,
    chapterSegmentCount: segment.chapter_segment_count,
    lastReadAt: new Date().toISOString(),
  };

  writeShelf(shelf);
}

export function removeFromShelf(novelId: number): void {
  const shelf = readShelf();
  const newShelf = {
    entries: shelf.entries.filter((entry) => entry.novelId !== novelId),
  };
  writeShelf(newShelf);
}
