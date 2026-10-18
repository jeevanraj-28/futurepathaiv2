import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * Get student's saved roadmaps
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user?.id } });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    const roadmaps = await prisma.careerRoadmap.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' }
    });

    const parsed = roadmaps.map(r => ({
      id: r.id,
      careerTitle: r.careerTitle,
      targetYear: r.targetYear,
      milestones: JSON.parse(r.milestonesJson),
      createdAt: r.createdAt
    }));

    res.json({ success: true, roadmaps: parsed });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch roadmaps', error: err.message });
  }
});

/**
 * Generate a personalized roadmap for a selected target career
 */
router.post('/generate', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user?.id } });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    const { careerTitle, targetYear = '2028' } = req.body;
    if (!careerTitle) {
      res.status(400).json({ success: false, message: 'Career title is required' });
      return;
    }

    // Match career in DB to pull entrance exams & skills
    const career = await prisma.career.findFirst({
      where: {
        OR: [
          { title: { contains: careerTitle } },
          { slug: { contains: careerTitle.toLowerCase().replace(/\s+/g, '-') } }
        ]
      }
    });

    const exams = career ? JSON.parse(career.entranceExamsJson || '["Relevant National Tests"]') : ['National Entrance Exam'];
    const skills = career ? JSON.parse(career.recommendedSkillsJson || '["Foundational Domain Mastery"]') : ['Core Subject Skills'];
    const degrees = career ? JSON.parse(career.degreesJson || '["Undergraduate Degree"]') : ['Undergraduate Degree'];

    const milestones = [
      {
        period: 'Next 30 Days (Immediate Focus)',
        title: 'Academic Diagnostics & Subject Alignment',
        tasks: [
          { task: `Benchmark current understanding of Class ${student.currentClass === 'CLASS_10' ? '10' : '12'} core chapters`, completed: false },
          { task: `Review official syllabus and test pattern for: ${exams[0] || 'National Test'}`, completed: false },
          { task: `Set up a dedicated daily 2.5-hour distraction-free conceptual study schedule`, completed: false },
          { task: `Identify top 2 reference textbooks recommended by teachers and state toppers`, completed: false }
        ]
      },
      {
        period: 'Next 90 Days (Execution & Foundation)',
        title: 'Skill Building & Target Goal Setting',
        tasks: [
          { task: `Complete online introductory module in: ${skills[0] || 'Core Subject Foundation'}`, completed: false },
          { task: `Solve previous 5 years' question papers for first semester board exams`, completed: false },
          { task: `Shortlist 5 target institutions offering ${degrees[0] || 'relevant courses'} and note cutoffs`, completed: false },
          { task: `Attend a 1-on-1 counseling checkpoint to evaluate study stamina`, completed: false }
        ]
      },
      {
        period: 'Year 1 (Intensive Preparation)',
        title: 'Exam Mastery & Portfolio Development',
        tasks: [
          { task: `Complete full syllabus mock tests for ${exams.slice(0, 2).join(', ')} with timed analysis`, completed: false },
          { task: `Build 1 tangible project or research paper demonstrating domain interest in ${careerTitle}`, completed: false },
          { task: `Apply for central/state scholarship schemes before published deadlines`, completed: false }
        ]
      },
      {
        period: 'Years 3–5 (Long-Term Trajectory)',
        title: 'College Admission, Internships & Career Launch',
        tasks: [
          { task: `Secure admission into target degree program (${degrees[0] || 'Undergraduate'})`, completed: false },
          { task: `Participate in national level student competitions, hackathons, or moot courts`, completed: false },
          { task: `Complete at least two structured industry/clinical internships before final year`, completed: false }
        ]
      }
    ];

    const roadmap = await prisma.careerRoadmap.create({
      data: {
        studentId: student.id,
        careerTitle,
        targetYear,
        milestonesJson: JSON.stringify(milestones)
      }
    });

    res.json({
      success: true,
      message: `Roadmap generated for ${careerTitle}`,
      roadmap: {
        id: roadmap.id,
        careerTitle: roadmap.careerTitle,
        targetYear: roadmap.targetYear,
        milestones
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to generate roadmap', error: err.message });
  }
});

/**
 * Toggle task completed status in a roadmap
 */
router.patch('/:id/task', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { milestoneIndex, taskIndex } = req.body;

    const roadmap = await prisma.careerRoadmap.findUnique({ where: { id } });
    if (!roadmap) {
      res.status(404).json({ success: false, message: 'Roadmap not found' });
      return;
    }

    const milestones = JSON.parse(roadmap.milestonesJson);
    if (milestones[milestoneIndex]?.tasks[taskIndex]) {
      milestones[milestoneIndex].tasks[taskIndex].completed = !milestones[milestoneIndex].tasks[taskIndex].completed;
    }

    const updated = await prisma.careerRoadmap.update({
      where: { id },
      data: { milestonesJson: JSON.stringify(milestones) }
    });

    res.json({
      success: true,
      roadmap: {
        id: updated.id,
        careerTitle: updated.careerTitle,
        milestones
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update roadmap task', error: err.message });
  }
});

/**
 * Get export data for printable/PDF report
 */
router.get('/:id/export', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const roadmap = await prisma.careerRoadmap.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
            assessmentAttempts: {
              where: { status: 'COMPLETED' },
              orderBy: { completedAt: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    if (!roadmap) {
      res.status(404).json({ success: false, message: 'Roadmap not found' });
      return;
    }

    const reportData = {
      reportTitle: `FUTUREPATH AI Personalized Strategic Roadmap: ${roadmap.careerTitle}`,
      generatedFor: roadmap.student.user.name,
      studentClass: roadmap.student.currentClass,
      board: roadmap.student.board,
      targetCareer: roadmap.careerTitle,
      targetYear: roadmap.targetYear,
      generatedDate: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
      verificationSeal: 'FUTUREPATH-AI-AUTHENTICATED',
      milestones: JSON.parse(roadmap.milestonesJson),
      latestAssessmentSummary: roadmap.student.assessmentAttempts[0]?.summaryReport || 'Assessment completed with balanced cognitive profile.'
    };

    res.json({ success: true, report: reportData });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to generate export report', error: err.message });
  }
});

export default router;
