import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext, type AuthContextType } from '../context/auth';
import { AssessmentWorkspacePage } from './AssessmentWorkspacePage';
import { ApiService } from '../services/api';
import { loadProgress } from '../lib/testProgress';

const questions = Array.from({ length: 20 }, (_, i) => ({
  id: `q${i + 1}`,
  orderNumber: i + 1,
  prompt: `Question number ${i + 1}?`,
  category: 'APTITUDE',
  dimension: i % 2 ? 'Numerical Reasoning' : 'Logical Reasoning',
  weight: 1,
  options: [
    { text: `Best answer ${i + 1}`, score: 10, traits: [] },
    { text: `Other answer ${i + 1}`, score: 2, traits: [] },
  ],
}));

const visitor: AuthContextType = {
  user: null, subscription: null, loading: false,
  login: vi.fn(), register: vi.fn(), demoLogin: vi.fn(), logout: vi.fn(), refreshUser: vi.fn(),
};

const renderTest = () =>
  render(
    <AuthContext.Provider value={visitor}>
      <MemoryRouter>
        <AssessmentWorkspacePage />
      </MemoryRouter>
    </AuthContext.Provider>
  );

describe('discovery test', () => {
  it('saves answers on the device and pauses once after each section', async () => {
    vi.spyOn(ApiService, 'getQuestions').mockResolvedValue({ success: true, count: 20, questions });
    const user = userEvent.setup();
    renderTest();

    for (let i = 1; i <= 10; i++) {
      await user.click(await screen.findByRole('radio', { name: new RegExp(`Best answer ${i}$`) }));
    }

    expect(await screen.findByText('Section 1 complete')).toBeInTheDocument();
    // all ten strongest answers were logical/numerical, so the insight names one of them
    expect(screen.getByText(/working (things out step by step|with numbers)/i)).toBeInTheDocument();
    expect(Object.keys(loadProgress().answers)).toHaveLength(10);
    expect(loadProgress().breaksSeen).toEqual([1]);

    await user.click(screen.getByRole('button', { name: 'Start section 2' }));
    expect(await screen.findByText('Question number 11?')).toBeInTheDocument();

    // going back and forward again doesn't show the same break twice
    await user.click(screen.getByRole('button', { name: /Previous/ }));
    await user.click(await screen.findByRole('button', { name: /Next/ }));
    await waitFor(() => expect(screen.getByText('Question number 11?')).toBeInTheDocument());
    expect(screen.queryByText('Section 1 complete')).not.toBeInTheDocument();
  });

  it('shows a retry when the questions cannot load', async () => {
    vi.spyOn(ApiService, 'getQuestions').mockRejectedValue(new Error('offline'));
    renderTest();
    expect(await screen.findByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});
