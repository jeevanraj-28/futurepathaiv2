import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

/**
 * List & search careers with stream & category filters
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, stream, category, demand } = req.query;

    const whereClause: any = {};

    if (search && typeof search === 'string') {
      whereClause.OR = [
        { title: { contains: search } },
        { shortDescription: { contains: search } },
        { category: { contains: search } }
      ];
    }

    if (stream && typeof stream === 'string' && stream !== 'ALL') {
      whereClause.OR = [
        { stream },
        { stream: 'ANY' }
      ];
    }

    if (category && typeof category === 'string' && category !== 'ALL') {
      whereClause.category = category;
    }

    if (demand && typeof demand === 'string') {
      whereClause.futureDemand = demand;
    }

    const careers = await prisma.career.findMany({
      where: whereClause,
      orderBy: { title: 'asc' }
    });

    const parsedCareers = careers.map(c => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      category: c.category,
      stream: c.stream,
      shortDescription: c.shortDescription,
      salaryMinINR: c.salaryMinINR,
      salaryMaxINR: c.salaryMaxINR,
      futureDemand: c.futureDemand,
      automationExposure: c.automationExposure,
      requiredSubjects: JSON.parse(c.requiredSubjectsJson || '[]'),
      recommendedSkills: JSON.parse(c.recommendedSkillsJson || '[]'),
      entranceExams: JSON.parse(c.entranceExamsJson || '[]'),
      degrees: JSON.parse(c.degreesJson || '[]'),
      topColleges: JSON.parse(c.topCollegesJson || '[]'),
      sourceName: c.sourceName,
      lastVerifiedDate: c.lastVerifiedDate
    }));

    res.json({
      success: true,
      count: parsedCareers.length,
      careers: parsedCareers
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch careers', error: err.message });
  }
});

/**
 * Get detailed career profile by slug
 */
router.get('/:slug', async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const career = await prisma.career.findUnique({
      where: { slug }
    });

    if (!career) {
      res.status(404).json({ success: false, message: 'Career not found' });
      return;
    }

    res.json({
      success: true,
      career: {
        id: career.id,
        title: career.title,
        slug: career.slug,
        category: career.category,
        stream: career.stream,
        shortDescription: career.shortDescription,
        fullDescription: career.fullDescription,
        responsibilities: JSON.parse(career.responsibilitiesJson || '[]'),
        requiredSubjects: JSON.parse(career.requiredSubjectsJson || '[]'),
        entryQualifications: career.entryQualifications,
        recommendedSkills: JSON.parse(career.recommendedSkillsJson || '[]'),
        entranceExams: JSON.parse(career.entranceExamsJson || '[]'),
        degrees: JSON.parse(career.degreesJson || '[]'),
        topColleges: JSON.parse(career.topCollegesJson || '[]'),
        salaryMinINR: career.salaryMinINR,
        salaryMaxINR: career.salaryMaxINR,
        futureDemand: career.futureDemand,
        automationExposure: career.automationExposure,
        sourceName: career.sourceName,
        sourceUrl: career.sourceUrl,
        lastVerifiedDate: career.lastVerifiedDate
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch career details', error: err.message });
  }
});

/**
 * Compare 2 or 3 careers side by side
 */
router.post('/compare', async (req: Request, res: Response): Promise<void> => {
  try {
    const { slugs } = req.body; // array of strings
    if (!Array.isArray(slugs) || slugs.length < 2) {
      res.status(400).json({ success: false, message: 'Please provide at least 2 career slugs to compare' });
      return;
    }

    const careers = await prisma.career.findMany({
      where: { slug: { in: slugs } }
    });

    const parsed = careers.map(c => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      category: c.category,
      stream: c.stream,
      salaryMinINR: c.salaryMinINR,
      salaryMaxINR: c.salaryMaxINR,
      futureDemand: c.futureDemand,
      automationExposure: c.automationExposure,
      entryQualifications: c.entryQualifications,
      requiredSubjects: JSON.parse(c.requiredSubjectsJson || '[]'),
      recommendedSkills: JSON.parse(c.recommendedSkillsJson || '[]'),
      entranceExams: JSON.parse(c.entranceExamsJson || '[]'),
      degrees: JSON.parse(c.degreesJson || '[]'),
      topColleges: JSON.parse(c.topCollegesJson || '[]')
    }));

    res.json({ success: true, comparison: parsed });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to compare careers', error: err.message });
  }
});

/**
 * Class 10 Stream Selection Intelligence Guide
 */
router.get('/meta/stream-guide', (req: Request, res: Response): void => {
  const streams = [
    {
      id: 'PCM',
      name: 'Science with Mathematics (PCM)',
      badge: 'Analytical & Technical',
      coreSubjects: ['Physics', 'Chemistry', 'Mathematics', 'English'],
      optionalElectives: ['Computer Science', 'Informatics Practices', 'Physical Education', 'Economics'],
      suitedFor: 'Students who love quantitative proofs, analytical problem solving, logical coding, mechanical systems, or space exploration.',
      majorDegrees: ['B.Tech / B.E. (4 Years)', 'B.Arch (5 Years)', 'B.Sc / BS Computer Science (3-4 Years)', 'Commercial Pilot Training (CPL)', 'Merchant Navy (B.Sc Nautical Science)'],
      keyExams: ['JEE Main', 'JEE Advanced', 'BITSAT', 'State CETs (MHT-CET, KCET, WBJEE)', 'NATA', 'NDA'],
      careerFamilies: ['AI & Software Engineering', 'Aerospace & Robotics', 'Civil & Mechanical Infrastructure', 'Commercial Aviation', 'Defence & Strategic Tech'],
      pros: 'Widest flexibility to pivot into Commerce, Management, or Economics later; premier engineering institutions in India.',
      cons: 'Heavy weekly academic rigor; extensive conceptual physics and calculus practice required.',
      costRangeINR: '₹4 Lakhs – ₹18 Lakhs (depending on Govt vs Private college)'
    },
    {
      id: 'PCB',
      name: 'Science with Biology (PCB)',
      badge: 'Clinical & Life Sciences',
      coreSubjects: ['Physics', 'Chemistry', 'Biology / Biotechnology', 'English'],
      optionalElectives: ['Psychology', 'Physical Education', 'Home Science', 'Hindi'],
      suitedFor: 'Students with deep curiosity about living organisms, human physiology, diagnosis, hospital care, pharmacology, or animal welfare.',
      majorDegrees: ['MBBS (5.5 Years)', 'BDS (5 Years)', 'BAMS / BHMS (5.5 Years)', 'B.Pharm (4 Years)', 'B.Sc Nursing (4 Years)', 'BPT Physiotherapy (4.5 Years)', 'BVSc Animal Surgery (5.5 Years)'],
      keyExams: ['NEET UG (Central National Test)', 'State Paramedical CETs'],
      careerFamilies: ['Clinical Medicine & Surgery', 'Dentistry & Orthodontics', 'Physical Therapy & Sports Rehab', 'Pharmaceutical Drug Research', 'Genomics & Bio-Technology'],
      pros: 'Profound social respect and purpose; continuous clinical demand globally; immunity from artificial intelligence displacement.',
      cons: 'Intense competition for government medical seats; long educational journey (5-8+ years including post-graduation).',
      costRangeINR: '₹50,000 (Govt Medical College) to ₹40+ Lakhs (Private Medical College)'
    },
    {
      id: 'PCMB',
      name: 'Science PCMB (PCM + Biology)',
      badge: 'Maximum Flexibility',
      coreSubjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English'],
      optionalElectives: ['None (due to 5 core subjects)'],
      suitedFor: 'Students with exceptional academic stamina and equal passion for both biological systems and mathematical modeling.',
      majorDegrees: ['All Engineering and All Medical pathways', 'Biomedical Engineering', 'Bioinformatics & Computational Biology', 'Biophysics'],
      keyExams: ['Both JEE Main and NEET UG'],
      careerFamilies: ['Biomedical Devices & Prosthetics', 'Genomic Data Science', 'Synthetic Biology', 'Healthcare Tech'],
      pros: 'Zero doors closed; eligible for both engineering and medical entrance tests.',
      cons: 'Double the homework and syllabus volume; high risk of academic burnout if time management slips.',
      costRangeINR: '₹2 Lakhs – ₹25 Lakhs'
    },
    {
      id: 'COMMERCE',
      name: 'Commerce (With or Without Math)',
      badge: 'Trade, Finance & Enterprise',
      coreSubjects: ['Accountancy', 'Business Studies', 'Economics', 'English'],
      optionalElectives: ['Applied Mathematics', 'Informatics Practices', 'Entrepreneurship', 'Physical Education'],
      suitedFor: 'Students intrigued by corporate finance, stock exchanges, startups, taxation laws, balance sheets, and management leadership.',
      majorDegrees: ['Chartered Accountancy (ICAI)', 'B.Com (Hons) (3-4 Years)', 'BBA / BMS (3-4 Years)', 'Company Secretary (ICSI)', 'Actuarial Science'],
      keyExams: ['CUET UG (for Delhi University, SRCC, SSCBS)', 'IPMAT (for 5-year IIM IPM)', 'CA Foundation', 'ACET'],
      careerFamilies: ['Statutory Auditing & Tax Consulting', 'Investment Banking & Private Equity', 'Corporate Company Secretary', 'Actuarial Risk Science', 'Brand Marketing & Operations'],
      pros: 'High corporate earning potential early in career; strong entrepreneurial and financial literacy foundations.',
      cons: 'Requires meticulous precision in numbers and law; high reliance on competitive professional certifications.',
      costRangeINR: '₹1.5 Lakhs – ₹12 Lakhs'
    },
    {
      id: 'HUMANITIES',
      name: 'Humanities & Social Sciences',
      badge: 'Society, Culture & Governance',
      coreSubjects: ['History', 'Political Science', 'Sociology / Psychology', 'English'],
      optionalElectives: ['Economics', 'Geography', 'Legal Studies', 'Fine Arts', 'Foreign Languages'],
      suitedFor: 'Students who love deep reading, public debating, social policy, human behavior, constitutional law, writing, and creative arts.',
      majorDegrees: ['B.A. (Hons) in Psychology / Political Science / Economics', '5-Year Integrated B.A. LL.B', 'B.Des (Design)', 'BJMC (Journalism)', 'Bachelor of Social Work (BSW)'],
      keyExams: ['CLAT (for National Law Universities)', 'CUET UG', 'UCEED & NID DAT', 'UPSC Civil Services (after graduation)'],
      careerFamilies: ['Corporate & Litigation Law', 'Civil Services (IAS / IPS / IFS)', 'Clinical Psychology', 'UX Design & Architecture', 'Investigative Media & Policy'],
      pros: 'Deeply enriching human perspective; versatile entry into civil service, corporate law, public policy, and creative tech design.',
      cons: 'Requires deliberate portfolio building; entry-level jobs often demand clear specialization or post-graduate degrees.',
      costRangeINR: '₹80,000 – ₹10 Lakhs'
    },
    {
      id: 'VOCATIONAL',
      name: 'Vocational & Applied Skill Pathways',
      badge: 'Hands-on Skill Mastery',
      coreSubjects: ['Applied Domain Technology', 'Applied Sciences', 'English', 'Practical Practicum'],
      optionalElectives: ['Web Development', 'Automotive Technology', 'Hospitality & Tourism', 'Retail Operations'],
      suitedFor: 'Students seeking rapid practical vocational skills, technical polytechnic diplomas, and immediate industry apprenticeships.',
      majorDegrees: ['B.Voc (Bachelor of Vocational Studies)', 'Polytechnic Diploma in Engineering (3 Years)', 'Hospitality Degree (BHM)'],
      keyExams: ['State Polytechnic JEXPO / JEECUP', 'NCHMCT JEE'],
      careerFamilies: ['Industrial CNC Machining & Automation', 'Hospitality Management & Culinary Arts', 'Automobile Service Technicians', 'Cloud Helpdesk & Web Support'],
      pros: 'Lowest tuition cost, direct apprenticeship links with National Skill Development Corporation (NSDC), hands-on competence.',
      cons: 'Perceived social stigma compared to conventional degrees; career ceiling can require later degree completion.',
      costRangeINR: '₹30,000 – ₹3 Lakhs'
    }
  ];

  res.json({ success: true, streams });
});

export default router;
