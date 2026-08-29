/**
 * ADMIN-ONLY SCRIPT
 * Run: node scripts/generateEmbeddings.js
 * Zero-cost, offline embedding generation
 * Auto-starts Ollama if not running
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import ollama from "ollama";
import { exec } from "child_process";
import util from "util";

import StudentProfile from "../models/StudentProfile.js";
import InvestorProfile from "../models/InvestorProfile.js";

dotenv.config();
const execAsync = util.promisify(exec);

/* -------------------------------------------------
   🔧 UTILS
--------------------------------------------------*/

// sleep helper
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// check if Ollama is running
async function isOllamaRunning() {
  try {
    await ollama.list();
    return true;
  } catch {
    return false;
  }
}

// start Ollama if not running
async function startOllama() {
  const running = await isOllamaRunning();
  if (running) {
    console.log("ℹ️ Ollama already running");
    return;
  }

  console.log("🚀 Starting Ollama...");
  execAsync("ollama serve"); // non-blocking
  await sleep(4000); // wait for server to be ready
  console.log("✅ Ollama started");
}

/* -------------------------------------------------
   🔌 DB CONNECTION
--------------------------------------------------*/
await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connected to MongoDB");

/* -------------------------------------------------
   🧠 EMBEDDING FUNCTION
--------------------------------------------------*/
async function generateEmbedding(text) {
  const res = await ollama.embeddings({
    model: "nomic-embed-text",
    prompt: text
  });
  return res.embedding;
}

/* -------------------------------------------------
   📝 TEXT BUILDERS
--------------------------------------------------*/
function buildStudentText(s) {
  return `
Industry: ${s.industry}
Stage: ${s.stage}
Problem: ${s.problemStatement}
Solution: ${s.solution}
Description: ${s.description || ""}
Location: ${s.location}
`.trim();
}

function buildInvestorText(i) {
  return `
Investor Type: ${i.investorType}
Risk Level: ${i.riskLevel}
Preferred Industries: ${i.preferredIndustries.join(", ")}
Investment Interest: ${i.investmentInterest}
Description: ${i.description || ""}
Location: ${i.location}
`.trim();
}

/* -------------------------------------------------
   🔁 MAIN JOB
--------------------------------------------------*/
async function runEmbeddingJob() {
  // ---------- STUDENTS ----------
  const students = await StudentProfile.find({
    embeddingStatus: "pending"
  });

  console.log(`🟢 Students pending: ${students.length}`);

  for (const s of students) {
    const embedding = await generateEmbedding(buildStudentText(s));
    s.embedding = embedding;
    s.embeddingStatus = "completed";
    await s.save();

    console.log(`✅ Embedded Student: ${s.studentName || s.startupName}`);
  }

  // ---------- INVESTORS ----------
  const investors = await InvestorProfile.find({
    embeddingStatus: "pending"
  });

  console.log(`🟢 Investors pending: ${investors.length}`);

  for (const i of investors) {
    const embedding = await generateEmbedding(buildInvestorText(i));
    i.embedding = embedding;
    i.embeddingStatus = "completed";
    await i.save();

    console.log(`✅ Embedded Investor: ${i.investorName}`);
  }

  console.log("🎉 Embedding job completed");
}

/* -------------------------------------------------
   ▶️ RUN
--------------------------------------------------*/
try {
  await startOllama();        // auto-start Ollama
  await runEmbeddingJob();    // generate embeddings
} catch (err) {
  console.error("❌ Error:", err);
} finally {
  await mongoose.disconnect();
  process.exit(0);
}
