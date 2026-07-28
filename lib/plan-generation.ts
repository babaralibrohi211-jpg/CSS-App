// lib/plan-generation.ts
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface SubjectPerformance {
  subjectId: string;
  subjectName: string;
  avgAccuracy: number | null; // null = never attempted
}

export interface PlanTask {
  id: string;
  label: string;
  subject: string;
  time: string;
  done: boolean;
}

export async function generateStudyPlan(
  performance: SubjectPerformance[]
): Promise<{ daily: PlanTask[]; weekly: PlanTask[]; monthly: PlanTask[] }> {
  const weakSubjects = performance
    .filter((p) => p.avgAccuracy === null || p.avgAccuracy < 60)
    .map((p) => p.subjectName);
  const strongSubjects = performance.filter((p) => p.avgAccuracy !== null && p.avgAccuracy >= 75).map((p) => p.subjectName);

  const prompt = `You are a CSS (Central Superior Services, Pakistan) exam preparation coach creating a study plan.

Student's real performance data:
${performance.map((p) => `- ${p.subjectName}: ${p.avgAccuracy === null ? "not attempted yet" : `${p.avgAccuracy}% average accuracy`}`).join("\n")}

Weak/unattempted subjects needing more focus: ${weakSubjects.join(", ") || "none identified yet"}
Strong subjects (maintain, less frequent review): ${strongSubjects.join(", ") || "none yet"}

Create a study plan with:
- 3 Daily tasks (today's focus — prioritize weak subjects, include realistic time estimates in minutes)
- 3 Weekly tasks (this week's goals, realistic time estimates in hours)
- 2 Monthly tasks (broader monthly goals, realistic time estimates in hours)

Each task should be specific and actionable (not generic like "study more") and reference one of the actual subjects listed above.

Respond with ONLY valid JSON, no other text, no markdown fences, in this exact format:
{
  "daily": [{"label": "...", "subject": "...", "time": "45 min"}],
  "weekly": [{"label": "...", "subject": "...", "time": "3 hrs"}],
  "monthly": [{"label": "...", "subject": "...", "time": "15 hrs"}]
}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const raw = completion.choices[0]?.message?.content || "";
  const cleaned = raw.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const parsed = JSON.parse(cleaned.slice(start, end + 1)) as {
    daily: { label: string; subject: string; time: string }[];
    weekly: { label: string; subject: string; time: string }[];
    monthly: { label: string; subject: string; time: string }[];
  };

  function withIds(tasks: { label: string; subject: string; time: string }[]): PlanTask[] {
    return tasks.map((t, i) => ({
      id: `${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
      label: t.label,
      subject: t.subject,
      time: t.time,
      done: false,
    }));
  }

  return {
    daily: withIds(parsed.daily || []),
    weekly: withIds(parsed.weekly || []),
    monthly: withIds(parsed.monthly || []),
  };
}