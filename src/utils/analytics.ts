import { ChallengeConfig, DailyEntry, WeeklyReviewSummary } from '../types';
import { addDays, daysBetween, formatDateKey } from './storage';

export interface CommandOverview {
  dayNumber: number; // e.g. 26 of 90
  daysCompleted: number;
  daysRemaining: number;
  progressPercentage: number;
  totalStudyHours: number;
  avgStudyHoursPerDay: number;
  currentStreak: number;
  longestStreak: number;
  targetStudyHours: number; // expected to date
  overallTargetHours: number;
  targetVsActualDiff: number;
  todaysHours: number;
  yesterdaysHours: number;
  todayEntry?: DailyEntry;
  yesterdayEntry?: DailyEntry;
}

export interface RangeStats {
  totalHours: number;
  avgHoursPerDay: number; // recorded days only
  medianHours: number;
  maxDay: { date: string; hours: number } | null;
  minRecordedDay: { date: string; hours: number } | null;
  studyDaysCount: number; // entries with hours >= 0
  activeStudyDaysCount: number; // entries with hours > 0
  noEntryDaysCount: number;
  currentStreak: number;
  longestStreak: number;
  targetAchievementPct: number; // actual vs expected target
  avgTestScore: number | null;
  scoreTrend: number | null; // e.g. +5% or -2%
  avgAccuracyPct: number | null;
}

export interface SubjectBreakdown {
  subject: string;
  hours: number;
  percentage: number;
}

/**
 * Calculates current & longest streak
 */
export function calculateStreaks(entries: DailyEntry[]): { currentStreak: number; longestStreak: number } {
  if (!entries || entries.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Create map of date -> studyHours
  const dateMap = new Map<string, number>();
  entries.forEach((e) => {
    dateMap.set(e.date, e.studyHours);
  });

  const todayStr = formatDateKey(new Date());
  const yesterdayStr = addDays(todayStr, -1);

  // Determine current streak starting point (today or yesterday if today not recorded yet)
  let checkDate = todayStr;
  let currentStreak = 0;

  if (!dateMap.has(todayStr) || (dateMap.get(todayStr) || 0) <= 0) {
    // If today is not recorded or 0, check if streak holds through yesterday
    if (dateMap.has(yesterdayStr) && (dateMap.get(yesterdayStr) || 0) > 0) {
      checkDate = yesterdayStr;
    }
  }

  while (dateMap.has(checkDate) && (dateMap.get(checkDate) || 0) > 0) {
    currentStreak++;
    checkDate = addDays(checkDate, -1);
  }

  // Calculate longest streak across all entries
  // Sort dates chronologically
  const sortedDates = Array.from(dateMap.keys()).sort();
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDateStr: string | null = null;

  for (const dateStr of sortedDates) {
    const hours = dateMap.get(dateStr) || 0;
    if (hours > 0) {
      if (prevDateStr && daysBetween(prevDateStr, dateStr) === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      prevDateStr = dateStr;
    } else {
      tempStreak = 0;
      prevDateStr = null;
    }
  }

  return { currentStreak, longestStreak };
}

/**
 * Calculates the overall 90-Day Command Center overview
 */
export function calculateCommandOverview(config: ChallengeConfig, entries: DailyEntry[]): CommandOverview {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const duration = config?.durationDays || 90;
  const overallTarget = config?.overallTargetHours || 450;

  // When data is reset (all entries deleted) or no entries exist, return explicit zero state
  if (safeEntries.length === 0) {
    return {
      dayNumber: 1,
      daysCompleted: 0,
      daysRemaining: duration,
      progressPercentage: 0,
      totalStudyHours: 0,
      avgStudyHoursPerDay: 0,
      currentStreak: 0,
      longestStreak: 0,
      targetStudyHours: 0,
      overallTargetHours: overallTarget,
      targetVsActualDiff: 0,
      todaysHours: 0,
      yesterdaysHours: 0,
      todayEntry: undefined,
      yesterdayEntry: undefined,
    };
  }

  const todayStr = formatDateKey(new Date());
  const elapsedDays = Math.max(0, daysBetween(config.startDate || todayStr, todayStr));
  const daysCompleted = Math.max(0, Math.min(duration, elapsedDays));
  const dayNumber = Math.min(duration, Math.max(1, daysCompleted + 1));
  const daysRemaining = Math.max(0, duration - daysCompleted);
  const progressPercentage = Math.round((daysCompleted / duration) * 100);

  // Total study hours
  const totalStudyHours = safeEntries.reduce((acc, curr) => acc + (curr.studyHours || 0), 0);

  // Recorded days (excluding unentered days)
  const recordedDays = safeEntries.length;
  const avgStudyHoursPerDay = recordedDays > 0 ? Number((totalStudyHours / recordedDays).toFixed(1)) : 0;

  // Streaks
  const { currentStreak, longestStreak } = calculateStreaks(safeEntries);

  // Expected target to date
  const expectedTargetToDate = Math.round((daysCompleted / duration) * overallTarget);
  const targetVsActualDiff = Number((totalStudyHours - expectedTargetToDate).toFixed(1));

  // Today & Yesterday hours
  const yesterdayStr = addDays(todayStr, -1);
  const todayEntry = safeEntries.find((e) => e.date === todayStr);
  const yesterdayEntry = safeEntries.find((e) => e.date === yesterdayStr);

  const todaysHours = todayEntry ? todayEntry.studyHours : 0;
  const yesterdaysHours = yesterdayEntry ? yesterdayEntry.studyHours : 0;

  return {
    dayNumber,
    daysCompleted,
    daysRemaining,
    progressPercentage,
    totalStudyHours: Number(totalStudyHours.toFixed(1)),
    avgStudyHoursPerDay,
    currentStreak,
    longestStreak,
    targetStudyHours: expectedTargetToDate,
    overallTargetHours: overallTarget,
    targetVsActualDiff,
    todaysHours,
    yesterdaysHours,
    todayEntry,
    yesterdayEntry,
  };
}

/**
 * Calculate stats for a specific range of days
 */
export function calculateRangeStats(
  config: ChallengeConfig,
  entries: DailyEntry[],
  filterType: 'today' | '3days' | '7days' | '14days' | '30days' | '90days' | 'custom',
  customStart?: string,
  customEnd?: string
): RangeStats {
  const todayStr = formatDateKey(new Date());
  let startDateStr = config.startDate;
  let endDateStr = todayStr;

  if (filterType === 'today') {
    startDateStr = todayStr;
  } else if (filterType === '3days') {
    startDateStr = addDays(todayStr, -2);
  } else if (filterType === '7days') {
    startDateStr = addDays(todayStr, -6);
  } else if (filterType === '14days') {
    startDateStr = addDays(todayStr, -13);
  } else if (filterType === '30days') {
    startDateStr = addDays(todayStr, -29);
  } else if (filterType === '90days') {
    startDateStr = config.startDate;
    endDateStr = addDays(config.startDate, config.durationDays - 1);
  } else if (filterType === 'custom' && customStart && customEnd) {
    startDateStr = customStart;
    endDateStr = customEnd;
  }

  // Filter entries in date range
  const rangeEntries = entries.filter((e) => e.date >= startDateStr && e.date <= endDateStr);

  const totalCalendarDaysInRange = Math.max(1, daysBetween(startDateStr, endDateStr) + 1);
  const studyDaysCount = rangeEntries.length; // recorded entries
  const activeStudyDaysCount = rangeEntries.filter((e) => e.studyHours > 0).length;
  const noEntryDaysCount = Math.max(0, totalCalendarDaysInRange - studyDaysCount);

  const totalHours = rangeEntries.reduce((sum, e) => sum + (e.studyHours || 0), 0);
  const avgHoursPerDay = studyDaysCount > 0 ? Number((totalHours / studyDaysCount).toFixed(1)) : 0;

  // Median study hours
  let medianHours = 0;
  if (studyDaysCount > 0) {
    const sortedHours = rangeEntries.map((e) => e.studyHours).sort((a, b) => a - b);
    const mid = Math.floor(sortedHours.length / 2);
    medianHours = sortedHours.length % 2 !== 0 ? sortedHours[mid] : (sortedHours[mid - 1] + sortedHours[mid]) / 2;
  }

  // Max and Min days
  let maxDay: { date: string; hours: number } | null = null;
  let minRecordedDay: { date: string; hours: number } | null = null;

  if (studyDaysCount > 0) {
    const sortedByHours = [...rangeEntries].sort((a, b) => b.studyHours - a.studyHours);
    maxDay = { date: sortedByHours[0].date, hours: sortedByHours[0].studyHours };
    minRecordedDay = { date: sortedByHours[sortedByHours.length - 1].date, hours: sortedByHours[sortedByHours.length - 1].studyHours };
  }

  // Target achievement
  const expectedTargetHours = config.dailyTargetHours * totalCalendarDaysInRange;
  const targetAchievementPct = expectedTargetHours > 0 ? Math.min(100, Math.round((totalHours / expectedTargetHours) * 100)) : 0;

  // Test scores & accuracy
  const testEntries = rangeEntries.filter((e) => e.testResult && typeof e.testResult.percentage === 'number');
  let avgTestScore: number | null = null;
  let scoreTrend: number | null = null;
  let avgAccuracyPct: number | null = null;

  if (testEntries.length > 0) {
    const totalScorePct = testEntries.reduce((sum, e) => sum + (e.testResult?.percentage || 0), 0);
    avgTestScore = Number((totalScorePct / testEntries.length).toFixed(1));

    // Calculate accuracy if attempted/correct fields exist
    const entriesWithQ = testEntries.filter((e) => e.testResult?.questionsAttempted && e.testResult?.correct);
    if (entriesWithQ.length > 0) {
      const totAttempted = entriesWithQ.reduce((sum, e) => sum + (e.testResult?.questionsAttempted || 0), 0);
      const totCorrect = entriesWithQ.reduce((sum, e) => sum + (e.testResult?.correct || 0), 0);
      if (totAttempted > 0) {
        avgAccuracyPct = Number(((totCorrect / totAttempted) * 100).toFixed(1));
      }
    }

    // Score trend comparing first half of range test scores vs second half
    if (testEntries.length >= 2) {
      const sortedTests = [...testEntries].sort((a, b) => a.date.localeCompare(b.date));
      const half = Math.floor(sortedTests.length / 2);
      const prevHalfAvg = sortedTests.slice(0, half).reduce((sum, e) => sum + (e.testResult?.percentage || 0), 0) / half;
      const recentHalfAvg = sortedTests.slice(half).reduce((sum, e) => sum + (e.testResult?.percentage || 0), 0) / (sortedTests.length - half);
      scoreTrend = Number((recentHalfAvg - prevHalfAvg).toFixed(1));
    }
  }

  const { currentStreak, longestStreak } = calculateStreaks(rangeEntries);

  return {
    totalHours: Number(totalHours.toFixed(1)),
    avgHoursPerDay,
    medianHours: Number(medianHours.toFixed(1)),
    maxDay,
    minRecordedDay,
    studyDaysCount,
    activeStudyDaysCount,
    noEntryDaysCount,
    currentStreak,
    longestStreak,
    targetAchievementPct,
    avgTestScore,
    scoreTrend,
    avgAccuracyPct,
  };
}

/**
 * Breakdown study hours by subject
 */
export function calculateSubjectBreakdown(entries: DailyEntry[]): SubjectBreakdown[] {
  const subjectHoursMap = new Map<string, number>();

  entries.forEach((e) => {
    if (e.studyHours > 0 && e.subjects && e.subjects.length > 0) {
      const share = e.studyHours / e.subjects.length;
      e.subjects.forEach((s) => {
        const clean = s.trim();
        if (clean) {
          subjectHoursMap.set(clean, (subjectHoursMap.get(clean) || 0) + share);
        }
      });
    }
  });

  const total = Array.from(subjectHoursMap.values()).reduce((sum, h) => sum + h, 0);
  if (total === 0) return [];

  return Array.from(subjectHoursMap.entries())
    .map(([subject, hours]) => ({
      subject,
      hours: Number(hours.toFixed(1)),
      percentage: Math.round((hours / total) * 100),
    }))
    .sort((a, b) => b.hours - a.hours);
}

/**
 * Calculates 13 weeks (Week 1..13) of the 90-day challenge
 */
export function calculateWeeklyBreakdown(config: ChallengeConfig, entries: DailyEntry[]) {
  const weeks = [];
  const entryMap = new Map<string, DailyEntry>();
  entries.forEach((e) => entryMap.set(e.date, e));

  for (let w = 1; w <= 13; w++) {
    const weekStartDayOffset = (w - 1) * 7;
    const weekStartDateStr = addDays(config.startDate, weekStartDayOffset);
    const weekEndDateStr = addDays(config.startDate, Math.min(89, weekStartDayOffset + 6));

    let weekTotalHours = 0;
    let recordedDays = 0;
    const testScores: number[] = [];

    let cur = weekStartDateStr;
    while (cur <= weekEndDateStr) {
      if (entryMap.has(cur)) {
        const e = entryMap.get(cur)!;
        weekTotalHours += e.studyHours || 0;
        recordedDays++;
        if (e.testResult?.percentage) {
          testScores.push(e.testResult.percentage);
        }
      }
      cur = addDays(cur, 1);
    }

    const target = config.weeklyTargetHours;
    const avgTest = testScores.length > 0 ? Math.round(testScores.reduce((a, b) => a + b, 0) / testScores.length) : null;

    weeks.push({
      weekNumber: w,
      startDate: weekStartDateStr,
      endDate: weekEndDateStr,
      actualHours: Number(weekTotalHours.toFixed(1)),
      targetHours: target,
      recordedDays,
      avgTestScore: avgTest,
    });
  }

  return weeks;
}

/**
 * Generate data-based observations for Study Efficiency
 */
export function generateEfficiencyInsights(entries: DailyEntry[]): string[] {
  if (entries.length < 3) {
    return ['Add at least 3-5 study entries to generate data-backed efficiency insights.'];
  }

  const insights: string[] = [];
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  // Compare recent 7 entries vs prior 7 entries
  const recent7 = sorted.slice(-7);
  const prior7 = sorted.slice(-14, -7);

  const recentAvgHours = recent7.reduce((s, e) => s + e.studyHours, 0) / recent7.length;
  const recentTests = recent7.filter((e) => e.testResult?.percentage);
  const recentAvgScore = recentTests.length > 0 ? recentTests.reduce((s, e) => s + (e.testResult?.percentage || 0), 0) / recentTests.length : null;

  if (prior7.length > 0) {
    const priorAvgHours = prior7.reduce((s, e) => s + e.studyHours, 0) / prior7.length;
    const priorTests = prior7.filter((e) => e.testResult?.percentage);
    const priorAvgScore = priorTests.length > 0 ? priorTests.reduce((s, e) => s + (e.testResult?.percentage || 0), 0) / priorTests.length : null;

    const hourDiff = Number((recentAvgHours - priorAvgHours).toFixed(1));

    if (recentAvgScore !== null && priorAvgScore !== null) {
      const scoreDiff = Number((recentAvgScore - priorAvgScore).toFixed(1));
      if (hourDiff > 0 && scoreDiff > 0) {
        insights.push(`Your average daily study time increased by ${hourDiff}h recently, and your test score improved by +${scoreDiff}%.`);
      } else if (hourDiff > 0 && scoreDiff <= 0) {
        insights.push(`Your study hours increased by ${hourDiff}h recently, but test scores stayed flat or dropped by ${Math.abs(scoreDiff)}%. Quality or topic difficulty might be a factor.`);
      } else if (hourDiff <= 0 && scoreDiff > 0) {
        insights.push(`Your average study hours decreased slightly by ${Math.abs(hourDiff)}h, yet test performance improved by +${scoreDiff}%. High study efficiency!`);
      }
    } else if (hourDiff > 0) {
      insights.push(`Your daily study time increased by ${hourDiff}h over the last week (${recentAvgHours.toFixed(1)}h/day vs ${priorAvgHours.toFixed(1)}h/day).`);
    } else if (hourDiff < 0) {
      insights.push(`Your daily study time dipped by ${Math.abs(hourDiff)}h/day compared to the previous week.`);
    }
  }

  // High distraction correlation
  const distractedEntries = sorted.filter((e) => e.distractions && e.distractions.trim().length > 3);
  if (distractedEntries.length >= 3) {
    insights.push(`Distractions were reported in ${distractedEntries.length} entries. Common factor: "${distractedEntries[distractedEntries.length - 1].distractions}".`);
  }

  if (insights.length === 0) {
    insights.push(`Consistent study flow observed across ${entries.length} recorded entries with an average of ${(entries.reduce((s, e) => s + e.studyHours, 0) / entries.length).toFixed(1)} hours per study day.`);
  }

  return insights;
}

/**
 * Calculates Weekly Review summary for a specified week (1..13)
 */
export function generateWeeklyReview(config: ChallengeConfig, entries: DailyEntry[], weekNum: number): WeeklyReviewSummary {
  const weekStartDayOffset = (weekNum - 1) * 7;
  const startDate = addDays(config.startDate, weekStartDayOffset);
  const endDate = addDays(config.startDate, Math.min(89, weekStartDayOffset + 6));

  const weekEntries = entries.filter((e) => e.date >= startDate && e.date <= endDate);
  const totalHours = Number(weekEntries.reduce((sum, e) => sum + e.studyHours, 0).toFixed(1));
  const studyDaysCount = weekEntries.length;
  const avgHoursPerDay = studyDaysCount > 0 ? Number((totalHours / studyDaysCount).toFixed(1)) : 0;
  const targetHours = config.weeklyTargetHours;
  const targetAchievementPct = Math.min(100, Math.round((totalHours / targetHours) * 100));

  const testEntries = weekEntries.filter((e) => e.testResult?.percentage);
  const avgTestScore = testEntries.length > 0 ? Math.round(testEntries.reduce((s, e) => s + (e.testResult?.percentage || 0), 0) / testEntries.length) : null;

  const improved: string[] = [];
  const declined: string[] = [];
  const neglectedSubjects: string[] = [];

  // Subject time check
  const subMap = new Map<string, number>();
  weekEntries.forEach((e) => {
    (e.subjects || []).forEach((s) => subMap.set(s, (subMap.get(s) || 0) + e.studyHours / (e.subjects.length || 1)));
  });

  config.availableSubjects.forEach((sub) => {
    if (!subMap.has(sub) || (subMap.get(sub) || 0) < 1) {
      neglectedSubjects.push(sub);
    }
  });

  if (targetAchievementPct >= 90) {
    improved.push('Met or exceeded weekly study hour targets');
  } else {
    declined.push(`Fell ${Number((targetHours - totalHours).toFixed(1))} hours short of weekly target (${targetHours}h)`);
  }

  if (avgTestScore && avgTestScore >= 80) {
    improved.push(`Strong test performance with average of ${avgTestScore}%`);
  } else if (avgTestScore && avgTestScore < 70) {
    declined.push(`Test score average dropped to ${avgTestScore}%`);
  }

  const mainPattern = studyDaysCount >= 5 ? 'High consistency with regular daily sessions.' : 'Irregular study frequency with multi-day gaps.';
  const nextWeekFocus = neglectedSubjects.length > 0
    ? `Prioritize ${neglectedSubjects.slice(0, 2).join(' & ')} to balance subject distribution.`
    : `Aim to increase daily study depth and maintain ${config.dailyTargetHours}h target.`;

  const { currentStreak } = calculateStreaks(weekEntries);

  return {
    weekNumber: weekNum,
    startDate,
    endDate,
    totalHours,
    avgHoursPerDay,
    studyDaysCount,
    targetHours,
    targetAchievementPct,
    avgTestScore,
    improved,
    declined,
    neglectedSubjects,
    mainPattern,
    nextWeekFocus,
  };
}
