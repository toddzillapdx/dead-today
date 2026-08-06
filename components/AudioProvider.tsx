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

  // Update MediaSession metadata (for CarPlay, lock screen, etc.)
  // This function is called AFTER loadedmetadata event to ensure audio element is ready
  const updateMediaSession = useCallback((title: string, audio: HTMLAudioElement | null) => {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      // 1. Force iOS to completely drop the previous track from its cache
      navigator.mediaSession.metadata = null;

      // 2. Assign new metadata with absolute URL for artwork
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title,
        artist: showVenue || 'Grateful Dead',
        album: showCity && showDate ? `${showCity}, ${showDate}` : 'Dead Today',
        artwork: [
          {
            // Use absolute URL so CarPlay can successfully resolve the image
            src: 'https://www.toddames.com/dead-today/tape-spines.jpg',
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ]
      });

      // 3. Explicitly tell Apple's subsystem that a fresh timeline state has started
      navigator.mediaSession.playbackState = 'playing';
      
      if (audio && 'setPositionState' in navigator.mediaSession) {
        navigator.mediaSession.setPositionState({
          duration: audio.duration || 0,
          playbackRate: audio.playbackRate || 1,
          position: audio.currentTime || 0
        });
      }

      // Set action handlers
      navigator.mediaSession.setActionHandler('play', () => play());
      navigator.mediaSession.setActionHandler('pause', () => pause());
      // Note: skipNext and skipPrevious refs will be resolved at call time
    }
  }, [showVenue, showDate, showCity, play, pause]);

  // Helper to bind metadata update to loadedmetadata event
  const bindMetadataUpdate = useCallback((audio: HTMLAudioElement, title: string) => {
    const updateMetaOnceLoaded = () => {
      updateMediaSession(title, audio);
      audio.removeEventListener('loadedmetadata', updateMetaOnceLoaded);
    };
    audio.addEventListener('loadedmetadata', updateMetaOnceLoaded, { once: true });
  }, [updateMediaSession]);

  const loadTrack = useCallback((url: string, title: string, trackId: string) => {
    // Update track info for UI
    setCurrentTrackId(trackId);
    setCurrentTrackTitle(title);
    setCurrentTime(0);
    
    // Find the track index in the playlist using ref (avoids closure issues)
    const trackIndex = playlistRef.current.findIndex(t => t.trackId === trackId);
    
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.load();
      
      // Update index immediately and sync ref for use in event handlers
      if (trackIndex >= 0) {
        setCurrentTrackIndex(trackIndex);
        currentTrackIndexRef.current = trackIndex;
      }
      
      // Bind metadata update to loadedmetadata event so iOS recognizes the audio is ready
      bindMetadataUpdate(audioRef.current, title);
      
      play();
    }
  }, [bindMetadataUpdate, play]);

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
        
        // Bind metadata update to loadedmetadata event
        bindMetadataUpdate(audioRef.current, next.title);
        
        audioRef.current.play().catch(() => {});
      }
    }
  }, [bindMetadataUpdate]);

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
        
        // Bind metadata update to loadedmetadata event
        bindMetadataUpdate(audio, prev.title);
        
        audio.play().catch(() => {});
      }
    } else if (audio) {
      audio.currentTime = 0;
    }
  }, [bindMetadataUpdate]);

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
          
          // Bind metadata update to loadedmetadata event
          // Create inline to avoid hoisting issues with bindMetadataUpdate
          const updateMetaOnceLoaded = () => {
            updateMediaSession(nextTrack.title, audio);
            audio.removeEventListener('loadedmetadata', updateMetaOnceLoaded);
          };
          audio.addEventListener('loadedmetadata', updateMetaOnceLoaded, { once: true });
          
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
