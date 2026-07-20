"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/card";
import { mentorQuickActions, trialDaysLeft } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function MentorPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your AI Mentor for CSS preparation. I can explain concepts, review your quiz mistakes, or build a study plan. What would you like to work on?",
    },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load this user's onboarding data for personalization
  const [userContext, setUserContext] = useState<Record<string, unknown> | null>(null);
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      const data = snap.data();
      if (data) {
        setUserContext({
          name: data.name,
          targetYear: data.onboarding?.targetYear,
          level: data.onboarding?.level,
          weakSubjects: data.weakSubjects || [],
        });
      }
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!input.trim() || streaming || !user) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setStreaming(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages((m) => [...m, { id: assistantId, role: "assistant", content: "" }]);

    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/mentor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          userContext,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Mentor request failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullReply = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullReply += chunk;
        setMessages((m) =>
          m.map((msg) => (msg.id === assistantId ? { ...msg, content: fullReply } : msg))
        );
      }

      // Persist the conversation to Firestore
      await setDoc(
        doc(db, "aiMentorChats", user.uid),
        {
          uid: user.uid,
          messages: [...nextMessages, { role: "assistant", content: fullReply }],
          lastUpdated: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error(err);
      setMessages((m) =>
        m.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: "Sorry, something went wrong. Please try again." }
            : msg
        )
      );
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px-24px)] md:h-[calc(100vh-64px-48px)] -mx-4 md:-mx-6 -mb-24 md:-mb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 pb-4 border-b border-outline-variant/40">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container/15 text-primary">
            <Icon name="smart_toy" filled />
          </div>
          <div>
            <h1 className="font-semibold text-on-surface leading-tight">AI Mentor</h1>
            <p className="text-xs text-on-surface-variant">Your personal CSS tutor</p>
          </div>
        </div>
        <Badge tone="tertiary">{trialDaysLeft} days left in trial</Badge>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[80%] md:max-w-[65%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                m.role === "user"
                  ? "bg-primary text-on-primary rounded-br-sm"
                  : "bg-surface-container-low text-on-surface rounded-bl-sm"
              )}
            >
              {m.content || (streaming && m.role === "assistant" ? "..." : "")}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="px-4 md:px-6 pb-2 flex gap-2 overflow-x-auto">
        {mentorQuickActions.map((qa) => (
          <button
            key={qa.label}
            onClick={() => setInput(qa.label)}
            disabled={streaming}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-outline-variant px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:bg-surface-container shrink-0 disabled:opacity-50"
          >
            <Icon name={qa.icon} className="text-[16px]" />
            {qa.label}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="px-4 md:px-6 pt-2 pb-4 border-t border-outline-variant/40">
        <div className="flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low pl-2 pr-2 h-12">
          <button className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container shrink-0">
            <Icon name="add" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={streaming ? "Mentor is replying..." : "Ask your AI Mentor anything..."}
            disabled={streaming}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-on-surface-variant disabled:opacity-60"
          />
          <button
            onClick={send}
            disabled={streaming || !input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary shrink-0 disabled:opacity-40"
          >
            <Icon name="send" filled />
          </button>
        </div>
      </div>
    </div>
  );
}