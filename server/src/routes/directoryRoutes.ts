import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

/**
 * List & search Colleges
 */
router.get('/colleges', async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, state, maxFee } = req.query;
    const where: any = {};

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search } },
        { city: { contains: search } },
        { admissionRoute: { contains: search } }
      ];
    }

    if (state && typeof state === 'string' && state !== 'ALL') {
      where.state = state;
    }

    if (maxFee && !isNaN(Number(maxFee))) {
      where.feeMinINR = { lte: Number(maxFee) };
    }

    const colleges = await prisma.college.findMany({
      where,
      orderBy: { nirfRank: 'asc' }
    });

    const parsed = colleges.map(c => ({
      id: c.id,
      name: c.name,
      state: c.state,
      city: c.city,
      nirfRank: c.nirfRank,
      courses: JSON.parse(c.coursesJson || '[]'),
      feeMinINR: c.feeMinINR,
      feeMaxINR: c.feeMaxINR,
      accreditation: c.accreditation,
      admissionRoute: c.admissionRoute,
      websiteUrl: c.websiteUrl,
      verifiedDate: c.verifiedDate
    }));

    res.json({ success: true, count: parsed.length, colleges: parsed });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch colleges', error: err.message });
  }
});

/**
 * List & search Entrance Exams
 */
router.get('/exams', async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, stream } = req.query;
    const where: any = {};

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search } },
        { fullName: { contains: search } },
        { conductingAuthority: { contains: search } }
      ];
    }

    const exams = await prisma.entranceExam.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    let filtered = exams.map(e => ({
      id: e.id,
      name: e.name,
      fullName: e.fullName,
      conductingAuthority: e.conductingAuthority,
      targetStreams: JSON.parse(e.targetStreamsJson || '[]'),
      eligibleCourses: JSON.parse(e.eligibleCoursesJson || '[]'),
      examFrequency: e.examFrequency,
      examMode: e.examMode,
      importantDatesInfo: e.importantDatesInfo,
      officialWebsite: e.officialWebsite
    }));

    if (stream && typeof stream === 'string' && stream !== 'ALL') {
      filtered = filtered.filter(e => e.targetStreams.includes(stream) || e.targetStreams.includes('ANY'));
    }

    res.json({ success: true, count: filtered.length, exams: filtered });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch exams', error: err.message });
  }
});

/**
 * List & search Scholarships
 */
router.get('/scholarships', async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;
    const where: any = {};

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search } },
        { provider: { contains: search } },
        { eligibility: { contains: search } }
      ];
    }

    const scholarships = await prisma.scholarship.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    const parsed = scholarships.map(s => ({
      id: s.id,
      name: s.name,
      provider: s.provider,
      eligibility: s.eligibility,
      benefitAmount: s.benefitAmount,
      incomeCeiling: s.incomeCeiling,
      requiredDocs: JSON.parse(s.requiredDocsJson || '[]'),
      officialUrl: s.officialUrl,
      deadlineText: s.deadlineText,
      lastVerifiedDate: s.lastVerifiedDate
    }));

    res.json({ success: true, count: parsed.length, scholarships: parsed });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch scholarships', error: err.message });
  }
});

export default router;
