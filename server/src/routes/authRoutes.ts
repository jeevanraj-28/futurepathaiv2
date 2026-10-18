import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'futurepath_jwt_super_secret_dev_key_2026_secured';

/**
 * Register new user
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role = 'STUDENT', phone, currentClass = 'CLASS_10' } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ success: false, message: 'Email, password and name are required' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email is already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        phone,
        role,
        studentProfile: role === 'STUDENT' ? {
          create: {
            currentClass: currentClass === 'CLASS_12' ? 'CLASS_12' : 'CLASS_10',
            completionScore: 25
          }
        } : undefined,
        parentProfile: role === 'PARENT' ? {
          create: {}
        } : undefined
      },
      include: {
        studentProfile: true,
        parentProfile: true
      }
    });

    // Auto-assign Free Explorer Plan
    const freePlan = await prisma.subscriptionPlan.findUnique({ where: { code: 'FREE' } });
    if (freePlan) {
      await prisma.subscription.create({
        data: {
          userId: user.id,
          planId: freePlan.id,
          status: 'ACTIVE'
        }
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        studentProfileId: user.studentProfile?.id
      },
      subscription: {
        planCode: 'FREE',
        isActive: true
      }
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Registration failed', error: err.message });
  }
});

/**
 * Login with email and password
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        parentProfile: true,
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const activeSub = user.subscriptions[0];

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        studentProfileId: user.studentProfile?.id
      },
      subscription: {
        planCode: activeSub ? activeSub.plan.code : 'FREE',
        planName: activeSub ? activeSub.plan.name : 'Free Explorer',
        isActive: !!activeSub
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Login failed', error: err.message });
  }
});

/**
 * Demo Login: 1-click switch between Student, Parent, School, Counselor, and Admin roles
 */
router.post('/demo-login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { role = 'STUDENT' } = req.body;

    const roleMap: Record<string, string> = {
      STUDENT: 'student@futurepath.ai',
      PARENT: 'parent@futurepath.ai',
      SCHOOL_ADMIN: 'school@futurepath.ai',
      COUNSELOR: 'counselor@futurepath.ai',
      PLATFORM_ADMIN: 'admin@futurepath.ai'
    };

    const targetEmail = roleMap[role] || 'student@futurepath.ai';

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: {
        studentProfile: true,
        parentProfile: true,
        counselorProfile: true,
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user) {
      res.status(404).json({ success: false, message: `Demo user for role ${role} not found` });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const activeSub = user.subscriptions[0];

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        studentProfileId: user.studentProfile?.id
      },
      subscription: {
        planCode: activeSub ? activeSub.plan.code : 'PREMIUM_STUDENT',
        planName: activeSub ? activeSub.plan.name : 'Premium Student Annual',
        isActive: true
      }
    });
  } catch (err: any) {
    console.error('Demo login error:', err);
    res.status(500).json({ success: false, message: 'Demo login failed', error: err.message });
  }
});

/**
 * Get current session user
 */
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      include: {
        studentProfile: true,
        parentProfile: true,
        counselorProfile: true,
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const activeSub = user.subscriptions[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        studentProfile: user.studentProfile,
        parentProfile: user.parentProfile,
        counselorProfile: user.counselorProfile
      },
      subscription: {
        planCode: activeSub ? activeSub.plan.code : 'FREE',
        planName: activeSub ? activeSub.plan.name : 'Free Explorer',
        isActive: !!activeSub,
        endDate: activeSub?.endDate
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch session', error: err.message });
  }
});

export default router;
