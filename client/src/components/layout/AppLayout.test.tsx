import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthContext, type AuthContextType } from '../../context/auth';
import { AppLayout } from './AppLayout';
import type { User } from '../../types';

const auth = (user: User | null): AuthContextType => ({
  user, subscription: user ? { planCode: 'FREE', planName: 'Free Explorer', isActive: true } : null, loading: false,
  login: vi.fn(), register: vi.fn(), demoLogin: vi.fn(), logout: vi.fn(), refreshUser: vi.fn(),
});

const LoginProbe = () => {
  const { search } = useLocation();
  return <p>login page {search}</p>;
};

const renderAt = (user: User | null) =>
  render(
    <AuthContext.Provider value={auth(user)}>
      <MemoryRouter initialEntries={['/plan?career=Pilot']}>
        <Routes>
          <Route element={<AppLayout roles={['STUDENT']} />}>
            <Route path="/plan" element={<p>plan page</p>} />
          </Route>
          <Route path="/login" element={<LoginProbe />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );

describe('signed-in area', () => {
  it('sends visitors to log in and remembers where they were going', () => {
    renderAt(null);
    expect(screen.getByText(`login page ?next=${encodeURIComponent('/plan?career=Pilot')}`)).toBeInTheDocument();
  });

  it('shows the page and the four student sections to a student', () => {
    renderAt({ id: '1', email: 's@x.com', name: 'Aarav Sharma', role: 'STUDENT' });
    expect(screen.getByText('plan page')).toBeInTheDocument();
    for (const label of ['Home', 'Discover', 'My plan', 'Mentor']) {
      expect(screen.getAllByRole('link', { name: label }).length).toBeGreaterThan(0);
    }
  });

  it('keeps other roles out of student pages', () => {
    renderAt({ id: '2', email: 'p@x.com', name: 'Sunita Sharma', role: 'PARENT' });
    expect(screen.queryByText('plan page')).not.toBeInTheDocument();
    expect(screen.getByText('This area isn’t part of your account')).toBeInTheDocument();
  });
});
