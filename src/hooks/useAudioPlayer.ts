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

      const ms = audio.currentTime * 1000;

      if (endMs != null && ms >= endMs) {
        audio.pause();
        setIsPlaying(false);
        return;
      }

      if (Math.abs(ms - prevMs) > 16) {
        setCurrentTimeMs(ms);
        prevMs = ms;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, endMs]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (startMs != null) {
        const currentMs = audio.currentTime * 1000;
        if (currentMs < (startMs ?? 0) || (endMs != null && currentMs >= endMs)) {
          audio.currentTime = startMs / 1000;
        }
      }
      audio.play().then(() => setIsPlaying(true));
    }
  }, [isPlaying, startMs, endMs]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  return { isPlaying, isBuffering, currentTimeMs, toggle, pause };
}
