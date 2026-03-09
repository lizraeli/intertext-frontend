import { useState, useCallback, type ReactNode } from 'react';
import { JourneyContext } from './journeyTypes';
import type { TrailEntry } from './journeyTypes';

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [trail, setTrail] = useState<TrailEntry[]>([]);

  const addToTrail = useCallback((segmentId: number, mood: string) => {
    setTrail((prev) => [...prev, { segmentId, mood }]);
  }, []);

  const resetTrail = useCallback(() => {
    setTrail([]);
  }, []);

  return (
    <JourneyContext.Provider value={{ trail, addToTrail, resetTrail }}>
      {children}
    </JourneyContext.Provider>
  );
}
