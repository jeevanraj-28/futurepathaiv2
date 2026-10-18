import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'futurepath_jwt_super_secret_dev_key_2026_secured';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
    studentProfileId?: string;
  };
  subscription?: {
    planCode: string;
    isActive: boolean;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string; name: string };
    
    // Fetch user and check status
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        studentProfile: { select: { id: true } },
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'User not found or account deactivated' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      studentProfileId: user.studentProfile?.id
    };

    const activeSub = user.subscriptions[0];
    req.subscription = {
      planCode: activeSub ? activeSub.plan.code : 'FREE',
      isActive: !!activeSub
    };

    next();
  } catch (error) {
    res.status(403).json({ success: false, message: 'Invalid or expired authentication token' });
    return;
  }
};

export const requireRoles = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Access denied: insufficient permissions' });
      return;
    }

    next();
  };
};

export const requireEntitlement = (allowedPlans: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const currentPlan = req.subscription?.planCode || 'FREE';
    
    // Platform admin always has access
    if (req.user.role === 'PLATFORM_ADMIN') {
      return next();
    }

    if (!allowedPlans.includes(currentPlan)) {
      res.status(402).json({
        success: false,
        message: 'This premium feature requires an upgraded subscription plan',
        requiredPlans: allowedPlans,
        currentPlan
      });
      return;
    }

    next();
  };
};
