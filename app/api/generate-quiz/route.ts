import { NextRequest } from "next/server";
import Groq from "groq-sdk";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const db = getFirestore();

function extractJson(text: string): unknown {
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1) throw new Error("No JSON array found in model response");
  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const idToken = authHeader?.replace("Bearer ", "");
    if (!idToken) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
    }
    await getAuth().verifyIdToken(idToken);

    const body = await req.json();
    const subjectId: string = body.subjectId;
    if (!subjectId) {
      return new Response(JSON.stringify({ error: "subjectId required" }), { status: 400 });
    }

    // Pull the REAL syllabus topics for this subject — questions must be grounded in these
    const subjectDoc = await db.collection("subjects").doc(subjectId).get();
    if (!subjectDoc.exists || !subjectDoc.data()?.topics) {
      return new Response(
        JSON.stringify({ error: "No syllabus data found for this subject yet" }),
        { status: 404 }
      );
    }
    const topics: string[] = subjectDoc.data()!.topics;

    // Pull recent existing questions so the model avoids repeating them
    const existingSnap = await db
      .collection("questionBank")
      .where("subjectId", "==", subjectId)
      .limit(25)
      .get();
    const existingQuestions = existingSnap.docs.map((d) => d.data().question as string);

    const prompt = `You are an expert CSS (Central Superior Services, Pakistan) exam question writer.

Subject: ${subjectId}

Official FPSC syllabus topics for this subject (your questions MUST be grounded strictly in these topics — do not invent facts outside them):
${topics.map((t, i) => `${i + 1}. ${t}`).join("\n")}

Existing questions already in the bank — do NOT repeat these or create close rephrasings of them:
${existingQuestions.length > 0 ? existingQuestions.map((q) => `- ${q}`).join("\n") : "(none yet)"}

Generate exactly 8 new multiple-choice questions for CSS exam preparation on this subject.

Requirements for each question:
- Grounded strictly in the syllabus topics listed above
- Exactly 4 options, only one correct
- Factually accurate — do not hallucinate dates, names, or events
- Mix of difficulty: roughly 3 Easy, 3 Medium, 2 Hard
- Genuinely different from the existing questions listed above

Respond with ONLY a valid JSON array, no other text, no markdown code fences, in this exact format:
[
  {
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "correctIndex": 0,
    "difficulty": "Easy"
  }
]`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    const raw = completion.choices[0]?.message?.content || "";
    const parsed = extractJson(raw) as Array<{
      question: string;
      options: string[];
      correctIndex: number;
      difficulty: string;
    }>;

    const saved = [];
    for (const q of parsed) {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) continue;
      const docRef = await db.collection("questionBank").add({
        subjectId,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        difficulty: q.difficulty || "Medium",
        source: "ai-generated",
        verified: false,
        createdAt: new Date(),
      });
      saved.push({ id: docRef.id, ...q });
    }

    return new Response(JSON.stringify({ generated: saved.length, questions: saved }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate quiz" }), { status: 500 });
  }
}