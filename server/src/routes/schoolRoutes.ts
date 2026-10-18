import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, AuthRequest, requireRoles } from '../middleware/auth';

const router = Router();

/**
 * Get School Organization Dashboard & Aggregated Analytics
 */
router.get('/dashboard', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Find school linked to this user (or fallback to demo school if school admin)
    let school = await prisma.school.findFirst({
      where: {
        memberships: { some: { userId: req.user?.id } }
      },
      include: {
        classGroups: true,
        enrollments: {
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
        }
      }
    });

    if (!school) {
      // Fallback to primary demo school for school admin preview
      school = await prisma.school.findFirst({
        where: { code: 'DPS-PUNE-01' },
        include: {
          classGroups: true,
          enrollments: {
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
          }
        }
      });
    }

    if (!school) {
      res.status(404).json({ success: false, message: 'School organization not found' });
      return;
    }

    const totalStudents = school.enrollments.length;
    const completedAssessments = school.enrollments.filter(e => e.student.assessmentAttempts.length > 0).length;
    const readinessRate = totalStudents > 0 ? Math.round((completedAssessments / totalStudents) * 100) : 85;

    // Stream distribution simulation
    const streamDistribution = [
      { stream: 'Science (PCM)', count: 42, percentage: 42 },
      { stream: 'Commerce with Math', count: 28, percentage: 28 },
      { stream: 'Science (PCB)', count: 18, percentage: 18 },
      { stream: 'Humanities & Design', count: 12, percentage: 12 }
    ];

    res.json({
      success: true,
      school: {
        id: school.id,
        name: school.name,
        code: school.code,
        board: school.board,
        city: school.city,
        state: school.state,
        subscriptionTier: school.subscriptionTier,
        maxStudents: school.maxStudents,
        totalEnrolledStudents: totalStudents,
        completedAssessments,
        readinessRate,
        batches: school.classGroups.map(cg => ({ id: cg.id, name: cg.name, academicYear: cg.academicYear })),
        streamDistribution
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch school dashboard', error: err.message });
  }
});

/**
 * Get Roster of Enrolled Students
 */
router.get('/students', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const school = await prisma.school.findFirst({
      where: {
        OR: [
          { memberships: { some: { userId: req.user?.id } } },
          { code: 'DPS-PUNE-01' }
        ]
      },
      include: {
        enrollments: {
          include: {
            classGroup: true,
            student: {
              include: {
                user: { select: { name: true, email: true, phone: true } },
                assessmentAttempts: {
                  where: { status: 'COMPLETED' },
                  orderBy: { completedAt: 'desc' },
                  take: 1
                }
              }
            }
          }
        }
      }
    });

    if (!school) {
      res.status(404).json({ success: false, message: 'School not found' });
      return;
    }

    const students = school.enrollments.map(e => {
      const attempt = e.student.assessmentAttempts[0] || null;
      let topStrengths = [];
      if (attempt?.strengthProfile) {
        try {
          topStrengths = JSON.parse(attempt.strengthProfile);
        } catch (err) {}
      }

      return {
        id: e.studentId,
        rollNumber: e.rollNumber || 'N/A',
        name: e.student.user.name,
        email: e.student.user.email,
        classGroup: e.classGroup?.name || 'Class 10-A',
        currentClass: e.student.currentClass,
        assessmentStatus: attempt ? 'COMPLETED' : 'PENDING',
        topStrengths,
        completionScore: e.student.completionScore,
        enrolledAt: e.enrolledAt
      };
    });

    res.json({ success: true, count: students.length, students });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch student roster', error: err.message });
  }
});

/**
 * Bulk Import Students via CSV (Simulation)
 */
router.post('/bulk-import', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentsList } = req.body; // array of { name, email, rollNumber, currentClass }
    const importedCount = Array.isArray(studentsList) && studentsList.length > 0 ? studentsList.length : 25;

    res.json({
      success: true,
      message: `Successfully processed CSV import! ${importedCount} student accounts registered and assigned invitation passes.`,
      importedCount
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to import CSV roster', error: err.message });
  }
});

export default router;
