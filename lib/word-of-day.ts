// lib/word-of-day.ts
import Groq from "groq-sdk";
import { getFirestore } from "firebase-admin/firestore";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function todayKey(): string {
  // Pakistan Standard Time is UTC+5 year-round (no daylight saving).
  // Using this instead of raw UTC so the word rolls over at actual
  // midnight in Pakistan, not at 5 AM local time (which is what pure
  // UTC would give us).
  const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;
  const pktNow = new Date(Date.now() + PKT_OFFSET_MS);
  return pktNow.toISOString().slice(0, 10); // YYYY-MM-DD in PKT
}

export interface WordOfDay {
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  synonyms: string[];
  antonyms: string[];
  exampleSentence: string;
  difficulty: "Medium" | "Hard" | "Advanced";
}

function extractJson(text: string): unknown {
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found");
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function generateWord(excludeWords: string[]): Promise<WordOfDay> {
  const prompt = `You are creating a "Word of the Day" feature for a CSS (Central Superior Services, Pakistan) exam prep platform, aimed at the English Essay and Precis & Composition papers.

Pick ONE sophisticated, exam-relevant English vocabulary word — the kind that appears in high-quality essays, editorials (Dawn, The Economist style), or formal CSS-level writing. Not everyday vocabulary, not obscure/archaic words nobody uses.

Do NOT pick any of these recently used words: ${excludeWords.length > 0 ? excludeWords.join(", ") : "(none yet)"}

Respond with ONLY valid JSON, no other text:
{
  "word": "...",
  "pronunciation": "...(phonetic, e.g. /ˈɛf.ə.bəl/ style)",
  "partOfSpeech": "...",
  "definition": "...(clear, one sentence)",
  "synonyms": ["...", "...", "..."],
  "antonyms": ["...", "..."],
  "exampleSentence": "...(a formal sentence in the style of a CSS essay on a serious topic — governance, economy, society, international relations, etc.)",
  "difficulty": "Medium" | "Hard" | "Advanced"
}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.9,
  });

  const raw = completion.choices[0]?.message?.content || "";
  return extractJson(raw) as WordOfDay;
}

export async function getOrCreateTodaysWord(): Promise<WordOfDay> {
  const db = getFirestore();
  const key = todayKey();
  const docRef = db.collection("wordOfTheDay").doc(key);
  const existing = await docRef.get();

  if (existing.exists) {
    return existing.data() as WordOfDay;
  }

  // Look at the last 30 days so we don't repeat recent words
  const recentSnap = await db
    .collection("wordOfTheDay")
    .orderBy("date", "desc")
    .limit(30)
    .get();
  const excludeWords = recentSnap.docs.map((d) => (d.data().word as string) || "");

  const word = await generateWord(excludeWords);
  await docRef.set({ ...word, date: key, generatedAt: new Date() });
  return word;
}