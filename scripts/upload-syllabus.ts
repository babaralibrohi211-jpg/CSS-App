// scripts/upload-syllabus.ts
// Populates real FPSC syllabus content into the `subjects` Firestore collection.
// Compulsory subjects: sourced from official FPSC syllabus with frequency analysis.
// Optional subjects: sourced from FPSC's stable, well-documented syllabus structure.
// Run: npx tsx scripts/upload-syllabus.ts

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

interface SubjectSyllabus {
  slug: string;
  totalMarks: number;
  paperPattern: { part: string; marks: number }[];
  recommendedTime: string;
  topics: string[];
}

const subjectsData: SubjectSyllabus[] = [
  {
    slug: "pakistan-affairs",
    totalMarks: 100,
    paperPattern: [{ part: "Single paper, descriptive", marks: 100 }],
    recommendedTime: "6-8 hrs/week",
    topics: [
      "Ideology of Pakistan — definition, historical aspects, reform movements (Shaikh Ahmad Sarhindi, Shah Waliullah, Sayyid Ahmad Shaheed), Aligarh/Deoband/Nadwah, Iqbal & Jinnah's vision",
      "Land and People of Pakistan — geography, society, natural resources, agriculture, industry, education",
      "Pakistan and Changing Regional Apparatus",
      "Nuclear Program of Pakistan — safety, security, international concerns",
      "Regional Cooperation Organizations (SAARC, ECO, SCO) and Pakistan's role",
      "Civil-Military Relations in Pakistan",
      "Economic Challenges in Pakistan",
      "Non-Traditional Security Threats — role of non-state actors",
      "Pakistan's Role in the Region",
      "The Palestine Issue",
      "Changing Security Dynamics — challenges to national security",
      "Political Evolution Since 1971",
      "Pakistan and the US War on Terror",
      "Foreign Policy of Pakistan Post-9/11",
      "Evolution of the Democratic System in Pakistan",
      "Ethnic Issues and National Integration",
      "Hydro Politics — water issues, domestic and regional",
      "Pakistan's National Interest",
      "Challenges to Sovereignty",
      "Pakistan's Energy Problems and Their Effects",
      "Pakistan's Relations with Neighbors (excluding India)",
      "Pakistan and India Relations Since 1947",
      "The Kashmir Issue",
      "The War in Afghanistan Since 1979 and Its Impact on Pakistan",
      "Proxy Wars — role of external elements",
      "Economic Conditions — recent Economic Survey, budgets, sector performance",
      "Recent Constitutional and Legal Debates, Amendments, Legislation",
      "Prevailing Social Problems — poverty, education, health, sanitation",
    ],
  },
  {
    slug: "current-affairs",
    totalMarks: 100,
    paperPattern: [
      { part: "Pakistan's Domestic Affairs", marks: 20 },
      { part: "Pakistan's External Affairs", marks: 40 },
      { part: "Global Issues", marks: 40 },
    ],
    recommendedTime: "6-8 hrs/week",
    topics: [
      "Pakistan's Domestic Affairs — Political, Economic, Social",
      "Pakistan's Relations with Neighbors (India, China, Afghanistan, Russia)",
      "Pakistan's Relations with the Muslim World (Iran, Saudi Arabia, Indonesia, Turkey)",
      "Pakistan's Relations with the United States",
      "Pakistan's Relations with Regional/International Organizations (UN, SAARC, ECO, OIC, WTO, GCC)",
      "International Security",
      "International Political Economy",
      "Human Rights",
      "Environment — Global Warming, Kyoto Protocol, Copenhagen Accord",
      "Population — world trends and policies",
      "Terrorism and Counter-Terrorism",
      "Global Energy Politics",
      "Nuclear Proliferation and Nuclear Security",
      "Nuclear Politics in South Asia",
      "International Trade (Doha Round, Bali Package)",
      "Cooperation/Competition in Arabian Sea, Indian & Pacific Oceans",
      "Millennium Development Goals — current status",
      "Globalization",
      "Middle East Crisis",
      "Kashmir Issue",
      "Palestine Issue",
    ],
  },
  {
    slug: "english-essay",
    totalMarks: 100,
    paperPattern: [{ part: "One comprehensive essay from given topics", marks: 100 }],
    recommendedTime: "5-7 hrs/week",
    topics: [
      "Philosophy, Abstract & Moral Topics — highest-frequency theme historically",
      "International Relations & Global Issues",
      "Economy & Poverty Alleviation",
      "Science, Technology & AI",
      "Environment & Energy Crisis",
      "Democracy & Politics in Pakistan",
      "Education & Literacy",
      "Gender Equality & Women's Rights",
      "Governance & Rule of Law",
      "Literature, Art & Culture",
    ],
  },
  {
    slug: "english-precis",
    totalMarks: 100,
    paperPattern: [
      { part: "Precis Writing", marks: 20 },
      { part: "Reading Comprehension", marks: 20 },
      { part: "Grammar and Vocabulary", marks: 20 },
      { part: "Sentence Correction", marks: 10 },
      { part: "Grouping of Words", marks: 10 },
      { part: "Pairs of Words", marks: 10 },
      { part: "Translation (Urdu to English)", marks: 10 },
    ],
    recommendedTime: "6-8 hrs/week",
    topics: [
      "Precis Writing — compression + appropriate title (15+5 marks)",
      "Reading Comprehension — passage with 5 questions (4 marks each)",
      "Grammar and Vocabulary — Tense, Articles, Prepositions, Conjunctions, Punctuation, Phrasal Verbs, Synonyms/Antonyms",
      "Sentence Correction — structural/grammar/punctuation flaws",
      "Grouping of Words — pairing by similar/opposite meaning",
      "Pairs of Words — distinguishing commonly confused words",
      "Translation — Urdu sentences into English",
    ],
  },
  {
    slug: "general-science",
    totalMarks: 100,
    paperPattern: [
      { part: "Part I — General Science", marks: 60 },
      { part: "Part II — General Ability", marks: 40 },
    ],
    recommendedTime: "6-8 hrs/week",
    topics: [
      "Physical Sciences — Universe/Solar System, natural hazards, energy resources, atomic structure, modern materials",
      "Biological Sciences — cell structure, biomolecules, plant/animal kingdom, human physiology, common diseases",
      "Environmental Science — atmosphere/hydrosphere/lithosphere, pollution types, Montreal & Kyoto Protocols",
      "Food Science — balanced diet, food quality, food deterioration & preservation",
      "Information Technology — hardware/software fundamentals, networking, AI fundamentals, telecommunications",
      "Quantitative Ability/Reasoning — arithmetic, algebra, geometry, sampling",
      "Logical and Analytical Reasoning",
      "Mental Abilities — verbal, mechanical, numerical, social ability",
    ],
  },
  {
    slug: "islamic-studies",
    totalMarks: 100,
    paperPattern: [{ part: "Single paper, descriptive", marks: 100 }],
    recommendedTime: "5-7 hrs/week",
    topics: [
      "Introduction to Islam — concept of Islam, importance of Deen, Deen vs. Religion, distinctive aspects",
      "Study of Sirah as a Model — individual life, diplomacy, teacher of mankind, military strategist, prophet of peace",
      "Human Rights and Status of Women in Islam",
      "Islamic Civilization and Culture — meaning, elements, distinctive features",
      "Islam and the World — impact on West, status in modern world, challenges of the modern era, extremism",
      "Public Administration and Islamic Governance — Shura, governance of the Pious Caliphs, civil servant responsibilities, accountability",
      "Islamic Code of Life — social/political/economic/judicial/administrative systems, Ijma and Ijtihad",
    ],
  },
  {
    slug: "political-science",
    totalMarks: 200,
    paperPattern: [
      { part: "Paper I — Political Theory", marks: 100 },
      { part: "Paper II — Comparative & Applied Politics", marks: 100 },
    ],
    recommendedTime: "7-9 hrs/week",
    topics: [
      "Western Political Thought — Plato, Aristotle, Machiavelli, Hobbes, Locke, Rousseau, Kant, Mill, Hegel, Marx, Gramsci, Fukuyama, Foucault, and others",
      "Muslim Political Thought — Al-Farabi, Al-Mawardi, Ibn Khaldun, Shah Waliullah, Allama Iqbal, and others",
      "State System — nature and emergence of the modern nation-state, Islamic concept of state and Ummah",
      "Sovereignty and Democracy — core concepts and theoretical debates",
      "Comparative Political Systems — USA, UK, France, Germany",
      "Global and Regional Integration — globalization, EU, SAARC, ECO, IMF, WTO",
      "Pakistan's Constitutional Development — 1956, 1962, 1973 Constitutions, amendments including the 18th",
      "Pakistan's Politics — civil-military relations, judiciary, political parties, elections, political culture",
      "International Relations and Pakistan's Foreign Policy",
    ],
  },
  {
    slug: "international-relations",
    totalMarks: 200,
    paperPattern: [
      { part: "Paper I — Theoretical Foundations", marks: 100 },
      { part: "Paper II — Contemporary Issues & Pakistan's Foreign Policy", marks: 100 },
    ],
    recommendedTime: "7-9 hrs/week",
    topics: [
      "Definition and Scope of International Relations",
      "The Nation-State System and Evolution of International Society",
      "IR Theories — Realism, Liberalism, Neo-realism, Neo-liberalism, Constructivism, Critical Theory, Feminism",
      "International Political Security — power, balance of power, national interest, foreign policy determinants",
      "Strategic Approach to International Relations — war, deterrence, strategic culture",
      "International Political Economy",
      "Non-Traditional Security Challenges",
      "Great Power Competition — US-China rivalry, evolving global order",
      "Regional Conflicts — Pakistan-India relations, Kashmir, Middle East",
      "Pakistan's Foreign Policy — evolution, decision-making, key international relationships",
      "International Organizations — UN, WTO, and regional bodies",
    ],
  },
  {
    slug: "public-administration",
    totalMarks: 100,
    paperPattern: [{ part: "Single paper, descriptive", marks: 100 }],
    recommendedTime: "6-8 hrs/week",
    topics: [
      "Introduction to Public Administration — nature, scope, and evolution of the discipline",
      "Organization Theories — classical, neo-classical, and modern approaches",
      "Administrative Behavior — decision-making, leadership, motivation",
      "Comparative Public Administration",
      "Development Administration",
      "Personnel Administration — civil service systems, recruitment, training",
      "Financial Administration — budgeting processes and control",
      "Administrative Accountability and Control mechanisms",
      "Local Government systems",
      "Administrative Reforms in Pakistan",
      "New Public Management and e-Governance",
    ],
  },
  {
    slug: "sociology",
    totalMarks: 100,
    paperPattern: [{ part: "Single paper, descriptive", marks: 100 }],
    recommendedTime: "6-8 hrs/week",
    topics: [
      "Introduction to Sociology — nature, scope, relation to other social sciences",
      "Sociological Theories — Functionalism, Conflict Theory, Symbolic Interactionism",
      "Research Methods in Sociology",
      "Social Institutions — family, marriage, kinship, religion, education, economy, polity",
      "Social Stratification — class, caste, status",
      "Culture and Society",
      "Social Change",
      "Social Problems in Pakistan — poverty, crime, population",
      "Social Control",
      "Urbanization and Social Change",
      "Gender and Society",
    ],
  },
  {
    slug: "muslim-law-jurisprudence",
    totalMarks: 100,
    paperPattern: [{ part: "Single paper, descriptive", marks: 100 }],
    recommendedTime: "6-8 hrs/week",
    topics: [
      "Sources of Islamic Law — Quran, Sunnah, Ijma, Qiyas",
      "Schools of Islamic Jurisprudence — Hanafi, Maliki, Shafi'i, Hanbali, Shia",
      "Islamic Criminal Law — Hudood, Qisas, Tazir",
      "Islamic Family Law — marriage, divorce, dower, maintenance",
      "Islamic Law of Inheritance",
      "Islamic Law of Contract and Transactions",
      "Islamic Banking and Finance",
      "Muslim Family Laws Ordinance, 1961 and Dissolution of Muslim Marriages Act, 1939",
      "Islamic International Law (Siyar)",
      "Islamic Law and Human Rights",
      "Ijtihad and Its Scope in the Modern Context",
    ],
  },
  {
    slug: "governance-public-policy",
    totalMarks: 100,
    paperPattern: [{ part: "Single paper, descriptive", marks: 100 }],
    recommendedTime: "6-8 hrs/week",
    topics: [
      "Concepts of Governance — good governance, democratic governance",
      "Public Policy — nature, and the policy cycle (formulation, implementation, evaluation)",
      "Theories of Public Policy Making",
      "Governance Structures in Pakistan — federal, provincial, local",
      "Civil Service Reforms",
      "Decentralization and Local Government",
      "Accountability and Transparency Mechanisms — NAB, Ombudsman",
      "E-Governance",
      "Public-Private Partnerships",
      "Governance Challenges in Pakistan — corruption, weak institutions",
      "International Governance Indicators",
    ],
  },
];

async function main() {
  console.log(`Uploading real syllabus data for ${subjectsData.length} subjects...\n`);

  for (const subject of subjectsData) {
    await db.collection("subjects").doc(subject.slug).set(
      {
        totalMarks: subject.totalMarks,
        paperPattern: subject.paperPattern,
        recommendedTime: subject.recommendedTime,
        topics: subject.topics,
        syllabusSource: "FPSC official CSS syllabus (public exam framework)",
        updatedAt: new Date(),
      },
      { merge: true }
    );
    console.log(`✓ ${subject.slug} — ${subject.topics.length} topics, ${subject.paperPattern.length} paper parts`);
  }

  console.log("\nDone! Real syllabus data is now in Firestore for all 12 subjects.");
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});