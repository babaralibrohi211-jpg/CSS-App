// scripts/upload-questions.ts
// Populates real, syllabus-grounded MCQs into the `questionBank` Firestore collection.
// Run: npx tsx scripts/upload-questions.ts

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

interface Q {
  subjectId: string;
  question: string;
  options: string[];
  correctIndex: number;
  difficulty: "Easy" | "Medium" | "Hard";
}

const questions: Q[] = [
  // Pakistan Affairs
  { subjectId: "pakistan-affairs", question: "The Objectives Resolution was passed by the Constituent Assembly in which year?", options: ["1947", "1949", "1956", "1962"], correctIndex: 1, difficulty: "Medium" },
  { subjectId: "pakistan-affairs", question: "Which constitution first declared Pakistan an \"Islamic Republic\"?", options: ["1956 Constitution", "1962 Constitution", "1973 Constitution", "1985 amendments"], correctIndex: 0, difficulty: "Medium" },
  { subjectId: "pakistan-affairs", question: "The 18th Amendment (2010) primarily enhanced which aspect of governance?", options: ["Presidential powers", "Provincial autonomy", "Judicial appointments only", "Military oversight"], correctIndex: 1, difficulty: "Medium" },
  { subjectId: "pakistan-affairs", question: "CPEC is a component of which larger Chinese initiative?", options: ["Belt and Road Initiative", "Shanghai Cooperation Organisation", "RCEP", "ASEAN"], correctIndex: 0, difficulty: "Easy" },
  { subjectId: "pakistan-affairs", question: "Which river system is central to the Indus Waters Treaty (1960) dispute between Pakistan and India?", options: ["Ganges", "Indus", "Brahmaputra", "Mekong"], correctIndex: 1, difficulty: "Medium" },
  { subjectId: "pakistan-affairs", question: "East Pakistan separated to become Bangladesh in which year?", options: ["1969", "1970", "1971", "1973"], correctIndex: 2, difficulty: "Easy" },

  // Current Affairs
  { subjectId: "current-affairs", question: "SAARC stands for South Asian Association for what?", options: ["Regional Cooperation", "Rural Cooperation", "Regional Commerce", "Regional Community"], correctIndex: 0, difficulty: "Easy" },
  { subjectId: "current-affairs", question: "The OIC (Organisation of Islamic Cooperation) headquarters is located in which city?", options: ["Riyadh", "Jeddah", "Cairo", "Istanbul"], correctIndex: 1, difficulty: "Medium" },
  { subjectId: "current-affairs", question: "The Bretton Woods institutions include the IMF and which other body?", options: ["WTO", "World Bank", "United Nations", "OECD"], correctIndex: 1, difficulty: "Easy" },
  { subjectId: "current-affairs", question: "The Kyoto Protocol primarily addressed which global issue?", options: ["Trade tariffs", "Greenhouse gas emissions", "Nuclear disarmament", "Refugee rights"], correctIndex: 1, difficulty: "Medium" },
  { subjectId: "current-affairs", question: "ECO (Economic Cooperation Organization) originally grew out of which earlier grouping?", options: ["RCD (Regional Cooperation for Development)", "SEATO", "CENTO", "NATO"], correctIndex: 0, difficulty: "Hard" },
  { subjectId: "current-affairs", question: "The G20 forum primarily focuses on coordinating which policy area among member states?", options: ["Cultural exchange", "International economic and financial policy", "Military alliances", "Sports diplomacy"], correctIndex: 1, difficulty: "Easy" },

  // English Essay
  { subjectId: "english-essay", question: "In the CSS English Essay paper, candidates typically choose their topic from:", options: ["Exactly 2 options", "A wider list of several given options", "No choice — one fixed topic", "A topic they submit in advance"], correctIndex: 1, difficulty: "Easy" },
  { subjectId: "english-essay", question: "A strong essay outline typically includes an introduction, body paragraphs, and which final component?", options: ["Bibliography", "Conclusion", "Abstract", "Appendix"], correctIndex: 1, difficulty: "Easy" },
  { subjectId: "english-essay", question: "Which of the following is considered a weak essay-writing practice?", options: ["Using clear topic sentences", "Providing relevant examples", "Excessive use of unrelated quotations", "Logical paragraph transitions"], correctIndex: 2, difficulty: "Medium" },
  { subjectId: "english-essay", question: "The primary purpose of a thesis statement in an essay is to:", options: ["List all sources used", "State the essay's central argument", "Summarize the conclusion", "Provide statistics"], correctIndex: 1, difficulty: "Easy" },
  { subjectId: "english-essay", question: "Coherence in essay writing primarily refers to:", options: ["Word count", "Logical flow of ideas", "Font formatting", "Grammar rules only"], correctIndex: 1, difficulty: "Medium" },
  { subjectId: "english-essay", question: "Applying a \"so what\" test while writing helps ensure:", options: ["Correct grammar", "The argument's significance is clear", "The word count is met", "Citations are formatted correctly"], correctIndex: 1, difficulty: "Medium" },

  // English Precis & Composition
  { subjectId: "english-precis", question: "A precis is typically what fraction of the original passage's length?", options: ["1/2", "1/3", "2/3", "Same length"], correctIndex: 1, difficulty: "Easy" },
  { subjectId: "english-precis", question: "Which of these is NOT a goal of precis writing?", options: ["Retaining original tone", "Adding personal opinion", "Condensing ideas", "Preserving sequence of ideas"], correctIndex: 1, difficulty: "Medium" },
  { subjectId: "english-precis", question: "Choose the correctly punctuated sentence:", options: ["\"Its a good day.\"", "\"It's a good day.\"", "\"Its' a good day.\"", "\"It, is a good day.\""], correctIndex: 1, difficulty: "Easy" },
  { subjectId: "english-precis", question: "Identify the correct preposition: \"He is good ___ mathematics.\"", options: ["at", "in", "on", "with"], correctIndex: 0, difficulty: "Easy" },
  { subjectId: "english-precis", question: "A synonym for \"ubiquitous\" is:", options: ["Rare", "Widespread", "Hidden", "Temporary"], correctIndex: 1, difficulty: "Medium" },
  { subjectId: "english-precis", question: "Which sentence uses correct subject-verb agreement?", options: ["\"The list of items were long.\"", "\"The list of items was long.\"", "\"The list of items being long.\"", "\"The list of items is being long.\""], correctIndex: 1, difficulty: "Medium" },

  // General Science & Ability
  { subjectId: "general-science", question: "The powerhouse of the cell is the:", options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"], correctIndex: 1, difficulty: "Easy" },
  { subjectId: "general-science", question: "The Montreal Protocol primarily aims to protect:", options: ["Ocean life", "The ozone layer", "Rainforests", "Freshwater sources"], correctIndex: 1, difficulty: "Medium" },
  { subjectId: "general-science", question: "Which gas is most associated with the greenhouse effect?", options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Helium"], correctIndex: 2, difficulty: "Easy" },
  { subjectId: "general-science", question: "The process by which plants make food using sunlight is called:", options: ["Respiration", "Photosynthesis", "Transpiration", "Fermentation"], correctIndex: 1, difficulty: "Easy" },
  { subjectId: "general-science", question: "In computing, \"RAM\" stands for:", options: ["Random Access Memory", "Read Access Memory", "Rapid Application Module", "Remote Access Machine"], correctIndex: 0, difficulty: "Easy" },
  { subjectId: "general-science", question: "A balanced diet should primarily include proteins, fats, and:", options: ["Only sugars", "Carbohydrates, vitamins and minerals", "Only vitamins", "Only water"], correctIndex: 1, difficulty: "Easy" },

  // Islamic Studies
  { subjectId: "islamic-studies", question: "The Objectives Resolution (1949) was influenced by which core Islamic governance concept?", options: ["Shura", "Riba", "Zakat only", "Qisas"], correctIndex: 0, difficulty: "Medium" },
  { subjectId: "islamic-studies", question: "The concept of \"Ijtihad\" in Islamic law refers to:", options: ["Blind following", "Independent reasoning to derive rulings", "Consensus of scholars only", "Historical narration"], correctIndex: 1, difficulty: "Medium" },
  { subjectId: "islamic-studies", question: "The Pious Caliphs (Khulafa-e-Rashideen) ruled in which order?", options: ["Umar, Abu Bakr, Usman, Ali", "Abu Bakr, Umar, Usman, Ali", "Ali, Abu Bakr, Umar, Usman", "Usman, Ali, Abu Bakr, Umar"], correctIndex: 1, difficulty: "Easy" },
  { subjectId: "islamic-studies", question: "\"Ijma\" in Islamic jurisprudence refers to:", options: ["Consensus of scholars", "A type of prayer", "Charity", "Fasting"], correctIndex: 0, difficulty: "Medium" },
  { subjectId: "islamic-studies", question: "The Farewell Sermon (Khutbah Hijjat-ul-Wida) emphasized which of the following?", options: ["Only ritual worship", "Human rights, equality, and justice", "Trade regulations only", "Military strategy only"], correctIndex: 1, difficulty: "Medium" },
  { subjectId: "islamic-studies", question: "Which source of Islamic law comes immediately after the Quran in authority?", options: ["Ijma", "Qiyas", "Sunnah", "Ijtihad"], correctIndex: 2, difficulty: "Medium" },

  // Political Science
  { subjectId: "political-science", question: "Which political theorist is most associated with the concept of \"separation of powers\"?", options: ["John Locke", "Montesquieu", "Machiavelli", "Hobbes"], correctIndex: 1, difficulty: "Medium" },
  { subjectId: "political-science", question: "Ibn Khaldun's concept of \"Asabiyyah\" refers to:", options: ["Social cohesion/group solidarity", "Divine right of kings", "Class struggle", "Social contract"], correctIndex: 0, difficulty: "Hard" },
  { subjectId: "political-science", question: "The 1973 Constitution of Pakistan established which system of government?", options: ["Presidential", "Federal Parliamentary", "Unitary", "Confederal"], correctIndex: 1, difficulty: "Medium" },
  { subjectId: "political-science", question: "Which theorist is known for the \"Social Contract\" alongside Rousseau and Locke?", options: ["Thomas Hobbes", "Karl Marx", "Antonio Gramsci", "Michel Foucault"], correctIndex: 0, difficulty: "Medium" },
  { subjectId: "political-science", question: "The 18th Amendment to Pakistan's Constitution is most associated with:", options: ["Presidential powers expansion", "Provincial autonomy", "Judicial term limits only", "Election reform only"], correctIndex: 1, difficulty: "Medium" },
  { subjectId: "political-science", question: "Which term describes a political system where power is concentrated in a single national government rather than shared with regions?", options: ["Federal", "Unitary", "Confederal", "Devolved"], correctIndex: 1, difficulty: "Medium" },

  // International Relations
  { subjectId: "international-relations", question: "The theory of Realism in IR emphasizes primarily:", options: ["International cooperation and institutions", "State power and national interest", "Class struggle", "Cultural identity"], correctIndex: 1, difficulty: "Medium" },
  { subjectId: "international-relations", question: "The Treaty of Westphalia (1648) is significant in IR because it:", options: ["Ended World War I", "Established the modern nation-state system", "Created the United Nations", "Founded NATO"], correctIndex: 1, difficulty: "Medium" },
  { subjectId: "international-relations", question: "\"Balance of power\" in IR refers to:", options: ["Economic equality among states", "A distribution of power preventing any single state from dominating", "Equal military budgets", "Cultural exchange programs"], correctIndex: 1, difficulty: "Medium" },
  { subjectId: "international-relations", question: "Constructivism in IR theory emphasizes the role of:", options: ["Military capability only", "Ideas, identity, and norms", "Trade balances only", "Geography only"], correctIndex: 1, difficulty: "Hard" },
  { subjectId: "international-relations", question: "The \"Security Dilemma\" in IR describes a situation where:", options: ["States cooperate fully", "One state's security measures make others feel less secure", "All states disarm simultaneously", "Trade replaces military concerns"], correctIndex: 1, difficulty: "Hard" },
  { subjectId: "international-relations", question: "Which organization emerged after WWII primarily to maintain international peace and security?", options: ["League of Nations", "United Nations", "NATO", "WTO"], correctIndex: 1, difficulty: "Easy" },

  // Public Administration
  { subjectId: "public-administration", question: "The \"Scalar Chain\" principle in classical administration theory refers to:", options: ["Salary scales", "The hierarchy of authority from top to bottom", "Budget allocation", "Recruitment tests"], correctIndex: 1, difficulty: "Medium" },
  { subjectId: "public-administration", question: "New Public Management (NPM) reforms primarily emphasize:", options: ["More bureaucracy", "Market-based, efficiency-driven governance", "Centralization only", "Reduced accountability"], correctIndex: 1, difficulty: "Medium" },
  { subjectId: "public-administration", question: "Which of the following best describes \"decentralization\" in public administration?", options: ["Concentrating power at the center", "Transferring authority to lower levels of government", "Eliminating local government", "Increasing federal control only"], correctIndex: 1, difficulty: "Easy" },
  { subjectId: "public-administration", question: "The main purpose of a government budget is to:", options: ["Only record past expenses", "Plan and control public revenue and expenditure", "Replace taxation", "Serve as a legal contract only"], correctIndex: 1, difficulty: "Medium" },
  { subjectId: "public-administration", question: "E-Governance primarily refers to:", options: ["Government use of information technology to deliver services", "Electronic voting only", "Online shopping regulation", "Private sector automation"], correctIndex: 0, difficulty: "Easy" },
  { subjectId: "public-administration", question: "Which principle emphasizes that public officials should be answerable for their actions?", options: ["Autonomy", "Accountability", "Anonymity", "Ambiguity"], correctIndex: 1, difficulty: "Easy" },

  // Sociology
  { subjectId: "sociology", question: "Which sociological perspective views society as composed of interconnected parts working together for stability?", options: ["Conflict theory", "Functionalism", "Symbolic Interactionism", "Feminism"], correctIndex: 1, difficulty: "Medium" },
  { subjectId: "sociology", question: "Karl Marx's approach to society primarily emphasizes:", options: ["Social harmony", "Class struggle and economic conflict", "Symbolic meaning", "Individual psychology"], correctIndex: 1, difficulty: "Medium" },
  { subjectId: "sociology", question: "\"Socialization\" refers to the process by which:", options: ["Individuals learn the norms and values of their society", "Societies industrialize", "Governments form", "Economies grow"], correctIndex: 0, difficulty: "Easy" },
  { subjectId: "sociology", question: "Which of these is considered a primary social institution?", options: ["Family", "Stock market only", "Sports club", "Political party only"], correctIndex: 0, difficulty: "Easy" },
  { subjectId: "sociology", question: "\"Social stratification\" refers to:", options: ["Equal distribution of resources", "Hierarchical ranking of individuals/groups in society", "Urban planning", "Population growth"], correctIndex: 1, difficulty: "Medium" },
  { subjectId: "sociology", question: "Max Weber's concept of \"bureaucracy\" is characterized primarily by:", options: ["Randomness", "Hierarchy, rules, and specialization", "Informal networks only", "Charisma only"], correctIndex: 1, difficulty: "Medium" },

  // Muslim Law & Jurisprudence
  { subjectId: "muslim-law-jurisprudence", question: "The primary sources of Islamic law, in order of authority, are the Quran and:", options: ["Ijma only", "Sunnah", "Qiyas only", "Local custom only"], correctIndex: 1, difficulty: "Easy" },
  { subjectId: "muslim-law-jurisprudence", question: "\"Qiyas\" in Islamic jurisprudence refers to:", options: ["Consensus", "Analogical reasoning", "Prophetic tradition", "Charity"], correctIndex: 1, difficulty: "Medium" },
  { subjectId: "muslim-law-jurisprudence", question: "The Muslim Family Laws Ordinance was enacted in which year?", options: ["1947", "1956", "1961", "1973"], correctIndex: 2, difficulty: "Medium" },
  { subjectId: "muslim-law-jurisprudence", question: "In Islamic inheritance law, shares are primarily determined by:", options: ["Age of heirs only", "Quranic-prescribed fixed shares", "Court discretion alone", "Equal division always"], correctIndex: 1, difficulty: "Medium" },
  { subjectId: "muslim-law-jurisprudence", question: "\"Hudood\" in Islamic criminal law refers to:", options: ["Discretionary punishments", "Fixed punishments prescribed in the Quran/Sunnah for specific crimes", "Civil contracts", "Inheritance shares"], correctIndex: 1, difficulty: "Medium" },
  { subjectId: "muslim-law-jurisprudence", question: "The Hanafi school of Islamic jurisprudence is most predominant in which region?", options: ["South Asia", "West Africa", "Southeast Asia exclusively", "Sub-Saharan Africa exclusively"], correctIndex: 0, difficulty: "Medium" },

  // Governance & Public Policy
  { subjectId: "governance-public-policy", question: "\"Good governance\" as defined by international bodies typically emphasizes accountability, transparency, and:", options: ["Centralization only", "Rule of law and participation", "Military strength", "Trade surplus"], correctIndex: 1, difficulty: "Medium" },
  { subjectId: "governance-public-policy", question: "The \"policy cycle\" in public policy studies typically includes agenda-setting, formulation, implementation, and:", options: ["Only funding", "Evaluation", "Only legislation", "Only publicity"], correctIndex: 1, difficulty: "Medium" },
  { subjectId: "governance-public-policy", question: "NAB (National Accountability Bureau) in Pakistan primarily deals with:", options: ["Tax collection", "Corruption and accountability", "Foreign policy", "Education policy"], correctIndex: 1, difficulty: "Easy" },
  { subjectId: "governance-public-policy", question: "\"Devolution\" of power typically refers to transferring authority to:", options: ["International bodies", "Local/provincial governments", "Private corporations", "The judiciary only"], correctIndex: 1, difficulty: "Medium" },
  { subjectId: "governance-public-policy", question: "Which concept refers to collaboration between government and private sector to deliver public services?", options: ["Nationalization", "Public-Private Partnership", "Privatization only", "Deregulation only"], correctIndex: 1, difficulty: "Medium" },
  { subjectId: "governance-public-policy", question: "Transparency in governance primarily requires:", options: ["Restricted information flow", "Open access to information about government decisions and actions", "Centralized secrecy", "Reduced public participation"], correctIndex: 1, difficulty: "Easy" },
];

async function main() {
  console.log(`Uploading ${questions.length} questions across 12 subjects...\n`);
  const bySubject: Record<string, number> = {};

  for (const q of questions) {
    await db.collection("questionBank").add({
      subjectId: q.subjectId,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      difficulty: q.difficulty,
      createdAt: new Date(),
    });
    bySubject[q.subjectId] = (bySubject[q.subjectId] || 0) + 1;
  }

  for (const [subject, count] of Object.entries(bySubject)) {
    console.log(`✓ ${subject} — ${count} questions`);
  }
  console.log("\nDone! Real question bank uploaded to Firestore.");
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});