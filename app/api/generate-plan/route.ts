import { NextRequest } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { generateStudyPlan } from "@/lib/plan-generation";

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
    const performance = body.performance;

    const plan = await generateStudyPlan(performance);

    const db = getFirestore();
    await db.collection("studyPlans").doc(decoded.uid).set({
      uid: decoded.uid,
      dailyTasks: plan.daily,
      weeklyTasks: plan.weekly,
      monthlyTasks: plan.monthly,
      generatedAt: new Date(),
    });

    return new Response(JSON.stringify(plan), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Plan generation error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate plan" }), { status: 500 });
  }
}