# 📘 Grok Recruiter – Project Context (Cursor Reference)

This file provides **global context** for Cursor when generating code for the Grok Recruiter hackathon MVP.

All code, APIs, schemas, and UI should align with this document.

---

## 🧠 PRODUCT OVERVIEW

**Grok Recruiter** is an **AI-powered recruiting automation platform** that replaces most manual recruiter workflow with AI agents while preserving **human oversight, observability, and learning from feedback**.

### 🎯 Core Goal

Automate:

- Candidate sourcing

- Resume screening

- Scoring and routing

- Take-home evaluation

- Team matching (stretch)

While providing:

- Transparent AI reasoning

- Recruiter override controls

- A feedback-driven learning loop

This is a **real product MVP**, not a toy demo.

---

## 🔁 CURRENT VS NEW WORKFLOW

### Manual Workflow (Today)

1. Hiring Manager writes Job Description + Headcount

2. Recruiter manually sources candidates

3. Recruiter manually screens resumes

4. Recruiter scores candidates (0–10)

5. 3–4 → Take-home

6. 6–7 → Interview

7. Engineers interview

8. Recruiter manually team-matches

---

### Automated Workflow (Grok Recruiter)

1. Hiring Manager inputs JD + Headcount

2. AI auto-sources candidates from GitHub and X

3. AI generates structured candidate representations

4. AI scores candidates (0–10)

5. AI routes candidates:

   - Reject

   - Take-home

   - Interview

6. AI evaluates take-homes

7. Recruiters observe everything in a dashboard

8. Recruiters can override any decision

9. System learns from outcomes and improves routing

---

## 🧱 CORE TECH STACK (FIXED)

All code must follow this stack:

- **Frontend:** Next.js + TypeScript + Tailwind + shadcn/ui

- **Backend:** Next.js API routes

- **Database:** Postgres (Supabase or Neon)

- **Vectors:** pgvector

- **AI:** Grok API + OpenAI embeddings

- **Background Jobs:** Inngest or Trigger.dev

- **Deployment:** Vercel

---

## 🧩 CORE CONCEPTS

### 1. Jobs

A job contains:

- Title

- Description

- Headcount

- Structured requirements (parsed by Grok)

- Embedding

---

### 2. Candidates

A candidate is a **person**, not a resume.

They may have:

- GitHub

- X

- LinkedIn (optional for MVP)

- Portfolio sites

Each candidate has a **canonical AI-readable profile** that unifies all signals.

---

### 3. Candidate Profiles (LLM-Friendly Memory)

Each candidate has:

- Raw scraped data

- Grok-generated summary

- Skills JSON

- Experience JSON

- Derived signals

- Vector embedding

This is the **MemOS-style memory layer**.

---

### 4. Job ↔ Candidate State Machine

Each job-candidate pair moves through:

- `sourced`

- `screened`

- `takehome_assigned`

- `takehome_reviewed`

- `interview`

- `offer`

- `rejected`

---

### 5. AI Scoring & Routing

For each job-candidate pair, AI produces:

- `ai_score` (0–10)

- `ai_recommendation`:

  - reject

  - takehome

  - interview

  - fasttrack

- `reasoning`

Routing is controlled by **policy thresholds**, not hard-coded logic.

---

### 6. Human Overrides

Recruiters can:

- Override any AI decision

- Provide a reason

- All overrides are logged as learning signals

Humans always have final control.

---

### 7. Learning From Deployment

Every major action generates an **event**:

- AI screening

- Human override

- Take-home evaluation

- Interview pass/fail

- Offer accepted/rejected

Each event logs:

- Context

- Action

- Reward

Policy updates:

- Adjust routing thresholds

- Improve future decisions

- Must be visible in the dashboard

---

## 📊 DASHBOARD REQUIREMENTS

The dashboard must allow recruiters to:

- View all active jobs

- View full candidate pipelines per job

- Inspect a candidate’s:

  - AI summary

  - GitHub activity

  - AI score + recommendation

  - AI reasoning

- Override AI decisions

- View event logs

- See policy updates over time

---

## ✅ MVP SCOPE (STRICT)

Only the following is required for MVP:

- ✅ Job creation

- ✅ GitHub sourcing

- ✅ Grok candidate summarization

- ✅ AI screening + routing

- ✅ Recruiter dashboard

- ✅ Human override

- ✅ Event logging

- ✅ Simple learning loop (threshold updates only)

Stretch goals:

- X sourcing

- Take-home grading

- Team matching

---

## 🛑 HARD CONSTRAINTS

- No fake databases

- No fake AI decisions

- No hard-coded candidate scores

- No black-box logic

- Every AI decision must:

  - Have reasoning

  - Be logged

  - Be overrideable

---

## ✅ CURSOR EXPECTATIONS

When generating any component, Cursor must:

1. Output a **file tree**

2. Explain the **purpose of each file**

3. Provide **fully working code**

4. Use **real SQL**

5. Use **real API routes**

6. Include:

   - Example request payloads

   - Example responses

7. Clearly explain:

   - How the component connects to the full system

---

## 🚀 DEMO SUCCESS CRITERIA

By demo time, we must be able to:

1. Create a job

2. Click “Auto Source”

3. Watch GitHub candidates appear

4. Click “Run Screening”

5. See:

   - AI scores

   - AI decisions

   - AI reasoning

6. Override one decision

7. Show:

   - Event log

   - Policy update

8. Re-run screening with improved behavior

---

This file is the **single source of truth** for the Grok Recruiter hackathon MVP.

All code generated in Cursor must align with this context.

