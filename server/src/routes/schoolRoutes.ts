import { Router, Response } from 'express';
import { prisma } from '../db';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { authenticateToken, AuthRequest, requireRoles } from '../middleware/auth';
import { parseReadiness, streamDistribution as streamDistributionOf } from '../services/schoolInsights';
import { validateRoster } from '../services/rosterImport';

const INVITE_DAYS = 14;

/** The school this staff member belongs to; platform admins and demo admins see the demo school. */
const findSchoolIdForUser = async (userId?: string) => {
  const own = await prisma.school.findFirst({ where: { memberships: { some: { userId } } }, select: { id: true } });
  if (own) return own.id;
  const demo = await prisma.school.findFirst({ where: { code: 'DPS-PUNE-01' }, select: { id: true } });
  return demo?.id || null;
};

const router = Router();

/**
 * Get School Organization Dashboard & Aggregated Analytics
 */
router.get('/dashboard', authenticateToken, requireRoles(['SCHOOL_ADMIN', 'PLATFORM_ADMIN']), async (req: AuthRequest, res: Response): Promise<void> => {
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

    // Real stream interest: each tested student's strongest stream
    const streamDistribution = streamDistributionOf(
      school.enrollments.map(e => parseReadiness(e.student.assessmentAttempts[0]?.readinessProfile))
    );

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
router.get('/students', authenticateToken, requireRoles(['SCHOOL_ADMIN', 'PLATFORM_ADMIN']), async (req: AuthRequest, res: Response): Promise<void> => {
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
router.post('/bulk-import', authenticateToken, requireRoles(['SCHOOL_ADMIN', 'PLATFORM_ADMIN']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { valid, errors } = validateRoster(req.body.studentsList);
    const schoolId = await findSchoolIdForUser(req.user?.id);
    if (!schoolId) {
      res.status(404).json({ success: false, message: 'School organization not found' });
      return;
    }
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: { classGroups: true, _count: { select: { enrollments: true } } }
    });
    if (!school) {
      res.status(404).json({ success: false, message: 'School organization not found' });
      return;
    }

    let seatsLeft = Math.max(0, school.maxStudents - school._count.enrollments);
    const created: Array<{ name: string; email: string; inviteToken: string }> = [];
    const skipped: Array<{ email: string; reason: string }> = [];

    for (const row of valid) {
      if (seatsLeft <= 0) {
        skipped.push({ email: row.email, reason: 'No seats left on your plan' });
        continue;
      }
      const existing = await prisma.user.findUnique({ where: { email: row.email } });
      if (existing) {
        skipped.push({ email: row.email, reason: 'An account with this email already exists' });
        continue;
      }
      // match a batch whose name mentions the class, e.g. "Class 10-A" for CLASS_10
      const classDigits = row.currentClass === 'CLASS_12' ? '12' : '10';
      const classGroup = school.classGroups.find(g => g.name.includes(classDigits));
      // the account can't be logged into until the student sets a password with the invite
      const unusablePassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
      const token = crypto.randomBytes(24).toString('hex');

      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: row.email,
            name: row.name,
            passwordHash: unusablePassword,
            role: 'STUDENT',
            studentProfile: { create: { currentClass: row.currentClass, board: school.board, completionScore: 25 } }
          },
          include: { studentProfile: true }
        });
        await tx.studentEnrollment.create({
          data: { studentId: user.studentProfile!.id, schoolId: school.id, classGroupId: classGroup?.id, rollNumber: row.rollNumber }
        });
        await tx.studentInvite.create({
          data: { token, userId: user.id, schoolId: school.id, expiresAt: new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000) }
        });
      });
      seatsLeft -= 1;
      created.push({ name: row.name, email: row.email, inviteToken: token });
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'ROSTER_IMPORTED',
        resource: 'SCHOOL',
        details: JSON.stringify({ schoolId: school.id, created: created.length, skipped: skipped.length, errors: errors.length })
      }
    });

    res.json({
      success: true,
      message: `${created.length} student${created.length === 1 ? '' : 's'} added. ${skipped.length} skipped, ${errors.length} with errors.`,
      importedCount: created.length,
      created,
      skipped,
      errors
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to import CSV roster', error: err.message });
  }
});

export default router;
