import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * Get parent overview with linked children
 */
router.get('/overview', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parent = await prisma.parentProfile.findUnique({
      where: { userId: req.user?.id },
      include: {
        studentLinks: {
          where: { status: { not: 'REVOKED' } },
          include: {
            student: {
              include: {
                user: { select: { name: true, email: true, phone: true } },
                assessmentAttempts: {
                  where: { status: 'COMPLETED' },
                  orderBy: { completedAt: 'desc' },
                  take: 1
                },
                recommendations: {
                  include: { career: true },
                  orderBy: { matchScore: 'desc' },
                  take: 5
                },
                roadmaps: {
                  orderBy: { createdAt: 'desc' },
                  take: 1
                }
              }
            }
          }
        }
      }
    });

    if (!parent) {
      res.status(404).json({ success: false, message: 'Parent profile not found' });
      return;
    }

    const linkedStudents = parent.studentLinks.map(link => {
      const st = link.student;
      // until the student approves, a parent sees only who they asked to link with
      const approved = link.status === 'ACTIVE';
      const latestAttempt = approved ? st.assessmentAttempts[0] || null : null;

      return {
        linkId: link.id,
        studentId: st.id,
        relationship: link.relationship,
        status: link.status,
        studentName: st.user.name,
        studentEmail: st.user.email,
        currentClass: st.currentClass,
        board: st.board,
        completionScore: approved ? st.completionScore : 0,
        latestAssessment: latestAttempt ? {
          attemptId: latestAttempt.id,
          completedAt: latestAttempt.completedAt,
          summary: latestAttempt.summaryReport,
          topStrengths: latestAttempt.strengthProfile ? JSON.parse(latestAttempt.strengthProfile) : [],
          readinessProfile: latestAttempt.readinessProfile ? JSON.parse(latestAttempt.readinessProfile) : {}
        } : null,
        topCareers: (approved ? st.recommendations : []).map(r => ({
          title: r.career.title,
          category: r.career.category,
          matchScore: r.matchScore,
          whyItMatches: r.whyItMatches,
          salaryRange: `₹${(r.career.salaryMinINR / 100000).toFixed(1)}L - ₹${(r.career.salaryMaxINR / 100000).toFixed(1)}L`
        })),
        activeRoadmap: approved && st.roadmaps[0] ? {
          careerTitle: st.roadmaps[0].careerTitle,
          milestones: JSON.parse(st.roadmaps[0].milestonesJson)
        } : null
      };
    });

    res.json({
      success: true,
      parentName: req.user?.name,
      linkedStudents
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch parent dashboard', error: err.message });
  }
});

/**
 * Link student by student email
 */
router.post('/link-student', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentEmail, relationship = 'Parent' } = req.body;
    if (!studentEmail) {
      res.status(400).json({ success: false, message: 'Student email is required' });
      return;
    }

    const parent = await prisma.parentProfile.findUnique({ where: { userId: req.user?.id } });
    if (!parent) {
      res.status(404).json({ success: false, message: 'Parent profile not found' });
      return;
    }

    const targetUser = await prisma.user.findUnique({
      where: { email: studentEmail },
      include: { studentProfile: true }
    });

    if (!targetUser || !targetUser.studentProfile) {
      res.status(404).json({ success: false, message: 'No student account found with this email' });
      return;
    }

    const existing = await prisma.parentStudentLink.findFirst({
      where: { parentId: parent.id, studentId: targetUser.studentProfile.id, status: { not: 'REVOKED' } }
    });
    if (existing) {
      res.json({
        success: true,
        message: existing.status === 'ACTIVE' ? `You're already linked with ${targetUser.name}.` : `Your request is waiting for ${targetUser.name} to approve.`,
        linkId: existing.id
      });
      return;
    }

    // The student must approve before the parent can see anything (DPDP Act consent).
    const link = await prisma.parentStudentLink.create({
      data: {
        parentId: parent.id,
        studentId: targetUser.studentProfile.id,
        relationship,
        status: 'PENDING',
        consentGiven: false
      }
    });

    res.json({
      success: true,
      message: `Request sent. You'll see ${targetUser.name}'s report once they approve it.`,
      linkId: link.id
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to link student', error: err.message });
  }
});

/**
 * Higher Education Financial Cost Planner Estimator
 */
router.post('/cost-planner', (req: AuthRequest, res: Response): void => {
  try {
    const { stream = 'Engineering', degreeType = 'UG_4_YEAR', collegeType = 'PRIVATE', cityTier = 'TIER_1' } = req.body;

    let baseAnnualTuition = 150000;
    if (stream === 'Medical') {
      baseAnnualTuition = collegeType === 'GOVERNMENT' ? 25000 : 1800000;
    } else if (stream === 'Engineering') {
      baseAnnualTuition = collegeType === 'GOVERNMENT' ? 120000 : 350000;
    } else if (stream === 'Design') {
      baseAnnualTuition = 300000;
    } else if (stream === 'Law') {
      baseAnnualTuition = 250000;
    } else {
      baseAnnualTuition = collegeType === 'GOVERNMENT' ? 30000 : 150000;
    }

    const durationYears = stream === 'Medical' || stream === 'Law' || stream === 'Architecture' ? 5 : 4;
    const annualLivingCost = cityTier === 'TIER_1' ? 180000 : 120000;
    const booksAndEquipment = stream === 'Design' || stream === 'Medical' ? 50000 : 25000;

    const totalTuition = baseAnnualTuition * durationYears;
    const totalLiving = annualLivingCost * durationYears;
    const totalIncidentals = booksAndEquipment * durationYears;
    const totalEstimatedCost = totalTuition + totalLiving + totalIncidentals;

    res.json({
      success: true,
      estimate: {
        stream,
        degreeDurationYears: durationYears,
        annualTuitionINR: baseAnnualTuition,
        annualLivingINR: annualLivingCost,
        annualIncidentalsINR: booksAndEquipment,
        totalTuitionINR: totalTuition,
        totalLivingINR: totalLiving,
        totalIncidentalsINR: totalIncidentals,
        totalEstimatedCostINR: totalEstimatedCost,
        suggestedMonthlySavingsINR: Math.round(totalEstimatedCost / (durationYears * 12 + 24)),
        disclaimer: 'Estimates based on published university fee structures and average tier-1/tier-2 living standards in India.'
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Cost planner calculation error', error: err.message });
  }
});

export default router;
