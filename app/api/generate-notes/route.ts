import { NextRequest } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { generateNotesForTopic, saveGeneratedNote, NoteDepth } from "@/lib/note-generation";

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
    const decoded = await getAuth().verifyIdToken(idToken);

    const body = await req.json();
    const { subjectId, subjectName, topic, depth, extraInstructions } = body as {
      subjectId: string;
      subjectName: string;
      topic: string;
      depth: NoteDepth;
      extraInstructions?: string;
    };

    if (!subjectId || !subjectName || !topic || !depth) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const generated = await generateNotesForTopic({ subjectId, subjectName, topic, depth, extraInstructions });
    const noteId = await saveGeneratedNote({
      subjectId,
      title: generated.title,
      content: generated.content,
      depth,
      uid: decoded.uid,
    });

    return new Response(JSON.stringify({ id: noteId, title: generated.title, content: generated.content }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Note generation error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate notes" }), { status: 500 });
  }
}