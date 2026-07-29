import { NextRequest } from "next/server";
import Groq from "groq-sdk";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

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

function extractJson(text: string): unknown {
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found");
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
    const { subjectName, correct, total, wrongQuestions } = body as {
      subjectName: string;
      correct: number;
      total: number;
      wrongQuestions: { question: string; yourAnswer: string; correctAnswer: string }[];
    };

    if (wrongQuestions.length === 0) {
      return new Response(
        JSON.stringify({
          weakAreas: [],
          improvementPlan: `Excellent work — you got all ${total} questions right on ${subjectName}. Keep this pace up and consider trying a harder difficulty mix next time.`,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const prompt = `A CSS (Pakistan) exam aspirant just took a quiz on "${subjectName}" and scored ${correct}/${total}.

Here are the questions they got WRONG, with their answer and the correct answer:
${wrongQuestions.map((w, i) => `${i + 1}. Q: ${w.question}\n   Their answer: ${w.yourAnswer}\n   Correct answer: ${w.correctAnswer}`).join("\n\n")}

Based ONLY on these specific wrong answers:
1. Identify 1-3 short "weak area" tags (2-4 words each, e.g. "Constitutional Amendments", "Precis Structure") that genuinely reflect what these specific questions were testing — do not invent generic or unrelated topics.
2. Write a short (2-3 sentence) improvement plan referencing the ACTUAL topics above, suggesting what to review next.

Respond with ONLY valid JSON, no other text:
{"weakAreas": ["...", "..."], "improvementPlan": "..."}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

    const raw = completion.choices[0]?.message?.content || "";
    const parsed = extractJson(raw) as { weakAreas: string[]; improvementPlan: string };

    return new Response(JSON.stringify(parsed), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Feedback generation error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate feedback" }), { status: 500 });
  }
}