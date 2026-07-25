import { NextRequest } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { generateQuestionsForSubject } from "@/lib/quiz-generation";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
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
    const count: number = body.count || 8;
    if (!subjectId) {
      return new Response(JSON.stringify({ error: "subjectId required" }), { status: 400 });
    }

    const result = await generateQuestionsForSubject(subjectId, count);
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate quiz" }), { status: 500 });
  }
}