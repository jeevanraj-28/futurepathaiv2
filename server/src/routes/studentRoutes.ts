import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { computeWeeklyStreak } from '../services/streakService';

const router = Router();

/**
 * Get Student Profile
 */
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user?.id },
      include: {
        savedCareers: { include: { career: true } },
        savedColleges: { include: { college: true } },
        parentLinks: { include: { parent: { include: { user: { select: { name: true, email: true } } } } } }
      }
    });

    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    res.json({ success: true, profile: student });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch student profile', error: err.message });
  }
});

/**
 * Update Student Profile / Onboarding Progress
 */
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      currentClass,
      board,
      state,
      city,
      currentSubjects,
      scoreRange,
      favouriteSubjects,
      difficultSubjects,
      hobbies,
      preferredActivities,
      skills,
      learningStyle,
      budgetRange,
      willingnessToRelocate,
      preferredLanguages,
      careerExpectations
    } = req.body;

    // Calculate dynamic completion score (0 - 100%)
    let points = 20; // base account
    if (currentClass) points += 10;
    if (board && state) points += 15;
    if (favouriteSubjects && favouriteSubjects.length > 0) points += 15;
    if (skills && skills.length > 0) points += 10;
    if (hobbies && hobbies.length > 0) points += 10;
    if (budgetRange) points += 10;
    if (careerExpectations) points += 10;

    const completionScore = Math.min(100, points);
    const onboardingCompleted = completionScore >= 70;

    const updated = await prisma.studentProfile.upsert({
      where: { userId: req.user?.id },
      update: {
        currentClass: currentClass || undefined,
        board: board || undefined,
        state: state || undefined,
        city: city || undefined,
        currentSubjects: currentSubjects ? JSON.stringify(currentSubjects) : undefined,
        scoreRange: scoreRange || undefined,
        favouriteSubjects: favouriteSubjects ? JSON.stringify(favouriteSubjects) : undefined,
        difficultSubjects: difficultSubjects ? JSON.stringify(difficultSubjects) : undefined,
        hobbies: hobbies ? JSON.stringify(hobbies) : undefined,
        preferredActivities: preferredActivities ? JSON.stringify(preferredActivities) : undefined,
        skills: skills ? JSON.stringify(skills) : undefined,
        learningStyle: learningStyle || undefined,
        budgetRange: budgetRange || undefined,
        willingnessToRelocate: willingnessToRelocate !== undefined ? willingnessToRelocate : undefined,
        preferredLanguages: preferredLanguages ? JSON.stringify(preferredLanguages) : undefined,
        careerExpectations: careerExpectations || undefined,
        completionScore,
        onboardingCompleted
      },
      create: {
        userId: req.user!.id,
        currentClass: currentClass || 'CLASS_10',
        board: board || 'CBSE',
        state: state || 'Maharashtra',
        city: city || 'Pune',
        completionScore,
        onboardingCompleted
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updated,
      completionScore,
      onboardingCompleted
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update profile', error: err.message });
  }
});

/**
 * Student Dashboard Overview
 */
router.get('/dashboard', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
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
          take: 5
        },
        roadmaps: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        savedCareers: {
          include: { career: true }
        },
        savedColleges: {
          include: { college: true }
        }
      }
    });

    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    const latestAttempt = student.assessmentAttempts[0] || null;
    let dimensionScores = null;
    let readinessProfile = null;
    if (latestAttempt && latestAttempt.dimensionScores) {
      try {
        dimensionScores = JSON.parse(latestAttempt.dimensionScores);
      } catch (e) {
        dimensionScores = null;
      }
    }
    if (latestAttempt && latestAttempt.readinessProfile) {
      try {
        readinessProfile = JSON.parse(latestAttempt.readinessProfile);
      } catch (e) {
        readinessProfile = null;
      }
    }

    const completions = await prisma.taskCompletion.findMany({
      where: { studentId: student.id },
      select: { completedAt: true }
    });
    const streak = computeWeeklyStreak(completions.map(c => c.completedAt));
    const pendingParentRequests = await prisma.parentStudentLink.count({
      where: { studentId: student.id, status: 'PENDING' }
    });

    // Key statistics and stream recommendations
    const dashboardData = {
      ...streak,
      pendingParentRequests,
      studentName: req.user?.name,
      currentClass: student.currentClass,
      board: student.board,
      completionScore: student.completionScore,
      onboardingCompleted: student.onboardingCompleted,
      assessmentCompleted: latestAttempt?.status === 'COMPLETED',
      latestAttemptId: latestAttempt?.id,
      dimensionScores,
      readinessProfile,
      topRecommendations: student.recommendations.map(r => ({
        careerId: r.careerId,
        title: r.career.title,
        slug: r.career.slug,
        category: r.career.category,
        stream: r.career.stream,
        matchScore: r.matchScore,
        whyItMatches: r.whyItMatches,
        salaryMinINR: r.career.salaryMinINR,
        salaryMaxINR: r.career.salaryMaxINR,
        futureDemand: r.career.futureDemand
      })),
      activeRoadmap: student.roadmaps[0] ? {
        id: student.roadmaps[0].id,
        careerTitle: student.roadmaps[0].careerTitle,
        targetYear: student.roadmaps[0].targetYear,
        milestones: JSON.parse(student.roadmaps[0].milestonesJson)
      } : null,
      savedCareersCount: student.savedCareers.length,
      savedCollegesCount: student.savedColleges.length,
      subscriptionPlan: req.subscription?.planCode || 'FREE',
      isPremium: req.subscription?.planCode !== 'FREE'
    };

    res.json({ success: true, dashboard: dashboardData });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard data', error: err.message });
  }
});

/**
 * Toggle Save / Bookmark Career
 */
router.post('/save-career/:careerId', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user?.id } });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    const { careerId } = req.params;
    const existing = await prisma.savedCareer.findUnique({
      where: {
        studentId_careerId: {
          studentId: student.id,
          careerId
        }
      }
    });

    if (existing) {
      await prisma.savedCareer.delete({
        where: { id: existing.id }
      });
      res.json({ success: true, saved: false, message: 'Career removed from bookmarks' });
    } else {
      await prisma.savedCareer.create({
        data: {
          studentId: student.id,
          careerId
        }
      });
      res.json({ success: true, saved: true, message: 'Career saved to bookmarks' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update saved career', error: err.message });
  }
});

/**
 * Toggle Save / Bookmark College
 */
router.post('/save-college/:collegeId', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user?.id } });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    const { collegeId } = req.params;
    const existing = await prisma.savedCollege.findUnique({
      where: {
        studentId_collegeId: {
          studentId: student.id,
          collegeId
        }
      }
    });

    if (existing) {
      await prisma.savedCollege.delete({
        where: { id: existing.id }
      });
      res.json({ success: true, saved: false, message: 'College removed from bookmarks' });
    } else {
      await prisma.savedCollege.create({
        data: {
          studentId: student.id,
          collegeId
        }
      });
      res.json({ success: true, saved: true, message: 'College saved to bookmarks' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update saved college', error: err.message });
  }
});

/**
 * Parent link requests and approved links for the signed-in student
 */
router.get('/parent-links', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user?.id } });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }
    const links = await prisma.parentStudentLink.findMany({
      where: { studentId: student.id, status: { not: 'REVOKED' } },
      include: { parent: { include: { user: { select: { name: true, email: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({
      success: true,
      links: links.map(l => ({
        id: l.id,
        status: l.status,
        relationship: l.relationship,
        parentName: l.parent.user.name,
        parentEmail: l.parent.user.email,
        createdAt: l.createdAt
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch parent links', error: err.message });
  }
});

/**
 * Approve, decline or remove a parent's access. Only the student can do this.
 */
router.post('/parent-links/:id/:action', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, action } = req.params;
    if (!['approve', 'reject', 'remove'].includes(action)) {
      res.status(400).json({ success: false, message: 'Action must be approve, reject or remove' });
      return;
    }
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user?.id } });
    const link = student ? await prisma.parentStudentLink.findFirst({ where: { id, studentId: student.id } }) : null;
    if (!link) {
      res.status(404).json({ success: false, message: 'Link not found' });
      return;
    }
    if (action === 'approve' && link.status !== 'PENDING') {
      res.status(400).json({ success: false, message: 'Only pending requests can be approved' });
      return;
    }

    const approved = action === 'approve';
    const updated = await prisma.parentStudentLink.update({
      where: { id },
      data: { status: approved ? 'ACTIVE' : 'REVOKED', consentGiven: approved }
    });
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: approved ? 'PARENT_LINK_APPROVED' : 'PARENT_LINK_REVOKED',
        resource: 'CONSENT',
        details: JSON.stringify({ linkId: id })
      }
    });
    res.json({ success: true, status: updated.status });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update parent link', error: err.message });
  }
});

export default router;
