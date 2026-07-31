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
  setPlaylist: (tracks: Track[], startIndex: number, identifier?: string, showInfo?: { venue?: string; date?: string; city?: string }) => void;
  skipNext: () => void;
  skipPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  currentShowIdentifier: string | null;
  showVenue: string;
  showDate: string;
  showCity: string;
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
  const [currentShowIdentifier, setCurrentShowIdentifier] = useState<string | null>(null);
  const [showVenue, setShowVenue] = useState<string>('');
  const [showDate, setShowDate] = useState<string>('');
  const [showCity, setShowCity] = useState<string>('');
  
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

  const play = useCallback(() => {
    audioRef.current?.play().catch(() => {});
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, pause, play]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  }, []);

  // Inline data URL for the bolt artwork — avoids any cross-origin fetch issues with CarPlay.
  const BOLT_ARTWORK = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAIAAAB7GkOtAAAHvElEQVR42u3c0ZHYNhAFQSSC/ONiJvxgDCyQO931EjBxnpVkldcCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgkmtvHwEgl/5nPgVALv3qD1BMvwMAEE2/+gMU0+8AAETTr/4AxfQ7AADF7qs/QDT9DgBANP3qD1BMvwMAEE2/+gMU0+8AAETT7wAARNOv/gDF9DsAANH0qz9AMf0OAEA0/eoPUEy/AwAQTb/6A+S67wAAdNOv/gDF9DsAANH0OwAA0fSrP0Ax/Q4AQDT96g9QTL8DABBNv/oDFNPvAABE06/+AMX0OwAA0fSrP0Ax/Q4AQLH76g8QTb8DABBNvwMAEE2/+gMU0+8AAETTr/4AxfQ7AAD+8AeA2BnwggDFG+DtAKJnwKsBFM+AxwKIngHPBBC9Ad4IoHgGPA1A9Ax4FIDi7wC8C0Au/Q4AQDT96g9QTP/ZA+D2ANI/v/5+5wFI//AD4M+dAOmfX3//1QFg/fd//3nkn85PCyD9n6u/v3EEMDz9/r4pgPSrP4D0Sz+A9Ks/gPSrPyD9pv6A9Jv6A9Jv6g9Iv6k/IP3qDyD96g+g++oPIP3qDyD96g8g/eoPIP3SDyD96g9Iv6k/IP2m/oD0m/oD0m/qD0i/qT8g/ab+gPSb+gPSr/4A0q/+ANKv/gDSr/4AjoH6A7gH6g/gGKg/gGMg/QCOgfoDuAfqD+AYqD+AY6D+AI6B+gO4B+oP4BioP4BjoP4A0q/+AOqv/gDl9Ks/gPoD0Ei/+gMU06/+AOoPgPQDoP4A0q/+ANKv/gDqr/4A0q/+AOqv/gDSr/4A0u88AKi/8wAg/c4DgPq7DQDS7zwASL/zAKD+5jwA0q/+AOov/QDSr/6A9Jv6A+pv0g9Iv6k/oP4m/YD0m/qD6i/ST8g/ab+gPqb+gPSb+oPqL9JP6D+pv6A+pv0A9Jv6g+ov0k/oP6m/oD0m/QD6m/qD6i/ST8g/ab+gPqb9APSb+oPqL9JP6D+pv6A+pv0A9Jv6g+ov0k/oP4m/YD0m/QD6m/qD6i/ST+g/qb+gPqb9APqr/6A9Jv0A+pv6g+ov0k/IP2m/oD6m/QD6m/qD0i/ST+g/qb+gPqb9APSb+oPqL9JP6D+pv6A+pv0A9Jv6g+ov0k/oP6m/oD0m/QD6m/qD6i/ST8g/ab+gPqb9APqr/6A9Jv0A+pv6g+ov0k/IP2m/oD6m/QD6m/qD0i/ST+g/qb+gPqb9APSb+oPqL9JP6D+pv6A+pv0A9Jv6g+ov0k/oP4m/YD6m/oD6m/SD6i/ST+g/tIPoP7SD6D+0g+g/tIPoP7SD6i/ST+g/ib9gPqb+gPqb9IPSL9JP6D+Jv2A+pv0A+pv0g+ov0k/oP4m/YD6Sz+A+ks/gPqrP4CbJP0A6i/9AA6A9AOov/QDOADSD6D+DgCAA+AAAKi/AwDgADgAAOrvGAA4AI4BgPq7BAAOgGMAoP6OAYAD4BgAqL9LAOAAOAaA+uu19AMOgOk+oP4m/YADYNIPqL/pPuAASD+A+us+gAMg/QDqL/0ADoDuA6i/9AM4ANIPoP66D+AASD+AAyD9AOqv+wAOgPQDqL/uAzgA0g+Qrb9XBmgdAI8LkKu/lwXIHQBvCtCqv9cEyB0A7wjQqr8XBMgdAG8HkKu/hwNoHQDvBZCrv8cCSP/5jycDKNbfDQBIHwBnAKBbfzcAIH0AnAGAbv2dAYD6AXADAKL1dwYA6gfADQCI1t8ZAKgfADcAIFp/ZwDAL/8B1F/6ARwA3QdQf+kHcAB0H8ABkH4A9dd9AAdA9wHUX/oBHADdB1B/6QdwAHQfQP2lH8AB0H2AYP29C0DuAHgRgFb9vQVA7gB4BYBW/X1/gNwB8OUBWvX3zQFyB8DXBmjV33cGaB0AnxcgV3/fFqB1AHxSgFz9fU+A1gHwGQFy9fcNAVoHwKcDaNXfRwPIHQCfC6BVfx8KIHcAfCKAVv19HIDcAfBZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGCuGxh7P2VxItawAAAAAElFTkSuQmCC';

  // Set MediaSession metadata immediately (before play) — CarPlay requires this timing.
  const updateMediaSession = useCallback((title: string) => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist: showVenue || 'Grateful Dead',
      album: showCity && showDate ? `${showCity}, ${showDate}` : 'Dead Today',
      artwork: [{ src: BOLT_ARTWORK, sizes: '512x512', type: 'image/png' }],
    });
    navigator.mediaSession.playbackState = 'playing';
  }, [showVenue, showDate, showCity]);

  const loadTrack = useCallback((url: string, title: string, trackId: string) => {
    setCurrentTrackId(trackId);
    setCurrentTrackTitle(title);
    setCurrentTime(0);

    const trackIndex = playlistRef.current.findIndex(t => t.trackId === trackId);

    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.load();

      if (trackIndex >= 0) {
        setCurrentTrackIndex(trackIndex);
        currentTrackIndexRef.current = trackIndex;
      }

      updateMediaSession(title);
      play();
    }
  }, [updateMediaSession, play]);

  const setPlaylist = useCallback((tracks: Track[], startIndex: number, identifier?: string, showInfo?: { venue?: string; date?: string; city?: string }) => {
    setPlaylistState(tracks);
    setCurrentTrackIndex(startIndex);
    if (identifier) setCurrentShowIdentifier(identifier);
    if (showInfo) {
      setShowVenue(showInfo.venue || '');
      setShowDate(showInfo.date || '');
      setShowCity(showInfo.city || '');
    }
  }, []);

  const skipNext = useCallback(() => {
    const index = currentTrackIndexRef.current;
    const tracks = playlistRef.current;
    if (index >= 0 && index < tracks.length - 1) {
      const next = tracks[index + 1];
      const nextIndex = index + 1;
      currentTrackIndexRef.current = nextIndex;
      setCurrentTrackIndex(nextIndex);
      setCurrentTrackId(next.trackId);
      setCurrentTrackTitle(next.title);
      setCurrentTime(0);
      if (audioRef.current) {
        audioRef.current.src = next.url;
        audioRef.current.load();
        updateMediaSession(next.title);
        audioRef.current.play().catch(() => {});
      }
    }
  }, [updateMediaSession]);

  const skipPrevious = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const index = currentTrackIndexRef.current;
    const tracks = playlistRef.current;
    if (index > 0) {
      const prev = tracks[index - 1];
      const prevIndex = index - 1;
      currentTrackIndexRef.current = prevIndex;
      setCurrentTrackIndex(prevIndex);
      setCurrentTrackId(prev.trackId);
      setCurrentTrackTitle(prev.title);
      setCurrentTime(0);
      if (audio) {
        audio.src = prev.url;
        audio.load();
        updateMediaSession(prev.title);
        audio.play().catch(() => {});
      }
    } else if (audio) {
      audio.currentTime = 0;
    }
  }, [updateMediaSession]);

  // Fix up action handlers now that skipNext/skipPrevious exist
  useEffect(() => {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('nexttrack', () => skipNext());
      navigator.mediaSession.setActionHandler('previoustrack', () => skipPrevious());
    }
  }, [skipNext, skipPrevious]);

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
      
      if (index >= 0 && index < tracks.length - 1) {
        const nextTrack = tracks[index + 1];
        
        // Update state AND ref immediately
        const nextIndex = index + 1;
        currentTrackIndexRef.current = nextIndex;
        setCurrentTrackIndex(nextIndex);
        
        // Update track info for UI
        setCurrentTrackId(nextTrack.trackId);
        setCurrentTrackTitle(nextTrack.title);
        setCurrentTime(0);
        
        if (audio && nextTrack) {
          audio.src = nextTrack.url;
          audio.load();
          updateMediaSession(nextTrack.title);
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
  }, [updateMediaSession]);

  // Update page title when track changes (for Apple Watch / CarPlay)
  useEffect(() => {
    if (typeof window !== 'undefined' && currentTrackTitle) {
      document.title = `${currentTrackTitle} - Dead Today`;
    }
  }, [currentTrackTitle]);

  const hasNext = currentTrackIndex >= 0 && currentTrackIndex < playlist.length - 1;
  const hasPrevious = currentTrackIndex > 0;

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
    skipNext,
    skipPrevious,
    hasNext,
    hasPrevious,
    currentShowIdentifier,
    showVenue,
    showDate,
    showCity,
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
