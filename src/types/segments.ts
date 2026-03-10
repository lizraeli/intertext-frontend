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
  setting: string;
  prev_segment_id: number | null;
  next_segment_id: number | null;
}
