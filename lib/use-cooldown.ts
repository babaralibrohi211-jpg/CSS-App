"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface CooldownState {
  /** true while the cooldown window is still running */
  active: boolean;
  /** seconds left, 0 when not on cooldown */
  remaining: number;
  /** call this right after a successful generation to start the cooldown */
  trigger: () => void;
}

/**
 * Simple client-side cooldown, persisted in localStorage so it survives
 * refreshes and can't be dodged by reloading the page.
 *
 * @param key      unique key per cooldown target, e.g. `quiz-${subjectId}`
 * @param seconds  cooldown duration in seconds
 */
export function useCooldown(key: string, seconds: number): CooldownState {
  const storageKey = `cooldown:${key}`;
  const [remaining, setRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const computeRemaining = useCallback(() => {
    if (typeof window === "undefined") return 0;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return 0;
    const until = parseInt(raw, 10);
    if (Number.isNaN(until)) return 0;
    const diff = Math.ceil((until - Date.now()) / 1000);
    return diff > 0 ? diff : 0;
  }, [storageKey]);

  useEffect(() => {
    setRemaining(computeRemaining());
    intervalRef.current = setInterval(() => {
      setRemaining(computeRemaining());
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // re-run if the key changes (e.g. navigating to a different subject)
  }, [computeRemaining]);

  const trigger = useCallback(() => {
    if (typeof window === "undefined") return;
    const until = Date.now() + seconds * 1000;
    window.localStorage.setItem(storageKey, String(until));
    setRemaining(seconds);
  }, [seconds, storageKey]);

  return { active: remaining > 0, remaining, trigger };
}
