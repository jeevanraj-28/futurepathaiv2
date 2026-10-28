import test from 'node:test';
import assert from 'node:assert/strict';
import { computeWeeklyStreak, istWeekIndex } from '../services/streakService';
import { streamDistribution, parseReadiness } from '../services/schoolInsights';
import { validateRoster, toServerClass, MAX_IMPORT_ROWS } from '../services/rosterImport';

// Wednesday 22 Oct 2025, 12:00 IST
const NOW = new Date('2025-10-22T06:30:00Z');
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000);

test('Streak - weeks start on Monday in India time', () => {
  // Sunday 23:30 IST and Monday 00:30 IST fall in different weeks
  const sundayNight = new Date('2025-10-19T18:00:00Z');
  const mondayMorning = new Date('2025-10-19T19:00:00Z');
  assert.equal(istWeekIndex(mondayMorning) - istWeekIndex(sundayNight), 1);
});

test('Streak - counts consecutive active weeks including this one', () => {
  const r = computeWeeklyStreak([daysAgo(0), daysAgo(7), daysAgo(14)], NOW);
  assert.equal(r.weeklyStreak, 3);
  assert.equal(r.thisWeekDone, 1);
  assert.deepEqual(r.recentWeeks, [false, false, false, true, true, true]);
});

test('Streak - a quiet current week does not break the streak yet', () => {
  const r = computeWeeklyStreak([daysAgo(7), daysAgo(14)], NOW);
  assert.equal(r.weeklyStreak, 2);
  assert.equal(r.thisWeekDone, 0);
});

test('Streak - a missed full week resets it', () => {
  const r = computeWeeklyStreak([daysAgo(14), daysAgo(21)], NOW);
  assert.equal(r.weeklyStreak, 0);
});

test('Streak - no activity gives zero and six empty weeks', () => {
  const r = computeWeeklyStreak([], NOW);
  assert.equal(r.weeklyStreak, 0);
  assert.deepEqual(r.recentWeeks, [false, false, false, false, false, false]);
});

test('School insights - counts each tested student by strongest stream', () => {
  const dist = streamDistribution([
    { 'Science (PCM)': 80, Commerce: 70 },
    { 'Science (PCM)': 60, Commerce: 75 },
    { 'Science (PCM)': 90, Commerce: 50 },
    null,
  ]);
  assert.deepEqual(dist, [
    { stream: 'Science (PCM)', count: 2, percentage: 67 },
    { stream: 'Commerce', count: 1, percentage: 33 },
  ]);
});

test('School insights - no tested students means no numbers', () => {
  assert.deepEqual(streamDistribution([null, undefined]), []);
  assert.equal(parseReadiness('not json'), null);
  assert.deepEqual(parseReadiness('{"Commerce":70}'), { Commerce: 70 });
});

test('Roster import - maps classes 9-12 to the two decision points', () => {
  assert.equal(toServerClass('9'), 'CLASS_10');
  assert.equal(toServerClass('Class 10-A'), 'CLASS_10');
  assert.equal(toServerClass('11'), 'CLASS_12');
  assert.equal(toServerClass('12 Science'), 'CLASS_12');
  assert.equal(toServerClass('8'), null);
  assert.equal(toServerClass(''), null);
});

test('Roster import - validates rows and reports problems by row number', () => {
  const { valid, errors } = validateRoster([
    { name: 'Riya Shah', email: 'Riya@Example.com', rollNumber: '10A-01', currentClass: '10' },
    { name: '', email: 'x@example.com', currentClass: '10' },
    { name: 'No Email', email: 'not-an-email', currentClass: '10' },
    { name: 'Wrong Class', email: 'w@example.com', currentClass: '7' },
    { name: 'Riya Again', email: 'riya@example.com', currentClass: '11' },
  ]);
  assert.equal(valid.length, 1);
  assert.equal(valid[0].email, 'riya@example.com');
  assert.equal(valid[0].currentClass, 'CLASS_10');
  assert.deepEqual(errors.map(e => [e.row, e.reason]), [
    [2, 'Missing name'],
    [3, 'Invalid email'],
    [4, 'Class must be 9, 10, 11 or 12'],
    [5, 'Duplicate email in file'],
  ]);
});

test('Roster import - rejects non-lists and oversized files', () => {
  assert.equal(validateRoster('nope').errors.length, 1);
  const tooMany = Array.from({ length: MAX_IMPORT_ROWS + 1 }, (_, i) => ({ name: 'A', email: `a${i}@x.com`, currentClass: '10' }));
  const r = validateRoster(tooMany);
  assert.equal(r.valid.length, 0);
  assert.match(r.errors[0].reason, /at most/);
});
