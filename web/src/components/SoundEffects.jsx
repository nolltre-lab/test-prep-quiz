import React, { useEffect, useState } from "react";

// Programmatic sound generation using Web Audio API
class SoundPlayer {
  constructor() {
    this.audioContext = null;
    this.muted = localStorage.getItem('soundMuted') === 'true';
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playCorrect() {
    if (this.muted) return;
    this.init();

    const ctx = this.audioContext;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.4);
  }

  playWrong() {
    if (this.muted) return;
    this.init();

    const ctx = this.audioContext;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.setValueAtTime(100, ctx.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  }

  playCelebration() {
    if (this.muted) return;
    this.init();

    const ctx = this.audioContext;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.3);

      oscillator.start(ctx.currentTime + i * 0.1);
      oscillator.stop(ctx.currentTime + i * 0.1 + 0.3);
    });
  }

  playClick() {
    if (this.muted) return;
    this.init();

    const ctx = this.audioContext;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.05);
  }

  setMuted(muted) {
    this.muted = muted;
    localStorage.setItem('soundMuted', muted.toString());
  }

  isMuted() {
    return this.muted;
  }
}

// Global instance
export const soundPlayer = new SoundPlayer();

// Mute toggle button component
export function SoundMuteToggle() {
  const [muted, setMuted] = useState(soundPlayer.isMuted());

  const toggle = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    soundPlayer.setMuted(newMuted);
  };

  return (
    <button
      onClick={toggle}
      style={{
        background: "var(--panel, #1a1e3e)",
        color: "var(--ink, #e8ebff)",
        border: "1px solid var(--muted, #4a5568)",
        borderRadius: "8px",
        padding: "8px 12px",
        cursor: "pointer",
        fontSize: "20px",
        display: "flex",
        alignItems: "center",
        gap: "6px"
      }}
      title={muted ? "Unmute sounds" : "Mute sounds"}
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
