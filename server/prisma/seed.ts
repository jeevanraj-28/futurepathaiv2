import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting FUTUREPATH AI database seed...');

  // 1. Subscription Plans
  const plans = [
    {
      code: 'FREE',
      name: 'Free Explorer',
      description: 'Foundational career discovery and profile assessment',
      priceINR: 0,
      billingType: 'ONE_TIME',
      featuresJson: JSON.stringify([
        'Complete student profile & academic tracker',
        'Basic 10-question assessment trial',
        'Top 3 career recommendations preview',
        'Access to public college & exam directory',
        'Class 10 Stream selection overview'
      ]),
      isPopular: false
    },
    {
      code: 'DISCOVERY',
      name: 'Career Discovery Report',
      description: 'In-depth comprehensive psychometric report with 16 dimensions',
      priceINR: 299,
      billingType: 'ONE_TIME',
      featuresJson: JSON.stringify([
        'Full 40-question psychometric & aptitude assessment',
        'Multi-factor compatibility scoring for 50+ careers',
        'Detailed Stream Selection Matrix (PCM vs PCB vs Commerce vs Arts)',
        'Downloadable High-Res PDF Career Dossier',
        'Personalized 90-day academic action plan'
      ]),
      isPopular: false
    },
    {
      code: 'PREMIUM_STUDENT',
      name: 'Premium Student Annual',
      description: 'Continuous intelligence, roadmap builder, and AI mentor guidance',
      priceINR: 999,
      billingType: 'ANNUAL',
      featuresJson: JSON.stringify([
        'Everything in Career Discovery',
        'Interactive 30-Day, 90-Day, 1-Year & 3-5 Year Roadmap Builder',
        'Unlimited AI Career Mentor chat guidance',
        'College & Cutoff Tracker with scholarship alerts',
        'Re-take assessment every 6 months to track cognitive evolution',
        'Official source links and verified salary benchmark data'
      ]),
      isPopular: true
    },
    {
      code: 'PREMIUM_PLUS',
      name: 'Premium Plus & Family',
      description: 'Holistic career strategy with Parent Dashboard & Counselor consultation discounts',
      priceINR: 2499,
      billingType: 'ANNUAL',
      featuresJson: JSON.stringify([
        'Everything in Premium Student',
        'Dedicated Parent Portal with consent management',
        'Higher Education Financial Planning & Cost Estimator',
        '20% Discount voucher on 1-on-1 Certified Counselor sessions',
        'Priority AI Mentor processing with custom roadmap exports'
      ]),
      isPopular: false
    },
    {
      code: 'SCHOOL_PILOT',
      name: 'School Institutional Pilot',
      description: 'For schools guiding batches of Class 10 and Class 12 students',
      priceINR: 19999,
      billingType: 'ANNUAL',
      featuresJson: JSON.stringify([
        'Up to 100 student accounts with bulk CSV enrollment',
        'Class-wise analytics & career readiness metrics',
        'School Counselor note taking & batch assignment',
        'Institutional aggregate reports for parent-teacher forums',
        'Dedicated school onboarding session'
      ]),
      isPopular: false
    }
  ];

  for (const p of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { code: p.code },
      update: p,
      create: p
    });
  }
  console.log('✅ Subscription plans seeded.');

  // 2. Demo Users & Accounts
  const hashedPassword = await bcrypt.hash('Password@123', 10);

  // Student
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@futurepath.ai' },
    update: {},
    create: {
      email: 'student@futurepath.ai',
      passwordHash: hashedPassword,
      name: 'Aarav Sharma',
      phone: '+91 98765 43210',
      role: 'STUDENT',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
    }
  });

  const studentProfile = await prisma.studentProfile.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      currentClass: 'CLASS_10',
      board: 'CBSE',
      state: 'Maharashtra',
      city: 'Pune',
      currentSubjects: JSON.stringify(['English', 'Mathematics', 'Science', 'Social Studies', 'Hindi', 'Information Tech']),
      scoreRange: '85-92%',
      favouriteSubjects: JSON.stringify(['Mathematics', 'Science', 'Information Tech']),
      difficultSubjects: JSON.stringify(['Hindi']),
      hobbies: JSON.stringify(['Robotics Club', 'Chess', 'Astronomy', 'Reading Tech Blogs']),
      preferredActivities: JSON.stringify(['Building things', 'Analyzing code', 'Solving numerical puzzles']),
      skills: JSON.stringify(['Python Basics', 'Logical Reasoning', 'Public Speaking']),
      learningStyle: 'Practical & Visual',
      budgetRange: '5-10 Lakhs',
      willingnessToRelocate: true,
      preferredLanguages: JSON.stringify(['English', 'Hindi']),
      careerExpectations: 'Aspiring to work in cutting-edge tech or space engineering.',
      onboardingCompleted: true,
      completionScore: 90
    }
  });

  // Assign Student an Active Premium Subscription for testing all premium capabilities
  const premiumPlan = await prisma.subscriptionPlan.findUnique({ where: { code: 'PREMIUM_STUDENT' } });
  if (premiumPlan) {
    await prisma.subscription.upsert({
      where: { id: 'demo-student-subscription' },
      update: {},
      create: {
        id: 'demo-student-subscription',
        userId: studentUser.id,
        planId: premiumPlan.id,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    });
  }

  // Parent
  const parentUser = await prisma.user.upsert({
    where: { email: 'parent@futurepath.ai' },
    update: {},
    create: {
      email: 'parent@futurepath.ai',
      passwordHash: hashedPassword,
      name: 'Sunita Sharma',
      phone: '+91 98765 43211',
      role: 'PARENT',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
    }
  });

  const parentProfile = await prisma.parentProfile.upsert({
    where: { userId: parentUser.id },
    update: {},
    create: {
      userId: parentUser.id,
      occupation: 'Senior Financial Analyst',
      educationLevel: 'Postgraduate',
      city: 'Pune'
    }
  });

  // Link Parent to Student
  await prisma.parentStudentLink.upsert({
    where: { id: 'demo-parent-student-link' },
    update: {},
    create: {
      id: 'demo-parent-student-link',
      parentId: parentProfile.id,
      studentId: studentProfile.id,
      status: 'ACTIVE',
      consentGiven: true,
      relationship: 'Mother'
    }
  });

  // School Admin
  const schoolAdmin = await prisma.user.upsert({
    where: { email: 'school@futurepath.ai' },
    update: {},
    create: {
      email: 'school@futurepath.ai',
      passwordHash: hashedPassword,
      name: 'Dr. Ramesh Kulkarni (Principal)',
      phone: '+91 98765 43212',
      role: 'SCHOOL_ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    }
  });

  const school = await prisma.school.upsert({
    where: { code: 'DPS-PUNE-01' },
    update: {},
    create: {
      name: 'Delhi Public School, Pune Camp',
      code: 'DPS-PUNE-01',
      board: 'CBSE',
      city: 'Pune',
      state: 'Maharashtra',
      contactEmail: 'admissions@dpspune.edu.in',
      contactPhone: '+91 20 2600 0000',
      subscriptionTier: 'GROWTH',
      maxStudents: 500
    }
  });

  await prisma.schoolMembership.upsert({
    where: { id: 'demo-school-admin-membership' },
    update: {},
    create: {
      id: 'demo-school-admin-membership',
      userId: schoolAdmin.id,
      schoolId: school.id,
      role: 'ADMIN'
    }
  });

  // Create Class Groups
  const class10A = await prisma.classGroup.create({
    data: {
      schoolId: school.id,
      name: 'Class 10-A (Secondary)',
      academicYear: '2026-2027'
    }
  });

  await prisma.classGroup.create({
    data: {
      schoolId: school.id,
      name: 'Class 12-Science (Senior)',
      academicYear: '2026-2027'
    }
  });

  await prisma.studentEnrollment.upsert({
    where: { id: 'demo-enrollment-aarav' },
    update: {},
    create: {
      id: 'demo-enrollment-aarav',
      studentId: studentProfile.id,
      schoolId: school.id,
      classGroupId: class10A.id,
      rollNumber: '10A-24'
    }
  });

  // Counselor
  const counselorUser = await prisma.user.upsert({
    where: { email: 'counselor@futurepath.ai' },
    update: {},
    create: {
      email: 'counselor@futurepath.ai',
      passwordHash: hashedPassword,
      name: 'Ananya Deshmukh, M.A., Ed.M.',
      phone: '+91 98765 43213',
      role: 'COUNSELOR',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
    }
  });

  await prisma.counselorProfile.upsert({
    where: { userId: counselorUser.id },
    update: {},
    create: {
      userId: counselorUser.id,
      title: 'Global Career Counseling Specialist & Cognitive Psychologist',
      bio: 'Over 12 years guiding Class 10 & 12 students in CBSE, ICSE, and IB across STEM, Design, and Law. Certified UCLA Career Counselor.',
      degrees: JSON.stringify(['M.A. Applied Psychology, University of Delhi', 'Ed.M. Counseling, UCLA Extension']),
      certifications: JSON.stringify(['Global Career Counselor (UCLA)', 'Certified Psychometric Assessor']),
      specializations: JSON.stringify(['STEM vs Commerce Stream Selection', 'Engineering & Entrance Strategy', 'Liberal Arts & Design']),
      languages: JSON.stringify(['English', 'Hindi', 'Marathi']),
      experienceYears: 12,
      hourlyRate: 1500,
      isVerified: true,
      rating: 4.95,
      availableSlots: JSON.stringify(['Mon 16:00-17:00', 'Wed 17:00-18:00', 'Sat 10:00-11:00', 'Sat 14:00-15:00'])
    }
  });

  // Platform Admin
  await prisma.user.upsert({
    where: { email: 'admin@futurepath.ai' },
    update: {},
    create: {
      email: 'admin@futurepath.ai',
      passwordHash: hashedPassword,
      name: 'FuturePath Platform Director',
      phone: '+91 99999 88888',
      role: 'PLATFORM_ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    }
  });

  console.log('✅ Demo accounts created for all 5 roles.');

  // 3. Forty (40) Assessment Questions covering 16 dimensions
  const questionsData = [
    // Numerical Reasoning (1-3)
    {
      orderNumber: 1,
      prompt: 'When you are presented with a numerical puzzle or a graph depicting trends over five years, how do you approach it?',
      category: 'APTITUDE',
      dimension: 'Numerical Reasoning',
      optionsJson: JSON.stringify([
        { text: 'I quickly calculate percentage changes and spot underlying mathematical relationships.', score: 10, traits: ['Numerical', 'Analytical'] },
        { text: 'I look at the general visual direction of the trend line without calculating specifics.', score: 6, traits: ['Visual'] },
        { text: 'I find raw numbers tedious and prefer a written summary of what the data means.', score: 2, traits: ['Verbal'] }
      ]),
      weight: 1.0
    },
    {
      orderNumber: 2,
      prompt: 'A car travels 180 km in 3 hours. If its speed increases by 30 km/h for the next 2 hours, what is its total distance?',
      category: 'APTITUDE',
      dimension: 'Numerical Reasoning',
      optionsJson: JSON.stringify([
        { text: '360 km (Calculated: 60 km/h + 30 = 90 km/h; 90*2 = 180; total 360 km)', score: 10, traits: ['Numerical', 'Mental Math'] },
        { text: '320 km', score: 3, traits: [] },
        { text: 'I prefer using a calculator or having the formula outlined step-by-step', score: 5, traits: ['Step-by-step'] }
      ]),
      weight: 1.0
    },
    {
      orderNumber: 3,
      prompt: 'When managing pocket money, budgeting an event, or estimating project expenses, you usually:',
      category: 'APTITUDE',
      dimension: 'Numerical Reasoning',
      optionsJson: JSON.stringify([
        { text: 'Create a spreadsheet with formulas to track balances, expenses, and savings.', score: 10, traits: ['Numerical', 'Finance'] },
        { text: 'Keep a mental tally of major expenses so you stay reasonably within limits.', score: 6, traits: ['Practical'] },
        { text: 'Spend as required and review only when funds are low.', score: 2, traits: ['Spontaneous'] }
      ]),
      weight: 1.0
    },

    // Logical Reasoning (4-6)
    {
      orderNumber: 4,
      prompt: 'If All X are Y, and Some Y are Z, what can be definitively concluded about the relationship between X and Z?',
      category: 'APTITUDE',
      dimension: 'Logical Reasoning',
      optionsJson: JSON.stringify([
        { text: 'No definitive overlap between X and Z can be deduced without additional conditions.', score: 10, traits: ['Deductive Logic'] },
        { text: 'All X must definitely be Z.', score: 2, traits: [] },
        { text: 'Some X must be Z.', score: 3, traits: [] }
      ]),
      weight: 1.0
    },
    {
      orderNumber: 5,
      prompt: 'When a piece of software or an electronic gadget malfunctions at home, what is your initial reaction?',
      category: 'APTITUDE',
      dimension: 'Logical Reasoning',
      optionsJson: JSON.stringify([
        { text: 'I isolate variables one by one (restart, check logs, cables) to deduce the root cause.', score: 10, traits: ['Logical', 'Problem Solving'] },
        { text: 'I search online forums or ask someone with technical experience.', score: 6, traits: ['Inquisitive'] },
        { text: 'I wait for someone else to fix it or send it for replacement.', score: 2, traits: [] }
      ]),
      weight: 1.0
    },
    {
      orderNumber: 6,
      prompt: 'When evaluating two opposing arguments in a debate or essay, you prioritize:',
      category: 'APTITUDE',
      dimension: 'Logical Reasoning',
      optionsJson: JSON.stringify([
        { text: 'Evidence-backed facts, logical consistency, and absence of logical fallacies.', score: 10, traits: ['Critical Thinking', 'Deduction'] },
        { text: 'How passionately and persuasively each speaker delivers their points.', score: 5, traits: ['Social', 'Emotional'] },
        { text: 'Which side aligns with popular tradition or general agreement.', score: 3, traits: ['Conformity'] }
      ]),
      weight: 1.0
    },

    // Verbal Reasoning (7-9)
    {
      orderNumber: 7,
      prompt: 'When reading a dense editorial article or philosophical passage, you feel:',
      category: 'APTITUDE',
      dimension: 'Verbal Reasoning',
      optionsJson: JSON.stringify([
        { text: 'Engaged; I easily decode nuance, tone, underlying metaphors, and core arguments.', score: 10, traits: ['Verbal', 'Literary'] },
        { text: 'Comfortable if the vocabulary is direct, but skim through overly complex prose.', score: 6, traits: ['Practical'] },
        { text: 'Bored; I would much rather watch a 5-minute animated video explaining the concept.', score: 3, traits: ['Visual'] }
      ]),
      weight: 1.0
    },
    {
      orderNumber: 8,
      prompt: 'When you need to explain a complex topic to classmates, you naturally:',
      category: 'APTITUDE',
      dimension: 'Verbal Reasoning',
      optionsJson: JSON.stringify([
        { text: 'Use clear analogies, precise vocabulary, and well-structured sentences.', score: 10, traits: ['Verbal', 'Communication'] },
        { text: 'Draw diagrams, flowcharts, or demonstrate with physical examples.', score: 6, traits: ['Visual', 'Kinesthetic'] },
        { text: 'Give them the summary bullet points and direct them to reference notes.', score: 5, traits: ['Concise'] }
      ]),
      weight: 1.0
    },
    {
      orderNumber: 9,
      prompt: 'Which task would you find most satisfying during a school exhibition?',
      category: 'APTITUDE',
      dimension: 'Verbal Reasoning',
      optionsJson: JSON.stringify([
        { text: 'Writing the official project thesis, press release, and presenting the opening speech.', score: 10, traits: ['Verbal', 'Public Discourse'] },
        { text: 'Designing the display banners, lighting, and physical layout of the booth.', score: 6, traits: ['Design', 'Spatial'] },
        { text: 'Coding the interactive software demo or calibrating the circuit board.', score: 6, traits: ['Engineering'] }
      ]),
      weight: 1.0
    },

    // Spatial Reasoning (10-12)
    {
      orderNumber: 10,
      prompt: 'Can you easily visualize a 2D blueprint or flat cardboard pattern folded into a 3D box in your mind?',
      category: 'APTITUDE',
      dimension: 'Spatial Reasoning',
      optionsJson: JSON.stringify([
        { text: 'Yes, I can rotate and manipulate 3D shapes effortlessly in my imagination.', score: 10, traits: ['Spatial', 'Architecture', 'Design'] },
        { text: 'Somewhat, but it takes deliberate effort or sketching it on paper.', score: 6, traits: ['Moderate Spatial'] },
        { text: 'No, I struggle to visualize geometry without physical models.', score: 2, traits: [] }
      ]),
      weight: 1.0
    },
    {
      orderNumber: 11,
      prompt: 'When navigating an unfamiliar city or large shopping mall, you:',
      category: 'APTITUDE',
      dimension: 'Spatial Reasoning',
      optionsJson: JSON.stringify([
        { text: 'Form an intuitive mental map using landmarks, directions, and spatial orientation.', score: 10, traits: ['Spatial', 'Navigation'] },
        { text: 'Rely strictly on GPS turn-by-turn spoken audio prompts.', score: 5, traits: ['Procedural'] },
        { text: 'Often feel disoriented and need to stop and ask people frequently.', score: 2, traits: [] }
      ]),
      weight: 1.0
    },
    {
      orderNumber: 12,
      prompt: 'Which of the following activities do you enjoy most in your free time?',
      category: 'APTITUDE',
      dimension: 'Spatial Reasoning',
      optionsJson: JSON.stringify([
        { text: 'Building complex LEGO structures, 3D CAD modeling, sketching architecture or sculptures.', score: 10, traits: ['Spatial', 'Architecture'] },
        { text: 'Playing strategy board games or competitive video games.', score: 7, traits: ['Strategic'] },
        { text: 'Reading novels or writing poetry.', score: 4, traits: ['Literary'] }
      ]),
      weight: 1.0
    },

    // Scientific Thinking (13-15)
    {
      orderNumber: 13,
      prompt: 'When observing a natural phenomenon (e.g. why the sky turns crimson at sunset or how vaccines stimulate antibodies), you:',
      category: 'APTITUDE',
      dimension: 'Scientific Thinking',
      optionsJson: JSON.stringify([
        { text: 'Deeply want to understand the exact biochemical or physical mechanism behind it.', score: 10, traits: ['Scientific', 'Empirical'] },
        { text: 'Appreciate the aesthetic beauty or practical benefit without digging into formulas.', score: 4, traits: ['Artistic'] },
        { text: 'Read about it only if it is explicitly required in the exam syllabus.', score: 2, traits: [] }
      ]),
      weight: 1.0
    },
    {
      orderNumber: 14,
      prompt: 'In a science laboratory experiment where results deviate from textbook predictions, you:',
      category: 'APTITUDE',
      dimension: 'Scientific Thinking',
      optionsJson: JSON.stringify([
        { text: 'Formulate hypotheses to investigate experimental errors, calibration, or unexpected variables.', score: 10, traits: ['Scientific', 'Research'] },
        { text: 'Re-run the experiment following standard steps carefully.', score: 7, traits: ['Methodical'] },
        { text: 'Adjust the written numbers to match what the textbook says should happen.', score: 1, traits: ['Unreliable'] }
      ]),
      weight: 1.0
    },
    {
      orderNumber: 15,
      prompt: 'Which subject topic fascinates you more naturally?',
      category: 'APTITUDE',
      dimension: 'Scientific Thinking',
      optionsJson: JSON.stringify([
        { text: 'Quantum physics, genetics, molecular chemistry, or astrophysics.', score: 10, traits: ['Pure Sciences'] },
        { text: 'Stock market cycles, macroeconomic policies, or business trade.', score: 5, traits: ['Commerce'] },
        { text: 'Constitutional law, sociology, or world history.', score: 5, traits: ['Humanities'] }
      ]),
      weight: 1.0
    },

    // Creative Thinking (16-18)
    {
      orderNumber: 16,
      prompt: 'When given an open-ended project with zero fixed instructions, you feel:',
      category: 'APTITUDE',
      dimension: 'Creative Thinking',
      optionsJson: JSON.stringify([
        { text: 'Exhilarated; I love inventing unconventional angles, storylines, or designs.', score: 10, traits: ['Creative', 'Innovator'] },
        { text: 'Comfortable once I look up 2-3 examples to guide my direction.', score: 6, traits: ['Adaptive'] },
        { text: 'Anxious; I strongly prefer a clear rubric with step-by-step instructions.', score: 2, traits: ['Structured'] }
      ]),
      weight: 1.0
    },
    {
      orderNumber: 17,
      prompt: 'If asked to come up with alternative uses for an ordinary plastic bottle, you can generate:',
      category: 'APTITUDE',
      dimension: 'Creative Thinking',
      optionsJson: JSON.stringify([
        { text: '10+ imaginative ideas (drip irrigation, acoustic amplifier, micro-greenhouse, art installation).', score: 10, traits: ['Creative', 'Lateral Thinking'] },
        { text: '3 to 5 common ideas (pen holder, funnel, water storage).', score: 6, traits: ['Practical'] },
        { text: 'Hardly any; a bottle is just for holding water.', score: 2, traits: [] }
      ]),
      weight: 1.0
    },
    {
      orderNumber: 18,
      prompt: 'When you listen to a speech, see a brand logo, or look at a mobile app interface, you immediately notice:',
      category: 'APTITUDE',
      dimension: 'Creative Thinking',
      optionsJson: JSON.stringify([
        { text: 'Visual harmony, typography, emotional resonance, and how it could look 10x better.', score: 10, traits: ['Creative', 'Design Thinking'] },
        { text: 'Whether it works fast and does not crash.', score: 6, traits: ['Functional'] },
        { text: 'Only what content it presents.', score: 3, traits: [] }
      ]),
      weight: 1.0
    },

    // Communication (19-21)
    {
      orderNumber: 19,
      prompt: 'How comfortable are you standing in front of an audience of 100 people to present an idea?',
      category: 'APTITUDE',
      dimension: 'Communication',
      optionsJson: JSON.stringify([
        { text: 'Very energized and confident; I enjoy connecting with the audience.', score: 10, traits: ['Communication', 'Oratory'] },
        { text: 'Somewhat nervous beforehand, but I can deliver the presentation smoothly with practice.', score: 7, traits: ['Prepared'] },
        { text: 'Extremely uncomfortable; I dread public speaking and avoid it whenever possible.', score: 2, traits: ['Introverted'] }
      ]),
      weight: 1.0
    },
    {
      orderNumber: 20,
      prompt: 'When a misunderstanding arises between you and a friend or team member, you:',
      category: 'APTITUDE',
      dimension: 'Communication',
      optionsJson: JSON.stringify([
        { text: 'Initiate a calm, direct conversation to listen to their perspective and clarify intent.', score: 10, traits: ['Empathetic Communication'] },
        { text: 'Send a detailed text message explaining your point of view.', score: 6, traits: ['Written Communication'] },
        { text: 'Withdraw and hope time resolves the tension.', score: 2, traits: ['Avoidant'] }
      ]),
      weight: 1.0
    },
    {
      orderNumber: 21,
      prompt: 'In group assignments, what role do you naturally gravitate toward?',
      category: 'APTITUDE',
      dimension: 'Communication',
      optionsJson: JSON.stringify([
        { text: 'The communicator/anchor who pitches the project and aligns everyone on goals.', score: 10, traits: ['Leadership', 'Communication'] },
        { text: 'The primary researcher or technical builder who stays focused on the artifact.', score: 6, traits: ['Specialist'] },
        { text: 'The proofreader who checks formatting and deadlines.', score: 6, traits: ['Detail-oriented'] }
      ]),
      weight: 1.0
    },

    // Practical Problem Solving (22-24)
    {
      orderNumber: 22,
      prompt: 'When facing a challenging real-world obstacle with limited resources and tight deadlines, you:',
      category: 'APTITUDE',
      dimension: 'Practical Problem Solving',
      optionsJson: JSON.stringify([
        { text: 'Find clever resourceful workarounds ("jugaad" + smart engineering) to make it work.', score: 10, traits: ['Resourceful', 'Practical'] },
        { text: 'Follow standard procedures as far as resources permit and report the deficit.', score: 6, traits: ['Compliant'] },
        { text: 'Feel paralyzed by the constraints.', score: 2, traits: [] }
      ]),
      weight: 1.0
    },
    {
      orderNumber: 23,
      prompt: 'Do you enjoy hands-on activities like assembling furniture, soldering circuits, cooking complex recipes, or gardening?',
      category: 'APTITUDE',
      dimension: 'Practical Problem Solving',
      optionsJson: JSON.stringify([
        { text: 'Yes, I get tremendous satisfaction from tangible, physical creation and tactile work.', score: 10, traits: ['Kinesthetic', 'Hands-on'] },
        { text: 'Occasionally, if there is a clear immediate purpose.', score: 6, traits: ['Balanced'] },
        { text: 'No, I prefer purely conceptual or digital tasks on my laptop.', score: 4, traits: ['Digital'] }
      ]),
      weight: 1.0
    },
    {
      orderNumber: 24,
      prompt: 'When planning a 3-day school trip or family outing, your approach is:',
      category: 'APTITUDE',
      dimension: 'Practical Problem Solving',
      optionsJson: JSON.stringify([
        { text: 'Build a practical itinerary with buffer times, backup routes, ticket confirmations, and medical kit.', score: 10, traits: ['Operations', 'Logistics'] },
        { text: 'Book the main hotel and figure out the rest on the go.', score: 6, traits: ['Spontaneous'] },
        { text: 'Let others handle all planning while I just show up.', score: 2, traits: [] }
      ]),
      weight: 1.0
    },

    // Leadership & Teamwork (25-27)
    {
      orderNumber: 25,
      prompt: 'When a team project is falling behind schedule, what do you do?',
      category: 'WORK_STYLE',
      dimension: 'Leadership & Teamwork',
      optionsJson: JSON.stringify([
        { text: 'Step up, reorganize the task breakdown, motivate team members, and track daily milestones.', score: 10, traits: ['Leadership'] },
        { text: 'Complete my own assigned portion quickly and offer to help others.', score: 8, traits: ['Team Player'] },
        { text: 'Worry about the grade but keep working in silence.', score: 3, traits: [] }
      ]),
      weight: 1.0
    },
    {
      orderNumber: 26,
      prompt: 'How do you prefer to resolve conflicting opinions inside your student committee or study circle?',
      category: 'WORK_STYLE',
      dimension: 'Leadership & Teamwork',
      optionsJson: JSON.stringify([
        { text: 'Facilitate consensus where everyone feels heard and align on shared criteria.', score: 10, traits: ['Diplomatic', 'Collaborative'] },
        { text: 'Take a quick majority vote to avoid wasting time.', score: 7, traits: ['Decisive'] },
        { text: 'Let the loudest person decide so work can proceed.', score: 2, traits: [] }
      ]),
      weight: 1.0
    },
    {
      orderNumber: 27,
      prompt: 'Would you rather be the captain of an average sports team or a star player on a championship team?',
      category: 'WORK_STYLE',
      dimension: 'Leadership & Teamwork',
      optionsJson: JSON.stringify([
        { text: 'Captain of the average team: I love building team culture and coaching others to win.', score: 10, traits: ['Leadership'] },
        { text: 'Star player on championship team: I focus on personal excellence and domain mastery.', score: 7, traits: ['Individual Contributor'] },
        { text: 'Neither, I prefer non-competitive pursuits.', score: 4, traits: [] }
      ]),
      weight: 1.0
    },

    // Work Environment Preferences (28-29)
    {
      orderNumber: 28,
      prompt: 'In your ideal future career, where would you like to spend the majority of your working hours?',
      category: 'WORK_STYLE',
      dimension: 'Work Environment',
      optionsJson: JSON.stringify([
        { text: 'A dynamic tech lab, design studio, or modern corporate headquarters.', score: 9, traits: ['Corporate', 'Creative Studio'] },
        { text: 'A hospital, clinic, or specialized diagnostic laboratory saving lives.', score: 10, traits: ['Healthcare Environment'] },
        { text: 'Outdoors, airfields, industrial plants, marine vessels, or field research locations.', score: 10, traits: ['Field/Aviation'] },
        { text: 'Courtrooms, university lecture halls, or policy chambers.', score: 9, traits: ['Academic/Legal'] }
      ]),
      weight: 1.0
    },
    {
      orderNumber: 29,
      prompt: 'How do you handle working under high-pressure environments with tight deadlines and unpredictable emergencies?',
      category: 'WORK_STYLE',
      dimension: 'Work Environment',
      optionsJson: JSON.stringify([
        { text: 'I thrive on adrenaline and stay remarkably calm and laser-focused.', score: 10, traits: ['High Stress Resilience', 'Crisis Management'] },
        { text: 'I can manage it when necessary, but prefer a predictable, steady schedule.', score: 6, traits: ['Balanced Routine'] },
        { text: 'High stress causes severe anxiety; I perform best in peaceful, calm surroundings.', score: 3, traits: ['Calm Environment'] }
      ]),
      weight: 1.0
    },

    // Risk Tolerance (30-31)
    {
      orderNumber: 30,
      prompt: 'When considering future employment, which proposition appeals more to you?',
      category: 'VALUE',
      dimension: 'Risk Tolerance',
      optionsJson: JSON.stringify([
        { text: 'A secure, prestigious position in government services (UPSC/Banking) or stable PSU with pension and housing.', score: 4, traits: ['Security Seeking'] },
        { text: 'A fast-growing venture-backed startup where compensation includes high equity and volatile upside.', score: 10, traits: ['High Risk', 'High Upside'] },
        { text: 'A well-established multinational corporation with clear annual increments and stability.', score: 7, traits: ['Moderate Risk'] }
      ]),
      weight: 1.0
    },
    {
      orderNumber: 31,
      prompt: 'If you have an innovative business idea during college, would you be willing to bootstrap it with savings?',
      category: 'VALUE',
      dimension: 'Risk Tolerance',
      optionsJson: JSON.stringify([
        { text: 'Yes! I believe in calculated risks and validating hypotheses in the market.', score: 10, traits: ['Entrepreneurial', 'Calculated Risk'] },
        { text: 'Only after securing a safe degree and having a backup job offer in hand.', score: 6, traits: ['Prudent'] },
        { text: 'No, I prefer guaranteed compensation and established corporate roles.', score: 2, traits: ['Risk Averse'] }
      ]),
      weight: 1.0
    },

    // Social Impact Preferences (32-33)
    {
      orderNumber: 32,
      prompt: 'How essential is it that your daily work directly alleviates suffering or helps disadvantaged communities?',
      category: 'VALUE',
      dimension: 'Social Impact',
      optionsJson: JSON.stringify([
        { text: 'It is my primary driving purpose; I want to dedicate my life to healthcare, public policy, or social justice.', score: 10, traits: ['Altruistic', 'Social Impact'] },
        { text: 'Important, but I can fulfill it through CSR initiatives, mentoring, or charitable donations alongside my primary career.', score: 7, traits: ['Secondary Impact'] },
        { text: 'My priority in the next 10 years is personal financial security and skill mastery.', score: 4, traits: ['Self-Focused'] }
      ]),
      weight: 1.0
    },
    {
      orderNumber: 33,
      prompt: 'Which news headline would inspire you most if it featured your work in 10 years?',
      category: 'VALUE',
      dimension: 'Social Impact',
      optionsJson: JSON.stringify([
        { text: '"Indian Scientist Develops Low-Cost Solar Desalination Bringing Clean Water to 500 Villages"', score: 10, traits: ['Public Good', 'Engineering'] },
        { text: '"Young Entrepreneur Builds India\'s Next FinTech Unicorn Valued at $2 Billion"', score: 6, traits: ['Commercial Success'] },
        { text: '"Supreme Court Advocate Secures Landmark Verdict Protecting Citizen Digital Privacy Rights"', score: 10, traits: ['Constitutional Justice'] }
      ]),
      weight: 1.0
    },

    // Entrepreneurial Interests (34-35)
    {
      orderNumber: 34,
      prompt: 'When you notice an inefficiency in everyday life (e.g. food delivery delays, unorganized study notes), do you instinctively think of building an app or service to monetize solving it?',
      category: 'VALUE',
      dimension: 'Entrepreneurial',
      optionsJson: JSON.stringify([
        { text: 'Constantly! I already keep a notebook or notes app full of startup ideas.', score: 10, traits: ['Entrepreneurial', 'Venture Mindset'] },
        { text: 'Sometimes, but I don\'t usually take action on them.', score: 6, traits: ['Curious'] },
        { text: 'Rarely; I expect existing organizations to fix operational problems.', score: 2, traits: [] }
      ]),
      weight: 1.0
    },
    {
      orderNumber: 35,
      prompt: 'Would you rather execute someone else\'s proven strategy efficiently or invent a new business model with high uncertainty?',
      category: 'VALUE',
      dimension: 'Entrepreneurial',
      optionsJson: JSON.stringify([
        { text: 'Invent a new business model from scratch; ambiguity energizes me.', score: 10, traits: ['Founder Mindset'] },
        { text: 'Scale and optimize an established operation; execution is what matters.', score: 7, traits: ['Managerial'] },
        { text: 'Execute clearly defined individual contributor tasks.', score: 3, traits: ['Specialist'] }
      ]),
      weight: 1.0
    },

    // Preferred Working Styles (36-37)
    {
      orderNumber: 36,
      prompt: 'How do you do your deepest, highest-quality thinking and study work?',
      category: 'WORK_STYLE',
      dimension: 'Working Style',
      optionsJson: JSON.stringify([
        { text: 'In long, uninterrupted blocks of solitary focus with headphones on.', score: 9, traits: ['Deep Focus', 'Independent'] },
        { text: 'In lively group discussions, brainstorming on whiteboards, bouncing ideas off peers.', score: 8, traits: ['Social Learner'] },
        { text: 'Alternating between quick individual sprints and short team checkpoints.', score: 9, traits: ['Agile'] }
      ]),
      weight: 1.0
    },
    {
      orderNumber: 37,
      prompt: 'When undertaking a major project, which timeline pattern matches your natural working style?',
      category: 'WORK_STYLE',
      dimension: 'Working Style',
      optionsJson: JSON.stringify([
        { text: 'Steady, disciplined daily progress mapped out across 4 weeks without last-minute panic.', score: 10, traits: ['Methodical', 'Consistent'] },
        { text: 'An intense sprint in the final 72 hours powered by deadlines and coffee.', score: 5, traits: ['Sprint Worker'] },
        { text: 'Bursts of high excitement at the start, followed by difficulty closing the last 20%.', score: 4, traits: ['Starter'] }
      ]),
      weight: 1.0
    },

    // Career Values & Long-term Motivation (38-40)
    {
      orderNumber: 38,
      prompt: 'Looking forward 15 years, what defines genuine career success for you?',
      category: 'VALUE',
      dimension: 'Career Values',
      optionsJson: JSON.stringify([
        { text: 'Becoming an internationally recognized authority/inventor in my technical domain.', score: 10, traits: ['Mastery', 'Domain Authority'] },
        { text: 'Building substantial wealth, financial freedom, and luxury for my family.', score: 8, traits: ['Financial Freedom'] },
        { text: 'Having exceptional work-life harmony, mental peace, and time for passions/family.', score: 7, traits: ['Lifestyle Harmony'] },
        { text: 'Transforming public systems or advancing social and environmental welfare in India.', score: 9, traits: ['Nation Building'] }
      ]),
      weight: 1.0
    },
    {
      orderNumber: 39,
      prompt: 'How important is continuous learning and unlearning new technologies throughout your life?',
      category: 'VALUE',
      dimension: 'Career Values',
      optionsJson: JSON.stringify([
        { text: 'Essential; I would be miserable if my job didn\'t force me to learn new skills every year.', score: 10, traits: ['Lifelong Learner'] },
        { text: 'Moderate; I prefer mastering a solid skillset and applying it steadily for decades.', score: 6, traits: ['Specialist Stability'] },
        { text: 'I want to finish studies once and never take an exam or course again.', score: 2, traits: ['Fixed Mindset'] }
      ]),
      weight: 1.0
    },
    {
      orderNumber: 40,
      prompt: 'If you had to summarize your core natural strength in one statement, it would be:',
      category: 'VALUE',
      dimension: 'Subject Interests',
      optionsJson: JSON.stringify([
        { text: '"I break down complex mathematical, scientific, and technological puzzles into clear solutions."', score: 10, traits: ['STEM Specialist'] },
        { text: '"I understand people, convey ideas powerfully, and influence human decisions."', score: 10, traits: ['Humanities & Commerce'] },
        { text: '"I visualize beauty, craft novel experiences, and design intuitive products."', score: 10, traits: ['Creative & Design'] },
        { text: '"I organize chaos, manage operations, and execute projects reliably."', score: 10, traits: ['Management & Operations'] }
      ]),
      weight: 1.0
    }
  ];

  for (const q of questionsData) {
    await prisma.assessmentQuestion.upsert({
      where: { orderNumber: q.orderNumber },
      update: q,
      create: q
    });
  }
  console.log('✅ 40 Assessment questions seeded covering 16 dimensions.');

  // 4. Fifty Plus (50+) Structured Indian Career Records
  const careersData = [
    // Computing, AI & Software (1-6)
    {
      title: 'AI & Machine Learning Engineer',
      slug: 'ai-machine-learning-engineer',
      category: 'Computing/AI',
      stream: 'PCM',
      shortDescription: 'Designs neural networks, large language models, computer vision systems, and autonomous predictive algorithms.',
      fullDescription: 'AI and Machine Learning Engineers develop mathematical models and software architectures that enable computers to learn from patterns in big data without explicit hand-crafted rules.',
      responsibilitiesJson: JSON.stringify([
        'Train, evaluate, and fine-tune deep learning and transformer architectures',
        'Build scalable data ingestion pipelines and feature stores',
        'Optimize inference latency and deploy models to cloud endpoints or edge devices',
        'Audit AI algorithms for fairness, explainability, hallucination, and data privacy'
      ]),
      requiredSubjectsJson: JSON.stringify(['Mathematics', 'Physics', 'Computer Science']),
      entryQualifications: 'B.Tech/B.E. in Computer Science/AI/Data Science or B.Sc in Mathematics/Computing followed by M.Tech/MS',
      recommendedSkillsJson: JSON.stringify(['Python', 'PyTorch/TensorFlow', 'Linear Algebra & Calculus', 'Data Structures & Algorithms', 'MLOps']),
      entranceExamsJson: JSON.stringify(['JEE Main', 'JEE Advanced', 'BITSAT', 'CUET UG (for B.Sc CS)']),
      degreesJson: JSON.stringify(['B.Tech in Artificial Intelligence', 'B.Tech in Computer Science & Engineering', 'BS in Data Science (IIT Madras)']),
      topCollegesJson: JSON.stringify(['IIT Bombay', 'IIT Delhi', 'IIIT Hyderabad', 'BITS Pilani', 'IISc Bangalore']),
      salaryMinINR: 900000,
      salaryMaxINR: 3500000,
      futureDemand: 'VERY_HIGH',
      automationExposure: 'LOW',
      sourceName: 'NASSCOM AI Skills Report 2025 & TeamLease Digital',
      sourceUrl: 'https://www.nasscom.in',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Full-Stack Software Architect',
      slug: 'full-stack-software-architect',
      category: 'Computing/AI',
      stream: 'PCM',
      shortDescription: 'Builds end-to-end web applications, microservices, cloud infrastructure, and distributed database systems.',
      fullDescription: 'Full-Stack Engineers and Architects bridge client-side user experience with robust backend architecture, handling scalability, APIs, security, and cloud deployment.',
      responsibilitiesJson: JSON.stringify([
        'Architect high-throughput REST and GraphQL APIs using Node.js, Go, or Java',
        'Build responsive frontend interfaces in React, Next.js, or TypeScript',
        'Design relational and NoSQL database schemas with caching layers (Redis, PostgreSQL)',
        'Maintain automated CI/CD pipelines and containerized deployments on AWS/GCP'
      ]),
      requiredSubjectsJson: JSON.stringify(['Mathematics', 'Physics', 'Computer Science/IP']),
      entryQualifications: 'B.Tech/B.E. in Computer Science/IT or BCA + MCA',
      recommendedSkillsJson: JSON.stringify(['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker/Kubernetes']),
      entranceExamsJson: JSON.stringify(['JEE Main', 'MHT CET', 'KCET', 'COMEDK', 'VITEEE']),
      degreesJson: JSON.stringify(['B.Tech in Computer Science', 'B.Tech in Information Technology', 'BCA (Honours)']),
      topCollegesJson: JSON.stringify(['NIT Trichy', 'NIT Surathkal', 'DTU Delhi', 'VIT Vellore', 'PSG Tech Coimbatore']),
      salaryMinINR: 700000,
      salaryMaxINR: 3200000,
      futureDemand: 'VERY_HIGH',
      automationExposure: 'LOW',
      sourceName: 'India Skills Report 2025 (Wheebox)',
      sourceUrl: 'https://wheebox.com/isr',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Cybersecurity Analyst & Ethical Hacker',
      slug: 'cybersecurity-analyst',
      category: 'Computing/AI',
      stream: 'PCM',
      shortDescription: 'Protects critical digital infrastructure, banking networks, and enterprise assets against cyber warfare and ransomware attacks.',
      fullDescription: 'Cybersecurity professionals identify vulnerabilities before malicious attackers exploit them, conducting penetration tests, incident response, and zero-trust security audits.',
      responsibilitiesJson: JSON.stringify([
        'Conduct ethical hacking and penetration tests on networks, APIs, and cloud services',
        'Analyze security logs in SIEM tools to detect intrusion attempts in real time',
        'Implement cryptographic protocols, multi-factor authentication, and firewall rules',
        'Comply with national data protection regulations (DPDP Act India, ISO 27001)'
      ]),
      requiredSubjectsJson: JSON.stringify(['Mathematics', 'Computer Science/Physics']),
      entryQualifications: 'B.Tech in Computer Science / Information Security or BCA with CEH/CISSP certifications',
      recommendedSkillsJson: JSON.stringify(['Networking Protocols', 'Linux Internals', 'Wireshark', 'Metasploit', 'Cryptography']),
      entranceExamsJson: JSON.stringify(['JEE Main', 'National Forensic Sciences University Entrance', 'BITSAT']),
      degreesJson: JSON.stringify(['B.Tech in Cyber Security', 'B.Sc in Cyber Security & Digital Forensics']),
      topCollegesJson: JSON.stringify(['NFSU Gandhinagar', 'IIT Madras (Cyber Lab)', 'IIIT Delhi', 'Amrita Vishwa Vidyapeetham']),
      salaryMinINR: 650000,
      salaryMaxINR: 2800000,
      futureDemand: 'VERY_HIGH',
      automationExposure: 'LOW',
      sourceName: 'Data Security Council of India (DSCI)',
      sourceUrl: 'https://www.dsci.in',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Cloud DevOps & Site Reliability Engineer',
      slug: 'cloud-devops-sre',
      category: 'Computing/AI',
      stream: 'PCM',
      shortDescription: 'Automates cloud computing infrastructure, continuous deployment, and ensures zero-downtime scalability for high-traffic platforms.',
      fullDescription: 'DevOps & SRE engineers apply software engineering to infrastructure operations, writing Infrastructure-as-Code (Terraform) and managing Kubernetes clusters.',
      responsibilitiesJson: JSON.stringify([
        'Manage multi-region cloud environments on AWS, Azure, and Google Cloud',
        'Deploy and orchestrate containerized microservices using Kubernetes',
        'Set up automated monitoring, tracing, alerting, and disaster recovery runbooks'
      ]),
      requiredSubjectsJson: JSON.stringify(['Mathematics', 'Physics', 'Computer Science']),
      entryQualifications: 'B.Tech/B.E. in CS/IT/Electronics or BCA + AWS/GCP Certified Solutions Architect',
      recommendedSkillsJson: JSON.stringify(['Kubernetes', 'Terraform', 'Linux', 'Python/Bash scripting', 'CI/CD Pipelines']),
      entranceExamsJson: JSON.stringify(['JEE Main', 'State CETs']),
      degreesJson: JSON.stringify(['B.Tech in Computer Science', 'B.Tech in Cloud Computing']),
      topCollegesJson: JSON.stringify(['NIT Warangal', 'Thapar Institute', 'Manipal Institute of Technology']),
      salaryMinINR: 750000,
      salaryMaxINR: 3000000,
      futureDemand: 'HIGH',
      automationExposure: 'LOW',
      sourceName: 'TeamLease Tech Hiring Trends 2025',
      sourceUrl: 'https://www.teamlease.com',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Data Scientist & Predictive Modeler',
      slug: 'data-scientist',
      category: 'Computing/AI',
      stream: 'PCM',
      shortDescription: 'Extracts actionable strategic insights and forecasts trends from petabytes of structured and unstructured business data.',
      fullDescription: 'Data Scientists blend statistical rigor, advanced programming, and domain business acumen to build recommender systems, fraud detection engines, and demand forecasts.',
      responsibilitiesJson: JSON.stringify([
        'Formulate mathematical hypothesis testing and statistical models',
        'Build feature engineering pipelines and predictive machine learning models',
        'Communicate executive findings using interactive dashboards and data storytelling'
      ]),
      requiredSubjectsJson: JSON.stringify(['Mathematics', 'Statistics/Physics', 'Computer Science']),
      entryQualifications: 'B.Stat from ISI, B.Tech in CS/Data Science, or B.Sc in Statistics followed by Masters',
      recommendedSkillsJson: JSON.stringify(['R / Python', 'SQL', 'Bayesian Statistics', 'Pandas & Scikit-Learn', 'Tableau/PowerBI']),
      entranceExamsJson: JSON.stringify(['ISI Admission Test', 'JEE Main', 'CUET UG']),
      degreesJson: JSON.stringify(['B.Stat (Indian Statistical Institute)', 'B.Tech in Data Science & Engineering', 'B.Sc Statistics']),
      topCollegesJson: JSON.stringify(['Indian Statistical Institute (ISI) Kolkata', 'IIT Kharagpur', 'Chennai Mathematical Institute (CMI)']),
      salaryMinINR: 850000,
      salaryMaxINR: 3200000,
      futureDemand: 'VERY_HIGH',
      automationExposure: 'LOW',
      sourceName: 'Analytics India Magazine (AIM) Salary Study 2025',
      sourceUrl: 'https://analyticsindiamag.com',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Video Game Developer & Interactive Engine Programmer',
      slug: 'video-game-developer',
      category: 'Computing/AI',
      stream: 'PCM',
      shortDescription: 'Programs physics engines, multiplayer networking, graphics shaders, and game mechanics in Unreal Engine and Unity.',
      fullDescription: 'Game programmers create interactive 3D simulations and entertainment experiences, writing high-performance C++ code, graphics shaders, and AI behavior trees.',
      responsibilitiesJson: JSON.stringify([
        'Implement physics simulation, character animation controllers, and gameplay logic',
        'Write custom HLSL/GLSL shaders for lighting, particles, and visual effects',
        'Profile and optimize frame rates for PC, console, and mobile gaming hardware'
      ]),
      requiredSubjectsJson: JSON.stringify(['Mathematics', 'Physics', 'Computer Science']),
      entryQualifications: 'B.Tech in Computer Science or B.Des in Game Design with a portfolio of playable games',
      recommendedSkillsJson: JSON.stringify(['C++', 'C#', 'Unreal Engine 5', 'Unity', 'Linear Algebra & 3D Math']),
      entranceExamsJson: JSON.stringify(['JEE Main', 'UCEED', 'Private University Game Entrance']),
      degreesJson: JSON.stringify(['B.Tech in Game Development', 'B.Sc in Game Programming']),
      topCollegesJson: JSON.stringify(['IIIT Hyderabad (Gaming Lab)', 'Rubika India Pune', 'ICAT Design & Media College']),
      salaryMinINR: 550000,
      salaryMaxINR: 2400000,
      futureDemand: 'HIGH',
      automationExposure: 'MODERATE',
      sourceName: 'FICCI-EY Media and Entertainment Report 2025',
      sourceUrl: 'https://www.ey.com/en_in',
      lastVerifiedDate: '2026-01-15'
    },

    // Engineering & Hardware (7-12)
    {
      title: 'Robotics & Mechatronics Automation Engineer',
      slug: 'robotics-mechatronics-engineer',
      category: 'Engineering',
      stream: 'PCM',
      shortDescription: 'Integrates mechanical kinematics, microcontrollers, computer vision, and pneumatic actuators for industrial and surgical robots.',
      fullDescription: 'Mechatronics engineers work at the fusion point of mechanical design, electronic circuitry, embedded firmware, and software algorithms.',
      responsibilitiesJson: JSON.stringify([
        'Design robotic arms, autonomous mobile robots (AMRs), and sensory feedback systems',
        'Program microcontrollers (STM32, ESP32) and robot operating systems (ROS2)',
        'Perform finite element stress analysis on mechanical chassis and planetary gearboxes'
      ]),
      requiredSubjectsJson: JSON.stringify(['Physics', 'Mathematics', 'Chemistry/Electronics']),
      entryQualifications: 'B.Tech/B.E. in Robotics, Mechatronics, Mechanical, or Electrical Engineering',
      recommendedSkillsJson: JSON.stringify(['ROS2 (Robot Operating System)', 'C/C++', 'SolidWorks CAD', 'Kinematics', 'Embedded Systems']),
      entranceExamsJson: JSON.stringify(['JEE Main', 'JEE Advanced', 'BITSAT']),
      degreesJson: JSON.stringify(['B.Tech in Robotics and Automation', 'B.Tech in Mechatronics Engineering']),
      topCollegesJson: JSON.stringify(['IIT Kanpur', 'IIT Madras', 'PSG College of Technology', 'Manipal Institute of Technology']),
      salaryMinINR: 650000,
      salaryMaxINR: 2600000,
      futureDemand: 'VERY_HIGH',
      automationExposure: 'LOW',
      sourceName: 'Robotics Society of India (RSI)',
      sourceUrl: 'https://www.rs-india.org',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Semiconductor & VLSI Chip Design Engineer',
      slug: 'vlsi-semiconductor-engineer',
      category: 'Engineering',
      stream: 'PCM',
      shortDescription: 'Architects microprocessors, digital logic, and silicon wafers for India Semiconductor Mission and global fabless companies.',
      fullDescription: 'VLSI engineers design, verify, and tape-out silicon microchips containing billions of nanoscale transistors that power smartphones, AI accelerators, and electric vehicles.',
      responsibilitiesJson: JSON.stringify([
        'Design RTL digital circuits using Verilog and SystemVerilog',
        'Perform static timing analysis (STA), clock tree synthesis, and physical layout verification',
        'Simulate analog CMOS mixed-signal circuits using Cadence and Synopsys EDA tools'
      ]),
      requiredSubjectsJson: JSON.stringify(['Physics', 'Mathematics', 'Chemistry']),
      entryQualifications: 'B.Tech in Electronics & Communication Engineering (ECE) followed by M.Tech in VLSI',
      recommendedSkillsJson: JSON.stringify(['Verilog/SystemVerilog', 'Digital Electronics', 'Synopsys/Cadence EDA', 'Computer Architecture']),
      entranceExamsJson: JSON.stringify(['JEE Main', 'JEE Advanced', 'GATE (for M.Tech)']),
      degreesJson: JSON.stringify(['B.Tech in Electronics and Communication Engineering (ECE)', 'Dual Degree B.Tech + M.Tech VLSI']),
      topCollegesJson: JSON.stringify(['IIT Kharagpur', 'IIT Roorkee', 'BITS Pilani', 'NIT Surathkal', 'IIIT Bangalore']),
      salaryMinINR: 800000,
      salaryMaxINR: 3400000,
      futureDemand: 'VERY_HIGH',
      automationExposure: 'LOW',
      sourceName: 'India Electronics and Semiconductor Association (IESA)',
      sourceUrl: 'https://www.iesaonline.org',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Aerospace & Spacecraft Systems Engineer',
      slug: 'aerospace-spacecraft-engineer',
      category: 'Engineering',
      stream: 'PCM',
      shortDescription: 'Develops rocket propulsion systems, satellites, orbital mechanics, and supersonic aerodynamics for ISRO and defence labs.',
      fullDescription: 'Aerospace engineers research, build, and test aircraft, rockets, drones, and spacecraft, calculating aerodynamic drag, thermal shielding, and guidance navigation.',
      responsibilitiesJson: JSON.stringify([
        'Simulate fluid dynamics (CFD) over airfoils and launch vehicle cowlings',
        'Design cryogenic or solid-propellant rocket rocket combustion chambers',
        'Model satellite orbital trajectories and attitude determination control systems (ADCS)'
      ]),
      requiredSubjectsJson: JSON.stringify(['Physics', 'Mathematics', 'Chemistry']),
      entryQualifications: 'B.Tech in Aerospace/Aeronautical Engineering from IIST, IITs, or accredited university',
      recommendedSkillsJson: JSON.stringify(['Aerodynamics & Thermodynamics', 'ANSYS Fluent', 'MATLAB/Simulink', 'Propulsion Systems']),
      entranceExamsJson: JSON.stringify(['JEE Advanced (Required for IIST Thiruvananthapuram)', 'JEE Main']),
      degreesJson: JSON.stringify(['B.Tech in Aerospace Engineering', 'Dual Degree in Astronomy & Space Engineering']),
      topCollegesJson: JSON.stringify(['Indian Institute of Space Science and Technology (IIST)', 'IIT Bombay', 'IIT Madras', 'IIT Kanpur']),
      salaryMinINR: 750000,
      salaryMaxINR: 2800000,
      futureDemand: 'HIGH',
      automationExposure: 'LOW',
      sourceName: 'ISRO Official Recruitment & IN-SPACe Industry Directorate',
      sourceUrl: 'https://www.isro.gov.in',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Electric Vehicle (EV) Powertrain Engineer',
      slug: 'ev-powertrain-engineer',
      category: 'Engineering',
      stream: 'PCM',
      shortDescription: 'Engineers lithium-ion battery management systems (BMS), high-voltage electric motors, and regenerative braking.',
      fullDescription: 'EV engineers transition mobility from fossil fuel combustion to clean electric propulsion, solving thermal runaway in battery packs and optimizing kilowatt-hour efficiency.',
      responsibilitiesJson: JSON.stringify([
        'Design thermal management liquid-cooling jackets for high-density lithium battery modules',
        'Program Battery Management System (BMS) state-of-charge (SoC) algorithms in C',
        'Optimize permanent magnet synchronous motor (PMSM) torque curves and inverters'
      ]),
      requiredSubjectsJson: JSON.stringify(['Physics', 'Mathematics', 'Chemistry']),
      entryQualifications: 'B.Tech in Electrical, Automobile, or Mechanical Engineering',
      recommendedSkillsJson: JSON.stringify(['Battery Chemistry & BMS', 'Electric Motors & Inverters', 'MATLAB Simulink', 'High Voltage Safety']),
      entranceExamsJson: JSON.stringify(['JEE Main', 'MHT CET', 'KCET']),
      degreesJson: JSON.stringify(['B.Tech in Electrical Engineering with EV Specialization', 'B.Tech in Automobile Engineering']),
      topCollegesJson: JSON.stringify(['IIT Madras', 'COEP Technological University Pune', 'VJTI Mumbai', 'Amrita University']),
      salaryMinINR: 650000,
      salaryMaxINR: 2500000,
      futureDemand: 'VERY_HIGH',
      automationExposure: 'LOW',
      sourceName: 'Society of Indian Automobile Manufacturers (SIAM)',
      sourceUrl: 'https://www.siam.in',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Biomedical Devices & Prosthetics Engineer',
      slug: 'biomedical-engineer',
      category: 'Engineering',
      stream: 'PCMB',
      shortDescription: 'Invents robotic prosthetics, MRI scanners, artificial heart valves, and wearable non-invasive health sensors.',
      fullDescription: 'Biomedical engineers bridge engineering principles with medical sciences to invent diagnostic instruments, implants, and surgical navigation equipment.',
      responsibilitiesJson: JSON.stringify([
        'Develop biocompatible medical implants and bionic prosthetic limbs',
        'Design signal acquisition hardware for EEG, ECG, and ultrasound transducers',
        'Verify compliance with medical device regulatory standards (CDSCO, FDA Class II/III)'
      ]),
      requiredSubjectsJson: JSON.stringify(['Physics', 'Chemistry', 'Mathematics', 'Biology']),
      entryQualifications: 'B.Tech in Biomedical Engineering or Bioengineering',
      recommendedSkillsJson: JSON.stringify(['Biomaterials', 'Biosensors & Signal Processing', 'CAD for Medical Implants', 'Human Anatomy Basics']),
      entranceExamsJson: JSON.stringify(['JEE Main', 'NEET UG (for select biomedical institutes)', 'State Engineering Exams']),
      degreesJson: JSON.stringify(['B.Tech in Biomedical Engineering', 'B.Tech in Biotechnology']),
      topCollegesJson: JSON.stringify(['IIT Hyderabad (Biomedical Lab)', 'Vellore Institute of Technology', 'Manipal University', 'SRM University']),
      salaryMinINR: 550000,
      salaryMaxINR: 2200000,
      futureDemand: 'HIGH',
      automationExposure: 'LOW',
      sourceName: 'Association of Indian Medical Device Industry (AiMeD)',
      sourceUrl: 'https://aimedindia.com',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Renewable Energy & Green Hydrogen Engineer',
      slug: 'renewable-energy-engineer',
      category: 'Engineering',
      stream: 'PCM',
      shortDescription: 'Plans utility-scale solar farms, offshore wind turbines, and industrial water electrolyzers for green hydrogen decarbonization.',
      fullDescription: 'Renewable Energy Engineers drive the clean energy transition, conducting grid-integration studies, photovoltaic efficiency research, and energy storage modeling.',
      responsibilitiesJson: JSON.stringify([
        'Perform solar irradiance and wind velocity resource assessments using PVsyst',
        'Design grid substation integration, high-capacity inverters, and battery storage (BESS)',
        'Conduct environmental impact assessments and levelized cost of electricity (LCOE) audits'
      ]),
      requiredSubjectsJson: JSON.stringify(['Physics', 'Mathematics', 'Chemistry']),
      entryQualifications: 'B.Tech in Electrical / Energy / Chemical Engineering',
      recommendedSkillsJson: JSON.stringify(['PVsyst Software', 'Power Systems & Grid Stability', 'Electrolyzer Chemistry', 'Thermodynamics']),
      entranceExamsJson: JSON.stringify(['JEE Main', 'JEE Advanced', 'State Engineering Tests']),
      degreesJson: JSON.stringify(['B.Tech in Energy Engineering', 'B.Tech in Electrical & Clean Energy']),
      topCollegesJson: JSON.stringify(['IIT Roorkee', 'IIT Bombay (Energy Science)', 'TERI School of Advanced Studies']),
      salaryMinINR: 600000,
      salaryMaxINR: 2400000,
      futureDemand: 'VERY_HIGH',
      automationExposure: 'LOW',
      sourceName: 'Ministry of New and Renewable Energy (MNRE) Reports',
      sourceUrl: 'https://mnre.gov.in',
      lastVerifiedDate: '2026-01-15'
    },

    // Medical, Healthcare & Life Sciences (13-20)
    {
      title: 'Medical Doctor & Surgeon (MBBS + MS/MD)',
      slug: 'medical-doctor-surgeon',
      category: 'Medical',
      stream: 'PCB',
      shortDescription: 'Diagnoses illnesses, performs complex surgical operations, and saves human lives through clinical medicine.',
      fullDescription: 'Physicians and Surgeons complete rigorous clinical training to treat human pathology, perform surgical interventions, and lead medical patient care teams.',
      responsibilitiesJson: JSON.stringify([
        'Perform physical examinations, clinical differential diagnosis, and emergency care',
        'Order and interpret blood assays, radiological imaging (CT/MRI), and biopsies',
        'Conduct operative surgeries and supervise post-operative ICU recovery'
      ]),
      requiredSubjectsJson: JSON.stringify(['Physics', 'Chemistry', 'Biology/Biotechnology', 'English']),
      entryQualifications: 'MBBS (5.5 years including mandatory 1-year rotatory internship) followed by NEET-PG (MD/MS)',
      recommendedSkillsJson: JSON.stringify(['Clinical Diagnosis', 'Surgical Dexterity', 'Patient Empathy', 'Pharmacology', 'Emergency Management']),
      entranceExamsJson: JSON.stringify(['NEET UG (National Eligibility cum Entrance Test)']),
      degreesJson: JSON.stringify(['MBBS (Bachelor of Medicine and Bachelor of Surgery)', 'MD/MS/DNB (Postgraduate)']),
      topCollegesJson: JSON.stringify(['AIIMS New Delhi', 'Christian Medical College (CMC) Vellore', 'KGMU Lucknow', 'JIPMER Puducherry', 'Maulana Azad Medical College (MAMC)']),
      salaryMinINR: 900000,
      salaryMaxINR: 4000000,
      futureDemand: 'VERY_HIGH',
      automationExposure: 'LOW',
      sourceName: 'National Medical Commission (NMC) Guidelines',
      sourceUrl: 'https://www.nmc.org.in',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Orthodontist & Dental Surgeon (BDS + MDS)',
      slug: 'dental-surgeon-orthodontist',
      category: 'Medical',
      stream: 'PCB',
      shortDescription: 'Corrects maxillofacial deformities, aligns teeth using invisible aligners/braces, and performs oral rehabilitative surgery.',
      fullDescription: 'Dental surgeons specialize in oral health, dental implants, cosmetic smiles, root canal therapies, and surgical corrections of jaw alignments.',
      responsibilitiesJson: JSON.stringify([
        'Treat dental caries, periodontitis, and impacted wisdom tooth extractions',
        'Plan 3D digital clear aligner treatments and install orthodontic braces',
        'Fabricate dental crowns, bridges, and osseointegrated titanium implants'
      ]),
      requiredSubjectsJson: JSON.stringify(['Physics', 'Chemistry', 'Biology']),
      entryQualifications: 'BDS (Bachelor of Dental Surgery - 5 years) followed by MDS in Orthodontics/Oral Surgery',
      recommendedSkillsJson: JSON.stringify(['Fine Manual Dexterity', 'Oral Radiology', 'Aesthetic Smile Design', 'Patient Communication']),
      entranceExamsJson: JSON.stringify(['NEET UG']),
      degreesJson: JSON.stringify(['BDS (Bachelor of Dental Surgery)', 'MDS (Master of Dental Surgery)']),
      topCollegesJson: JSON.stringify(['Manipal College of Dental Sciences', 'Maulana Azad Institute of Dental Sciences Delhi', 'Government Dental College Mumbai']),
      salaryMinINR: 500000,
      salaryMaxINR: 2200000,
      futureDemand: 'HIGH',
      automationExposure: 'LOW',
      sourceName: 'Dental Council of India (DCI)',
      sourceUrl: 'https://dciindia.gov.in',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Physiotherapist & Sports Rehabilitation Specialist (BPT)',
      slug: 'physiotherapist-sports-rehab',
      category: 'Healthcare',
      stream: 'PCB',
      shortDescription: 'Restores musculoskeletal mobility, manages chronic pain, and rehabilitates elite athletes recovering from ligament tears.',
      fullDescription: 'Physiotherapists use physical exercise therapy, electrotherapy, dry needling, and biomechanical posture retraining without pharmaceutical drugs.',
      responsibilitiesJson: JSON.stringify([
        'Assess muscle strength, joint range of motion, and gait abnormalities',
        'Design tailored exercise rehabilitation plans for post-stroke or sports injuries',
        'Administer ultrasound therapy, electrical muscle stimulation, and joint mobilization'
      ]),
      requiredSubjectsJson: JSON.stringify(['Physics', 'Chemistry', 'Biology']),
      entryQualifications: 'BPT (Bachelor of Physiotherapy - 4.5 years) + MPT for Sports/Neuro',
      recommendedSkillsJson: JSON.stringify(['Kinesiology & Biomechanics', 'Manual Therapy', 'Exercise Prescription', 'Athletic Taping']),
      entranceExamsJson: JSON.stringify(['NEET UG (in select states) or State Paramedical Entrance']),
      degreesJson: JSON.stringify(['BPT (Bachelor of Physiotherapy)', 'MPT (Master of Physiotherapy)']),
      topCollegesJson: JSON.stringify(['NIPMR Kerala', 'Seth GS Medical College (KEM) Mumbai', 'Manipal College of Health Professions', 'Apollo Physiotherapy College']),
      salaryMinINR: 450000,
      salaryMaxINR: 1800000,
      futureDemand: 'HIGH',
      automationExposure: 'LOW',
      sourceName: 'Indian Association of Physiotherapists (IAP)',
      sourceUrl: 'https://www.physiotherapyindia.org',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Clinical Pharmacist & Drug Discovery Scientist',
      slug: 'pharmacist-drug-discovery',
      category: 'Healthcare',
      stream: 'PCB',
      shortDescription: 'Formulates pharmaceutical medicines, runs multi-phase clinical drug trials, and audits hospital medication regimens.',
      fullDescription: 'Pharmacy graduates and Pharm.D doctors specialize in pharmaceutical chemistry, toxicology, pharmacokinetics, and clinical drug safety trials.',
      responsibilitiesJson: JSON.stringify([
        'Formulate tablets, injectable vaccines, and sustained-release liposomes',
        'Evaluate drug-drug interactions and adverse drug reactions in hospitalized patients',
        'Manage Phase I-IV regulatory clinical trials under ICH-GCP guidelines'
      ]),
      requiredSubjectsJson: JSON.stringify(['Physics', 'Chemistry', 'Biology/Mathematics']),
      entryQualifications: 'B.Pharm (4 years) or Pharm.D (6-year doctoral clinical pharmacy program)',
      recommendedSkillsJson: JSON.stringify(['Pharmacology & Toxicology', 'HPLC & Spectroscopy', 'Clinical Trial Documentation', 'Good Manufacturing Practices (GMP)']),
      entranceExamsJson: JSON.stringify(['GPAT', 'MHT CET Pharmacy', 'KCET', 'BITS HD']),
      degreesJson: JSON.stringify(['B.Pharm (Bachelor of Pharmacy)', 'Pharm.D (Doctor of Pharmacy)']),
      topCollegesJson: JSON.stringify(['Jamia Hamdard New Delhi', 'NIPER Mohali', 'BITS Pilani (Dept of Pharmacy)', 'Manipal College of Pharmaceutical Sciences']),
      salaryMinINR: 500000,
      salaryMaxINR: 2200000,
      futureDemand: 'HIGH',
      automationExposure: 'LOW',
      sourceName: 'Pharmacy Council of India (PCI) & NIRF Pharmacy Rankings',
      sourceUrl: 'https://www.pci.nic.in',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Critical Care & Global Registered Nurse (B.Sc Nursing)',
      slug: 'critical-care-nurse',
      category: 'Healthcare',
      stream: 'PCB',
      shortDescription: 'Provides frontline patient care, administers intravenous medications, and operates life-support ventilators in ICUs.',
      fullDescription: 'Professional registered nurses are the backbone of clinical healthcare, managing continuous patient monitoring, post-operative care, and global international hospital placement.',
      responsibilitiesJson: JSON.stringify([
        'Monitor vital signs, telemetry, arterial lines, and infusion pumps in ICUs',
        'Administer controlled medications and execute emergency resuscitation protocols',
        'Educate patients and families on post-discharge chronic illness management'
      ]),
      requiredSubjectsJson: JSON.stringify(['Physics', 'Chemistry', 'Biology', 'English']),
      entryQualifications: 'B.Sc Nursing (4 years) from an INC-recognized nursing college',
      recommendedSkillsJson: JSON.stringify(['ICU Protocols', 'IV Cannulation', 'Compassion & Resilience', 'Triage Assessment']),
      entranceExamsJson: JSON.stringify(['NEET UG (used by AIIMS, Military Nursing Services, JIPMER)', 'State Nursing CETs']),
      degreesJson: JSON.stringify(['B.Sc in Nursing (Basic)', 'M.Sc in Critical Care Nursing']),
      topCollegesJson: JSON.stringify(['AIIMS College of Nursing New Delhi', 'CMC Vellore College of Nursing', 'Armed Forces Medical College (AFMC) Pune']),
      salaryMinINR: 400000,
      salaryMaxINR: 1800000,
      futureDemand: 'VERY_HIGH',
      automationExposure: 'LOW',
      sourceName: 'Indian Nursing Council (INC) & WHO Global Nursing Report',
      sourceUrl: 'https://www.indiannursingcouncil.org',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Veterinary Doctor & Animal Surgeon (BVSc & AH)',
      slug: 'veterinary-doctor',
      category: 'Medical',
      stream: 'PCB',
      shortDescription: 'Diagnoses and operates on domestic pets, livestock, dairy herds, and wildlife animals in sanctuaries.',
      fullDescription: 'Veterinarians treat animals, preventing zoonotic pandemics (diseases jumping from animals to humans), performing orthopedic surgeries, and ensuring food security in animal husbandry.',
      responsibilitiesJson: JSON.stringify([
        'Examine and treat companion animals (dogs, cats) and farm livestock (cattle, horses)',
        'Perform soft tissue and orthopedic surgeries under general animal anesthesia',
        'Enforce epidemiological quarantine and vaccination against rabies, foot-and-mouth disease'
      ]),
      requiredSubjectsJson: JSON.stringify(['Physics', 'Chemistry', 'Biology', 'English']),
      entryQualifications: 'BVSc & AH (Bachelor of Veterinary Science & Animal Husbandry - 5.5 years)',
      recommendedSkillsJson: JSON.stringify(['Animal Handling & Empathy', 'Veterinary Surgery', 'Zoonotic Pathology', 'Diagnostic Ultrasound']),
      entranceExamsJson: JSON.stringify(['NEET UG (used for 15% All India Quota through VCI)']),
      degreesJson: JSON.stringify(['BVSc & AH (Bachelor of Veterinary Science & Animal Husbandry)']),
      topCollegesJson: JSON.stringify(['Indian Veterinary Research Institute (IVRI) Bareilly', 'GADVASU Ludhiana', 'TANUVAS Chennai', 'Bombay Veterinary College']),
      salaryMinINR: 550000,
      salaryMaxINR: 2000000,
      futureDemand: 'HIGH',
      automationExposure: 'LOW',
      sourceName: 'Veterinary Council of India (VCI)',
      sourceUrl: 'https://vci.dadf.gov.in',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Ayurvedic Medical Doctor (BAMS)',
      slug: 'ayurvedic-doctor-bams',
      category: 'Medical',
      stream: 'PCB',
      shortDescription: 'Practices holistic herbal medicine, Panchakarma rejuvenation therapy, and lifestyle wellness rooted in classical Indian medicine.',
      fullDescription: 'BAMS doctors integrate ancient Ayurvedic diagnostic methodologies (Nadi Pariksha) with modern anatomy, pathology, and standardized pharmacology.',
      responsibilitiesJson: JSON.stringify([
        'Conduct Ayurvedic pulse diagnosis (Nadi Pariksha) and Prakriti constitutional analysis',
        'Prescribe standardized herbal extracts, classical formulations, and dietary lifestyle corrections',
        'Supervise Panchakarma detoxification and therapeutic pancha-karma treatments'
      ]),
      requiredSubjectsJson: JSON.stringify(['Physics', 'Chemistry', 'Biology', 'Sanskrit (helpful but optional in 12th)']),
      entryQualifications: 'BAMS (Bachelor of Ayurvedic Medicine & Surgery - 5.5 years) recognized by NCISM',
      recommendedSkillsJson: JSON.stringify(['Nadi Pariksha', 'Ayurvedic Pharmacology (Dravyaguna)', 'Panchakarma Protocol', 'Holistic Nutrition']),
      entranceExamsJson: JSON.stringify(['NEET UG (Central AYUSH Admissions AACCC)']),
      degreesJson: JSON.stringify(['BAMS (Bachelor of Ayurvedic Medicine and Surgery)', 'MD/MS (Ayurveda)']),
      topCollegesJson: JSON.stringify(['Institute of Teaching & Research in Ayurveda (ITRA) Jamnagar', 'National Institute of Ayurveda (NIA) Jaipur', 'Banaras Hindu University (BHU - Faculty of Ayurveda)']),
      salaryMinINR: 480000,
      salaryMaxINR: 2000000,
      futureDemand: 'HIGH',
      automationExposure: 'LOW',
      sourceName: 'Ministry of AYUSH Government of India',
      sourceUrl: 'https://ayush.gov.in',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Genetic Counselor & Genomic Biologist',
      slug: 'genetic-counselor',
      category: 'Medical',
      stream: 'PCB',
      shortDescription: 'Analyzes DNA sequence variations, interprets inherited hereditary risks, and counsels expectant parents on genetic disorders.',
      fullDescription: 'Genetic counselors evaluate whole exome sequencing data to help families understand congenital health risks, hereditary cancers, and rare chromosomal conditions.',
      responsibilitiesJson: JSON.stringify([
        'Interpret next-generation sequencing (NGS) gene panels and karyotype reports',
        'Construct multi-generational pedigree family trees to assess disease probability',
        'Deliver empathetic counseling to couples regarding prenatal testing and reproductive options'
      ]),
      requiredSubjectsJson: JSON.stringify(['Biology', 'Chemistry', 'English', 'Psychology']),
      entryQualifications: 'B.Sc in Genetics / Life Sciences followed by M.Sc in Genetic Counseling',
      recommendedSkillsJson: JSON.stringify(['Next-Gen Sequencing (NGS)', 'Pedigree Analysis', 'Empathetic Patient Counseling', 'Bioethics']),
      entranceExamsJson: JSON.stringify(['CUET PG', 'University Specific Entrances']),
      degreesJson: JSON.stringify(['M.Sc in Genetic Counseling', 'B.Sc (Hons) in Genetics & Molecular Biology']),
      topCollegesJson: JSON.stringify(['KMC Manipal', 'Osmania University Hyderabad', 'St. John\'s Research Institute Bangalore']),
      salaryMinINR: 600000,
      salaryMaxINR: 2200000,
      futureDemand: 'VERY_HIGH',
      automationExposure: 'LOW',
      sourceName: 'Board of Genetic Counseling India (BGCI)',
      sourceUrl: 'https://bgesi.org',
      lastVerifiedDate: '2026-01-15'
    },

    // Commerce, Finance, Economics & Business (21-28)
    {
      title: 'Chartered Accountant (ICAI CA)',
      slug: 'chartered-accountant-icai',
      category: 'Commerce',
      stream: 'COMMERCE',
      shortDescription: 'Audits corporate balance sheets, manages statutory direct/indirect taxation (GST), and advises boards on mergers and financial health.',
      fullDescription: 'Chartered Accountants certified by the Institute of Chartered Accountants of India (ICAI) are the ultimate legal authorities for statutory financial auditing, corporate forensic accounting, and tax compliance in India.',
      responsibilitiesJson: JSON.stringify([
        'Conduct statutory, internal, and forensic financial audits of listed and private companies',
        'Structure corporate direct tax, international transfer pricing, and GST filings',
        'Advise corporate boards on working capital management, debt refinancing, and mergers'
      ]),
      requiredSubjectsJson: JSON.stringify(['Accountancy', 'Economics', 'Business Studies', 'Mathematics (Recommended)']),
      entryQualifications: 'Clearing ICAI CA Foundation (after 12th), CA Intermediate, 2-year Articleship, and CA Final',
      recommendedSkillsJson: JSON.stringify(['Auditing & Assurance', 'Indian Accounting Standards (Ind AS)', 'Direct & Indirect Tax Laws', 'Financial Modeling']),
      entranceExamsJson: JSON.stringify(['CA Foundation Exam (Conducted thrice a year by ICAI)']),
      degreesJson: JSON.stringify(['Chartered Accountant (ICAI Certification)', 'B.Com (Hons) simultaneously']),
      topCollegesJson: JSON.stringify(['ICAI Institute (Direct Membership)', 'SRCC Delhi (for B.Com Hons parallel)', 'St. Xavier\'s Kolkata']),
      salaryMinINR: 850000,
      salaryMaxINR: 3500000,
      futureDemand: 'HIGH',
      automationExposure: 'LOW',
      sourceName: 'Institute of Chartered Accountants of India (ICAI) Campus Placement Reports',
      sourceUrl: 'https://www.icai.org',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Investment Banker & Private Equity Associate',
      slug: 'investment-banker',
      category: 'Commerce',
      stream: 'COMMERCE',
      shortDescription: 'Raises billions in capital through Initial Public Offerings (IPOs), models merger valuations, and structures corporate acquisitions.',
      fullDescription: 'Investment Bankers advise corporate clients, venture funds, and governments on major capital events: issuing shares on stock exchanges (IPO), private equity buyouts, and multi-billion-dollar corporate acquisitions.',
      responsibilitiesJson: JSON.stringify([
        'Build detailed discounted cash flow (DCF) and leveraged buyout (LBO) financial models in Excel',
        'Draft confidential information memorandums (CIM) and pitch books for institutional investors',
        'Coordinate legal due diligence, debt syndication, and stock exchange regulatory compliance'
      ]),
      requiredSubjectsJson: JSON.stringify(['Mathematics/Applied Math', 'Economics', 'Accountancy']),
      entryQualifications: 'B.Com (Hons) / BBA / B.Tech from tier-1 college followed by MBA from IIMs or CFA charter',
      recommendedSkillsJson: JSON.stringify(['Financial Modeling (DCF/LBO)', 'Corporate Valuation', 'Pitch Book Creation', 'Due Diligence']),
      entranceExamsJson: JSON.stringify(['CAT (for IIM MBA)', 'CUET UG (for SRCC/Shaheed Sukhdev)', 'IPMAT']),
      degreesJson: JSON.stringify(['BBA in Financial & Investment Analysis (BFIA)', 'B.Com (Hons)', 'MBA Finance']),
      topCollegesJson: JSON.stringify(['Shaheed Sukhdev College of Business Studies (SSCBS) Delhi', 'SRCC Delhi', 'IIM Ahmedabad', 'IIM Bangalore', 'IIM Calcutta']),
      salaryMinINR: 1200000,
      salaryMaxINR: 4500000,
      futureDemand: 'HIGH',
      automationExposure: 'MODERATE',
      sourceName: 'IIM Placement Audit Reports & CFA Institute India',
      sourceUrl: 'https://www.cfainstitute.org',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Actuary & Mathematical Risk Scientist (IAI)',
      slug: 'actuary-risk-scientist',
      category: 'Commerce',
      stream: 'COMMERCE',
      shortDescription: 'Applies advanced probability, mortality tables, and calculus to price insurance policies and calculate pension liabilities.',
      fullDescription: 'Actuaries use mathematical modeling and statistical probability to calculate the financial cost of future uncertain risks, such as life insurance, natural catastrophe damages, and pension funds.',
      responsibilitiesJson: JSON.stringify([
        'Calculate life tables, mortality risks, and claims reserves for insurance corporations',
        'Model catastrophic weather risk reinsurance and health insurance premiums',
        'Evaluate pension fund liabilities and advise corporate treasuries on solvencies'
      ]),
      requiredSubjectsJson: JSON.stringify(['Mathematics/Applied Mathematics', 'Statistics', 'Economics']),
      entryQualifications: 'Passing Actuarial Common Entrance Test (ACET) and examinations of the Institute of Actuaries of India (IAI)',
      recommendedSkillsJson: JSON.stringify(['Actuarial Mathematics', 'Probability & Statistics', 'R/Python for Stochastic Modeling', 'Financial Economics']),
      entranceExamsJson: JSON.stringify(['ACET (Actuarial Common Entrance Test)', 'CUET UG']),
      degreesJson: JSON.stringify(['B.Sc in Actuarial Science', 'B.Sc in Mathematics/Statistics with Actuarial Papers']),
      topCollegesJson: JSON.stringify(['Institute of Actuaries of India (IAI Mumbai)', 'St. Xavier\'s College Mumbai', 'Christ University Bangalore', 'Amity School of Insurance']),
      salaryMinINR: 900000,
      salaryMaxINR: 4000000,
      futureDemand: 'VERY_HIGH',
      automationExposure: 'LOW',
      sourceName: 'Institute of Actuaries of India (IAI)',
      sourceUrl: 'https://www.actuariesindia.org',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Management Consultant & Corporate Strategist',
      slug: 'management-consultant',
      category: 'Commerce',
      stream: 'ANY',
      shortDescription: 'Solves complex executive bottlenecks, reorganizes operations, and leads digital transformation for Fortune 500 enterprises.',
      fullDescription: 'Management Consultants at firms like McKinsey, BCG, Bain, and Big 4 help CEOs tackle their most urgent business problems: entering new international markets, improving profitability, and driving organizational change.',
      responsibilitiesJson: JSON.stringify([
        'Conduct hypothesis-driven quantitative data analysis and stakeholder interviews',
        'Synthesize findings into strategic frameworks and slide presentations for C-suite leaders',
        'Track turnaround performance metrics and lead post-merger integration teams'
      ]),
      requiredSubjectsJson: JSON.stringify(['Any stream; Mathematics or Economics strongly advantageous']),
      entryQualifications: 'B.Tech/B.A./B.Com from top-tier university followed by MBA from top-tier business school',
      recommendedSkillsJson: JSON.stringify(['Structured Problem Solving (MECE)', 'Business Case Analysis', 'Executive Storytelling', 'Financial Acumen']),
      entranceExamsJson: JSON.stringify(['CAT', 'GMAT', 'CUET UG']),
      degreesJson: JSON.stringify(['BBA/B.Com/B.Tech followed by PGP/MBA']),
      topCollegesJson: JSON.stringify(['IIM Ahmedabad', 'IIM Bangalore', 'ISB Hyderabad/Mohali', 'St. Stephen\'s College Delhi', 'LSR Delhi']),
      salaryMinINR: 1100000,
      salaryMaxINR: 4200000,
      futureDemand: 'HIGH',
      automationExposure: 'LOW',
      sourceName: 'Consulting Industry Compensation Benchmarks 2025',
      sourceUrl: 'https://www.vault.com',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Corporate Secretary & Governance Officer (ICSI CS)',
      slug: 'corporate-company-secretary',
      category: 'Commerce',
      stream: 'COMMERCE',
      shortDescription: 'Ensures corporate board compliance with the Companies Act, SEBI LODR rules, and manages shareholder voting relations.',
      fullDescription: 'Company Secretaries certified by ICSI serve as primary corporate governance advisors to the Board of Directors, ensuring listed corporations operate within legal and ethical statutory mandates.',
      responsibilitiesJson: JSON.stringify([
        'Coordinate Board of Directors meetings, AGM resolutions, and minutes of proceedings',
        'Ensure strict adherence to SEBI listing obligations and corporate disclosures',
        'Manage intellectual property filings, secretarial audits, and corporate restructuring filings'
      ]),
      requiredSubjectsJson: JSON.stringify(['Business Studies', 'Accountancy', 'Economics']),
      entryQualifications: 'CSEET (CS Executive Entrance Test) + CS Executive + CS Professional stages conducted by ICSI',
      recommendedSkillsJson: JSON.stringify(['Corporate Laws (Companies Act 2013)', 'SEBI Regulations', 'Board Meeting Governance', 'Secretarial Auditing']),
      entranceExamsJson: JSON.stringify(['CSEET (Conducted four times a year by ICSI)']),
      degreesJson: JSON.stringify(['Company Secretary (ICSI)', 'LL.B (Dual degree highly recommended)']),
      topCollegesJson: JSON.stringify(['Institute of Company Secretaries of India (ICSI HQ New Delhi)', 'Delhi University Law Centre']),
      salaryMinINR: 600000,
      salaryMaxINR: 2500000,
      futureDemand: 'HIGH',
      automationExposure: 'LOW',
      sourceName: 'Institute of Company Secretaries of India (ICSI)',
      sourceUrl: 'https://www.icsi.edu',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Macroeconomist & Public Policy Analyst',
      slug: 'macroeconomist-policy-analyst',
      category: 'Commerce',
      stream: 'COMMERCE',
      shortDescription: 'Studies inflation trends, fiscal deficit, monetary policy, and writes economic impact assessments for government and think tanks.',
      fullDescription: 'Economists analyze national production, employment, trade tariffs, and consumer expenditure patterns to advise the Reserve Bank of India, NITI Aayog, and international development agencies.',
      responsibilitiesJson: JSON.stringify([
        'Build econometric time-series models (ARIMA, Vector Autoregression) to forecast GDP and inflation',
        'Evaluate legislative policy drafts for poverty alleviation, green subsidies, and labor market reforms',
        'Draft whitepapers and economic survey chapters for central and state governments'
      ]),
      requiredSubjectsJson: JSON.stringify(['Economics', 'Mathematics/Applied Mathematics']),
      entryQualifications: 'B.A. (Hons) in Economics followed by M.A. in Economics or Ph.D.',
      recommendedSkillsJson: JSON.stringify(['Econometrics', 'STATA / R', 'Macroeconomic Theory', 'Policy Writing', 'Data Synthesis']),
      entranceExamsJson: JSON.stringify(['CUET UG', 'CUET PG (for Delhi School of Economics / JNU)', 'IES (Indian Economic Service Exam)']),
      degreesJson: JSON.stringify(['B.A. (Hons) in Economics', 'M.Sc in Economics']),
      topCollegesJson: JSON.stringify(['Delhi School of Economics (DSE)', 'St. Stephen\'s College Delhi', 'Jawaharlal Nehru University (JNU)', 'Madras School of Economics']),
      salaryMinINR: 700000,
      salaryMaxINR: 2800000,
      futureDemand: 'HIGH',
      automationExposure: 'LOW',
      sourceName: 'Reserve Bank of India (RBI) & NITI Aayog Research Fellowship Reports',
      sourceUrl: 'https://www.rbi.org.in',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Digital Marketing Strategist & Growth Hacker',
      slug: 'digital-marketing-strategist',
      category: 'Commerce',
      stream: 'ANY',
      shortDescription: 'Scales customer acquisition through performance marketing, programmatic SEO, conversion rate optimization, and brand storytelling.',
      fullDescription: 'Growth Marketers combine creative consumer psychology with quantitative attribution modeling to acquire millions of users for startups and global consumer brands.',
      responsibilitiesJson: JSON.stringify([
        'Manage multi-crore advertising budgets across Google Ads, Meta, and Programmatic networks',
        'Run A/B conversion tests on landing pages to optimize customer acquisition cost (CAC)',
        'Engineer viral referral loops and retention email lifecycle sequences'
      ]),
      requiredSubjectsJson: JSON.stringify(['Any stream; Business Studies, English, or Computer Applications helpful']),
      entryQualifications: 'BBA / B.Com / B.A. Media with verified performance marketing portfolio',
      recommendedSkillsJson: JSON.stringify(['Performance Ad Buying', 'Google Analytics 4', 'A/B Testing & Funnels', 'Copywriting & Content Strategy']),
      entranceExamsJson: JSON.stringify(['CUET UG', 'IPMAT', 'SET (Symbiosis)']),
      degreesJson: JSON.stringify(['BBA in Marketing & Digital Media', 'B.Sc in Digital Communication']),
      topCollegesJson: JSON.stringify(['NMIMS Mumbai', 'Symbiosis Centre for Management Studies (SCMS) Pune', 'Christ University Bangalore']),
      salaryMinINR: 500000,
      salaryMaxINR: 2400000,
      futureDemand: 'VERY_HIGH',
      automationExposure: 'MODERATE',
      sourceName: 'IAMAI (Internet and Mobile Association of India) Digital Commerce Report',
      sourceUrl: 'https://www.iamai.in',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Supply Chain & Logistics Operations Manager',
      slug: 'supply-chain-logistics-manager',
      category: 'Commerce',
      stream: 'COMMERCE',
      shortDescription: 'Orchestrates nationwide freight, warehousing fulfillment, customs clearing, and last-mile deliveries for e-commerce giants.',
      fullDescription: 'Supply chain leaders manage the complex physical movement of goods from manufacturing plants to consumer doorsteps, balancing fuel costs, warehouse robotics, and delivery SLAs.',
      responsibilitiesJson: JSON.stringify([
        'Optimize multi-hub warehouse inventory distribution and freight route planning',
        'Negotiate contracts with shipping carriers, port terminal authorities, and 3PL partners',
        'Implement automated barcode scanning and RFID tracking across the supply chain network'
      ]),
      requiredSubjectsJson: JSON.stringify(['Mathematics/Applied Math', 'Commerce or Science']),
      entryQualifications: 'BBA in Logistics & Supply Chain or B.Tech followed by MBA in Operations',
      recommendedSkillsJson: JSON.stringify(['ERP Systems (SAP/Oracle)', 'Inventory Optimization', 'Six Sigma Quality', 'Fleet Management']),
      entranceExamsJson: JSON.stringify(['CUET UG', 'CAT (for MBA Operations)']),
      degreesJson: JSON.stringify(['BBA in Supply Chain Management', 'MBA in Logistics & Operations']),
      topCollegesJson: JSON.stringify(['NITIE (IIM Mumbai)', 'SPJIMR Mumbai', 'Symbiosis Institute of Operations Management']),
      salaryMinINR: 650000,
      salaryMaxINR: 2600000,
      futureDemand: 'HIGH',
      automationExposure: 'LOW',
      sourceName: 'Logistics Sector Skill Council (LSC) India',
      sourceUrl: 'https://lsc-india.com',
      lastVerifiedDate: '2026-01-15'
    },

    // Law, Civil Services & Humanities (29-36)
    {
      title: 'Corporate Lawyer & M&A Legal Counsel',
      slug: 'corporate-lawyer',
      category: 'Law',
      stream: 'ANY',
      shortDescription: 'Drafts cross-border contracts, structures venture capital investments, and ensures compliance with Indian corporate jurisprudence.',
      fullDescription: 'Corporate lawyers work in premier law firms (like CAM, SAM, AZB, Trilegal) or as in-house counsel, negotiating shareholder agreements, IPO prospectuses, and cross-border commercial transactions.',
      responsibilitiesJson: JSON.stringify([
        'Draft and negotiate Share Purchase Agreements (SPA) and Joint Venture contracts',
        'Conduct rigorous legal due diligence on corporate assets and intellectual property',
        'Represent corporate entities before the National Company Law Tribunal (NCLT) and SEBI'
      ]),
      requiredSubjectsJson: JSON.stringify(['Any stream in Class 12; English, Legal Studies, or Humanities helpful']),
      entryQualifications: '5-Year Integrated B.A. LL.B (Hons) or BBA LL.B (Hons) from a recognized National Law University',
      recommendedSkillsJson: JSON.stringify(['Contract Drafting & Review', 'Commercial Negotiation', 'Legal Research (Manupatra/SCC)', 'Corporate Law']),
      entranceExamsJson: JSON.stringify(['CLAT (Common Law Admission Test)', 'AILET (NLU Delhi Entrance)']),
      degreesJson: JSON.stringify(['B.A. LL.B (Hons) - 5 Years Integrated', 'BBA LL.B (Hons) - 5 Years Integrated']),
      topCollegesJson: JSON.stringify(['NLSIU Bangalore', 'NALSAR Hyderabad', 'WBNUJS Kolkata', 'NLU Delhi', 'NLU Jodhpur']),
      salaryMinINR: 1200000,
      salaryMaxINR: 4000000,
      futureDemand: 'HIGH',
      automationExposure: 'LOW',
      sourceName: 'Bar Council of India (BCI) & NLU Consolidated Placement Audits',
      sourceUrl: 'https://www.barcouncilofindia.org',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Litigation Advocate & Criminal Defense Lawyer',
      slug: 'litigation-advocate',
      category: 'Law',
      stream: 'ANY',
      shortDescription: 'Argues cases before High Courts and the Supreme Court of India, defending citizen constitutional rights and civil disputes.',
      fullDescription: 'Litigation advocates master courtroom advocacy, cross-examination, and constitutional interpretation, fighting civil disputes, property litigations, and criminal defense trials.',
      responsibilitiesJson: JSON.stringify([
        'Draft writ petitions, special leave petitions (SLP), bail applications, and plaints',
        'Conduct oral courtroom arguments and witness cross-examinations before judges',
        'Advise clients on evidentiary strategy and dispute settlement mediation'
      ]),
      requiredSubjectsJson: JSON.stringify(['Any stream; strong reading and analytical argumentation skills']),
      entryQualifications: '5-Year Integrated LL.B or 3-Year LL.B after graduation, enrolled with State Bar Council and passing AIBE',
      recommendedSkillsJson: JSON.stringify(['Courtroom Oratory', 'Cross Examination', 'Constitutional Law', 'Brief Drafting', 'Case Law Precedents']),
      entranceExamsJson: JSON.stringify(['CLAT', 'CUET PG (for DU Faculty of Law)', 'MHCET Law']),
      degreesJson: JSON.stringify(['B.A. LL.B (Hons)', 'LL.B (Bachelor of Laws - 3 Years)']),
      topCollegesJson: JSON.stringify(['Faculty of Law University of Delhi', 'Government Law College (GLC) Mumbai', 'ILIS Pune', 'NLSIU Bangalore']),
      salaryMinINR: 450000,
      salaryMaxINR: 3000000,
      futureDemand: 'HIGH',
      automationExposure: 'LOW',
      sourceName: 'Bar Council of India (BCI)',
      sourceUrl: 'https://www.barcouncilofindia.org',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Civil Services Officer (IAS / IPS / IFS)',
      slug: 'civil-services-ias-ips',
      category: 'Humanities',
      stream: 'ANY',
      shortDescription: 'Administers entire districts, enforces law and order, and represents India diplomatically across global embassies.',
      fullDescription: 'Selected through the fiercely competitive UPSC Civil Services Examination, officers of the Indian Administrative Service (IAS), Police (IPS), and Foreign Service (IFS) steer the governance of India.',
      responsibilitiesJson: JSON.stringify([
        'Oversee district revenue administration, disaster management, and public welfare execution',
        'Direct law and order maintenance, crime detection, and police force leadership (IPS)',
        'Negotiate bilateral treaties and protect Indian national interests in foreign missions (IFS)'
      ]),
      requiredSubjectsJson: JSON.stringify(['Any graduation degree from a recognized university']),
      entryQualifications: 'Bachelor\'s degree in any discipline + clearing the 3-stage UPSC Civil Services Examination (Prelims, Mains, Interview)',
      recommendedSkillsJson: JSON.stringify(['Comprehensive General Knowledge', 'Public Administration Ethics', 'Critical Essay Writing', 'Crisis Decision Making']),
      entranceExamsJson: JSON.stringify(['UPSC Civil Services Examination (CSE)']),
      degreesJson: JSON.stringify(['Any Bachelor\'s Degree (B.A., B.Tech, B.Com, MBBS, B.Sc)']),
      topCollegesJson: JSON.stringify(['Lal Bahadur Shastri National Academy of Administration (LBSNAA Mussoorie - Post Selection)']),
      salaryMinINR: 750000,
      salaryMaxINR: 2500000,
      futureDemand: 'HIGH',
      automationExposure: 'LOW',
      sourceName: 'Union Public Service Commission (UPSC) Annual Reports',
      sourceUrl: 'https://www.upsc.gov.in',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Clinical Psychologist & Mental Health Psychotherapist',
      slug: 'clinical-psychologist',
      category: 'Humanities',
      stream: 'ANY',
      shortDescription: 'Administers psychometric testing, conducts cognitive behavioral therapy (CBT), and treats emotional and behavioral conditions.',
      fullDescription: 'Clinical Psychologists licensed by the Rehabilitation Council of India (RCI) diagnose mental health conditions, provide evidence-based psychotherapy, and design behavioral interventions.',
      responsibilitiesJson: JSON.stringify([
        'Conduct standardized diagnostic psychometric batteries (IQ, personality, neuropsychological)',
        'Provide psychotherapy (CBT, ACT, DBT) for anxiety, depression, and trauma recovery',
        'Collaborate with psychiatrists in multidisciplinary hospital mental health wards'
      ]),
      requiredSubjectsJson: JSON.stringify(['Psychology/Humanities/Science (Open to all streams)']),
      entryQualifications: 'B.A./B.Sc in Psychology + M.A./M.Sc in Clinical Psychology + M.Phil/Psy.D in Clinical Psychology (RCI Licensed)',
      recommendedSkillsJson: JSON.stringify(['Active Empathy & Listening', 'Psychometric Assessment', 'Cognitive Behavioral Therapy (CBT)', 'Diagnostic Formulations']),
      entranceExamsJson: JSON.stringify(['CUET UG', 'CUET PG', 'NIMHANS Entrance Examination']),
      degreesJson: JSON.stringify(['B.A. (Hons) in Psychology', 'M.A./M.Sc in Clinical Psychology', 'M.Phil in Clinical Psychology']),
      topCollegesJson: JSON.stringify(['National Institute of Mental Health and Neuro Sciences (NIMHANS) Bangalore', 'Lady Shri Ram College (LSR) Delhi', 'TISS Mumbai', 'Christ University']),
      salaryMinINR: 500000,
      salaryMaxINR: 2000000,
      futureDemand: 'VERY_HIGH',
      automationExposure: 'LOW',
      sourceName: 'Rehabilitation Council of India (RCI) & National Mental Health Survey',
      sourceUrl: 'https://rehabcouncil.nic.in',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Diplomat & International Relations Specialist',
      slug: 'diplomat-international-relations',
      category: 'Humanities',
      stream: 'ANY',
      shortDescription: 'Represents India at the United Nations, drafts geopolitical treaties, and fosters bilateral economic partnerships.',
      fullDescription: 'Foreign service diplomats and international policy researchers analyze global geopolitical dynamics, bilateral security treaties, cross-border refugee laws, and international trade pacts.',
      responsibilitiesJson: JSON.stringify([
        'Negotiate multilateral agreements at the UN, G20, BRICS, and WTO summits',
        'Protect Indian citizens living abroad and assist consular visa operations',
        'Author confidential intelligence briefs on geopolitical tensions and trade shifts'
      ]),
      requiredSubjectsJson: JSON.stringify(['Political Science', 'History', 'International Relations', 'Foreign Languages']),
      entryQualifications: 'Graduation in any discipline + UPSC CSE for Indian Foreign Service (IFS) or M.A. in International Relations',
      recommendedSkillsJson: JSON.stringify(['Diplomatic Protocol', 'Geopolitical Analysis', 'Cross-Cultural Fluency', 'Bilingual Competency']),
      entranceExamsJson: JSON.stringify(['UPSC Civil Services Examination', 'CUET PG (for JNU SIS)']),
      degreesJson: JSON.stringify(['B.A. in Political Science', 'M.A. in International Relations & Politics']),
      topCollegesJson: JSON.stringify(['School of International Studies (SIS) JNU New Delhi', 'St. Stephen\'s College Delhi', 'Ashoka University Sonipat']),
      salaryMinINR: 800000,
      salaryMaxINR: 2800000,
      futureDemand: 'HIGH',
      automationExposure: 'LOW',
      sourceName: 'Ministry of External Affairs (MEA) Government of India',
      sourceUrl: 'https://www.mea.gov.in',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Investigative Journalist & Digital Media Producer',
      slug: 'investigative-journalist',
      category: 'Humanities',
      stream: 'ANY',
      shortDescription: 'Uncovers public interest corruption, verifies digital disinformation, and produces long-form video documentaries.',
      fullDescription: 'Journalists investigate complex systemic issues, verify facts against misinformation, and broadcast stories through broadcast television, digital publications, and investigative podcasts.',
      responsibilitiesJson: JSON.stringify([
        'File Right to Information (RTI) queries and analyze public procurement records',
        'Interview whistleblowers and cross-verify secondary evidence',
        'Write long-form articles, shoot field video footage, and anchor broadcast reports'
      ]),
      requiredSubjectsJson: JSON.stringify(['English/Languages', 'Political Science', 'Mass Communication']),
      entryQualifications: 'B.A. in Journalism / Mass Communication or English Literature followed by PG Diploma',
      recommendedSkillsJson: JSON.stringify(['Investigative Reporting', 'Media Ethics & Defamation Law', 'Video Editing (Premiere Pro)', 'Data Journalism']),
      entranceExamsJson: JSON.stringify(['IIMC Entrance Exam', 'ACJ Entrance Exam', 'CUET UG']),
      degreesJson: JSON.stringify(['B.A. in Journalism and Mass Communication (BJMC)', 'Post Graduate Diploma in Journalism']),
      topCollegesJson: JSON.stringify(['Indian Institute of Mass Communication (IIMC) New Delhi', 'Asian College of Journalism (ACJ) Chennai', 'Symbiosis Institute of Media & Communication (SIMC) Pune']),
      salaryMinINR: 450000,
      salaryMaxINR: 2200000,
      futureDemand: 'MODERATE',
      automationExposure: 'MODERATE',
      sourceName: 'Press Council of India (PCI)',
      sourceUrl: 'https://presscouncil.nic.in',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Social Anthropologist & Heritage Conservationist',
      slug: 'anthropologist-heritage-conservation',
      category: 'Humanities',
      stream: 'HUMANITIES',
      shortDescription: 'Preserves ancient monuments, documents indigenous folklore, and advises cultural tourism and ethnographic policies.',
      fullDescription: 'Anthropologists study human evolutionary cultures, tribal rituals, archaeological monuments, and sociological transformations across millennia.',
      responsibilitiesJson: JSON.stringify([
        'Conduct field ethnographic research among indigenous and rural communities',
        'Supervise archaeological conservation of ancient stone structures with ASI',
        'Curate national museum exhibits and archive endangered oral languages'
      ]),
      requiredSubjectsJson: JSON.stringify(['History', 'Sociology', 'Anthropology']),
      entryQualifications: 'B.A. in History/Sociology/Anthropology followed by M.A. and Ph.D.',
      recommendedSkillsJson: JSON.stringify(['Field Ethnography', 'Archival Research', 'Material Culture Conservation', 'Qualitative Interviewing']),
      entranceExamsJson: JSON.stringify(['CUET UG', 'CUET PG', 'UGC NET']),
      degreesJson: JSON.stringify(['B.A. in Anthropology', 'M.A. in Heritage Management']),
      topCollegesJson: JSON.stringify(['University of Delhi (Dept of Anthropology)', 'National Museum Institute New Delhi', 'Visva-Bharati Shantiniketan']),
      salaryMinINR: 450000,
      salaryMaxINR: 1800000,
      futureDemand: 'MODERATE',
      automationExposure: 'LOW',
      sourceName: 'Archaeological Survey of India (ASI) & Anthropological Survey of India',
      sourceUrl: 'https://asi.nic.in',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Corporate Social Responsibility (CSR) & ESG Director',
      slug: 'csr-esg-director',
      category: 'Humanities',
      stream: 'ANY',
      shortDescription: 'Directs statutory corporate 2% CSR budgets, tracks carbon emissions, and ensures ethical environmental governance.',
      fullDescription: 'ESG and CSR leaders steer corporate sustainability initiatives, aligning corporate capital with renewable transition, gender equity, clean water, and village education.',
      responsibilitiesJson: JSON.stringify([
        'Deploy mandatory CSR budgets under Section 135 of the Indian Companies Act',
        'Audit greenhouse gas emissions (Scope 1, 2, 3) and publish annual BRSR sustainability reports',
        'Partner with grassroots NGOs to measure real-world community social return on investment (SROI)'
      ]),
      requiredSubjectsJson: JSON.stringify(['Any stream; Environmental Studies or Social Work advantageous']),
      entryQualifications: 'Master of Social Work (MSW) or MBA in Sustainability / Public Policy',
      recommendedSkillsJson: JSON.stringify(['ESG Reporting (GRI/BRSR)', 'Social Impact Assessment', 'NGO Partnership Management', 'Sustainability Auditing']),
      entranceExamsJson: JSON.stringify(['TISSNET / CUET PG', 'CAT (for MBA Sustainability)']),
      degreesJson: JSON.stringify(['M.A. in Social Work (MSW)', 'MBA in Sustainability Management']),
      topCollegesJson: JSON.stringify(['Tata Institute of Social Sciences (TISS) Mumbai', 'Xavier Institute of Social Service (XISS) Ranchi', 'IIM Lucknow (SM Program)']),
      salaryMinINR: 750000,
      salaryMaxINR: 2800000,
      futureDemand: 'VERY_HIGH',
      automationExposure: 'LOW',
      sourceName: 'Ministry of Corporate Affairs (MCA) CSR Portal',
      sourceUrl: 'https://www.csr.gov.in',
      lastVerifiedDate: '2026-01-15'
    },

    // Design, Architecture & Creative Arts (37-43)
    {
      title: 'Architect & Sustainable Urban Planner (B.Arch)',
      slug: 'architect-urban-planner',
      category: 'Design',
      stream: 'PCM',
      shortDescription: 'Designs iconic skyscrapers, eco-friendly residences, and walkable smart city masterplans.',
      fullDescription: 'Architects licensed by the Council of Architecture (COA) blend aesthetic sculptural vision with structural engineering, climate-responsive ventilation, and building bylaws.',
      responsibilitiesJson: JSON.stringify([
        'Draw architectural floorplans, structural elevations, and 3D photorealistic renderings',
        'Perform solar shadow simulations and airflow thermal comfort modeling in BIM (Revit)',
        'Supervise on-site construction to verify compliance with architectural specifications and safety codes'
      ]),
      requiredSubjectsJson: JSON.stringify(['Physics', 'Chemistry', 'Mathematics (Mandatory for B.Arch)']),
      entryQualifications: '5-Year B.Arch degree recognized by the Council of Architecture (COA)',
      recommendedSkillsJson: JSON.stringify(['Autodesk Revit & AutoCAD', '3D SketchUp / Rhino', 'Sustainable Climatology', 'Building Bye-laws']),
      entranceExamsJson: JSON.stringify(['NATA (National Aptitude Test in Architecture)', 'JEE Main Paper 2 (for NIT B.Arch)', 'JEE Advanced AAT (for IIT B.Arch)']),
      degreesJson: JSON.stringify(['B.Arch (Bachelor of Architecture - 5 Years)']),
      topCollegesJson: JSON.stringify(['IIT Roorkee (Dept of Architecture)', 'CEPT University Ahmedabad', 'School of Planning and Architecture (SPA) New Delhi', 'NIT Trichy']),
      salaryMinINR: 500000,
      salaryMaxINR: 2500000,
      futureDemand: 'HIGH',
      automationExposure: 'LOW',
      sourceName: 'Council of Architecture (COA) India',
      sourceUrl: 'https://www.coa.gov.in',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'User Experience (UX) & Digital Product Designer',
      slug: 'ux-product-designer',
      category: 'Design',
      stream: 'ANY',
      shortDescription: 'Conducts user research, wireframes mobile apps, and designs intuitive, frictionless consumer software experiences.',
      fullDescription: 'UX/UI Product Designers map user journeys, test prototypes with real humans, and craft polished digital interfaces used by millions of smartphone owners.',
      responsibilitiesJson: JSON.stringify([
        'Conduct usability testing interviews and map behavioral user personas',
        'Build interactive high-fidelity clickable prototypes and design systems in Figma',
        'Collaborate with software engineers to ensure pixel-perfect responsive component implementations'
      ]),
      requiredSubjectsJson: JSON.stringify(['Any stream; visual sensibility and human psychology empathy']),
      entryQualifications: 'B.Des in Interaction / Product Design or self-built portfolio of published design case studies',
      recommendedSkillsJson: JSON.stringify(['Figma', 'User Research & Wireframing', 'Design Systems', 'Information Architecture', 'Prototyping']),
      entranceExamsJson: JSON.stringify(['UCEED (Undergraduate Common Entrance Exam for Design - IITs)', 'NID DAT', 'NIFT Entrance']),
      degreesJson: JSON.stringify(['B.Des in Interaction Design', 'B.Des in Industrial/Communication Design']),
      topCollegesJson: JSON.stringify(['National Institute of Design (NID) Ahmedabad', 'IIT Bombay (IDC School of Design)', 'IIT Guwahati (DoD)', 'Srishti Institute Bangalore']),
      salaryMinINR: 750000,
      salaryMaxINR: 3200000,
      futureDemand: 'VERY_HIGH',
      automationExposure: 'LOW',
      sourceName: 'India Design Council & AIGA Design Salary Survey',
      sourceUrl: 'https://www.indiadesigncouncil.org',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Industrial & Hardware Product Designer',
      slug: 'industrial-product-designer',
      category: 'Design',
      stream: 'ANY',
      shortDescription: 'Shapes physical consumer electronics, ergonomics of electric scooters, and medical diagnostic hardware.',
      fullDescription: 'Industrial designers sculpt the form, tactile material finish, and manufacturing feasibility of physical products from household appliances to futuristic wearable devices.',
      responsibilitiesJson: JSON.stringify([
        'Sketch ergonomic product concepts and model 3D CAD surfaces in Rhino/Alias',
        'Select manufacturing materials (injection-molded polymers, CNC aluminum, carbon fiber)',
        'Build physical appearance models using 3D printing and rapid prototyping workshops'
      ]),
      requiredSubjectsJson: JSON.stringify(['Any stream; Science or Arts with strong spatial visualization']),
      entryQualifications: 'B.Des in Industrial Design / Product Design',
      recommendedSkillsJson: JSON.stringify(['Rhino 3D / SolidWorks', 'KeyShot Rendering', 'Ergonomics & Human Factors', 'Injection Molding Principles']),
      entranceExamsJson: JSON.stringify(['UCEED', 'NID DAT']),
      degreesJson: JSON.stringify(['B.Des in Industrial Design']),
      topCollegesJson: JSON.stringify(['NID Ahmedabad', 'IDC IIT Bombay', 'MIT Institute of Design Pune']),
      salaryMinINR: 600000,
      salaryMaxINR: 2600000,
      futureDemand: 'HIGH',
      automationExposure: 'LOW',
      sourceName: 'National Institute of Design (NID) Placement Reports',
      sourceUrl: 'https://www.nid.edu',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Fashion & Sustainable Textile Designer',
      slug: 'fashion-sustainable-textile-designer',
      category: 'Design',
      stream: 'ANY',
      shortDescription: 'Creates apparel collections, champions circular zero-waste fabrics, and presents runway fashion weeks.',
      fullDescription: 'Fashion designers predict upcoming color trends, sketch seasonal apparel collections, draft garment patterns, and innovate with sustainable natural textiles.',
      responsibilitiesJson: JSON.stringify([
        'Develop mood boards, color forecasting palettes, and concept illustration lines',
        'Draft technical garment specification sheets and coordinate sample tailoring',
        'Source natural organic dyes, handloom weaves, and biodegradable textiles'
      ]),
      requiredSubjectsJson: JSON.stringify(['Any stream in Class 12']),
      entryQualifications: '4-Year B.Des in Fashion Design or Textile Design from NIFT or accredited institute',
      recommendedSkillsJson: JSON.stringify(['Garment Construction', 'Pattern Making & Draping', 'Textile Science', 'Adobe Illustrator & Clo3D']),
      entranceExamsJson: JSON.stringify(['NIFT Entrance Examination (General Ability & Creative Ability Test)']),
      degreesJson: JSON.stringify(['B.Des in Fashion Design', 'B.Des in Textile Design']),
      topCollegesJson: JSON.stringify(['NIFT New Delhi', 'NIFT Mumbai', 'Pearl Academy', 'NIFT Bangalore']),
      salaryMinINR: 450000,
      salaryMaxINR: 2200000,
      futureDemand: 'MODERATE',
      automationExposure: 'LOW',
      sourceName: 'National Institute of Fashion Technology (NIFT)',
      sourceUrl: 'https://nift.ac.in',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: '3D VFX & Animation Director',
      slug: '3d-vfx-animation-director',
      category: 'Design',
      stream: 'ANY',
      shortDescription: 'Creates photorealistic visual effects, CGI creatures, and 3D animated feature films for global Hollywood and Indian cinema.',
      fullDescription: 'VFX artists simulate cinematic explosions, digital crowds, mythical creatures, and digital environments using industry standard 3D suites like Maya, Houdini, and Nuke.',
      responsibilitiesJson: JSON.stringify([
        'Simulate dynamic smoke, fluid, fire, and destruction particle effects in Houdini',
        'Model, rig, and animate expressive 3D character skeletons in Autodesk Maya',
        'Composite multiple green-screen CGI passes into seamless cinematic frames in Nuke'
      ]),
      requiredSubjectsJson: JSON.stringify(['Any stream; Computer Science or Fine Arts helpful']),
      entryQualifications: 'B.Des or B.Sc in Animation & VFX with an outstanding showreel',
      recommendedSkillsJson: JSON.stringify(['Houdini FX', 'Autodesk Maya', 'ZBrush Sculpting', 'Nuke Compositing', 'Cinematography Lighting']),
      entranceExamsJson: JSON.stringify(['UCEED', 'Institute Specific Portfolio Tests']),
      degreesJson: JSON.stringify(['B.Sc in Animation and Visual Effects', 'B.Des in Animation Film Design']),
      topCollegesJson: JSON.stringify(['NID Ahmedabad (Animation)', 'Rubika India', 'Whistling Woods International Mumbai', 'Arena Animation']),
      salaryMinINR: 500000,
      salaryMaxINR: 2500000,
      futureDemand: 'HIGH',
      automationExposure: 'MODERATE',
      sourceName: 'Media & Entertainment Skills Council (MESC) India',
      sourceUrl: 'https://mescindia.org',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Sound Engineer & Music Producer',
      slug: 'sound-engineer-music-producer',
      category: 'Design',
      stream: 'ANY',
      shortDescription: 'Records, mixes, and masters multi-track acoustic music, movie surround-sound, and spatial game audio.',
      fullDescription: 'Sound Engineers manipulate audio frequencies, acoustics, microphone polar patterns, and digital audio workstations (Pro Tools, Logic Pro) to deliver pristine soundscapes.',
      responsibilitiesJson: JSON.stringify([
        'Record studio musical instruments with calibrated analog and condenser microphones',
        'Mix multi-channel stem tracks with equalization, dynamic compression, and spatial reverbs',
        'Master album audio to international loudness standards (LUFS) for streaming platforms'
      ]),
      requiredSubjectsJson: JSON.stringify(['Any stream; Physics with acoustics knowledge advantageous']),
      entryQualifications: 'Diploma or Degree in Audio Engineering from FTII, SRFTI, or specialized academies',
      recommendedSkillsJson: JSON.stringify(['Pro Tools / Logic Pro', 'Acoustic Studio Calibration', 'Mixing & Mastering', 'Foley & Sound Design']),
      entranceExamsJson: JSON.stringify(['JET (FTII / SRFTI Entrance Exam)']),
      degreesJson: JSON.stringify(['B.Sc in Sound Engineering', 'Post Graduate Diploma in Sound Recording and Design']),
      topCollegesJson: JSON.stringify(['Film and Television Institute of India (FTII) Pune', 'Satyajit Ray Film & Television Institute (SRFTI) Kolkata', 'KM Music Conservatory Chennai']),
      salaryMinINR: 400000,
      salaryMaxINR: 2000000,
      futureDemand: 'MODERATE',
      automationExposure: 'MODERATE',
      sourceName: 'FTII Placement Directory & Indian Music Industry (IMI)',
      sourceUrl: 'https://ftii.ac.in',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Film Director & Cinematographer (DoP)',
      slug: 'film-director-cinematographer',
      category: 'Design',
      stream: 'ANY',
      shortDescription: 'Directs actors, composes cinematic camera frames, and tells visual stories that move audiences across theaters and streaming.',
      fullDescription: 'Film Directors lead the complete creative vision of motion pictures, while Cinematographers control lighting, lens optics, and camera movement to create mood and atmosphere.',
      responsibilitiesJson: JSON.stringify([
        'Direct actors through emotional beats and subtextual performance blocking',
        'Collaborate with Directors of Photography on lens choice, color temperature, and camera movement',
        'Supervise final sound design, color grading, and pacing in the editing suite'
      ]),
      requiredSubjectsJson: JSON.stringify(['Any stream in Class 12']),
      entryQualifications: 'Degree or Diploma in Direction / Cinematography with short film showreel',
      recommendedSkillsJson: JSON.stringify(['Visual Storytelling', 'Cinematography Optics & Lighting', 'Screenplay Breakdown', 'Actor Direction']),
      entranceExamsJson: JSON.stringify(['FTII Entrance Exam', 'SRFTI Joint Entrance Test']),
      degreesJson: JSON.stringify(['Diploma in Film Direction', 'B.A. in Cinema Studies']),
      topCollegesJson: JSON.stringify(['FTII Pune', 'SRFTI Kolkata', 'Whistling Woods International Mumbai', 'LV Prasad Film Academy Chennai']),
      salaryMinINR: 450000,
      salaryMaxINR: 3500000,
      futureDemand: 'HIGH',
      automationExposure: 'LOW',
      sourceName: 'Producers Guild of India',
      sourceUrl: 'https://producersguildindia.com',
      lastVerifiedDate: '2026-01-15'
    },

    // Aviation, Defence & Maritime (44-50)
    {
      title: 'Commercial Airline Pilot (CPL)',
      slug: 'commercial-airline-pilot',
      category: 'Aviation',
      stream: 'PCM',
      shortDescription: 'Flies passenger jetliners (Airbus A320, Boeing 787) across domestic and international commercial flight corridors.',
      fullDescription: 'Commercial pilots undergo intensive flight training, simulator checks, and instrument rating exams to operate multi-engine jet airliners in all weather conditions.',
      responsibilitiesJson: JSON.stringify([
        'Perform pre-flight walkarounds, fuel weight balance calculations, and flight plan checks',
        'Navigate jet aircraft in compliance with Air Traffic Control (ATC) radar clearances',
        'Manage cockpit automation and execute emergency contingency protocols during technical alerts'
      ]),
      requiredSubjectsJson: JSON.stringify(['Physics', 'Mathematics (Class 12 Mandatory with minimum 50%)']),
      entryQualifications: 'DGCA Class 1 Medical Fitness + 200 Flying Hours + DGCA Ground Theory Exams for Commercial Pilot License (CPL)',
      recommendedSkillsJson: JSON.stringify(['Cockpit Resource Management (CRM)', 'Instrument Flying (IFR)', 'Situational Awareness', 'Aviation Meteorology']),
      entranceExamsJson: JSON.stringify(['IGRUA Entrance Exam', 'Cadet Pilot Programme Selection Tests (IndiGo, Air India)']),
      degreesJson: JSON.stringify(['Commercial Pilot License (DGCA CPL)', 'B.Sc in Aviation (Optional Parallel)']),
      topCollegesJson: JSON.stringify(['Indira Gandhi Rashtriya Uran Akademi (IGRUA) Amethi', 'National Flying Training Institute (NFTI) Gondia', 'Bombay Flying Club']),
      salaryMinINR: 1500000,
      salaryMaxINR: 6000000,
      futureDemand: 'VERY_HIGH',
      automationExposure: 'LOW',
      sourceName: 'Directorate General of Civil Aviation (DGCA) India',
      sourceUrl: 'https://www.dgca.gov.in',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Indian Armed Forces Officer (Army / Navy / Air Force)',
      slug: 'armed-forces-officer-nda',
      category: 'Defence',
      stream: 'ANY',
      shortDescription: 'Commands combat troops, naval warships, and supersonic fighter jets, defending the nation\'s borders with valor.',
      fullDescription: 'Commissioned officers in the Indian Army, Navy, and Air Force lead soldiers in times of peace and national conflict, upholding constitutional sovereignty.',
      responsibilitiesJson: JSON.stringify([
        'Command tactical combat formations, mechanized infantry, or air defense batteries',
        'Lead operations along the Line of Control, counter-insurgency grids, and international missions',
        'Train and mentor troops in physical resilience, marksmanship, and military ethics'
      ]),
      requiredSubjectsJson: JSON.stringify(['Army: Any stream; Navy & Air Force: Physics & Mathematics in Class 12']),
      entryQualifications: 'Clearing NDA Written Exam (Class 12) or CDS Exam (after Graduation) + 5-day Services Selection Board (SSB) Interview',
      recommendedSkillsJson: JSON.stringify(['Officer Like Qualities (OLQ)', 'Physical Stamina', 'Courage under Fire', 'Tactical Troop Leadership']),
      entranceExamsJson: JSON.stringify(['NDA Examination (Conducted twice a year by UPSC)', 'CDS Exam']),
      degreesJson: JSON.stringify(['B.A. / B.Sc / B.Tech from National Defence Academy (conferred by JNU)']),
      topCollegesJson: JSON.stringify(['National Defence Academy (NDA) Khadakwasla Pune', 'Indian Military Academy (IMA) Dehradun', 'Indian Naval Academy (INA) Ezhimala', 'Air Force Academy (AFA) Dundigal']),
      salaryMinINR: 850000,
      salaryMaxINR: 2800000,
      futureDemand: 'HIGH',
      automationExposure: 'LOW',
      sourceName: 'Join Indian Army / Navy / Air Force Official Portals (UPSC)',
      sourceUrl: 'https://joinindianarmy.nic.in',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Merchant Navy Deck Officer & Master Mariner',
      slug: 'merchant-navy-deck-officer',
      category: 'Aviation',
      stream: 'PCM',
      shortDescription: 'Navigates massive container ships and oil tankers across international oceans, managing global maritime cargo trade.',
      fullDescription: 'Merchant Navy Deck Officers navigate ocean-going commercial cargo vessels, calculate ship stability, and command international seafaring crews.',
      responsibilitiesJson: JSON.stringify([
        'Navigate cargo ships through straits and ocean routes using radar, ECDIS, and celestial navigation',
        'Supervise container stowage, ballast water distribution, and dangerous goods safety',
        'Inspect hull integrity, fire-fighting systems, and international maritime law (SOLAS/MARPOL)'
      ]),
      requiredSubjectsJson: JSON.stringify(['Physics', 'Chemistry', 'Mathematics (Min 60% aggregate) + English (Min 50%)']),
      entryQualifications: 'B.Sc in Nautical Science (3 years) or Diploma in Nautical Science (DNS) + DGCA Seafarer Medicals',
      recommendedSkillsJson: JSON.stringify(['Celestial & Electronic Navigation', 'Ship Stability & Cargo Work', 'Maritime Law', 'Seamanship']),
      entranceExamsJson: JSON.stringify(['IMU CET (Indian Maritime University Common Entrance Test)']),
      degreesJson: JSON.stringify(['B.Sc in Nautical Science', 'B.Tech in Marine Engineering']),
      topCollegesJson: JSON.stringify(['Indian Maritime University (IMU) Chennai/Kolkata/Mumbai', 'Tolani Maritime Institute (TMI) Pune', 'Anglo-Eastern Maritime Academy']),
      salaryMinINR: 900000,
      salaryMaxINR: 4500000,
      futureDemand: 'HIGH',
      automationExposure: 'LOW',
      sourceName: 'Directorate General of Shipping (DGS) India',
      sourceUrl: 'https://www.dgshipping.gov.in',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Air Traffic Controller (AAI ATC)',
      slug: 'air-traffic-controller',
      category: 'Aviation',
      stream: 'PCM',
      shortDescription: 'Coordinates airport runway takeoffs, landings, and high-altitude air route separation to prevent aircraft collisions.',
      fullDescription: 'Air Traffic Controllers stationed inside control towers and radar en-route centers guide commercial and military flights safely through Indian airspace.',
      responsibilitiesJson: JSON.stringify([
        'Issue take-off, taxi, and landing clearances to airline pilots with strict separation buffers',
        'Monitor primary and secondary radar displays to direct aircraft around severe thunderstorm cells',
        'Coordinate emergency runway responses during bird strikes or technical depressurization calls'
      ]),
      requiredSubjectsJson: JSON.stringify(['Physics', 'Mathematics in Class 12']),
      entryQualifications: 'B.Sc with Physics & Mathematics or B.Tech/B.E. in any discipline + clearing AAI Junior Executive ATC exam',
      recommendedSkillsJson: JSON.stringify(['Rapid Spatial Decision Making', 'Radio Telephony Communications', 'High Stress Resilience', 'Situational Vigilance']),
      entranceExamsJson: JSON.stringify(['Airports Authority of India (AAI) JE-ATC Direct Examination']),
      degreesJson: JSON.stringify(['B.Sc with Physics & Math', 'B.Tech in Any Engineering Discipline']),
      topCollegesJson: JSON.stringify(['Civil Aviation Training College (CATC) Prayagraj (Post Selection Training)']),
      salaryMinINR: 900000,
      salaryMaxINR: 2400000,
      futureDemand: 'VERY_HIGH',
      automationExposure: 'LOW',
      sourceName: 'Airports Authority of India (AAI)',
      sourceUrl: 'https://www.aai.aero',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Agricultural Scientist & Precision Agritech Specialist',
      slug: 'agricultural-scientist',
      category: 'Applied Science',
      stream: 'PCB',
      shortDescription: 'Develops climate-resilient hybrid seeds, drone crop scouting, and hydroponic vertical farming systems.',
      fullDescription: 'Agricultural scientists innovate bio-fortified crops, soil microbiome health, and IoT satellite precision farming to ensure food security for 1.4 billion people.',
      responsibilitiesJson: JSON.stringify([
        'Breed high-yield drought-tolerant crop varieties through marker-assisted selection',
        'Analyze multispectral drone imagery to calculate normalized difference vegetation index (NDVI)',
        'Formulate organic pest bio-control agents and micro-irrigation schedules'
      ]),
      requiredSubjectsJson: JSON.stringify(['Physics', 'Chemistry', 'Biology/Agriculture/Mathematics']),
      entryQualifications: 'B.Sc (Hons) in Agriculture (4 years) accredited by ICAR',
      recommendedSkillsJson: JSON.stringify(['Crop Genetics & Plant Pathology', 'Soil Chemistry', 'Agritech IoT & Drone Scouting', 'Precision Irrigation']),
      entranceExamsJson: JSON.stringify(['CUET UG (for ICAR All India Quota)', 'State Agricultural University CETs']),
      degreesJson: JSON.stringify(['B.Sc (Hons) in Agriculture', 'B.Tech in Agricultural Engineering']),
      topCollegesJson: JSON.stringify(['Indian Agricultural Research Institute (IARI) New Delhi', 'GB Pant University of Agriculture & Technology Pantnagar', 'Punjab Agricultural University (PAU) Ludhiana']),
      salaryMinINR: 500000,
      salaryMaxINR: 2000000,
      futureDemand: 'VERY_HIGH',
      automationExposure: 'LOW',
      sourceName: 'Indian Council of Agricultural Research (ICAR)',
      sourceUrl: 'https://icar.org.in',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Sports Scientist & Athletic Performance Biomechanist',
      slug: 'sports-scientist-biomechanist',
      category: 'Applied Science',
      stream: 'PCB',
      shortDescription: 'Uses motion capture cameras and VO2 max metabolic analyzers to optimize performance of Olympic athletes and IPL cricketers.',
      fullDescription: 'Sports scientists apply exercise physiology, high-speed biomechanics, and sports nutrition to help elite athletes peak at international tournaments.',
      responsibilitiesJson: JSON.stringify([
        'Capture 3D optical motion data to analyze cricket bowling actions or sprinting mechanics',
        'Perform laboratory VO2 max endurance tests and blood lactate threshold profiling',
        'Prescribe scientific periodization schedules, sleep recovery, and micronutrient protocols'
      ]),
      requiredSubjectsJson: JSON.stringify(['Physics', 'Chemistry', 'Biology', 'Physical Education']),
      entryQualifications: 'B.Sc in Sports Science / Exercise Physiology followed by M.Sc',
      recommendedSkillsJson: JSON.stringify(['Force Plate Biomechanics', 'Cardiopulmonary Exercise Testing', 'Athletic Periodization', 'Motion Capture']),
      entranceExamsJson: JSON.stringify(['National Sports University Entrance', 'CUET UG']),
      degreesJson: JSON.stringify(['B.Sc in Sports & Exercise Science', 'M.Sc in Sports Biomechanics']),
      topCollegesJson: JSON.stringify(['National Sports University (NSU) Imphal', 'Netaji Subhas National Institute of Sports (NIS) Patiala', 'Manipal Academy of Higher Education']),
      salaryMinINR: 550000,
      salaryMaxINR: 2400000,
      futureDemand: 'HIGH',
      automationExposure: 'LOW',
      sourceName: 'Sports Authority of India (SAI) & Ministry of Youth Affairs and Sports',
      sourceUrl: 'https://sportsauthorityofindia.nic.in',
      lastVerifiedDate: '2026-01-15'
    },
    {
      title: 'Environmental Climate Scientist & Carbon Auditor',
      slug: 'environmental-climate-scientist',
      category: 'Applied Science',
      stream: 'ANY',
      shortDescription: 'Models global warming climate scenarios, conducts carbon credit audits, and formulates biodiversity preservation policies.',
      fullDescription: 'Climate scientists analyze satellite atmospheric data, glacier melt rates, carbon sequestering forests, and advise governments on COP emissions commitments.',
      responsibilitiesJson: JSON.stringify([
        'Run global climate models (GCMs) to forecast regional monsoon shifts and extreme heat waves',
        'Verify corporate carbon offset credits and reforestation biomass accounting',
        'Draft coastal resilience and disaster vulnerability action plans for state governments'
      ]),
      requiredSubjectsJson: JSON.stringify(['Science stream (PCM or PCB) or Environmental Geography']),
      entryQualifications: 'B.Sc in Environmental Science / Earth Sciences followed by M.Sc',
      recommendedSkillsJson: JSON.stringify(['Climate Modeling (NetCDF/Python)', 'GIS & Satellite Remote Sensing', 'Carbon Accounting (GHG Protocol)', 'Ecology']),
      entranceExamsJson: JSON.stringify(['CUET UG', 'CUET PG']),
      degreesJson: JSON.stringify(['B.Sc in Environmental Science', 'M.Sc in Climate Science & Policy']),
      topCollegesJson: JSON.stringify(['TERI School of Advanced Studies New Delhi', 'IISc Bangalore (Centre for Atmospheric Sciences)', 'JNU School of Environmental Sciences']),
      salaryMinINR: 600000,
      salaryMaxINR: 2200000,
      futureDemand: 'VERY_HIGH',
      automationExposure: 'LOW',
      sourceName: 'Ministry of Environment, Forest and Climate Change (MoEFCC)',
      sourceUrl: 'https://moef.gov.in',
      lastVerifiedDate: '2026-01-15'
    }
  ];

  for (const c of careersData) {
    await prisma.career.upsert({
      where: { slug: c.slug },
      update: c,
      create: c
    });
  }
  console.log(`✅ 50+ Structured Indian Career records seeded across all streams.`);

  // 5. Seed Colleges
  const collegesData = [
    {
      name: 'Indian Institute of Technology Bombay (IIT Bombay)',
      state: 'Maharashtra',
      city: 'Mumbai',
      nirfRank: 3,
      coursesJson: JSON.stringify(['B.Tech Computer Science', 'B.Tech Electrical', 'B.Des Industrial Design', 'BS Chemistry']),
      feeMinINR: 220000,
      feeMaxINR: 1050000,
      accreditation: 'Institute of Eminence (IoE)',
      admissionRoute: 'JEE Advanced (via JEE Main)',
      websiteUrl: 'https://www.iitb.ac.in',
      verifiedDate: '2026-01-15'
    },
    {
      name: 'All India Institute of Medical Sciences (AIIMS New Delhi)',
      state: 'Delhi',
      city: 'New Delhi',
      nirfRank: 1,
      coursesJson: JSON.stringify(['MBBS', 'B.Sc Nursing (Hons)', 'MD/MS']),
      feeMinINR: 6000,
      feeMaxINR: 15000,
      accreditation: 'Autonomous Apex Medical Institution',
      admissionRoute: 'NEET UG',
      websiteUrl: 'https://www.aiims.edu',
      verifiedDate: '2026-01-15'
    },
    {
      name: 'Shri Ram College of Commerce (SRCC, Delhi University)',
      state: 'Delhi',
      city: 'New Delhi',
      nirfRank: 11,
      coursesJson: JSON.stringify(['B.Com (Hons)', 'B.A. (Hons) Economics', 'M.Com']),
      feeMinINR: 30000,
      feeMaxINR: 90000,
      accreditation: 'NAAC A++',
      admissionRoute: 'CUET UG',
      websiteUrl: 'https://www.srcc.edu',
      verifiedDate: '2026-01-15'
    },
    {
      name: 'National Law School of India University (NLSIU Bangalore)',
      state: 'Karnataka',
      city: 'Bengaluru',
      nirfRank: 1,
      coursesJson: JSON.stringify(['B.A. LL.B (Hons)', 'LL.M', 'Master of Public Policy']),
      feeMinINR: 280000,
      feeMaxINR: 1400000,
      accreditation: 'Premier National Law University',
      admissionRoute: 'CLAT (Common Law Admission Test)',
      websiteUrl: 'https://www.nls.ac.in',
      verifiedDate: '2026-01-15'
    },
    {
      name: 'National Institute of Design (NID Ahmedabad)',
      state: 'Gujarat',
      city: 'Ahmedabad',
      nirfRank: 1,
      coursesJson: JSON.stringify(['B.Des Product Design', 'B.Des Animation', 'B.Des Textile Design', 'M.Des']),
      feeMinINR: 350000,
      feeMaxINR: 1500000,
      accreditation: 'Institute of National Importance',
      admissionRoute: 'NID DAT (Design Aptitude Test)',
      websiteUrl: 'https://www.nid.edu',
      verifiedDate: '2026-01-15'
    },
    {
      name: 'BITS Pilani (Birla Institute of Technology and Science)',
      state: 'Rajasthan',
      city: 'Pilani',
      nirfRank: 20,
      coursesJson: JSON.stringify(['B.E. Computer Science', 'B.E. Electronics', 'B.Pharm', 'M.Sc Dual Degree']),
      feeMinINR: 480000,
      feeMaxINR: 2200000,
      accreditation: 'NAAC A',
      admissionRoute: 'BITSAT',
      websiteUrl: 'https://www.bits-pilani.ac.in',
      verifiedDate: '2026-01-15'
    },
    {
      name: 'Christian Medical College (CMC Vellore)',
      state: 'Tamil Nadu',
      city: 'Vellore',
      nirfRank: 3,
      coursesJson: JSON.stringify(['MBBS', 'B.Sc Nursing', 'BPT Physiotherapy']),
      feeMinINR: 52000,
      feeMaxINR: 240000,
      accreditation: 'NAAC A++',
      admissionRoute: 'NEET UG + Institutional Counseling',
      websiteUrl: 'https://www.cmch-vellore.edu',
      verifiedDate: '2026-01-15'
    },
    {
      name: 'Shaheed Sukhdev College of Business Studies (SSCBS Delhi)',
      state: 'Delhi',
      city: 'New Delhi',
      nirfRank: 1,
      coursesJson: JSON.stringify(['BMS (Bachelor of Management Studies)', 'BBA (FIA)', 'B.Sc (Hons) Computer Science']),
      feeMinINR: 25000,
      feeMaxINR: 85000,
      accreditation: 'NAAC A+',
      admissionRoute: 'CUET UG',
      websiteUrl: 'https://sscbs.du.ac.in',
      verifiedDate: '2026-01-15'
    }
  ];

  for (const col of collegesData) {
    const existing = await prisma.college.findFirst({ where: { name: col.name } });
    if (!existing) {
      await prisma.college.create({ data: col });
    }
  }
  console.log('✅ Top Colleges seeded.');

  // 6. Seed Entrance Exams
  const examsData = [
    {
      name: 'JEE Main',
      fullName: 'Joint Entrance Examination (Main)',
      conductingAuthority: 'National Testing Agency (NTA)',
      targetStreamsJson: JSON.stringify(['PCM']),
      eligibleCoursesJson: JSON.stringify(['B.Tech', 'B.E.', 'B.Arch', 'Integrated M.Sc']),
      examFrequency: 'Twice a year (January and April Sessions)',
      examMode: 'Computer Based Test (CBT)',
      importantDatesInfo: 'Registration usually opens in November; Session 1 in Jan, Session 2 in April.',
      officialWebsite: 'https://jeemain.nta.nic.in'
    },
    {
      name: 'NEET UG',
      fullName: 'National Eligibility cum Entrance Test (Undergraduate)',
      conductingAuthority: 'National Testing Agency (NTA)',
      targetStreamsJson: JSON.stringify(['PCB']),
      eligibleCoursesJson: JSON.stringify(['MBBS', 'BDS', 'BAMS', 'BHMS', 'B.Sc Nursing', 'BVSc']),
      examFrequency: 'Once a year (Usually first Sunday of May)',
      examMode: 'Pen & Paper (OMR sheet based)',
      importantDatesInfo: 'Application forms open around February; examination in early May.',
      officialWebsite: 'https://neet.nta.nic.in'
    },
    {
      name: 'CUET UG',
      fullName: 'Common University Entrance Test (Undergraduate)',
      conductingAuthority: 'National Testing Agency (NTA)',
      targetStreamsJson: JSON.stringify(['PCM', 'PCB', 'COMMERCE', 'HUMANITIES', 'ANY']),
      eligibleCoursesJson: JSON.stringify(['B.A. (Hons)', 'B.Com (Hons)', 'B.Sc (Hons)', 'BMS', 'BCA', 'Integrated LL.B']),
      examFrequency: 'Once a year (May-June)',
      examMode: 'Hybrid / Computer Based Test',
      importantDatesInfo: 'Gateway to all Central Universities (DU, BHU, JNU, Jamia) and top private universities.',
      officialWebsite: 'https://cuetug.nta.nic.in'
    },
    {
      name: 'CLAT',
      fullName: 'Common Law Admission Test',
      conductingAuthority: 'Consortium of National Law Universities',
      targetStreamsJson: JSON.stringify(['ANY']),
      eligibleCoursesJson: JSON.stringify(['5-Year Integrated B.A. LL.B (Hons)', 'BBA LL.B (Hons)']),
      examFrequency: 'Once a year (Usually first Sunday of December for upcoming academic year)',
      examMode: 'Pen and Paper (Offline)',
      importantDatesInfo: 'Registration opens in July, exam conducted in December for 24 NLUs across India.',
      officialWebsite: 'https://consortiumofnlus.ac.in'
    },
    {
      name: 'UCEED',
      fullName: 'Undergraduate Common Entrance Examination for Design',
      conductingAuthority: 'IIT Bombay',
      targetStreamsJson: JSON.stringify(['ANY']),
      eligibleCoursesJson: JSON.stringify(['B.Des (Bachelor of Design) at IIT Bombay, IIT Delhi, IIT Guwahati, IIT Hyderabad, IIITDM Jabalpur']),
      examFrequency: 'Once a year (January)',
      examMode: 'Part A (Computer-based) + Part B (Sketching on Paper)',
      importantDatesInfo: 'Registration opens in October; test in mid-January.',
      officialWebsite: 'https://www.uceed.iitb.ac.in'
    },
    {
      name: 'NDA & NA Exam',
      fullName: 'National Defence Academy and Naval Academy Examination',
      conductingAuthority: 'Union Public Service Commission (UPSC)',
      targetStreamsJson: JSON.stringify(['ANY', 'PCM']),
      eligibleCoursesJson: JSON.stringify(['Army, Navy, and Air Force Cadet Training with Graduation Degree']),
      examFrequency: 'Twice a year (NDA-I in April, NDA-II in September)',
      examMode: 'Offline Written Test + 5-Day SSB Interview',
      importantDatesInfo: 'Open to both male and female candidates aged 16.5 to 19.5 years.',
      officialWebsite: 'https://www.upsc.gov.in'
    }
  ];

  for (const ex of examsData) {
    await prisma.entranceExam.upsert({
      where: { name: ex.name },
      update: ex,
      create: ex
    });
  }
  console.log('✅ Key Entrance Exams seeded.');

  // 7. Seed Scholarships
  const scholarshipsData = [
    {
      name: 'INSPIRE Scholarship for Higher Education (SHE)',
      provider: 'Department of Science and Technology (DST), Govt of India',
      eligibility: 'Top 1% in Class 12 board exams pursuing B.Sc / BS / Integrated M.Sc in Natural & Basic Sciences',
      benefitAmount: '₹80,000 per year (₹60,000 annual scholarship + ₹20,000 summer mentorship project)',
      incomeCeiling: 'No family income limit; strictly merit-based on board exam percentile',
      requiredDocsJson: JSON.stringify(['Class 12 Marksheet', 'College Admission Proof', 'SBI Bank Passbook', 'Endorsement Certificate']),
      officialUrl: 'https://online-inspire.gov.in',
      deadlineText: 'Annual cycle: applications typically open October to December on DST portal.',
      lastVerifiedDate: '2026-01-15'
    },
    {
      name: 'Central Sector Scheme of Scholarships (CSSS) for College Students',
      provider: 'Ministry of Education, Department of Higher Education',
      eligibility: 'Above 80th percentile in relevant stream in Class 12 pursuing regular recognized undergraduate degree',
      benefitAmount: '₹12,000/year for first 3 years of UG, ₹20,000/year at PG level',
      incomeCeiling: 'Gross parental annual income below ₹4.5 Lakhs',
      requiredDocsJson: JSON.stringify(['Income Certificate from competent authority', 'Class 12 Marksheet', 'Aadhaar Card', 'Bonafide Student Certificate']),
      officialUrl: 'https://scholarships.gov.in',
      deadlineText: 'National Scholarship Portal (NSP) opens annually between July and November.',
      lastVerifiedDate: '2026-01-15'
    },
    {
      name: 'AICTE Pragati Scholarship for Girls',
      provider: 'All India Council for Technical Education (AICTE)',
      eligibility: 'Female students admitted to first year of Degree or Diploma in AICTE approved technical programs',
      benefitAmount: '₹50,000 per annum for tuition, books, and living expenses',
      incomeCeiling: 'Family income not exceeding ₹8 Lakhs per annum',
      requiredDocsJson: JSON.stringify(['AICTE Institute Admission Letter', 'Income Certificate', 'Class 10/12 Marksheets', 'Aadhaar Card']),
      officialUrl: 'https://www.aicte-india.org',
      deadlineText: 'Processed via National Scholarship Portal (NSP) during Autumn semester.',
      lastVerifiedDate: '2026-01-15'
    },
    {
      name: 'Prime Minister\'s Scholarship Scheme (PMSS)',
      provider: 'Welfare and Rehabilitation Board (WARB), Ministry of Home Affairs',
      eligibility: 'Dependent wards and widows of deceased or retired CAPFs, Assam Rifles, and State Police personnel',
      benefitAmount: '₹36,000/year for girls, ₹30,000/year for boys for professional degrees (B.Tech, MBBS, BBA, B.Sc Ag)',
      incomeCeiling: 'Priority quota category based',
      requiredDocsJson: JSON.stringify(['Service Discharge Book', 'PPO Certificate', 'College Bonafide', 'Mark Sheet']),
      officialUrl: 'https://scholarships.gov.in',
      deadlineText: 'Published on National Scholarship Portal annually.',
      lastVerifiedDate: '2026-01-15'
    }
  ];

  for (const sc of scholarshipsData) {
    const existing = await prisma.scholarship.findFirst({ where: { name: sc.name } });
    if (!existing) {
      await prisma.scholarship.create({ data: sc });
    }
  }
  console.log('✅ Scholarships seeded.');

  // 8. Seed sample completed assessment attempt for Aarav Sharma (student demo)
  const dimensionScoresSample = {
    'Numerical Reasoning': 88,
    'Logical Reasoning': 92,
    'Verbal Reasoning': 75,
    'Spatial Reasoning': 82,
    'Scientific Thinking': 90,
    'Creative Thinking': 78,
    'Communication': 70,
    'Practical Problem Solving': 85,
    'Leadership & Teamwork': 72,
    'Work Environment': 80,
    'Risk Tolerance': 65,
    'Social Impact': 75,
    'Entrepreneurial': 74,
    'Working Style': 82,
    'Career Values': 88,
    'Subject Interests': 92
  };

  const sampleAttempt = await prisma.assessmentAttempt.create({
    data: {
      studentId: studentProfile.id,
      status: 'COMPLETED',
      completedAt: new Date(),
      dimensionScores: JSON.stringify(dimensionScoresSample),
      interestProfile: JSON.stringify(['Advanced Computing', 'Space Engineering', 'Robotics Systems']),
      strengthProfile: JSON.stringify(['Deductive Logical Reasoning', 'Mathematical Modeling', 'Scientific Inquiry']),
      readinessProfile: JSON.stringify({
        'Science (PCM)': 94,
        'Science (PCMB)': 82,
        'Commerce with Math': 78,
        'Humanities / Design': 70
      }),
      summaryReport: 'Student shows exceptional cognitive aptitude in analytical problem solving and quantitative reasoning. High natural alignment with Science PCM pathway leading to AI, Robotics, or Aerospace Engineering.'
    }
  });

  // Seed sample career recommendations for student
  const topCareerSlugs = ['ai-machine-learning-engineer', 'robotics-mechatronics-engineer', 'aerospace-spacecraft-engineer', 'full-stack-software-architect'];
  for (let i = 0; i < topCareerSlugs.length; i++) {
    const c = await prisma.career.findUnique({ where: { slug: topCareerSlugs[i] } });
    if (c) {
      await prisma.careerRecommendation.create({
        data: {
          studentId: studentProfile.id,
          careerId: c.id,
          matchScore: 95 - (i * 3),
          interestScore: 94 - (i * 2),
          strengthScore: 92 - (i * 2),
          academicScore: 96,
          whyItMatches: `Aligns with your 90%+ score in Logical & Scientific dimensions and deep passion for building practical systems.`,
          areasToDevelop: `Build strong fundamentals in Calculus, discrete math, and continue Python programming practice.`,
          suggestedNextSteps: JSON.stringify([
            'Target Science with Mathematics (PCM) in Class 11',
            'Start structured preparation for JEE Main & Advanced mathematics syllabus',
            'Participate in school robotics club or national level science exhibitions'
          ])
        }
      });
    }
  }

  // Seed sample personalized roadmap
  await prisma.careerRoadmap.create({
    data: {
      studentId: studentProfile.id,
      careerTitle: 'AI & Robotics Systems Engineer',
      targetYear: '2028',
      milestonesJson: JSON.stringify([
        {
          period: 'Next 30 Days',
          title: 'Class 10 Board Optimization & Stream Confirmation',
          tasks: [
            { task: 'Complete Class 10 NCERT Mathematics exemplar problems in Quadratic equations and Trigonometry', completed: true },
            { task: 'Finalize Class 11 stream subject preferences: Physics, Chemistry, Mathematics, Computer Science', completed: true },
            { task: 'Attend school counseling session with parent to confirm board subject allocations', completed: false }
          ]
        },
        {
          period: 'Next 90 Days',
          title: 'Transition to Higher Secondary & Foundation Prep',
          tasks: [
            { task: 'Start introductory Python algorithmic programming course (Functions, Lists, Loops)', completed: false },
            { task: 'Acquire reference books: H.C. Verma Concepts of Physics Volume 1', completed: false },
            { task: 'Create a disciplined 3-hour daily self-study study block tracker', completed: false }
          ]
        },
        {
          period: 'Year 1 (Class 11)',
          title: 'Core Conceptual Mastery & Olympiad Exploration',
          tasks: [
            { task: 'Master Class 11 Mechanics, Rotational Dynamics, and Coordinate Geometry', completed: false },
            { task: 'Attempt National Standard Examination in Physics (NSEP) or PRMO Mathematics', completed: false },
            { task: 'Build a small portfolio project: Autonomous Obstacle-Avoiding Robot simulation', completed: false }
          ]
        },
        {
          period: 'Years 3-5 (Degree & Specialization)',
          title: 'Undergraduate Excellence & Research Internships',
          tasks: [
            { task: 'Target top-tier engineering institution through JEE Advanced / BITSAT', completed: false },
            { task: 'Engage in open-source AI repositories and college robotics team competitions', completed: false },
            { task: 'Secure research or industry software internship in autonomous systems', completed: false }
          ]
        }
      ])
    }
  });

  console.log('✅ Sample student assessment, recommendations and roadmap seeded.');
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
