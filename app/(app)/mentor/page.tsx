"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/card";
import { mentorMessages, mentorQuickActions, trialDaysLeft } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function MentorPage() {
  const [messages, setMessages] = useState(mentorMessages);
  const [input, setInput] = useState("");

  function send() {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), role: "user" as const, content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: Date.now() + 1,
          role: "assistant" as const,
          content:
            "This is a UI placeholder response — once the AI backend proxy is connected (Phase 3), replies will stream in token-by-token here.",
        },
      ]);
    }, 500);
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
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[80%] md:max-w-[65%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-primary text-on-primary rounded-br-sm"
                  : "bg-surface-container-low text-on-surface rounded-bl-sm"
              )}
            >
              {m.content}
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
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-outline-variant px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:bg-surface-container shrink-0"
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
            placeholder="Ask your AI Mentor anything..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-on-surface-variant"
          />
          <button
            onClick={send}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary shrink-0"
          >
            <Icon name="send" filled />
          </button>
        </div>
      </div>
    </div>
  );
}