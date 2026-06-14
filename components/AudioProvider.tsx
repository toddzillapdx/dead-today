'use client';

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';

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
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [currentTrackTitle, setCurrentTrackTitle] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create audio element only on client
  const initAudio = () => {
    if (!audioRef.current && typeof window !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;

      audioRef.current.addEventListener('play', () => setIsPlaying(true));
      audioRef.current.addEventListener('pause', () => setIsPlaying(false));
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime ?? 0);
      });
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration ?? 0);
      });
    }
  };

  const play = () => {
    initAudio();
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
    initAudio();
    setCurrentTrackId(trackId);
    setCurrentTrackTitle(title);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.load();
      play();
    }
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
