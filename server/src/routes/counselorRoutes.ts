import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * List certified career counselors
 */
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const counselors = await prisma.counselorProfile.findMany({
      where: { isVerified: true },
      include: {
        user: { select: { name: true, email: true, avatarUrl: true } }
      }
    });

    const parsed = counselors.map(c => ({
      id: c.id,
      name: c.user.name,
      title: c.title,
      bio: c.bio,
      avatarUrl: c.user.avatarUrl,
      degrees: JSON.parse(c.degrees || '[]'),
      certifications: JSON.parse(c.certifications || '[]'),
      specializations: JSON.parse(c.specializations || '[]'),
      languages: JSON.parse(c.languages || '[]'),
      experienceYears: c.experienceYears,
      hourlyRateINR: c.hourlyRate,
      rating: c.rating,
      availableSlots: JSON.parse(c.availableSlots || '[]')
    }));

    res.json({ success: true, count: parsed.length, counselors: parsed });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch counselors', error: err.message });
  }
});

/**
 * Book 1-on-1 counseling session
 */
router.post('/book', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { counselorId, scheduledDate, slotTime, studentNotes, studentId: forStudentId } = req.body;

    // Students book for themselves; parents book for a child whose link the child approved.
    let student = await prisma.studentProfile.findUnique({ where: { userId: req.user?.id } });
    if (!student && req.user?.role === 'PARENT' && forStudentId) {
      const link = await prisma.parentStudentLink.findFirst({
        where: { studentId: forStudentId, status: 'ACTIVE', parent: { userId: req.user.id } }
      });
      if (link) student = await prisma.studentProfile.findUnique({ where: { id: forStudentId } });
    }
    if (!student) {
      res.status(404).json({ success: false, message: 'Choose a linked student to book a session for' });
      return;
    }

    if (!counselorId || !scheduledDate || !slotTime) {
      res.status(400).json({ success: false, message: 'Counselor ID, date, and slot time are required' });
      return;
    }

    const counselor = await prisma.counselorProfile.findUnique({ where: { id: counselorId } });
    if (!counselor) {
      res.status(404).json({ success: false, message: 'Counselor not found' });
      return;
    }

    const booking = await prisma.counselorBooking.create({
      data: {
        counselorId,
        studentId: student.id,
        scheduledDate,
        slotTime,
        durationMinutes: 60,
        amountPaid: counselor.hourlyRate,
        meetingLink: `https://meet.futurepath.ai/session-${Date.now().toString(36)}`,
        studentNotes,
        status: 'CONFIRMED',
        paymentStatus: 'PAID'
      }
    });

    res.json({
      success: true,
      message: 'Counseling session successfully scheduled!',
      booking: {
        id: booking.id,
        scheduledDate: booking.scheduledDate,
        slotTime: booking.slotTime,
        meetingLink: booking.meetingLink,
        amountPaidINR: booking.amountPaid,
        status: booking.status
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to schedule booking', error: err.message });
  }
});

/**
 * Get current user's session bookings
 */
router.get('/my-bookings', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user?.id } });
    const counselor = await prisma.counselorProfile.findUnique({ where: { userId: req.user?.id } });

    let bookings: any[] = [];
    if (student) {
      bookings = await prisma.counselorBooking.findMany({
        where: { studentId: student.id },
        include: { counselor: { include: { user: { select: { name: true } } } } },
        orderBy: { scheduledDate: 'asc' }
      });
    } else if (req.user?.role === 'PARENT') {
      bookings = await prisma.counselorBooking.findMany({
        where: { student: { parentLinks: { some: { status: 'ACTIVE', parent: { userId: req.user.id } } } } },
        include: {
          counselor: { include: { user: { select: { name: true } } } },
          student: { include: { user: { select: { name: true } } } }
        },
        orderBy: { scheduledDate: 'asc' }
      });
    } else if (counselor) {
      bookings = await prisma.counselorBooking.findMany({
        where: { counselorId: counselor.id },
        include: { student: { include: { user: { select: { name: true, email: true } } } } },
        orderBy: { scheduledDate: 'asc' }
      });
    }

    res.json({ success: true, count: bookings.length, bookings });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings', error: err.message });
  }
});

export default router;
