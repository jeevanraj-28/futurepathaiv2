import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { PaymentService } from '../services/paymentService';

const router = Router();

/**
 * Get all available subscription plans
 */
router.get('/plans', async (req: Request, res: Response): Promise<void> => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { priceINR: 'asc' }
    });

    const parsed = plans.map(p => ({
      id: p.id,
      code: p.code,
      name: p.name,
      description: p.description,
      priceINR: p.priceINR,
      billingType: p.billingType,
      features: JSON.parse(p.featuresJson || '[]'),
      isPopular: p.isPopular
    }));

    res.json({ success: true, plans: parsed });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch plans', error: err.message });
  }
});

/**
 * Create Checkout Order (Razorpay Sandbox/Production)
 */
router.post('/create-order', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { planCode } = req.body;
    if (!planCode) {
      res.status(400).json({ success: false, message: 'Plan code is required' });
      return;
    }

    const orderData = await PaymentService.createOrder(req.user!.id, planCode);
    res.json({ success: true, order: orderData });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to create payment order', error: err.message });
  }
});

/**
 * Verify payment signature & activate subscription
 */
router.post('/verify-payment', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId, paymentId, signature } = req.body;

    if (!orderId || !paymentId || !signature) {
      res.status(400).json({ success: false, message: 'orderId, paymentId, and signature are required' });
      return;
    }

    const result = await PaymentService.verifyPayment(
      req.user!.id,
      orderId,
      paymentId,
      signature
    );

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Payment verification failed' });
  }
});

/**
 * Razorpay Webhook Endpoint
 */
router.post('/webhook', async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = (req.headers['x-razorpay-signature'] as string) || '';
    const payload = req.body;

    const result = await PaymentService.processWebhook(payload, signature);
    res.json(result);
  } catch (err: any) {
    console.error('Webhook error:', err);
    res.status(400).json({ success: false, message: 'Webhook processing error' });
  }
});

/**
 * Get user's billing history & invoices
 */
router.get('/invoices', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user?.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      invoices: payments.map(p => ({
        id: p.id,
        receiptNumber: p.receiptNumber,
        orderId: p.orderId,
        paymentId: p.paymentId,
        planCode: p.planCode,
        amountINR: p.amountINR,
        status: p.status,
        date: p.createdAt,
        method: p.method
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch invoices', error: err.message });
  }
});

/**
 * Cancel auto-renew subscription
 */
router.post('/cancel', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.subscription.updateMany({
      where: { userId: req.user?.id, status: 'ACTIVE' },
      data: { autoRenew: false }
    });

    res.json({
      success: true,
      message: 'Auto-renewal cancelled. You will continue to have access until your billing period ends.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to cancel subscription', error: err.message });
  }
});

export default router;
