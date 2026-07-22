// scripts/upload-content.ts
//
// Since files are served directly via Firebase Hosting (not Cloud Storage),
// this script only needs to create Firestore records pointing at the
// public Hosting URL for each file — it doesn't upload anything itself.
//
// IMPORTANT: run `firebase deploy --only hosting` from D:\css-content
// BEFORE and AFTER running this script, so the files are actually live
// at the URLs being recorded.

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// ─────────────────────────────────────────────────────────────
const CONTENT_ROOT = "D:/css-content";
const HOSTING_BASE_URL = "https://css-aspirants-d4067.web.app";
// ─────────────────────────────────────────────────────────────

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

function guessLevel(filename: string): "beginner" | "intermediate" | "advanced" {
  const lower = filename.toLowerCase();
  if (lower.includes("beginner") || lower.includes("intro")) return "beginner";
  if (lower.includes("advanced")) return "advanced";
  return "intermediate";
}

function parseTitleAndAuthor(filename: string) {
  const nameOnly = filename.replace(/\.pdf$/i, "");
  const parts = nameOnly.split(" - ");
  if (parts.length >= 2) {
    return { title: parts[0].trim(), author: parts.slice(1).join(" - ").trim() };
  }
  return { title: nameOnly.trim(), author: "Unknown" };
}

function buildUrl(subjectSlug: string, type: string, filename: string): string {
  const encoded = encodeURIComponent(filename);
  return `${HOSTING_BASE_URL}/${subjectSlug}/${type}/${encoded}`;
}

async function processBooks(subjectSlug: string, folderPath: string) {
  if (!fs.existsSync(folderPath)) return;
  const files = fs.readdirSync(folderPath).filter((f) => f.toLowerCase().endsWith(".pdf"));

  for (const filename of files) {
    const fileUrl = buildUrl(subjectSlug, "books", filename);
    const { title, author } = parseTitleAndAuthor(filename);
    const level = guessLevel(filename);

    await db.collection("books").add({
      subjectId: subjectSlug,
      title,
      author,
      level,
      fileUrl,
      uploadedAt: new Date(),
    });
    console.log(`  ✓ Book: "${title}" by ${author} (${level})`);
  }
}

async function processNotes(subjectSlug: string, folderPath: string) {
  if (!fs.existsSync(folderPath)) return;
  const files = fs.readdirSync(folderPath).filter((f) => f.toLowerCase().endsWith(".pdf"));

  for (const filename of files) {
    const fileUrl = buildUrl(subjectSlug, "notes", filename);
    const title = filename.replace(/\.pdf$/i, "");

    await db.collection("notes").add({
      subjectId: subjectSlug,
      title,
      fileUrl,
      uploadedAt: new Date(),
    });
    console.log(`  ✓ Note: "${title}"`);
  }
}

async function processPastPapers(subjectSlug: string, folderPath: string) {
  if (!fs.existsSync(folderPath)) return;
  const files = fs.readdirSync(folderPath).filter((f) => f.toLowerCase().endsWith(".pdf"));

  for (const filename of files) {
    const fileUrl = buildUrl(subjectSlug, "past-papers", filename);
    const isSolved = filename.toLowerCase().includes("solved");
    const yearMatch = filename.match(/(\d{4})/);
    const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();

    await db.collection("pastPapers").add({
      subjectId: subjectSlug,
      year,
      isSolved,
      fileUrl,
      uploadedAt: new Date(),
    });
    console.log(`  ✓ Past paper: ${year}${isSolved ? " (solved)" : ""}`);
  }
}

async function main() {
  if (!fs.existsSync(CONTENT_ROOT)) {
    console.error(`Content folder not found: ${CONTENT_ROOT}`);
    process.exit(1);
  }

  const subjectFolders = fs
    .readdirSync(CONTENT_ROOT)
    .filter((f) => fs.statSync(path.join(CONTENT_ROOT, f)).isDirectory());

  console.log(`Found ${subjectFolders.length} subject folders. Indexing into Firestore...\n`);

  for (const subjectSlug of subjectFolders) {
    console.log(`Subject: ${subjectSlug}`);
    const subjectPath = path.join(CONTENT_ROOT, subjectSlug);

    await processBooks(subjectSlug, path.join(subjectPath, "books"));
    await processNotes(subjectSlug, path.join(subjectPath, "notes"));
    await processPastPapers(subjectSlug, path.join(subjectPath, "past-papers"));

    console.log("");
  }

  console.log("Done! Firestore now points at your Hosting URLs.");
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});