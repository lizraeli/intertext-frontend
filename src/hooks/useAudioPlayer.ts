import { useState, useEffect, useRef, useCallback } from 'react';

interface UseAudioPlayerProps {
  audioUrl: string | null;
  startMs: number | null;
  endMs: number | null;
}

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  isBuffering: boolean;
  currentTimeMs: number;
  toggle: () => void;
  pause: () => void;
}

export function useAudioPlayer({
  audioUrl,
  startMs,
  endMs,
}: UseAudioPlayerProps): UseAudioPlayerReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (startMs != null) {
      const currentMs = audio.currentTime * 1000;
      if (currentMs < startMs || (endMs != null && currentMs >= endMs)) {
        audio.currentTime = startMs / 1000;
      }
    }

    audio.play().then(() => setIsPlaying(true));
  }, [endMs, startMs]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.pause();
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  useEffect(() => {
    if (!audioUrl) {
      return;
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('ended', onEnded);
      audio.src = '';
      audioRef.current = null;
      setIsPlaying(false);
      setIsBuffering(false);
      setCurrentTimeMs(0);
    };
  }, [audioUrl]);

  useEffect(() => {
    if (!isPlaying || !audioRef.current) {
      return;
    }

    let prevMs = -1;
    const tick = () => {
      const audio = audioRef.current;
      if (!audio) {
        return;
      }

      const currentMs = audio.currentTime * 1000;

      if (endMs != null && currentMs >= endMs) {
        pause();
        return;
      }

      if (Math.abs(currentMs - prevMs) > 16) {
        setCurrentTimeMs(currentMs);
        prevMs = currentMs;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, endMs, pause]);

  return { isPlaying, isBuffering, currentTimeMs, toggle, pause };
}
