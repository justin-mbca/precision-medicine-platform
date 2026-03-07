# Precision Medicine Platform — User Manual

This guide explains how to use the Precision Medicine Platform, a web-based clinical decision support tool that integrates genomic data with electronic medical records.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Signing In](#2-signing-in)
3. [Navigation](#3-navigation)
4. [Dashboard (Patients)](#4-dashboard-patients)
5. [Genomic Insights](#5-genomic-insights)
6. [Virtual Colleague](#6-virtual-colleague)
7. [Printing](#7-printing)
8. [Tips & Troubleshooting](#8-tips--troubleshooting)

---

## 1. Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- The application running locally or on a server

### Starting the Application

1. Open a terminal and go to the project folder:
   ```bash
   cd /Users/justin/health_ai
   ```
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and go to: **http://localhost:3000**

---

## 2. Signing In

Before using the platform, you must sign in with a clinician account.

1. Go to **http://localhost:3000** — you will be redirected to the sign-in page.
2. Enter the demo credentials:
   - **Email:** `clinician@example.com`
   - **Password:** `password123`
3. Click **Sign in**.
4. After signing in, you will be taken to the main dashboard.

> **Note:** This is a demo environment. The credentials above are for development and testing only.

---

## 3. Navigation

The left sidebar provides access to the main sections:

| Link | Description |
|------|-------------|
| **Patients** | Main dashboard with synoptic and detailed patient views |
| **Genomic insights** | Browse and analyze genetic variants |
| **Virtual Colleague** | AI assistant for clinical questions |

The header at the top shows:
- The current page or section
- Your name and email
- Your role (e.g., oncologist)
- A **Sign out** button

---

## 4. Dashboard (Patients)

The **Patients** page is the main clinical dashboard. It has two views: **Synoptic** and **Detailed**.

### Synoptic View (Default)

The synoptic view shows a high-level overview of a patient across 14 health dimensions.

#### Selecting a Patient

1. Use the **Search** box to find patients by name or ID.
2. Use the **Selected patient** dropdown to choose a patient.
3. Use the **Date range** dropdown to filter data (Last 7 days, 30 days, 90 days, or All time).

#### Health Dimension Cards

Each card represents one health dimension:

- **Cardiovascular Health** — Heart, blood pressure, lipids
- **Metabolic Function** — Glucose, HbA1c, metabolic markers
- **Cancer Risk** — Hereditary cancer, tumor markers
- **Neurological Health** — Cognitive risk, Alzheimer disease
- **Immune Function** — WBC, immune markers
- **Renal Function** — Kidney function, eGFR
- **Hepatic Function** — Liver enzymes
- **Respiratory Health** — Lung function
- **Hematologic Function** — Blood counts
- **Endocrine Function** — Thyroid, diabetes
- **Gastrointestinal Health** — GI conditions
- **Musculoskeletal Health** — Bones, joints
- **Dermatologic Health** — Skin conditions
- **Mental Health** — Depression, anxiety, psychosocial

#### Status Colors

- **Green** — Normal or low risk
- **Yellow** — Monitor or moderate risk
- **Red** — Action needed or high risk

#### Drill-Down

1. Click the arrow (→) on a dimension card.
2. A modal opens with:
   - Summary and score
   - Contributing factors (bar chart)
   - Genomic findings
   - Clinical conditions
   - AI-generated insight (when available)
3. Click outside the modal or use the close control to return.

### Detailed View

1. Click the **Detailed** tab at the top.
2. The detailed view shows:
   - Patient summary and demographics
   - **Recompute risk (mock AI)** button
   - Genomic risk snapshot (bar charts)
   - Pathogenic variants
   - Medical history and recent labs
   - Clinical documentation (notes, treatment plans, follow-up recommendations)

---

## 5. Genomic Insights

The **Genomic insights** page lets you browse and analyze genetic variants across patients.

### View Modes

- **Table** — Compact list of variants
- **Cards** — Card layout for each variant

### Search and Filters

- **Search** — Filter by gene name, variant, or condition.
- **Significance** — Filter by pathogenic, likely pathogenic, VUS, benign, etc.
- **Variant type** — Filter by SNP, indel, CNV, etc.

### Variant Information

Each variant shows:

- Gene symbol and location
- Variant type (SNP, indel, etc.)
- Clinical significance (with color coding)
- Associated diseases
- Literature references

### AI Analysis

1. Click **AI analyze** on a variant card or table row.
2. A modal opens with an AI interpretation.
3. The interpretation streams in real time.
4. Close the modal when finished.

---

## 6. Virtual Colleague

The **Virtual Colleague** is an AI assistant for clinical questions.

### Selecting Patient Context

1. Use the **Patient context** dropdown to choose a patient (or "None").
2. The assistant uses this patient’s data when answering.

### Asking Questions

You can ask about:

- **Drug–gene interactions** — e.g., “What drug-gene interactions should I consider?”
- **Risk assessment** — e.g., “Summarize cancer risk for this patient.”
- **Treatment options** — e.g., “What treatment options are recommended?”
- **Literature** — e.g., “What does the literature say about BRCA1 variants?”

### Understanding Responses

Responses may include:

- **Reasoning** — How the answer was derived
- **Main answer** — Direct response to your question
- **Recommendation cards** — Color-coded (green/yellow/red) with citations
- **Confidence score** — How confident the model is in the answer

### Feedback

- Use **thumbs up** or **thumbs down** on assistant messages to provide feedback.
- This helps improve future responses (in a production system).

### Rate Limiting

- The assistant is limited to about 30 requests per minute per user.
- If you hit the limit, wait a minute before sending more messages.

---

## 7. Printing

The dashboard is set up for printing clinical summaries.

1. Open the **Synoptic** view and select a patient.
2. Use your browser’s **Print** command (e.g., Ctrl+P or Cmd+P).
3. The printed page will:
   - Hide the sidebar, header, and most buttons
   - Show the patient summary and health dimension cards
   - Use a clean, white background

---

## 8. Tips & Troubleshooting

### The app won’t load

- Confirm the dev server is running (`npm run dev`).
- Check that you are using **http://localhost:3000** (not https).

### I can’t sign in

- Use exactly: `clinician@example.com` and `password123`.
- Check that `.env.local` exists with `NEXTAUTH_URL` and `NEXTAUTH_SECRET`.

### No patient data appears

- The app uses mock data. If the API fails, check the browser console and network tab.
- Ensure you are signed in; some data is only available when authenticated.

### Virtual Colleague doesn’t respond

- You may have hit the rate limit. Wait about a minute and try again.
- Ensure a patient is selected if your question is patient-specific.

### Build or install errors

- Run `npm install --legacy-peer-deps` if you see peer dependency conflicts.
- See the main README for setup details.

---

## Demo Data Disclaimer

This platform uses **synthetic mock data** for development and demonstration. It is not intended for clinical use. Do not use it with real patient information.

---

*Precision Medicine Platform — User Manual v1.0*
