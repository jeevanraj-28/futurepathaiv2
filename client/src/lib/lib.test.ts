import { describe, expect, it } from 'vitest';
import { fitBand, formatINR, formatLPA, plainDimension, strengthBand } from './utils';
import { answeredCount, clearProgress, loadProgress, saveProgress, toServerClass } from './testProgress';
import { setLang, translate } from './i18n';
import { currentMilestoneIndex, roadmapProgress, type Roadmap } from './roadmap';
import { characterForRole } from './characters';

describe('fit bands', () => {
  it('leads with a band instead of a precise score', () => {
    expect(fitBand(92)).toEqual({ label: 'Strong fit', tone: 'leaf' });
    expect(fitBand(80)).toEqual({ label: 'Strong fit', tone: 'leaf' });
    expect(fitBand(79)).toEqual({ label: 'Good fit', tone: 'royal' });
    expect(fitBand(65)).toEqual({ label: 'Good fit', tone: 'royal' });
    expect(fitBand(64)).toEqual({ label: 'Worth exploring', tone: 'saffron' });
  });

  it('describes strengths in plain words', () => {
    expect(strengthBand(70).label).toBe('Strong');
    expect(strengthBand(50).label).toBe('Medium');
    expect(strengthBand(49).label).toBe('Still growing');
    expect(plainDimension('Numerical Reasoning')).toBe('Working with numbers');
    expect(plainDimension('Unknown thing')).toBe('Unknown thing');
  });
});

describe('money formatting', () => {
  it('formats salary ranges in lakh per annum', () => {
    expect(formatLPA(850000, 3200000)).toBe('₹8.5–32 LPA');
    expect(formatLPA(900000)).toBe('₹9 LPA');
    expect(formatLPA()).toBe('—');
  });

  it('uses Indian digit grouping for rupees', () => {
    expect(formatINR(1300000)).toBe('₹13,00,000');
    expect(formatINR(999)).toBe('₹999');
  });
});

describe('test progress on the device', () => {
  it('saves, merges and clears answers', () => {
    expect(answeredCount(loadProgress())).toBe(0);
    saveProgress({ answers: { q1: 0 }, grade: '10' });
    saveProgress({ answers: { q1: 0, q2: 2 }, index: 2 });
    const p = loadProgress();
    expect(answeredCount(p)).toBe(2);
    expect(p.grade).toBe('10');
    expect(p.index).toBe(2);
    clearProgress();
    expect(answeredCount(loadProgress())).toBe(0);
  });

  it('picks up drafts saved by the previous test page', () => {
    localStorage.setItem('futurepath_assessment_draft', JSON.stringify({ a: 1, b: 0 }));
    expect(answeredCount(loadProgress())).toBe(2);
  });

  it('maps classes to the two server decision points', () => {
    expect(toServerClass('9')).toBe('CLASS_10');
    expect(toServerClass('10')).toBe('CLASS_10');
    expect(toServerClass('11')).toBe('CLASS_12');
    expect(toServerClass('12')).toBe('CLASS_12');
  });
});

describe('English and Hindi strings', () => {
  it('fills placeholders in both languages', () => {
    expect(translate('en', 'tasks_done', { done: 2, total: 12 })).toBe('2 of 12 tasks done');
    expect(translate('hi', 'tasks_done', { done: 2, total: 12 })).toBe('12 में से 2 काम पूरे');
  });

  it('remembers the choice and sets the page language', () => {
    setLang('hi');
    expect(localStorage.getItem('futurepath_lang')).toBe('hi');
    expect(document.documentElement.lang).toBe('hi');
    setLang('en');
    expect(document.documentElement.lang).toBe('en');
  });
});

describe('roadmap helpers', () => {
  const roadmap: Roadmap = {
    id: 'r1',
    careerTitle: 'Data Scientist',
    milestones: [
      { period: '30 days', title: 'Start', tasks: [{ task: 'a', completed: true }, { task: 'b', completed: true }] },
      { period: '90 days', title: 'Build', tasks: [{ task: 'c', completed: false }, { task: 'd', completed: true }] },
    ],
  };

  it('counts progress across milestones', () => {
    expect(roadmapProgress(roadmap)).toEqual({ done: 3, total: 4, pct: 75 });
    expect(roadmapProgress(null)).toEqual({ done: 0, total: 0, pct: 0 });
  });

  it('points at the first milestone with work left', () => {
    expect(currentMilestoneIndex(roadmap)).toBe(1);
  });
});

describe('cast', () => {
  it('gives every role a character', () => {
    expect(characterForRole('PARENT')).toBe('sunita');
    expect(characterForRole('SCHOOL_ADMIN')).toBe('harjeet');
    expect(characterForRole(undefined)).toBe('aarav');
  });
});
