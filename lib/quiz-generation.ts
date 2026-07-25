// lib/quiz-generation.ts
import Groq from "groq-sdk";
import { getFirestore } from "firebase-admin/firestore";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Subjects where real, timely current events should ground the questions —
// as opposed to subjects like Essay/Precis where the underlying content is
// stable and only "no repeats" matters.
const DYNAMIC_SUBJECTS = ["current-affairs", "pakistan-affairs"];

// Free, no-API-key RSS feeds for real, up-to-date Pakistani/international news.
const NEWS_FEEDS = [
  "https://www.dawn.com/feeds/home",
  "https://www.dawn.com/feeds/pakistan",
];

function extractJson(text: string): unknown {
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1) throw new Error("No JSON array found in model response");
  return JSON.parse(cleaned.slice(start, end + 1));
}

function stripCdata(s: string): string {
  return s.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim();
}

async function fetchRecentHeadlines(): Promise<string[]> {
  const headlines: string[] = [];
  for (const feedUrl of NEWS_FEEDS) {
    try {
      const res = await fetch(feedUrl, { next: { revalidate: 0 } as never });
      if (!res.ok) continue;
      const xml = await res.text();
      const titleMatches = [...xml.matchAll(/<title>([\s\S]*?)<\/title>/gi)];
      // Skip the first match — that's the feed's own title, not an article headline.
      for (const m of titleMatches.slice(1, 12)) {
        headlines.push(stripCdata(m[1]));
      }
    } catch (err) {
      console.error(`Failed to fetch feed ${feedUrl}:`, err);
    }
  }
  // De-duplicate, cap the list
  return Array.from(new Set(headlines)).slice(0, 20);
}

export interface GeneratedQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  difficulty: string;
}

export async function generateQuestionsForSubject(
  subjectId: string,
  count = 5
): Promise<{ subjectId: string; generated: number; questions: GeneratedQuestion[]; error?: string }> {
  const db = getFirestore();

  const subjectDoc = await db.collection("subjects").doc(subjectId).get();
  if (!subjectDoc.exists || !subjectDoc.data()?.topics) {
    return { subjectId, generated: 0, questions: [], error: "No syllabus data for this subject" };
  }
  const topics: string[] = subjectDoc.data()!.topics;

  const existingSnap = await db
    .collection("questionBank")
    .where("subjectId", "==", subjectId)
    .orderBy("createdAt", "desc")
    .limit(40)
    .get();
  const existingQuestions = existingSnap.docs.map((d) => d.data().question as string);

  const isDynamic = DYNAMIC_SUBJECTS.includes(subjectId);
  let currentEventsBlock = "";

  if (isDynamic) {
    const headlines = await fetchRecentHeadlines();
    if (headlines.length > 0) {
      currentEventsBlock = `
REAL, CURRENT NEWS HEADLINES (as of today) — ground several of your questions in these actual recent events, connecting them to the syllabus topics above where relevant:
${headlines.map((h) => `- ${h}`).join("\n")}

If a headline doesn't clearly connect to the syllabus topics, don't force it — only use headlines that genuinely fit a CSS-relevant angle (foreign policy, economy, governance, regional security, etc.).
`;
    }
  }

  const prompt = `You are an expert CSS (Central Superior Services, Pakistan) exam question writer.

Subject: ${subjectId}

Official FPSC syllabus topics for this subject (your questions MUST be grounded strictly in these topics):
${topics.map((t, i) => `${i + 1}. ${t}`).join("\n")}
${currentEventsBlock}
Questions already used recently — generate DIFFERENT questions, not these or close rephrasings:
${existingQuestions.length > 0 ? existingQuestions.map((q) => `- ${q}`).join("\n") : "(none yet)"}

Generate exactly ${count} new multiple-choice questions for CSS exam preparation on this subject.

Requirements:
- Grounded strictly in the syllabus topics listed above${isDynamic ? ", and where a real headline above fits naturally, ground a question in that real, current event" : ""}
- Exactly 4 options, only one correct
- Factually accurate — do not hallucinate dates, names, or events
- Mix of difficulty levels
- Genuinely different from the questions listed above — vary the angle, sub-topic, or phrasing

Respond with ONLY a valid JSON array, no other text, no markdown fences, in this exact format:
[{"question": "...", "options": ["...", "...", "...", "..."], "correctIndex": 0, "difficulty": "Easy"}]`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: isDynamic ? 0.7 : 0.9,
  });

  const raw = completion.choices[0]?.message?.content || "";
  const parsed = extractJson(raw) as Array<{
    question: string;
    options: string[];
    correctIndex: number;
    difficulty: string;
  }>;

  const saved: GeneratedQuestion[] = [];
  for (const q of parsed) {
    if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) continue;
    const docRef = await db.collection("questionBank").add({
      subjectId,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      difficulty: q.difficulty || "Medium",
      source: isDynamic ? "ai-generated-current-events" : "ai-generated",
      verified: false,
      createdAt: new Date(),
    });
    saved.push({
      id: docRef.id,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      difficulty: q.difficulty || "Medium",
    });
  }

  return { subjectId, generated: saved.length, questions: saved };
}