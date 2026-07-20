import { NextRequest } from "next/server";
import Groq from "groq-sdk";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { buildMentorSystemPrompt } from "@/lib/mentor-prompt";

// Initialize Firebase Admin once (server-side only)
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

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Verify the request really comes from a logged-in user
    const authHeader = req.headers.get("authorization");
    const idToken = authHeader?.replace("Bearer ", "");
    if (!idToken) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
    }
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // 2. Parse the request
    const body = await req.json();
    const messages: ChatMessage[] = body.messages;
    const userContext = body.userContext;

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), { status: 400 });
    }

    // 3. Build the CSS-scoped system prompt with this user's personalization
    const systemPrompt = buildMentorSystemPrompt(userContext);

    // 4. Drop any leading assistant message (our UI's hardcoded welcome text)
    //    so the conversation sent to the model starts cleanly at a user turn.
    const firstUserIndex = messages.findIndex((m) => m.role === "user");
    const trimmedMessages = firstUserIndex === -1 ? [] : messages.slice(firstUserIndex);

    // 5. Call Groq with streaming enabled
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...trimmedMessages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      stream: true,
      temperature: 0.7,
    });

    // 6. Stream the response back to the browser
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Mentor API error:", error);
    return new Response(JSON.stringify({ error: "Something went wrong" }), { status: 500 });
  }
}