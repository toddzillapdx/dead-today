'use client';

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';

export interface Track {
  url: string;
  title: string;
  trackId: string;
}

export interface AudioContextType {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  currentTrackId: string | null;
  currentTrackTitle: string;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  loadTrack: (url: string, title: string, trackId: string) => void;
  setPlaylist: (tracks: Track[], startIndex: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [currentTrackTitle, setCurrentTrackTitle] = useState('');
  const [playlist, setPlaylistState] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create audio element only on client
  useEffect(() => {
    if (!audioRef.current && typeof window !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
      audioRef.current.crossOrigin = 'anonymous';
    }
  }, []);

  // Set up event listeners that depend on playlist state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    const handleEnded = () => {
      // Auto-advance to next track
      if (currentTrackIndex >= 0 && currentTrackIndex < playlist.length - 1) {
        const nextTrack = playlist[currentTrackIndex + 1];
        setCurrentTrackIndex(currentTrackIndex + 1);
        if (audio && nextTrack) {
          audio.src = nextTrack.url;
          audio.load();
          audio.play().catch(() => {});
        }
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, playlist]);

  const play = () => {
    audioRef.current?.play().catch(() => {});
  };

  const pause = () => {
    audioRef.current?.pause();
  };

  const togglePlay = () => {
    if (isPlaying) pause();
    else play();
  };

  const seek = (time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  };

  const loadTrack = (url: string, title: string, trackId: string) => {
    setCurrentTrackId(trackId);
    setCurrentTrackTitle(title);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.load();
      play();
    }
  };

  const setPlaylist = (tracks: Track[], startIndex: number) => {
    setPlaylistState(tracks);
    setCurrentTrackIndex(startIndex);
  };

  const value: AudioContextType = {
    isPlaying,
    currentTime,
    duration,
    volume,
    currentTrackId,
    currentTrackTitle,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    loadTrack,
    setPlaylist,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}
