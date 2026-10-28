import { Compass, CreditCard, Home, Map, MessageCircle, Shield, Users, Wallet, type LucideIcon } from 'lucide-react';

export type NavItem = { to: string; label: string; icon: LucideIcon; match?: string[] };

export const homePathForRole = (role?: string) => {
  switch (role) {
    case 'PARENT': return '/parent-portal';
    case 'SCHOOL_ADMIN': return '/school-portal';
    case 'COUNSELOR': return '/counselor-portal';
    case 'PLATFORM_ADMIN': return '/admin';
    default: return '/dashboard';
  }
};

const DISCOVER: NavItem = {
  to: '/discover', label: 'Discover', icon: Compass,
  match: ['/discover', '/careers', '/stream-guide', '/colleges', '/exams', '/scholarships'],
};

/** Four sections for students everywhere — Home, Discover, My plan, Mentor — and a short role-specific set for others. */
export const navForRole = (role?: string): NavItem[] => {
  switch (role) {
    case 'PARENT':
      return [
        { to: '/parent-portal', label: 'Overview', icon: Home },
        DISCOVER,
        { to: '/counselors', label: 'Counsellors', icon: Users },
        { to: '/billing', label: 'Billing', icon: Wallet },
      ];
    case 'SCHOOL_ADMIN':
      return [
        { to: '/school-portal', label: 'Overview', icon: Home },
        DISCOVER,
        { to: '/billing', label: 'Billing', icon: Wallet },
      ];
    case 'COUNSELOR':
      return [
        { to: '/counselor-portal', label: 'Sessions', icon: Home },
        DISCOVER,
      ];
    case 'PLATFORM_ADMIN':
      return [
        { to: '/admin', label: 'Admin', icon: Shield },
        DISCOVER,
        { to: '/billing', label: 'Billing', icon: CreditCard },
      ];
    default:
      return [
        { to: '/dashboard', label: 'Home', icon: Home },
        DISCOVER,
        { to: '/plan', label: 'My plan', icon: Map, match: ['/plan', '/roadmap', '/assessment/results'] },
        { to: '/mentor', label: 'Mentor', icon: MessageCircle, match: ['/mentor', '/counselors'] },
      ];
  }
};

export const isActive = (item: NavItem, pathname: string) =>
  (item.match || [item.to]).some((p) => pathname === p || pathname.startsWith(`${p}/`));
