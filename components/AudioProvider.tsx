'use client';

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';

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
  
  // Refs to track current state for use in event handlers
  const currentTrackIndexRef = useRef(-1);
  const playlistRef = useRef<Track[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Keep refs in sync with state for use in closures
  useEffect(() => {
    currentTrackIndexRef.current = currentTrackIndex;
  }, [currentTrackIndex]);

  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  // Create audio element only on client
  useEffect(() => {
    if (!audioRef.current && typeof window !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
      audioRef.current.crossOrigin = 'anonymous';
    }
  }, []);

  // Set up event listeners (minimal deps)
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
      // Auto-advance to next track using refs (always have latest values)
      const index = currentTrackIndexRef.current;
      const tracks = playlistRef.current;
      
      console.log('[handleEnded] Current index:', index, 'Playlist length:', tracks.length);
      
      if (index >= 0 && index < tracks.length - 1) {
        const nextTrack = tracks[index + 1];
        console.log('[handleEnded] Loading next track:', nextTrack.title);
        
        // Update state AND ref immediately
        const nextIndex = index + 1;
        currentTrackIndexRef.current = nextIndex;
        setCurrentTrackIndex(nextIndex);
        
        if (audio && nextTrack) {
          audio.src = nextTrack.url;
          audio.load();
          audio.play().catch(() => {});
        }
      } else {
        console.log('[handleEnded] End of playlist or invalid index');
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
  }, []);

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

  const loadTrack = useCallback((url: string, title: string, trackId: string) => {
    console.log('[loadTrack] Loading track:', title, 'trackId:', trackId);
    
    setCurrentTrackId(trackId);
    setCurrentTrackTitle(title);
    setCurrentTime(0);
    
    // Find the track index in the playlist
    const trackIndex = playlist.findIndex(t => t.trackId === trackId);
    console.log('[loadTrack] Found track at index:', trackIndex, 'Playlist size:', playlist.length);
    
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.load();
      
      // Update index immediately (not async state)
      // We'll use a ref to track this for the ended handler
      if (trackIndex >= 0) {
        setCurrentTrackIndex(trackIndex);
        currentTrackIndexRef.current = trackIndex;
      }
      
      play();
    }
  }, [playlist]);

  const setPlaylist = useCallback((tracks: Track[], startIndex: number) => {
    console.log('[setPlaylist] Setting playlist with', tracks.length, 'tracks, starting at index', startIndex);
    setPlaylistState(tracks);
    setCurrentTrackIndex(startIndex);
  }, []);

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
