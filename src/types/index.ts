/**
 * Types for the 90-Day Study Progress Tracker
 */

export interface TestResult {
  testName: string;
  subject: string;
  score: number;
  maxMarks: number;
  percentage: number;
  questionsAttempted?: number;
  correct?: number;
  wrong?: number;
  unattempted?: number;
  timeTakenMinutes?: number;
}

export interface DailyEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  studyHours: number; // e.g. 4.5, can explicitly be 0
  startTime?: string;
  endTime?: string;
  subjects: string[];
  topics?: string;
  completed?: string;
  wentWell?: string;
  wentWrong?: string;
  distractions?: string;
  tomorrowPlan?: string;
  notes?: string;
  testResult?: TestResult;
  createdAt: number;
  updatedAt: number;
}

export interface ChallengeConfig {
  startDate: string; // YYYY-MM-DD format
  durationDays: number; // default 90
  dailyTargetHours: number; // default 6
  weeklyTargetHours: number; // default 42
  overallTargetHours: number; // default 450
  availableSubjects: string[];
}

export interface WeeklyReviewSummary {
  weekNumber: number; // 1 to 13
  startDate: string;
  endDate: string;
  totalHours: number;
  avgHoursPerDay: number;
  studyDaysCount: number;
  targetHours: number;
  targetAchievementPct: number;
  avgTestScore: number | null;
  improved: string[];
  declined: string[];
  neglectedSubjects: string[];
  mainPattern: string;
  nextWeekFocus: string;
}

export interface AIRecommendation {
  title: string;
  summary: string;
  actionableSteps: string[];
  reasoning: string;
  generatedAt: string;
  isDataSufficient: boolean;
}

export interface ReflectionPatternInsight {
  category: 'distraction' | 'sleep' | 'focus' | 'difficulty' | 'procrastination';
  title: string;
  occurrenceCount: number;
  userReportedExamples: string[];
  insightSummary: string;
}

export type ViewTab = 'home' | 'journal' | 'progress' | 'calendar' | 'review' | 'settings';
