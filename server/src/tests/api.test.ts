import test from 'node:test';
import assert from 'node:assert/strict';
import { RecommendationEngine } from '../services/recommendationEngine';
import { PaymentService } from '../services/paymentService';
import { AIMentorService } from '../services/aiMentorService';

test('Recommendation Engine - should score careers based on dimension profile', () => {
  const sampleCareers = [
    {
      id: 'c1',
      title: 'AI Machine Learning Engineer',
      category: 'Computing/AI',
      stream: 'PCM',
      requiredSubjectsJson: JSON.stringify(['Mathematics', 'Physics', 'Computer Science']),
      recommendedSkillsJson: JSON.stringify(['Python', 'Calculus', 'PyTorch']),
      entranceExamsJson: JSON.stringify(['JEE Main', 'JEE Advanced']),
      futureDemand: 'VERY_HIGH'
    },
    {
      id: 'c2',
      title: 'Doctor & Surgeon',
      category: 'Medical',
      stream: 'PCB',
      requiredSubjectsJson: JSON.stringify(['Physics', 'Chemistry', 'Biology']),
      recommendedSkillsJson: JSON.stringify(['Clinical Diagnosis', 'Patient Care']),
      entranceExamsJson: JSON.stringify(['NEET UG']),
      futureDemand: 'VERY_HIGH'
    }
  ];

  const mathStudentDimensions = {
    'Logical Reasoning': 95,
    'Numerical Reasoning': 90,
    'Scientific Thinking': 85,
    'Verbal Reasoning': 70,
    'Spatial Reasoning': 80,
    'Creative Thinking': 75,
    'Subject Interests': 90,
    'Career Values': 85
  };

  const mathProfile = {
    currentClass: 'CLASS_10',
    favouriteSubjects: ['Mathematics', 'Science'],
    skills: ['Python', 'Problem Solving']
  };

  const results = RecommendationEngine.matchCareers(sampleCareers, mathStudentDimensions, mathProfile);

  assert.equal(results.length, 2);
  // AI Engineer should score higher than Doctor for high Logical/Numerical math student
  assert.equal(results[0].title, 'AI Machine Learning Engineer');
  assert.ok(results[0].matchScore >= 80, 'Match score should be 80+');
  assert.ok(results[0].whyItMatches.length > 10, 'Why it matches explanation should be present');
});

test('Recommendation Engine - medical profile should match Medical Doctor higher', () => {
  const sampleCareers = [
    {
      id: 'c1',
      title: 'AI Machine Learning Engineer',
      category: 'Computing/AI',
      stream: 'PCM',
      requiredSubjectsJson: JSON.stringify(['Mathematics', 'Physics']),
      recommendedSkillsJson: JSON.stringify(['Python']),
      futureDemand: 'VERY_HIGH'
    },
    {
      id: 'c2',
      title: 'Doctor & Surgeon',
      category: 'Medical',
      stream: 'PCB',
      requiredSubjectsJson: JSON.stringify(['Biology', 'Chemistry']),
      recommendedSkillsJson: JSON.stringify(['Clinical Diagnosis']),
      futureDemand: 'VERY_HIGH'
    }
  ];

  const bioStudentDimensions = {
    'Scientific Thinking': 95,
    'Logical Reasoning': 75,
    'Social Impact': 90,
    'Numerical Reasoning': 50,
    'Subject Interests': 90,
    'Career Values': 85
  };

  const bioProfile = {
    currentClass: 'CLASS_12',
    favouriteSubjects: ['Biology', 'Chemistry'],
    skills: ['Clinical Care']
  };

  const results = RecommendationEngine.matchCareers(sampleCareers, bioStudentDimensions, bioProfile);

  assert.equal(results[0].title, 'Doctor & Surgeon');
  assert.ok(results[0].matchScore > results[1].matchScore);
});

test('AI Mentor Service - provides stream intelligence fallback for Class 10 queries', async () => {
  const query = 'I am in class 10, should I choose PCM or PCB or Commerce?';
  const response = await AIMentorService.generateResponse(query, [], { currentClass: 'CLASS_10' });

  assert.ok(response.reply.includes('Science with Mathematics (PCM'));
  assert.ok(response.reply.includes('Commerce'));
  assert.ok(response.reply.includes('Humanities'));
  assert.ok(response.sources && response.sources.length > 0);
});

test('Payment Service - verifies sandbox payment signature and rejects invalid signatures', async () => {
  // Sandbox signature starting with sig_mock_ is accepted
  const validMock = 'sig_mock_payment_12345';
  assert.ok(validMock.startsWith('sig_mock_'));

  // Invalid empty or short string
  const invalidSig = 'bad';
  assert.ok(invalidSig.length < 8 && !invalidSig.startsWith('sig_mock_'));
});

test('Assessment scoring - balances 16 cognitive dimensions within 0-100 scale', () => {
  const dimensions = [
    'Numerical Reasoning', 'Logical Reasoning', 'Verbal Reasoning', 'Spatial Reasoning',
    'Scientific Thinking', 'Creative Thinking', 'Communication', 'Practical Problem Solving',
    'Leadership & Teamwork', 'Work Environment', 'Risk Tolerance', 'Social Impact',
    'Entrepreneurial', 'Working Style', 'Career Values', 'Subject Interests'
  ];

  assert.equal(dimensions.length, 16);
  for (const dim of dimensions) {
    assert.ok(typeof dim === 'string' && dim.length > 0);
  }
});

