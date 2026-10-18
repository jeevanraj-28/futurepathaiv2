export interface ChatContext {
  studentName?: string;
  currentClass?: string;
  stream?: string;
  favouriteSubjects?: string[];
  topCareers?: string[];
}

export class AIMentorService {
  /**
   * Process chat messages with student context and guardrails
   */
  public static async generateResponse(
    message: string,
    history: { role: string; content: string }[],
    context?: ChatContext
  ): Promise<{ reply: string; sources?: string[] }> {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;

    // Check if external LLM API is available and configured
    if (geminiKey && geminiKey !== 'your_gemini_key') {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{
                  text: `System Context: You are FuturePath AI Career Counselor for Indian secondary students (Class 10 and 12).
Student Context: ${JSON.stringify(context || {})}
Guardrails: Never guarantee cutoffs or 100% placement. Provide structured, empathetic, evidence-informed guidance. Suggest verifying with official bodies (NTA, CBSE, State Boards).
User Query: ${message}`
                }]
              }
            ]
          })
        });
        const data = await response.json();
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          return {
            reply: data.candidates[0].content.parts[0].text,
            sources: ['Official Board Curriculum Guidelines', 'National Education Policy 2020']
          };
        }
      } catch (err) {
        console.warn('Gemini API call failed, activating deterministic career intelligence fallback');
      }
    }

    // High-quality Deterministic AI Career Mentor Engine
    const lower = message.toLowerCase();
    const studentName = context?.studentName || 'Student';
    const currentClass = context?.currentClass === 'CLASS_10' ? 'Class 10' : 'Class 12';

    // 1. Class 10 Stream Selection Queries
    if (lower.includes('class 10') || lower.includes('stream') || lower.includes('pcm') || lower.includes('pcb') || lower.includes('commerce') || lower.includes('humanities') || lower.includes('arts')) {
      return {
        reply: `Hello ${studentName}! Choosing your stream after Class 10 is an exploratory milestone, not a life sentence.

Here is an objective breakdown of the primary streams in India:

1. **Science with Mathematics (PCM / Non-Medical)**:
   - **Core Subjects**: Physics, Chemistry, Mathematics, English, plus Computer Science/Informatics/Physical Ed.
   - **Ideal For**: Students who genuinely enjoy problem-solving, analytical proofs, coding, architecture, defense (NDA), and technological innovation.
   - **Key Pathways**: B.Tech/B.E., B.Arch, BCA/B.Sc Computer Science, Commercial Pilot, Indian Navy/Air Force.

2. **Science with Biology (PCB / Medical)**:
   - **Core Subjects**: Physics, Chemistry, Biology, English, plus Psychology/Biotechnology/Physical Ed.
   - **Ideal For**: Students passionate about living systems, research, diagnosis, healthcare, and patient care.
   - **Key Pathways**: MBBS, BDS, BAMS/BHMS, Pharmacy (B.Pharm), Nursing, Biotechnology, Agricultural Sciences.

3. **Science PCMB (PCM + Biology)**:
   - **Ideal For**: Flexible learners with strong study stamina who want to keep both engineering and bio-sciences options open.

4. **Commerce (With or Without Math)**:
   - **Core Subjects**: Accountancy, Business Studies, Economics, English, plus Applied Mathematics or IP.
   - **Ideal For**: Analytical minds interested in trade, corporate strategy, investments, startups, and economic policy.
   - **Key Pathways**: CA (Chartered Accountancy), CFA, CS, B.Com (Hons), BBA/BMS, Law (CLAT), Economics (Hons).

5. **Humanities & Social Sciences**:
   - **Core Subjects**: History, Political Science, Psychology, Sociology, Economics, English, Geography.
   - **Ideal For**: Inquisitive thinkers, strong writers, debaters, and students focused on governance, social systems, media, or design.
   - **Key Pathways**: Civil Services (UPSC), Corporate Law, Psychology, Journalism, Public Policy, Liberal Arts, UX Design.

💡 **Actionable Tip**: Take our free 40-question dimension assessment to see which cognitive traits align best with your natural strengths!`,
        sources: ['CBSE Curriculum Framework', 'National Curriculum Framework 2023', 'National Career Service (NCS)']
      };
    }

    // 2. Class 12 / Engineering / AI / CS
    if (lower.includes('computer science') || lower.includes('ai') || lower.includes('engineering') || lower.includes('b.tech') || lower.includes('software')) {
      return {
        reply: `For students targeting **Computer Science and AI Careers** in India:

- **Primary Academic Route**: Class 12 with Physics, Chemistry, and Mathematics (PCM).
- **Major Entrance Exams**:
  - **JEE Main & Advanced**: For IITs, NITs, IIITs, and CFTIs.
  - **State Level Tests**: MHT CET (Maharashtra), KCET/COMEDK (Karnataka), WBJEE (West Bengal).
  - **Institute Tests**: BITSAT (BITS Pilani), VITEEE, SRMJEEE, MET.
- **Alternative Pathways**: If you did not choose PCM, courses like **BCA (Bachelor of Computer Applications)** and **B.Sc Data Science/IT** are open at premier universities (such as Delhi University, Christ, St. Xavier's, and the IIT Madras Online BS in Data Science).
- **Core Industry Competencies**: Algorithmic problem solving (Python/C++), discrete mathematics, data structures, and foundational statistics.

⚠️ *Important Note*: Avoid relying solely on degree brand names. Practical open-source projects, hackathons, and certified portfolio work carry immense weight in modern tech hiring.`,
        sources: ['AICTE Approval Process Handbook', 'NASSCOM FutureSkills Report']
      };
    }

    // 3. Medical / NEET / Allied Health
    if (lower.includes('doctor') || lower.includes('neet') || lower.includes('mbbs') || lower.includes('medical') || lower.includes('biology')) {
      return {
        reply: `If you are aspiring for **Medical & Healthcare Pathways**:

- **Eligibility**: Class 12 with Physics, Chemistry, Biology/Biotechnology, and English with at least 50% aggregate in PCB (40% for reserved categories).
- **Primary Exam**: **NEET-UG** conducted by the National Testing Agency (NTA).
- **Beyond MBBS**: Remember that healthcare is vastly broader than clinical MBBS alone:
  - **BAMS/BHMS**: Ayurveda and Homeopathic medicine.
  - **BPT (Physiotherapy)** & **BOT (Occupational Therapy)**.
  - **B.Sc Nursing**: Crucial global demand with extensive overseas opportunities.
  - **Pharm.D & B.Pharm**: Clinical research, pharmacovigilance, drug discovery.
  - **Biomedical Engineering & Genetics**: Intersection of tech and life sciences.

💡 *Preparation Strategy*: Complete thorough NCERT line-by-line reading for Biology, with disciplined numerical practice in Physics and physical chemistry.`,
        sources: ['National Medical Commission (NMC)', 'NTA NEET Information Bulletin']
      };
    }

    // 4. Law, Design, Humanities, Management
    if (lower.includes('law') || lower.includes('clat') || lower.includes('design') || lower.includes('nift') || lower.includes('management') || lower.includes('ipmat')) {
      return {
        reply: `Exciting multidisciplinary options available for students from **ANY stream**:

1. **Law (5-Year Integrated B.A. LL.B / BBA LL.B)**:
   - **Key Exam**: **CLAT** (for 24 National Law Universities) and **AILET** (NLU Delhi).
   - **Focus**: Reading comprehension, critical reasoning, legal aptitude, and current affairs. Open to Science, Commerce, and Humanities students!

2. **Design & Creative Industries (B.Des)**:
   - **Key Exams**: **UCEED** (IIT Bombay/Delhi/Guwahati), **NID DAT**, **NIFT Entrance**.
   - **Focus**: Visual spatial reasoning, sketch ability, ergonomic thinking, user empathy.

3. **Integrated Management (IPMAT / JIPMAT)**:
   - **Institutions**: IIM Indore, IIM Rohtak, IIM Ranchi, IIM Jammu, IIM Bodh Gaya (5-Year IPM BBA+MBA).
   - **Focus**: Quantitative aptitude, verbal proficiency, and interview presence.`,
        sources: ['Consortium of NLUs', 'National Institute of Design (NID)', 'IIM IPM Portal']
      };
    }

    // 5. Default Comprehensive Guidance Response
    return {
      reply: `I am here to help you navigate your academic and career trajectory with clarity and verifiable data.

As a ${currentClass} student${context?.stream ? ` in the ${context.stream} stream` : ''}, here are 3 high-impact actions you can take right now:

1. **Review Assessment Insights**: Check your 16-dimension profile in the Assessment workspace to uncover which cognitive and practical skills you naturally excel at.
2. **Explore Realistic Pathways**: Use our Career Explorer to view eligibility prerequisites, typical entry-level salary ranges (verified from official industry reports), and 3-5 year progression routes.
3. **Draft Your 90-Day Milestone**: Check the Career Roadmap tab to track your entrance exam syllabus, targeted skill courses, and academic targets.

What specific stream, career, or college query would you like to explore together?`,
      sources: ['National Career Service Portal', 'Ministry of Education Government of India']
    };
  }
}
