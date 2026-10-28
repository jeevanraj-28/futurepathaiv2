import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, AuthRequest, requireRoles } from '../middleware/auth';

const router = Router();

/**
 * Platform Administrator SaaS Revenue & Metric Intelligence
 */
router.get('/metrics', authenticateToken, requireRoles(['PLATFORM_ADMIN']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await prisma.user.count();
    const studentUsers = await prisma.user.count({ where: { role: 'STUDENT' } });
    const parentUsers = await prisma.user.count({ where: { role: 'PARENT' } });
    const schoolUsers = await prisma.user.count({ where: { role: 'SCHOOL_ADMIN' } });
    const counselorUsers = await prisma.user.count({ where: { role: 'COUNSELOR' } });

    const activeSubscriptions = await prisma.subscription.count({
      where: {
        status: 'ACTIVE',
        plan: { code: { not: 'FREE' } }
      }
    });

    // Real recorded cash payments
    const payments = await prisma.payment.findMany({
      where: { status: 'SUCCESS' }
    });

    const totalRevenueINR = payments.reduce((sum, p) => sum + p.amountINR, 0);

    // MRR calculation based on active annual/monthly subscriptions
    const activeSubs = await prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      include: { plan: true }
    });

    let mrrEstimateINR = 0;
    for (const sub of activeSubs) {
      if (sub.plan.billingType === 'ANNUAL') {
        mrrEstimateINR += Math.round(sub.plan.priceINR / 12);
      } else if (sub.plan.billingType === 'MONTHLY') {
        mrrEstimateINR += sub.plan.priceINR;
      }
    }
    const arrEstimateINR = mrrEstimateINR * 12;

    const conversionRate = studentUsers > 0 ? ((activeSubscriptions / studentUsers) * 100).toFixed(1) : '0.0';
    const totalBookings = await prisma.counselorBooking.count();

    res.json({
      success: true,
      metrics: {
        totalUsers,
        breakdown: {
          students: studentUsers,
          parents: parentUsers,
          schools: schoolUsers,
          counselors: counselorUsers
        },
        activeSubscriptions,
        conversionRatePercent: Number(conversionRate),
        totalRevenueINR,
        mrrEstimateINR,
        arrEstimateINR,
        totalCounselorBookings: totalBookings,
        aiUsageCostEstINR: Math.round(totalUsers * 2.5) // ₹2.5 per user estimated token inference
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin metrics', error: err.message });
  }
});

/**
 * List registered platform users
 */
router.get('/users', authenticateToken, requireRoles(['PLATFORM_ADMIN']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        studentProfile: { select: { currentClass: true, completionScore: true } },
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { plan: { select: { code: true, name: true } } },
          take: 1
        }
      }
    });

    const parsed = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      class: u.studentProfile?.currentClass || 'N/A',
      completionScore: u.studentProfile?.completionScore || 0,
      plan: u.subscriptions[0]?.plan.name || 'Free Explorer',
      createdAt: u.createdAt
    }));

    res.json({ success: true, count: parsed.length, users: parsed });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch user list', error: err.message });
  }
});

/**
 * Update plan price dynamically
 */
router.post('/plans/:code/price', authenticateToken, requireRoles(['PLATFORM_ADMIN']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    const { priceINR } = req.body;

    if (priceINR === undefined || isNaN(Number(priceINR))) {
      res.status(400).json({ success: false, message: 'Valid priceINR number is required' });
      return;
    }

    const updated = await prisma.subscriptionPlan.update({
      where: { code },
      data: { priceINR: Number(priceINR) }
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'PLAN_PRICE_UPDATED',
        resource: 'BILLING',
        details: JSON.stringify({ code, newPriceINR: priceINR })
      }
    });

    res.json({
      success: true,
      message: `Plan ${updated.name} price updated to ₹${updated.priceINR}`,
      plan: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update plan price', error: err.message });
  }
});

/**
 * Get system audit logs
 */
router.get('/audit-logs', authenticateToken, requireRoles(['PLATFORM_ADMIN']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: { select: { email: true, name: true, role: true } }
      }
    });

    res.json({ success: true, count: logs.length, logs });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs', error: err.message });
  }
});

export default router;
