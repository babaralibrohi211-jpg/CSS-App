export const currentUser = {
  name: "Bobby",
  targetYear: 2027,
};

export const weeklyProgress = [
  { day: "Mon", hours: 2.5 },
  { day: "Tue", hours: 3 },
  { day: "Wed", hours: 1.5 },
  { day: "Thu", hours: 4 },
  { day: "Fri", hours: 2 },
  { day: "Sat", hours: 3.5 },
  { day: "Sun", hours: 1 },
];

export const todayTasks = [
  { id: 1, label: "Read Pakistan Affairs — Chapter 4 (Ideology of Pakistan)", done: true },
  { id: 2, label: "Attempt Topic Quiz: Current Affairs — International", done: false },
  { id: 3, label: "Review yesterday's Precis writing mistakes", done: false },
];

export const currentAffairsPreview = [
  { id: 1, title: "SBP holds policy rate steady amid inflation concerns", category: "Pakistan", date: "Jul 14" },
  { id: 2, title: "UN Security Council reform talks resume in New York", category: "International", date: "Jul 13" },
  { id: 3, title: "CPEC Phase II: new industrial cooperation framework", category: "Pakistan", date: "Jul 12" },
];

export const subjects = [
  {
    slug: "pakistan-affairs",
    name: "Pakistan Affairs",
    group: "Compulsory",
    icon: "flag",
    progress: 62,
    totalMarks: 100,
    questions: 8,
  },
  {
    slug: "current-affairs",
    name: "Current Affairs",
    group: "Compulsory",
    icon: "public",
    progress: 45,
    totalMarks: 100,
    questions: 8,
  },
  {
    slug: "english-essay",
    name: "English Essay",
    group: "Compulsory",
    icon: "edit_note",
    progress: 30,
    totalMarks: 100,
    questions: 1,
  },
  {
    slug: "english-precis",
    name: "English Precis & Composition",
    group: "Compulsory",
    icon: "menu_book",
    progress: 71,
    totalMarks: 100,
    questions: 5,
  },
  {
    slug: "general-science",
    name: "General Science & Ability",
    group: "Compulsory",
    icon: "science",
    progress: 18,
    totalMarks: 100,
    questions: 8,
  },
  {
    slug: "islamic-studies",
    name: "Islamic Studies / Comparative Religions",
    group: "Compulsory",
    icon: "menu_book",
    progress: 55,
    totalMarks: 100,
    questions: 8,
  },
  {
    slug: "international-relations",
    name: "International Relations",
    group: "Optional",
    icon: "public",
    progress: 40,
    totalMarks: 100,
    questions: 8,
  },
  {
    slug: "governance-public-policy",
    name: "Governance & Public Policy",
    group: "Optional",
    icon: "account_balance",
    progress: 12,
    totalMarks: 100,
    questions: 8,
  },
];

export const continueLearning = {
  subjectName: "English Precis & Composition",
  topic: "Precis Writing — Core Techniques",
  slug: "english-precis",
  progress: 71,
};

export const readinessScore = 68;
export const studyStreak = 12;

export const trialDaysLeft = 5;

export const mentorMessages = [
  {
    id: 1,
    role: "assistant" as const,
    content:
      "Hi Bobby! I'm your AI Mentor for CSS preparation. I can explain concepts, review your quiz mistakes, or build a study plan. What would you like to work on?",
  },
  {
    id: 2,
    role: "user" as const,
    content: "Can you explain the difference between precis and summary writing?",
  },
  {
    id: 3,
    role: "assistant" as const,
    content:
      "Good question. A precis is a structured condensation that keeps the original tone, sequence of ideas, and roughly 1/3 the word count of the source — it's a formal exercise with strict rules. A summary is more flexible: you can reorder ideas and focus only on the main takeaways, without a fixed word-count rule. In the CSS exam, precis writing is graded specifically on adherence to structure, so practice condensing without adding your own opinion.",
  },
];

export const mentorQuickActions = [
  { label: "Generate study plan", icon: "calendar_month" },
  { label: "Explain a topic", icon: "lightbulb" },
  { label: "Review my last quiz", icon: "fact_check" },
];

export const progressStats = {
  studyHoursTotal: 142,
  studyHoursTrend: "+8 hrs this week",
  quizAccuracyTrend: [
    { week: "W1", accuracy: 52 },
    { week: "W2", accuracy: 58 },
    { week: "W3", accuracy: 55 },
    { week: "W4", accuracy: 64 },
    { week: "W5", accuracy: 61 },
    { week: "W6", accuracy: 68 },
  ],
  subjectsCompleted: 3,
  subjectsTotal: 8,
  topicsCompletedPct: 47,
  weeklyBars: weeklyProgress,
  readinessHistory: [
    { week: "W1", score: 40 },
    { week: "W2", score: 46 },
    { week: "W3", score: 51 },
    { week: "W4", score: 58 },
    { week: "W5", score: 63 },
    { week: "W6", score: 68 },
  ],
};

export const streakCalendar = Array.from({ length: 84 }, (_, i) => ({
  day: i,
  active: Math.random() > 0.35,
}));

export const plannerTasks = {
  daily: [
    { id: 1, label: "Pakistan Affairs — Chapter 4 reading", time: "45 min", subject: "Pakistan Affairs", done: true },
    { id: 2, label: "Topic Quiz: International Affairs", time: "20 min", subject: "Current Affairs", done: false },
    { id: 3, label: "Precis writing practice (2 passages)", time: "40 min", subject: "English Precis", done: false },
  ],
  weekly: [
    { id: 1, label: "Complete Islamic Studies syllabus — Unit 2", time: "3 hrs", subject: "Islamic Studies", done: false },
    { id: 2, label: "Attempt Weekly Mock Quiz", time: "1.5 hrs", subject: "Mixed", done: false },
    { id: 3, label: "Review flagged questions from last week", time: "1 hr", subject: "Mixed", done: true },
  ],
  monthly: [
    { id: 1, label: "Finish Pakistan Affairs full syllabus", time: "20 hrs", subject: "Pakistan Affairs", done: false },
    { id: 2, label: "Attempt 1 full-length Mock Exam", time: "3 hrs", subject: "Mixed", done: false },
  ],
};

export const bookmarks = [
  { id: 1, type: "Notes", title: "Precis Writing — Core Techniques", subject: "English Precis", date: "Jul 10" },
  { id: 2, type: "Books", title: "Pakistan Affairs — Ikram Rabbani", subject: "Pakistan Affairs", date: "Jul 8" },
  { id: 3, type: "Questions", title: "\"Discuss the ideology of Pakistan...\"", subject: "Pakistan Affairs", date: "Jul 6" },
  { id: 4, type: "AI Responses", title: "Explanation: Precis vs Summary", subject: "English Precis", date: "Jul 5" },
  { id: 5, type: "Topics", title: "Rotational Motion", subject: "General Science", date: "Jul 2" },
];

const genericTopics = [
  "Introduction & Basic Concepts",
  "Historical Background",
  "Core Theories & Frameworks",
  "Contemporary Developments",
  "Case Studies & Applications",
  "Critical Analysis & Debates",
];

const genericNotes = [
  { title: "Quick Revision Notes — Unit 1", preview: "Condensed summary covering the most-tested concepts..." },
  { title: "Important Definitions & Terms", preview: "A glossary of key terms examiners frequently quote..." },
  { title: "Comparative Analysis Notes", preview: "Side-by-side comparison of competing viewpoints..." },
];

const genericBooks = {
  beginner: [{ title: "Foundations — An Introduction", author: "M. Aslam" }],
  intermediate: [{ title: "Comprehensive Guide", author: "Ikram Rabbani" }],
  advanced: [{ title: "Advanced Critical Perspectives", author: "S. Hussain" }],
};

const genericPastPapers = [
  { year: 2025, hasView: true, hasSolved: true },
  { year: 2024, hasView: true, hasSolved: true },
  { year: 2023, hasView: true, hasSolved: false },
  { year: 2022, hasView: true, hasSolved: true },
];

const genericQuizzes = [
  { title: "Topic-wise Quiz", questions: 15, minutes: 15 },
  { title: "Chapter Test", questions: 25, minutes: 25 },
  { title: "Full Subject Mock", questions: 50, minutes: 60 },
];

export function getSubjectDetail(slug: string) {
  const subject = subjects.find((s) => s.slug === slug);
  if (!subject) return null;

  return {
    ...subject,
    description: `A comprehensive breakdown of ${subject.name} for the CSS exam — covering syllabus topics, curated notes, recommended books, past papers with AI-flagged frequently repeated questions, and practice quizzes.`,
    stats: {
      totalMarks: subject.totalMarks,
      questions: subject.questions,
      split: subject.group === "Compulsory" ? "Compulsory" : "Optional",
      recommendedTime: "6–8 hrs/week",
    },
    syllabus: genericTopics.map((t, i) => ({ id: i + 1, title: t, done: i < 2 })),
    notes: genericNotes,
    books: genericBooks,
    pastPapers: genericPastPapers,
    frequentlyRepeated: [
      "Discuss the core themes most frequently tested in the last 5 years.",
      "Compare and contrast two major perspectives within this subject.",
    ],
    quizzes: genericQuizzes,
  };
}

export const quizFilters = ["Topic", "Subject", "Weekly", "Monthly", "Mock Exam"] as const;

export const quizList = [
  {
    id: "pak-affairs-ideology",
    title: "Pakistan Affairs — Ideology of Pakistan",
    subject: "Pakistan Affairs",
    type: "Topic",
    questions: 10,
    minutes: 12,
    difficulty: "Medium",
  },
  {
    id: "current-affairs-intl",
    title: "Current Affairs — International",
    subject: "Current Affairs",
    type: "Topic",
    questions: 10,
    minutes: 10,
    difficulty: "Easy",
  },
  {
    id: "english-precis-basics",
    title: "English Precis — Core Techniques",
    subject: "English Precis & Composition",
    type: "Subject",
    questions: 15,
    minutes: 20,
    difficulty: "Medium",
  },
  {
    id: "weekly-mixed-w6",
    title: "Weekly Mixed Quiz — Week 6",
    subject: "Mixed",
    type: "Weekly",
    questions: 25,
    minutes: 30,
    difficulty: "Medium",
  },
  {
    id: "monthly-review-jun",
    title: "Monthly Review — June",
    subject: "Mixed",
    type: "Monthly",
    questions: 40,
    minutes: 45,
    difficulty: "Hard",
  },
  {
    id: "mock-exam-1",
    title: "Full-Length Mock Exam #1",
    subject: "All Subjects",
    type: "Mock Exam",
    questions: 60,
    minutes: 90,
    difficulty: "Hard",
  },
];

export const quizQuestions = [
  {
    id: 1,
    question: "Who is credited with proposing the Two-Nation Theory in its modern political form?",
    options: ["Allama Iqbal", "Quaid-e-Azam", "Sir Syed Ahmed Khan", "Liaquat Ali Khan"],
    correctIndex: 0,
  },
  {
    id: 2,
    question: "The 1973 Constitution of Pakistan established which form of government?",
    options: ["Presidential", "Federal Parliamentary", "Unitary", "Confederal"],
    correctIndex: 1,
  },
  {
    id: 3,
    question: "Which amendment to the Constitution is most associated with provincial autonomy?",
    options: ["8th Amendment", "13th Amendment", "18th Amendment", "21st Amendment"],
    correctIndex: 2,
  },
  {
    id: 4,
    question: "CPEC is primarily a bilateral economic corridor between Pakistan and which country?",
    options: ["Iran", "China", "Turkey", "Saudi Arabia"],
    correctIndex: 1,
  },
  {
    id: 5,
    question: "The Objectives Resolution was passed in which year?",
    options: ["1949", "1956", "1962", "1973"],
    correctIndex: 0,
  },
];