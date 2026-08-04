"use client";

import { useEffect, useState } from "react";
import { Card, Badge } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/lib/auth-context";

interface WordOfDay {
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  synonyms: string[];
  antonyms: string[];
  exampleSentence: string;
  difficulty: string;
}

export function WordOfDayCard() {
  const { user, loading: authLoading } = useAuth();
  const [word, setWord] = useState<WordOfDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      setError("Sign in to load today's word.");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/word-of-day", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          throw new Error(payload?.error || "Failed to load word of the day");
        }

        const payload = (await res.json()) as WordOfDay;
        if (!cancelled) setWord(payload);
      } catch (err) {
        console.error("Failed to load word of the day:", err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load word of the day");
          setWord(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="h-4 w-24 rounded bg-surface-container-high animate-pulse mb-3" />
        <div className="h-6 w-40 rounded bg-surface-container-high animate-pulse mb-2" />
        <div className="h-3 w-full rounded bg-surface-container-high animate-pulse" />
      </Card>
    );
  }

  if (!word) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-primary text-sm font-medium mb-2">
          <Icon name="menu_book" filled className="text-[18px]" />
          Word of the Day
        </div>
        <p className="text-sm text-on-surface-variant">{error ?? "Word data is not available right now."}</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-primary text-sm font-medium">
          <Icon name="menu_book" filled className="text-[18px]" />
          Word of the Day
        </div>
        <Badge tone="tertiary">{word.difficulty}</Badge>
      </div>

      <div className="flex items-baseline gap-2 flex-wrap">
        <h3 className="text-xl font-bold text-on-surface">{word.word}</h3>
        <span className="text-sm text-on-surface-variant">{word.pronunciation}</span>
        <span className="text-xs italic text-on-surface-variant">{word.partOfSpeech}</span>
      </div>

      <p className="mt-2 text-sm text-on-surface leading-relaxed">{word.definition}</p>

      <p className="mt-3 text-sm text-on-surface-variant italic leading-relaxed border-l-2 border-primary-container pl-3">
        "{word.exampleSentence}"
      </p>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs">
        {word.synonyms.length > 0 && (
          <div>
            <span className="text-on-surface-variant">Synonyms: </span>
            <span className="text-on-surface font-medium">{word.synonyms.join(", ")}</span>
          </div>
        )}
        {word.antonyms.length > 0 && (
          <div>
            <span className="text-on-surface-variant">Antonyms: </span>
            <span className="text-on-surface font-medium">{word.antonyms.join(", ")}</span>
          </div>
        )}
      </div>
    </Card>
  );
}