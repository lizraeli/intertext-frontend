export interface NovelSummary {
  id: number;
  title: string;
  author: string;
  publication_year: number | null;
}

export interface ChapterDetail {
  id: number;
  title: string;
  block_index: number;
  opening_line: string;
  first_segment_id: number | null;
  places: string[];
}

export interface NovelChaptersResponse {
  novel_title: string;
  author: string;
  publication_year: number | null;
  chapters: ChapterDetail[];
}

export interface ThemeAnnotation {
  name: string;
  intensity: number;
  tone: number;
  manifestation: string;
}

export interface SegmentPreview {
  id: number;
  opening_line: string;
  mood: string;
}

export interface SimilarSegmentPreview {
  id: number;
  opening_line: string;
  mood: string;
  novel_title: string;
  author: string;
  similarity_score: number;
}

export interface FullSegment {
  id: number;
  novel_id: number;
  content: string;
  novel_title: string;
  author: string;
  year: number | null;
  mood: string;
  themes: ThemeAnnotation[];
  place: string;
  characters: string[];
  chapter_id: number;
  chapter_title: string;
  prev_segment_id: number | null;
  next_segment_id: number | null;
  segment_index: number;
  chapter_segment_count: number;
}
