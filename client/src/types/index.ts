export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'PARENT' | 'SCHOOL_ADMIN' | 'COUNSELOR' | 'PLATFORM_ADMIN';
  phone?: string;
  avatarUrl?: string;
  studentProfileId?: string;
}

export interface SubscriptionStatus {
  planCode: string;
  planName: string;
  isActive: boolean;
  endDate?: string;
}

export interface Career {
  id: string;
  title: string;
  slug: string;
  category: string;
  stream: string;
  shortDescription: string;
  fullDescription?: string;
  responsibilities?: string[];
  responsibilitiesJson?: string;
  salaryMinINR: number;
  salaryMaxINR: number;
  futureDemand: string;
  automationExposure: string;
  requiredSubjects: string[];
  recommendedSkills: string[];
  entranceExams: string[];
  degrees: string[];
  topColleges: string[];
  sourceName?: string;
  sourceUrl?: string;
  lastVerifiedDate?: string;
}

export interface AssessmentQuestion {
  id: string;
  orderNumber: number;
  prompt: string;
  category: string;
  dimension: string;
  weight: number;
  options: Array<{
    text: string;
    score: number;
    traits: string[];
  }>;
}

export interface CareerRecommendation {
  careerId: string;
  title: string;
  slug: string;
  category: string;
  stream: string;
  matchScore: number;
  interestScore: number;
  strengthScore: number;
  academicScore: number;
  whyItMatches: string;
  areasToDevelop: string;
  suggestedNextSteps: string[];
  salaryMinINR?: number;
  salaryMaxINR?: number;
  futureDemand?: string;
}

export interface RoadmapMilestone {
  period: string;
  title: string;
  tasks: Array<{ task: string; completed: boolean }>;
}

export interface College {
  id: string;
  name: string;
  state: string;
  city: string;
  nirfRank?: number;
  courses: string[];
  feeMinINR: number;
  feeMaxINR: number;
  accreditation: string;
  admissionRoute: string;
  websiteUrl: string;
  verifiedDate: string;
}

export interface EntranceExam {
  id: string;
  name: string;
  fullName: string;
  conductingAuthority: string;
  targetStreams: string[];
  eligibleCourses: string[];
  examFrequency: string;
  examMode: string;
  importantDatesInfo: string;
  officialWebsite: string;
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  eligibility: string;
  benefitAmount: string;
  incomeCeiling?: string;
  requiredDocs: string[];
  officialUrl: string;
  deadlineText: string;
  lastVerifiedDate: string;
}

export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  description: string;
  priceINR: number;
  billingType: string;
  features: string[];
  isPopular: boolean;
}
