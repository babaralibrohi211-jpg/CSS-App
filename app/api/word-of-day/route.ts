import { NextRequest } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getOrCreateTodaysWord } from "@/lib/word-of-day";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const idToken = authHeader?.replace("Bearer ", "");
    if (!idToken) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
    }
    await getAuth().verifyIdToken(idToken);

    const word = await getOrCreateTodaysWord();
    return new Response(JSON.stringify(word), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Word of the day error:", error);
    return new Response(JSON.stringify({ error: "Failed to load word of the day" }), { status: 500 });
  }
}