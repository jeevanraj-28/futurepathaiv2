import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { RecommendationEngine, DimensionScoreMap } from '../services/recommendationEngine';

const router = Router();

/**
 * Get assessment question bank (40 questions across 16 dimensions)
 */
router.get('/questions', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const questions = await prisma.assessmentQuestion.findMany({
      orderBy: { orderNumber: 'asc' }
    });

    const parsedQuestions = questions.map(q => ({
      id: q.id,
      orderNumber: q.orderNumber,
      prompt: q.prompt,
      category: q.category,
      dimension: q.dimension,
      weight: q.weight,
      options: JSON.parse(q.optionsJson)
    }));

    res.json({
      success: true,
      count: parsedQuestions.length,
      questions: parsedQuestions
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch questions', error: err.message });
  }
});

/**
 * Submit assessment answers, compute 16 dimension scores, and generate explainable matches
 */
router.post('/submit', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user?.id }
    });

    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    const { responses } = req.body; // Map: { [questionId: string]: selectedOptionIndex (number) }
    if (!responses || typeof responses !== 'object') {
      res.status(400).json({ success: false, message: 'Invalid assessment responses provided' });
      return;
    }

    const allQuestions = await prisma.assessmentQuestion.findMany();
    
    // Aggregate scores per dimension
    const dimensionTotals: Record<string, { sum: number; count: number }> = {};
    
    for (const q of allQuestions) {
      if (!dimensionTotals[q.dimension]) {
        dimensionTotals[q.dimension] = { sum: 0, count: 0 };
      }

      const selectedIndex = responses[q.id];
      const options = JSON.parse(q.optionsJson);

      if (selectedIndex !== undefined && options[selectedIndex]) {
        const optionScore = options[selectedIndex].score || 5;
        dimensionTotals[q.dimension].sum += (optionScore * 10); // scale to 0-100
        dimensionTotals[q.dimension].count += 1;
      } else {
        // Default baseline for unselected in preview
        dimensionTotals[q.dimension].sum += 60;
        dimensionTotals[q.dimension].count += 1;
      }
    }

    const dimensionScores: DimensionScoreMap = {};
    for (const dim in dimensionTotals) {
      const avg = Math.round(dimensionTotals[dim].sum / (dimensionTotals[dim].count || 1));
      dimensionScores[dim] = Math.min(100, Math.max(20, avg));
    }

    // Identify top strengths & interests
    const sortedDimensions = Object.entries(dimensionScores).sort((a, b) => b[1] - a[1]);
    const topStrengths = sortedDimensions.slice(0, 3).map(([dim]) => dim);
    const topInterests = sortedDimensions.filter(([dim]) => 
      ['Subject Interests', 'Creative Thinking', 'Social Impact', 'Entrepreneurial'].includes(dim)
    ).slice(0, 3).map(([dim]) => dim);

    // Stream Readiness Breakdown for Class 10/12
    const num = dimensionScores['Numerical Reasoning'] || 60;
    const log = dimensionScores['Logical Reasoning'] || 60;
    const sci = dimensionScores['Scientific Thinking'] || 60;
    const ver = dimensionScores['Verbal Reasoning'] || 60;
    const cre = dimensionScores['Creative Thinking'] || 60;

    const readinessProfile = {
      'Science (PCM)': Math.round((log * 0.4) + (num * 0.35) + (sci * 0.25)),
      'Science (PCB)': Math.round((sci * 0.45) + (log * 0.3) + (ver * 0.25)),
      'Commerce': Math.round((num * 0.45) + (log * 0.35) + (ver * 0.2)),
      'Humanities & Social Sciences': Math.round((ver * 0.45) + (cre * 0.3) + (log * 0.25)),
      'Design & Fine Arts': Math.round((cre * 0.5) + (dimensionScores['Spatial Reasoning'] || 60) * 0.3 + (log * 0.2))
    };

    // Run Recommendation Engine on all careers in the database
    const allCareers = await prisma.career.findMany();
    const studentProfileData = {
      currentClass: student.currentClass,
      favouriteSubjects: student.favouriteSubjects ? JSON.parse(student.favouriteSubjects) : [],
      difficultSubjects: student.difficultSubjects ? JSON.parse(student.difficultSubjects) : [],
      skills: student.skills ? JSON.parse(student.skills) : [],
      hobbies: student.hobbies ? JSON.parse(student.hobbies) : [],
      budgetRange: student.budgetRange || undefined
    };

    const matches = RecommendationEngine.matchCareers(allCareers, dimensionScores, studentProfileData);

    // Save Attempt
    const attempt = await prisma.assessmentAttempt.create({
      data: {
        studentId: student.id,
        status: 'COMPLETED',
        completedAt: new Date(),
        responsesJson: JSON.stringify(responses),
        dimensionScores: JSON.stringify(dimensionScores),
        interestProfile: JSON.stringify(topInterests),
        strengthProfile: JSON.stringify(topStrengths),
        readinessProfile: JSON.stringify(readinessProfile),
        summaryReport: `Student shows highest alignment in ${topStrengths.join(', ')}. Strong suitability for ${sortedDimensions[0][0]}-centric academic tracks.`
      }
    });

    // Delete previous recommendations for this student and persist new top recommendations
    await prisma.careerRecommendation.deleteMany({ where: { studentId: student.id } });

    for (const match of matches.slice(0, 10)) {
      await prisma.careerRecommendation.create({
        data: {
          studentId: student.id,
          careerId: match.careerId,
          matchScore: match.matchScore,
          interestScore: match.interestScore,
          strengthScore: match.strengthScore,
          academicScore: match.academicScore,
          whyItMatches: match.whyItMatches,
          areasToDevelop: match.areasToDevelop,
          suggestedNextSteps: JSON.stringify(match.suggestedNextSteps)
        }
      });
    }

    res.json({
      success: true,
      message: 'Assessment evaluated successfully',
      attemptId: attempt.id,
      dimensionScores,
      topStrengths,
      topInterests,
      readinessProfile,
      topMatches: matches.slice(0, 10)
    });
  } catch (err: any) {
    console.error('Error submitting assessment:', err);
    res.status(500).json({ success: false, message: 'Failed to evaluate assessment', error: err.message });
  }
});

/**
 * Get latest assessment results
 */
router.get('/results', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user?.id },
      include: {
        assessmentAttempts: {
          orderBy: { startedAt: 'desc' },
          take: 1
        },
        recommendations: {
          include: { career: true },
          orderBy: { matchScore: 'desc' },
          take: 10
        }
      }
    });

    if (!student || student.assessmentAttempts.length === 0) {
      res.status(404).json({ success: false, message: 'No completed assessment found' });
      return;
    }

    const attempt = student.assessmentAttempts[0];

    res.json({
      success: true,
      result: {
        attemptId: attempt.id,
        completedAt: attempt.completedAt,
        dimensionScores: attempt.dimensionScores ? JSON.parse(attempt.dimensionScores) : {},
        interestProfile: attempt.interestProfile ? JSON.parse(attempt.interestProfile) : [],
        strengthProfile: attempt.strengthProfile ? JSON.parse(attempt.strengthProfile) : [],
        readinessProfile: attempt.readinessProfile ? JSON.parse(attempt.readinessProfile) : {},
        summaryReport: attempt.summaryReport,
        recommendations: student.recommendations.map(r => ({
          careerId: r.careerId,
          title: r.career.title,
          slug: r.career.slug,
          category: r.career.category,
          stream: r.career.stream,
          shortDescription: r.career.shortDescription,
          matchScore: r.matchScore,
          interestScore: r.interestScore,
          strengthScore: r.strengthScore,
          academicScore: r.academicScore,
          whyItMatches: r.whyItMatches,
          areasToDevelop: r.areasToDevelop,
          suggestedNextSteps: JSON.parse(r.suggestedNextSteps || '[]'),
          salaryMinINR: r.career.salaryMinINR,
          salaryMaxINR: r.career.salaryMaxINR,
          futureDemand: r.career.futureDemand
        }))
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch assessment results', error: err.message });
  }
});

/**
 * Get assessment history
 */
router.get('/history', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user?.id } });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    const attempts = await prisma.assessmentAttempt.findMany({
      where: { studentId: student.id },
      orderBy: { startedAt: 'desc' }
    });

    res.json({
      success: true,
      attempts: attempts.map(a => ({
        id: a.id,
        startedAt: a.startedAt,
        completedAt: a.completedAt,
        status: a.status,
        summary: a.summaryReport
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch history', error: err.message });
  }
});

export default router;
