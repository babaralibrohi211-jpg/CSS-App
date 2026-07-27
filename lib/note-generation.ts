// lib/note-generation.ts
// Generates real, syllabus-grounded study notes via Groq and saves them
// to the same Firestore `notes` collection your PDF notes already use.

import Groq from "groq-sdk";
import { getFirestore } from "firebase-admin/firestore";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export type NoteDepth = "brief" | "detailed" | "exam-focused";

function depthInstructions(depth: NoteDepth): string {
  if (depth === "brief") {
    return "Keep it to concise revision points — a single page's worth. Focus on definitions, key facts, and a quick summary. No answer skeletons needed.";
  }
  if (depth === "exam-focused") {
    return "Structure this as exam-ready material: a crisp memorable definition, 4-6 high-yield bullet points, a short answer skeleton for a typical CSS descriptive question on this topic, and common mistakes/traps to avoid.";
  }
  return "Write full study notes: introduction and context, key concepts explained clearly, relevant facts/examples (especially Pakistan-specific where relevant), a brief critical analysis (strengths/limitations), and 2-3 possible exam question angles.";
}

export interface GeneratedNote {
  title: string;
  content: string;
}

export async function generateNotesForTopic(params: {
  subjectId: string;
  subjectName: string;
  topic: string;
  depth: NoteDepth;
  extraInstructions?: string;
}): Promise<GeneratedNote> {
  const db = getFirestore();

  const subjectDoc = await db.collection("subjects").doc(params.subjectId).get();
  const topics: string[] = subjectDoc.exists ? subjectDoc.data()?.topics || [] : [];

  const prompt = `You are an expert CSS (Central Superior Services, Pakistan) exam tutor writing study notes.

Subject: ${params.subjectName}
Topic requested: ${params.topic}

${topics.length > 0 ? `Official FPSC syllabus topics for this subject (ground your notes in this context — the topic requested should relate to these):\n${topics.map((t, i) => `${i + 1}. ${t}`).join("\n")}` : ""}

${params.extraInstructions ? `Additional instructions from the student: ${params.extraInstructions}` : ""}

Depth/style required: ${depthInstructions(params.depth)}

Write the notes in clean Markdown (use ## and ### headers, bullet points, bold for key terms). Be factually accurate — do not invent dates, names, or events. If you are not certain of a specific fact, phrase it generally rather than stating a fabricated specific.

Output ONLY the notes content in Markdown — no preamble, no "Here are your notes" framing.`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.6,
  });

  const content = completion.choices[0]?.message?.content?.trim() || "";
  const depthLabel =
    params.depth === "brief" ? "Quick Notes" : params.depth === "exam-focused" ? "Exam Notes" : "Detailed Notes";

  return { title: `${params.topic} — ${depthLabel}`, content };
}

export async function saveGeneratedNote(params: {
  subjectId: string;
  title: string;
  content: string;
  depth: NoteDepth;
  uid: string;
}): Promise<string> {
  const db = getFirestore();
  const docRef = await db.collection("notes").add({
    subjectId: params.subjectId,
    title: params.title,
    content: params.content,
    source: "ai-generated",
    depth: params.depth,
    generatedByUid: params.uid,
    createdAt: new Date(),
  });
  return docRef.id;
}