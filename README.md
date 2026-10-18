# FUTUREPATH AI
## AI Career Guidance, Student Intelligence & Subscription SaaS Platform for India

FUTUREPATH AI is a full-stack, evidence-informed educational intelligence and subscription SaaS platform designed specifically for students in **Classes 10 and 12 in India**, parents, schools, and professional career counselors.

The platform transforms career and academic stream selection from stressful guesswork into a structured, transparent, multi-dimensional decision-making process.

---

## 1. Key Capabilities & Implemented Modules

### A. Academic Stream Intelligence (Class 10)
- **Stream Comparison Matrix**: Side-by-side evaluation of Science with Mathematics (PCM), Science with Biology (PCB), Science (PCMB), Commerce (with/without Math), Humanities & Social Sciences, and Vocational pathways.
- **Prerequisites vs. Suitability**: Explicitly distinguishes board eligibility from natural cognitive suitability.
- **Financial Projections**: Estimates 4-year higher education costs in INR across streams.

### B. Career & Degree Selection (Class 12)
- **50+ Curated Indian Careers**: Engineering, Computing & AI, Medicine, Allied Healthcare, Commerce & Chartered Accountancy, Corporate Law, Civil Services, Product Design, Aviation, and Defence.
- **Structured Career Dossiers**: Daily responsibilities, required subjects, recommended skills, relevant degrees, verified entry-to-experienced salary benchmarks in LPA, and official testing sources.

### C. 16-Dimension Cognitive & Aptitude Engine
- **40-Question Psychometric Bank**: Measures 16 distinct dimensions including Numerical Reasoning, Deductive Logic, Verbal Nuance, Spatial 3D Visualization, Scientific Inquiry, Creative Thinking, Communication, Practical Problem Solving, Leadership, Risk Tolerance, and Career Values.
- **Explainable Recommendation Engine**: Deterministic weighted scoring algorithm that maps profile traits + assessment results to career compatibility without requiring external LLM API calls.
- **Radar & Bar Chart Visualizations**: Interactive polar and readiness charts displaying student strengths and gaps.

### D. Personalized Career Roadmap Builder
- **Actionable Milestones**: Generates structured 30-Day, 90-Day, 1-Year, and 3-to-5 Year preparation milestones.
- **Interactive Checklists**: Real-time task completion tracking for entrance exam syllabus, reference books, and Olympiad prep.
- **Printable Dossier Export**: Formatted printable PDF summary report for parent-teacher forums.

### E. AI Career Mentor
- **Context-Aware Guidance**: Contextual chat assistance reflecting the student's class, stream, and top career matches.
- **Safety Guardrails & Citations**: Refuses to fabricate cutoffs, never guarantees placement, cites official regulatory bodies (CBSE, NTA, NMC, AICTE, Consortium of NLUs).
- **Deterministic Fallback Engine**: Guarantees intelligent, factual advice even when external LLM API keys are unconfigured.

### F. Higher Education Directories
- **College Finder**: Verified Indian institutions (IITs, AIIMS, NLSIU, IIMs, NID, BITS, etc.) with NIRF rank, fee ranges, and admission routes.
- **Entrance Examination Guide**: Dates, modes, eligibility, and official portals for JEE Main, JEE Advanced, NEET UG, CLAT, CUET, UCEED, NDA.
- **Scholarship Finder**: Central Sector Scheme (CSSS), DST INSPIRE, AICTE Pragati, and PMSS with eligibility and income ceilings.

### G. Multi-Stakeholder Portals & SaaS Architecture
- **Student Dashboard**: Readiness scores, bookmarking, quick actions, active roadmaps.
- **Parent Portal**: Consent-based student linking, diagnostic summary review, 4-year Higher Education Cost Estimator.
- **School SaaS Workspace**: Multi-tenant institutional dashboard, student rosters, batch-wise stream distribution analytics, CSV enrollment simulation.
- **Counselor Marketplace**: Directory of verified career counselors, hourly rates in INR, credentials, and 1-on-1 slot booking.
- **Platform Admin Console**: SaaS metrics (MRR, ARR, cash collected, conversion rates, AI inference cost estimates), user directory, dynamic plan pricing editor, and security audit logs.

### H. Indian Payment Gateway & Subscription Lifecycle
- **Razorpay India Integration**: Automated sandbox mock mode in local development with signature verification.
- **INR Pricing Tiers**:
  - **Free Explorer**: ₹0
  - **Career Discovery Dossier**: ₹299 (one-time purchase)
  - **Premium Student Annual**: ₹999/year
  - **Premium Plus & Family**: ₹2,499/year
  - **School Institutional Pilot**: ₹19,999/year
- **Server-Side Entitlements**: Backend protection ensuring premium reports and features are unlocked only upon verified payment.
- **Billing History**: Complete GST receipt records and invoice downloads.

---

## 2. Pre-Seeded Test Accounts & 1-Click Persona Switcher

The application includes 5 pre-configured demo accounts. In the UI, click the **"Demo Switcher"** button in the navigation bar to switch between any persona in 1 click:

| Role | Email | Password | Pre-Seeded State |
| :--- | :--- | :--- | :--- |
| **Student** | `student@futurepath.ai` | `Password@123` | Class 10 (CBSE Pune), Active Premium Student Plan, 16-D Assessment Completed, Active Roadmap |
| **Parent** | `parent@futurepath.ai` | `Password@123` | Linked to Aarav Sharma, Access to assessment dossier & cost planner |
| **School Admin** | `school@futurepath.ai` | `Password@123` | Delhi Public School (DPS Pune), Class 10-A & 12-Science batches |
| **Counselor** | `counselor@futurepath.ai` | `Password@123` | UCLA Certified Career Counselor, ₹1,500/hr, Rating 4.95, Verified |
| **Platform Admin** | `admin@futurepath.ai` | `Password@123` | Full access to MRR/ARR analytics, user management, and pricing controls |

---

## 3. Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router DOM, Lucide Icons, Recharts (Radar & Bar charts)
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM, SQLite (`dev.db` for instant turnkey local run; switchable to PostgreSQL via `DATABASE_URL`), JWT authentication, Bcrypt password hashing
- **Payments**: Razorpay sandbox gateway interface with HMAC-SHA256 signature verification and webhook processing
- **AI**: Gemini 1.5 Flash / OpenAI provider client + Deterministic career intelligence fallback

---

## 4. Quick Start & Execution Commands

### Prerequisites
- Node.js v18+ (tested on Node v24.15.0)
- npm v9+ (tested on npm 11.12.1)

### Development Server
To launch both backend API server (port 5000) and frontend client (port 5173) concurrently:
```bash
npm run dev
```
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:5000](http://localhost:5000)
- API Health Check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Running Database Migrations & Seeding
```bash
# Push Prisma schema to database
npm --prefix server run prisma:migrate

# Seed 50+ careers, 40 questions, colleges, scholarships, and demo accounts
npm run seed
```

### Running Automated Tests
```bash
npm test
```
*Executed 5 unit tests verifying recommendation matching, medical alignment, stream intelligence fallback, payment signature verification, and 16-dimension scoring.*

### Production Build
```bash
npm run build
```
*Compiles both the backend TypeScript server to `server/dist/` and the frontend bundle to `client/dist/`.*

---

## 5. Environment Variables

### Backend (`server/.env`)
```ini
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="futurepath_jwt_super_secret_dev_key_2026_secured"
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"

# Razorpay Sandbox (Auto-mocked in local dev)
RAZORPAY_KEY_ID="rzp_test_futurepath_mock_id"
RAZORPAY_KEY_SECRET="rzp_test_futurepath_mock_secret"

# Optional External AI API (Fallback engine active by default)
GEMINI_API_KEY=""
OPENAI_API_KEY=""
AI_PROVIDER="deterministic_fallback"
```

### Frontend (`client/.env`)
```ini
VITE_API_URL="http://localhost:5000/api"
```

---

## 6. What is Required Before Accepting Real Customer Payments

1. **Razorpay Merchant Onboarding**: Complete business KYC, GSTIN registration, and bank settlement account verification at [dashboard.razorpay.com](https://dashboard.razorpay.com).
2. **Production API Keys**: Replace `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `server/.env` with live keys (`rzp_live_...`).
3. **Webhook Endpoint Configuration**: In the Razorpay Merchant Dashboard, configure the webhook URL:
   `https://api.yourdomain.com/api/billing/webhook` with the `payment.captured` event and save the secret in `RAZORPAY_WEBHOOK_SECRET`.
4. **Managed PostgreSQL**: Switch `DATABASE_URL` from SQLite to managed PostgreSQL (e.g. Supabase, AWS RDS, or GCP Cloud SQL) and run `npx prisma db push`.
5. **SSL/TLS Encryption**: Ensure all production traffic is served over HTTPS with HSTS headers.

---

## 7. Child Privacy & Legal Compliance Note

- Built in adherence with the principles of the **Digital Personal Data Protection (DPDP) Act 2023**.
- Collects minimal data necessary for academic orientation.
- Zero identifiable student data reselling or commercial targeted ad profiling.
- Explicit parent consent mechanisms for linked student profiles.
- Ethical guidance disclaimer stating recommendations are exploratory possibilities, not admission or employment guarantees.
