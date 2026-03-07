# Precision Medicine Platform (Phase 1)

Web-based precision medicine console that integrates mock genomic data with EMR-style records to demonstrate AI-powered clinical decision support patterns.

## Tech Stack

- Next.js (Pages router) + React + TypeScript  
- NextAuth.js (credentials provider, mock clinician user)  
- Tailwind CSS for styling  

## Getting Started

1. **Install dependencies**

```bash
cd /Users/justin/health_ai
npm install
```

2. **Environment variables**

`.env.local` is already created with development-safe defaults:

- `NEXTAUTH_URL=http://localhost:3000`  
- `NEXTAUTH_SECRET=development-secret-change-me`

3. **Run the dev server**

```bash
npm run dev
```

Then open `http://localhost:3000/auth/signin`.

- Email: `clinician@example.com`  
- Password: `password123`

## Project Structure

- `pages/`
  - `index.tsx` – protected dashboard, main patient view
  - `auth/signin.tsx` – mock clinician sign-in
  - `api/`
    - `auth/[...nextauth].ts` – NextAuth configuration
    - `patients.ts` – REST endpoint serving mock patient data
    - `patients/[id]/recompute-risk.ts` – mock AI risk recomputation
    - `patient-records/index.ts` – full `PatientRecord[]` (notes, plans, follow-ups)
    - `patient-records/[id].ts` – single full record by `demographics.patientId`
    - `genomic/analyze-variant.ts` – AI variant interpretation (JSON)
    - `genomic/analyze-variant-stream.ts` – AI variant interpretation (SSE streaming)
    - `assistant/chat-stream.ts` – Virtual Colleague chat (SSE streaming, rate limited)
    - `assistant/feedback.ts` – Feedback (thumbs up/down) for responses
- `components/`
  - `layout/` – `Sidebar`, `Header`, `DashboardLayout`
  - `dashboard/` – `SynopticDashboard`, `HealthDimensionCard`, `DimensionDrillDown`
  - `patients/` – `PatientOverview`, `ClinicalDocumentationPanel`
  - `genomic/` – `GenomicDataViewer`, `VariantCard`, `VariantImpactBadge`, `AIAnalysisPanel`
  - `assistant/` – `VirtualColleagueChat`, `ChatMessageBubble`, `RecommendationCard`, `ConfidenceBadge`, `FeedbackButtons`
  - `ui/` – `Tooltip`
- `lib/`
  - `patientService.ts` – frontend data access layer
  - `usePatients.ts` – React hook with loading/error handling
  - `ai/riskScoring.ts` – mock AI risk scoring function
  - `ai/clinicalPrompts.ts` – Virtual Colleague prompt templates (drug, risk, treatment, literature)
  - `ai/rateLimit.ts` – in-memory rate limiter for API routes
- `types/`
  - `patient.ts` – core domain models (patient, EMR, genomics, risk)
  - `assistant.ts` – chat messages, recommendations (green/yellow/red), citations, feedback
  - `next-auth.d.ts` – type extensions for session/user (role)
- `data/mockPatients.ts` – mock EMR + genomics data

## Phase 1 Capabilities

- Mock clinician authentication and protected dashboard route  
- Patient summary view (demographics, EMR, genomic variants)  
- Risk score visualization with mock AI recompute action  
- **Clinical documentation panel**: clinical notes, treatment plans, follow-up recommendations  
- **Full-record API**: `GET /api/patient-records` and `GET /api/patient-records/[id]` for notes, plans, and follow-ups  
- **Genomic data viewer** (`/genomic`): interactive table and card views, search/filter by gene, significance, variant type; color-coded impact badges with tooltips; AI analysis modal with streaming responses  
- **AI variant analysis**: `POST /api/genomic/analyze-variant` (JSON) and `POST /api/genomic/analyze-variant-stream` (SSE) with prompt templates in `lib/ai/promptTemplates.ts`  
- **Virtual Colleague** (`/assistant`): AI chat for drug-gene interactions, risk assessment, treatment options, and literature; green/yellow/red recommendation cards with citations; confidence scores; streaming responses; rate limiting (30/min); feedback (thumbs up/down)
- Loading skeletons and error states around data fetching and AI calls  

## Next Steps (Future Phases)

- Integrate real free-tier LLMs for explanation and triage  
- Add per-role dashboards (oncology vs cardiology views)  
- Expand mock data to cover more patient cohorts and variants  

