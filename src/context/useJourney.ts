import { useContext } from 'react';
import { JourneyContext, type JourneyContextValue } from './journeyTypes';

export function useJourney(): JourneyContextValue {
  const context = useContext(JourneyContext);
  if (!context) {
    throw new Error('useJourney must be used within a JourneyProvider');
  }
  return context;
}
