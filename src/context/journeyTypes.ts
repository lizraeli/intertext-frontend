import { createContext } from 'react';

export interface TrailEntry {
  segmentId: number;
  mood: string;
}

export interface JourneyContextValue {
  trail: TrailEntry[];
  addToTrail: (segmentId: number, mood: string) => void;
  resetTrail: () => void;
}

export const JourneyContext = createContext<JourneyContextValue | null>(null);
