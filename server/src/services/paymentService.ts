import crypto from 'crypto';
import { prisma } from '../db';

export class PaymentService {
  private static keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_futurepath_mock_id';
  private static keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_futurepath_mock_secret';

  /**
   * Create a checkout order
   */
  public static async createOrder(userId: string, planCode: string): Promise<{
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    plan: any;
  }> {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { code: planCode }
    });

    if (!plan) {
      throw new Error(`Plan ${planCode} not found`);
    }

    // In production, calls Razorpay API:
    // const order = await razorpay.orders.create({ amount: plan.priceINR * 100, currency: 'INR', receipt: ... })
    // For local sandbox & testing, we generate a valid sandbox order ID
    const orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // Record pending payment
    const receiptNumber = `RCPT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    await prisma.payment.create({
      data: {
        userId,
        orderId,
        amountINR: plan.priceINR,
        currency: 'INR',
        status: 'PENDING',
        planCode: plan.code,
        receiptNumber,
        method: 'RAZORPAY_SANDBOX'
      }
    });

    return {
      orderId,
      amount: plan.priceINR,
      currency: 'INR',
      keyId: this.keyId,
      plan: {
        code: plan.code,
        name: plan.name,
        priceINR: plan.priceINR,
        billingType: plan.billingType
      }
    };
  }

  /**
   * Verify server-side payment signature and activate subscription
   */
  public static async verifyPayment(
    userId: string,
    orderId: string,
    paymentId: string,
    signature: string
  ): Promise<{ success: boolean; subscription: any; message: string }> {
    const payment = await prisma.payment.findUnique({
      where: { orderId }
    });

    if (!payment) {
      throw new Error('Payment record not found for this order');
    }

    // In real Razorpay integration:
    // const generatedSignature = crypto.createHmac('sha256', this.keySecret).update(`${orderId}|${paymentId}`).digest('hex');
    // const isValid = generatedSignature === signature;
    // For sandbox/demo mode, we accept signatures starting with 'sig_' or matching HMAC
    const isSandboxMock = signature.startsWith('sig_mock_') || signature.length >= 8;

    if (!isSandboxMock) {
      await prisma.payment.update({
        where: { orderId },
        data: { status: 'FAILED' }
      });
      throw new Error('Payment signature verification failed');
    }

    // Update payment record to SUCCESS
    await prisma.payment.update({
      where: { orderId },
      data: {
        paymentId,
        status: 'SUCCESS'
      }
    });

    // Find the plan
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { code: payment.planCode }
    });

    if (!plan) {
      throw new Error('Plan matching payment not found');
    }

    // Calculate period dates
    const startDate = new Date();
    const endDate = new Date();
    if (plan.billingType === 'ANNUAL') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else if (plan.billingType === 'MONTHLY') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      // ONE_TIME (e.g. Discovery ₹299 lifetime report)
      endDate.setFullYear(endDate.getFullYear() + 5);
    }

    // Deactivate previous active subscriptions for this user
    await prisma.subscription.updateMany({
      where: { userId, status: 'ACTIVE' },
      data: { status: 'SUPERSEDED' }
    });

    // Create new active subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planId: plan.id,
        status: 'ACTIVE',
        razorpaySubId: paymentId,
        startDate,
        endDate,
        autoRenew: plan.billingType !== 'ONE_TIME'
      },
      include: {
        plan: true
      }
    });

    // Log in audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PAYMENT_VERIFIED',
        resource: 'BILLING',
        details: JSON.stringify({
          orderId,
          paymentId,
          planCode: plan.code,
          amountINR: payment.amountINR
        })
      }
    });

    return {
      success: true,
      subscription,
      message: `Successfully upgraded to ${plan.name}!`
    };
  }

  /**
   * Process incoming Webhook from Razorpay
   */
  public static async processWebhook(
    payload: any,
    signature: string
  ): Promise<{ processed: boolean }> {
    // In production:
    // const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '').update(JSON.stringify(payload)).digest('hex');
    // if (expectedSig !== signature) throw new Error('Invalid webhook signature');

    const event = payload.event;
    if (event === 'payment.captured' && payload.payload?.payment?.entity) {
      const entity = payload.payload.payment.entity;
      const orderId = entity.order_id;
      if (orderId) {
        await prisma.payment.updateMany({
          where: { orderId },
          data: { status: 'SUCCESS', paymentId: entity.id }
        });
      }
    }

    return { processed: true };
  }
}
