import type { SegmentPreview, SimilarSegmentPreview, FullSegment } from '../types/segments';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export async function fetchRandomSegments(count: number = 5): Promise<SegmentPreview[]> {
  const response = await fetch(`${API_URL}/api/segments/random?count=${count}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch random segments: ${response.status}`);
  }
  return response.json();
}

export async function fetchSegment(id: number): Promise<FullSegment> {
  const response = await fetch(`${API_URL}/api/segments/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch segment ${id}: ${response.status}`);
  }
  return response.json();
}

export async function fetchSimilarSegments(
  id: number,
  limit: number = 3,
): Promise<SimilarSegmentPreview[]> {
  const response = await fetch(`${API_URL}/api/segments/${id}/similar?limit=${limit}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch similar segments: ${response.status}`);
  }
  return response.json();
}
