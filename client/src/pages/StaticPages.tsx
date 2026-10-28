import React from 'react';
import { Mail, Phone } from 'lucide-react';
import { Dhruv, type DhruvPose } from '../components/brand';
import { Character, type CharacterId } from '../components/Character';
import { Button } from '../components/ui';

/* ---------- Shared building blocks ---------- */

const Hero: React.FC<{ eyebrow: string; title: string; body: string; pose?: DhruvPose; who?: CharacterId[]; cta?: React.ReactNode }> = ({ eyebrow, title, body, pose, who, cta }) => (
  <section className="border-b border-line bg-mist">
    <div className="page flex flex-wrap items-center justify-between gap-10 py-16 sm:py-20">
      <div className="flex max-w-2xl flex-col gap-5">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="h-display text-4xl sm:text-[52px]">{title}</h1>
        <p className="text-lg leading-relaxed text-ink-2">{body}</p>
        {cta && <div className="mt-2 flex flex-wrap gap-3">{cta}</div>}
      </div>
      {who ? (
        <div className="flex gap-3">{who.map((w, i) => <Character key={w} who={w} mood={i === 0 ? 'wave' : 'happy'} size={110} />)}</div>
      ) : pose ? <Dhruv pose={pose} size={180} bob decorative /> : null}
    </div>
  </section>
);

const Cards: React.FC<{ items: Array<[string, string]> }> = ({ items }) => (
  <section className="page grid gap-5 py-16 md:grid-cols-2">
    {items.map(([title, body], i) => (
      <div key={title} className="card flex flex-col gap-3 p-7">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-royal-50 font-display text-xl font-extrabold text-royal-500">{i + 1}</span>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="leading-relaxed text-ink-2">{body}</p>
      </div>
    ))}
  </section>
);

const Legal: React.FC<{ title: string; updated: string; sections: Array<[string, string]> }> = ({ title, updated, sections }) => (
  <article className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16 sm:px-6">
    <h1 className="h-display text-4xl">{title}</h1>
    <p className="text-ink-3">{updated}</p>
    {sections.map(([h, p]) => (
      <section key={h} className="flex flex-col gap-2">
        <h2 className="text-xl font-bold">{h}</h2>
        <p className="leading-relaxed text-ink-2">{p}</p>
      </section>
    ))}
    <p className="text-ink-2">Questions? Email <a href="mailto:support@futurepath.ai" className="link">support@futurepath.ai</a>.</p>
  </article>
);

/* ---------- Pages ---------- */

export const HowItWorksPage: React.FC = () => (
  <>
    <Hero eyebrow="How it works" title="From “I don’t know” to a plan you can act on" body="Four steps, built with counsellors and families. Start free, without signing up." pose="backpack" cta={<Button to="/start" size="lg">Start free test</Button>} />
    <Cards items={[
      ['Take the discovery test', '40 questions across 16 areas: reasoning, interests, values and working style. About 25 minutes, saved on your device as you go.'],
      ['Read your report', 'Your strengths in plain words, the stream that fits, and career matches — each with the reasons, salary ranges and exams.'],
      ['Turn it into a plan', 'Pick a career and get tasks for the next 30 days, 90 days and year, from entrance exam prep to scholarships.'],
      ['Decide together', 'Share the report with parents on WhatsApp, ask Dhruv any time, and book a verified counsellor when you want a person.'],
    ]} />
  </>
);

export const ForParentsPage: React.FC = () => (
  <>
    <Hero eyebrow="For parents" title="Be part of the decision, with the facts in front of you" body="Link to your child’s account with their consent, read the same report, and plan the costs of higher education." who={['sunita', 'rajesh']} cta={<><Button to="/register?role=PARENT" size="lg">Create a parent account</Button><Button to="/pricing" size="lg" variant="secondary">See the Family plan</Button></>} />
    <Cards items={[
      ['A report you can understand', 'Strengths, recommended stream and career matches explained in plain language — no test jargon.'],
      ['Four-year cost planner', 'Tuition, hostel and books for government and private colleges, in ₹, with a monthly saving target.'],
      ['Scholarships that fit', 'Central and state schemes with eligibility and family income limits in one place.'],
      ['Expert help when you need it', 'Book a verified counsellor for a one-on-one family session by video.'],
    ]} />
    <section className="page pb-16">
      <div className="flex flex-col gap-4 rounded-4xl bg-night p-8 text-white sm:p-10">
        <h2 className="font-display text-2xl font-bold text-white">Five questions to ask your child tonight</h2>
        <ol className="flex list-decimal flex-col gap-2 pl-5 text-night-text">
          <li>Which subject do you lose track of time in?</li>
          <li>What kind of problems do you enjoy solving?</li>
          <li>Would you rather work with people, ideas or things?</li>
          <li>How do you feel about two years of entrance exam preparation?</li>
          <li>What would a good working day look like to you?</li>
        </ol>
      </div>
    </section>
  </>
);

export const ForSchoolsPage: React.FC = () => (
  <>
    <Hero eyebrow="For schools" title="Career guidance for every student, not just a few" body="Give Class 9–12 students the discovery test, reports and plans, with class-level insight for your counselling team." who={['harjeet', 'fatima']} cta={<><Button to="/pricing" size="lg">See the School Pilot</Button><Button to="/contact" size="lg" variant="secondary">Book a demo</Button></>} />
    <Cards items={[
      ['Import your class lists', 'Upload a CSV of students and send invitations in one go.'],
      ['See who still needs the test', 'Track completion by class and send reminders to your WhatsApp groups.'],
      ['Stream insight for planning', 'See stream interest across a batch to plan counselling sessions and parent-teacher meetings.'],
      ['Aligned with NEP 2020', 'Multi-disciplinary pathways and vocational options are part of every report.'],
    ]} />
  </>
);

export const ForCounselorsPage: React.FC = () => (
  <>
    <Hero eyebrow="For counsellors" title="Spend your sessions on decisions, not data gathering" body="Students arrive with a report, a plan and their questions. You bring the judgement." who={['ananya']} cta={<Button to="/contact" size="lg">Apply to join</Button>} />
    <Cards items={[
      ['Verified profiles', 'We check qualifications and certifications before you appear to families.'],
      ['Context before every call', 'See the student’s notes and booking details ahead of the session.'],
      ['Simple scheduling', 'Share weekly slots; students book and get a video link automatically.'],
      ['Fair, visible pricing', 'Set your hourly rate in ₹. Families see it before they book.'],
    ]} />
  </>
);

export const AboutPage: React.FC = () => (
  <>
    <Hero eyebrow="About us" title="Honest guidance, not a sales funnel" body="FuturePath AI was built on one belief: Indian students deserve clear, evidence-informed guidance instead of pressure, hype or black-box algorithms." pose="love" />
    <Cards items={[
      ['We explain every match', 'You always see which strengths led to a recommendation and what you’d need to work on.'],
      ['We cite our sources', 'Salary and exam data come from official bodies and industry studies, with the date we last checked.'],
      ['We protect student data', 'Built for the DPDP Act 2023. We never sell student data or profiles.'],
      ['We guide, we don’t decide', 'Recommendations are possibilities for families to discuss — never guarantees of admission or jobs.'],
    ]} />
  </>
);

export const ContactPage: React.FC = () => (
  <>
    <Hero eyebrow="Contact" title="We’re here to help" body="Students, parents and schools can reach our team by email or phone." pose="wave" />
    <section className="page grid gap-5 py-16 sm:grid-cols-2">
      <div className="card flex flex-col gap-2 p-7">
        <Mail className="h-6 w-6 text-royal-500" aria-hidden="true" />
        <h2 className="text-xl font-bold">Email</h2>
        <a href="mailto:support@futurepath.ai" className="link">support@futurepath.ai</a>
        <a href="mailto:admissions@futurepath.ai" className="link">admissions@futurepath.ai</a>
      </div>
      <div className="card flex flex-col gap-2 p-7">
        <Phone className="h-6 w-6 text-royal-500" aria-hidden="true" />
        <h2 className="text-xl font-bold">Schools desk</h2>
        <a href="tel:+912026000000" className="link">+91 20 2600 0000</a>
        <span className="text-ink-3">Mon–Sat, 9 am – 6 pm IST</span>
      </div>
    </section>
  </>
);

export const PrivacyPolicyPage: React.FC = () => (
  <Legal title="Privacy policy" updated="Last updated 15 January 2026 · Digital Personal Data Protection Act 2023" sections={[
    ['1. We collect only what guidance needs', 'Because many of our users are minors, we collect only data relevant to guidance: class, subjects and test answers. We do not collect government ID numbers or card details.'],
    ['2. We never sell student information', 'We do not sell, license or share student contacts with coaching institutes, loan brokers or advertisers.'],
    ['3. Consent and parent access', 'A parent can see a student’s report only after linking with the student’s consent. Students and parents can ask us to delete test attempts and profile data at any time.'],
  ]} />
);

export const TermsPage: React.FC = () => (
  <Legal title="Terms of service" updated="Effective 15 January 2026" sections={[
    ['1. Guidance, not guarantees', 'FuturePath offers career exploration and planning. Recommendations are not admission guarantees, clinical assessments or promised salaries. Official criteria are set by bodies such as NTA, CBSE and universities.'],
    ['2. Fair use and account security', 'Please give accurate information and keep your account to yourself and your family.'],
  ]} />
);

export const RefundPolicyPage: React.FC = () => (
  <Legal title="Refunds and cancellations" updated="Effective 15 January 2026" sections={[
    ['1. 7-day refund', 'If the Career Report (₹299) or Premium (₹999) doesn’t give you useful clarity, you can ask for a full refund within 7 days of purchase.'],
    ['2. How refunds are paid', 'Email support@futurepath.ai with your receipt number. Refunds go back to the original UPI, bank account or card within 5–7 business days through Razorpay.'],
    ['3. Cancelling a yearly plan', 'You can cancel from Plan and billing at any time. You move to the free plan and keep your report.'],
  ]} />
);
