import { ChallengeConfig, DailyEntry } from '../types';

const STORAGE_KEYS = {
  CONFIG: 'study_tracker_90_config_v1',
  ENTRIES: 'study_tracker_90_entries_v1',
  THEME: 'study_tracker_90_theme_v1',
};

// Helper to format Date as YYYY-MM-DD in local time
export function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Add days to date
export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return formatDateKey(d);
}

// Difference in days between two date strings (b - a)
export function daysBetween(dateStrA: string, dateStrB: string): number {
  const a = new Date(dateStrA + 'T00:00:00').getTime();
  const b = new Date(dateStrB + 'T00:00:00').getTime();
  return Math.floor((b - a) / (1000 * 60 * 60 * 24));
}

// Default Challenge Config (starts 25 days ago so user immediately sees real progress!)
export function getDefaultConfig(): ChallengeConfig {
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 25);

  return {
    startDate: formatDateKey(defaultStart),
    durationDays: 90,
    dailyTargetHours: 6,
    weeklyTargetHours: 42,
    overallTargetHours: 450,
    availableSubjects: ['Physics', 'Mathematics', 'Chemistry', 'Computer Science', 'Biology', 'English'],
  };
}

export function loadChallengeConfig(): ChallengeConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) {
      const defaultConfig = getDefaultConfig();
      saveChallengeConfig(defaultConfig);
      return defaultConfig;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load challenge config:', err);
    return getDefaultConfig();
  }
}

export function saveChallengeConfig(config: ChallengeConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save challenge config:', err);
  }
}

export function loadDailyEntries(): DailyEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    if (!raw) {
      // Initialize with demo data so user experiences a rich dashboard immediately!
      const demo = generateDemoEntries(loadChallengeConfig().startDate);
      saveDailyEntries(demo);
      return demo;
    }
    const parsed: DailyEntry[] = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load daily entries:', err);
    return [];
  }
}

export function saveDailyEntries(entries: DailyEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  } catch (err) {
    console.error('Failed to save daily entries:', err);
  }
}

/**
 * Generate high quality, realistic demo entries for testing
 */
export function generateDemoEntries(startDateStr: string): DailyEntry[] {
  const entries: DailyEntry[] = [];
  const todayStr = formatDateKey(new Date());
  let curDate = startDateStr;
  let dayIndex = 0;

  const sampleSubjects = [
    ['Physics', 'Mathematics'],
    ['Mathematics'],
    ['Chemistry', 'Physics'],
    ['Computer Science'],
    ['Mathematics', 'Chemistry'],
    ['Physics', 'Computer Science'],
  ];

  const sampleTopics = [
    'Physics: Thermodynamics & Electrostatics + Maths: Integration by parts',
    'Maths: Differential Equations & Matrix Algebra',
    'Chemistry: Chemical Bonding & Organic Reactions',
    'Computer Science: Data Structures, Arrays & Binary Trees',
    'Physics: Wave Optics & Magnetism',
    'Maths: Definite Integrals + Vectors',
    'Chemistry: Electrochemistry & Solutions',
    'Computer Science: Recursion & Sorting Algorithms',
  ];

  const sampleReflections = [
    {
      completed: 'Solved 30 calculus problems & reviewed physics notes',
      wentWell: 'Maintained deep focus during morning 3-hour session',
      wentWrong: 'Lost 45 mins scrolling phone after lunch',
      distractions: 'Social media notifications',
      tomorrowPlan: 'Start with hardest Physics numericals early morning',
      notes: 'Felt confident in definite integration questions today.',
    },
    {
      completed: 'Completed Organic Chemistry chapter 4 & 1 mock test',
      wentWell: 'Scored high on reaction mechanisms section',
      wentWrong: 'Struggled with physical chemistry formulas',
      distractions: 'Noise in study room',
      tomorrowPlan: 'Revise physical chemistry formula sheet before starting next topic',
      notes: 'Need to review error log from today test.',
    },
    {
      completed: 'Wrote 2 C++ algorithm scripts and practiced 20 Maths questions',
      wentWell: 'Quickly grasped tree traversal concepts',
      wentWrong: 'Felt fatigue after 4th hour',
      distractions: 'Lack of proper sleep previous night',
      tomorrowPlan: 'Take a short 15 min walk every 2 hours',
      notes: 'Overall productive day despite afternoon slump.',
    },
  ];

  const sampleTests = [
    {
      testName: 'Physics Weekly Mock Test #2',
      subject: 'Physics',
      score: 78,
      maxMarks: 100,
      percentage: 78,
      questionsAttempted: 30,
      correct: 24,
      wrong: 5,
      unattempted: 1,
      timeTakenMinutes: 60,
    },
    {
      testName: 'Mathematics Calculus Drill',
      subject: 'Mathematics',
      score: 85,
      maxMarks: 100,
      percentage: 85,
      questionsAttempted: 25,
      correct: 22,
      wrong: 3,
      unattempted: 0,
      timeTakenMinutes: 45,
    },
    {
      testName: 'Chemistry Periodic Trends Quiz',
      subject: 'Chemistry',
      score: 64,
      maxMarks: 80,
      percentage: 80,
      questionsAttempted: 20,
      correct: 16,
      wrong: 4,
      unattempted: 0,
      timeTakenMinutes: 30,
    },
    {
      testName: 'Computer Science DS Assessment',
      subject: 'Computer Science',
      score: 92,
      maxMarks: 100,
      percentage: 92,
      questionsAttempted: 20,
      correct: 19,
      wrong: 1,
      unattempted: 0,
      timeTakenMinutes: 40,
    },
  ];

  while (curDate <= todayStr && dayIndex < 26) {
    // Leave 2 random days as unrecorded / missing
    if (dayIndex === 5 || dayIndex === 14) {
      curDate = addDays(curDate, 1);
      dayIndex++;
      continue;
    }

    // Explicit 0 hour day once
    let studyHours = 0;
    if (dayIndex === 19) {
      studyHours = 0;
    } else {
      // Varied realistic hours around 4.5h to 7.5h
      const baseHours = [4.5, 6.0, 5.5, 7.0, 6.5, 5.0, 8.0, 3.5, 6.0, 7.5];
      studyHours = baseHours[dayIndex % baseHours.length];
    }

    const sub = sampleSubjects[dayIndex % sampleSubjects.length];
    const top = sampleTopics[dayIndex % sampleTopics.length];
    const ref = sampleReflections[dayIndex % sampleReflections.length];

    // Add test on every ~5th recorded day
    const hasTest = dayIndex % 5 === 2 && studyHours > 0;
    const testRes = hasTest ? sampleTests[(dayIndex / 5 | 0) % sampleTests.length] : undefined;

    entries.push({
      id: `demo-${dayIndex}-${curDate}`,
      date: curDate,
      studyHours,
      subjects: studyHours > 0 ? sub : [],
      topics: studyHours > 0 ? top : 'Rest / Break Day',
      completed: studyHours > 0 ? ref.completed : 'Took a full break to recharge',
      wentWell: studyHours > 0 ? ref.wentWell : 'Slept well and cleared mind',
      wentWrong: studyHours > 0 ? ref.wentWrong : 'Didn\'t get to open books',
      distractions: studyHours > 0 ? ref.distractions : undefined,
      tomorrowPlan: ref.tomorrowPlan,
      notes: ref.notes,
      testResult: testRes,
      createdAt: Date.now() - (26 - dayIndex) * 86400000,
      updatedAt: Date.now() - (26 - dayIndex) * 86400000,
    });

    curDate = addDays(curDate, 1);
    dayIndex++;
  }

  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

export function exportDataJSON(config: ChallengeConfig, entries: DailyEntry[]): void {
  const exportPayload = {
    app: '90-Day Study Progress Tracker',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    config,
    entries,
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `study-tracker-backup-${formatDateKey(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportDataCSV(entries: DailyEntry[]): void {
  const headers = [
    'Date',
    'Study Hours',
    'Subjects',
    'Topics',
    'Completed',
    'Went Well',
    'Went Wrong',
    'Distractions',
    'Tomorrow Plan',
    'Test Name',
    'Test Score %',
  ];

  const rows = entries.map((e) => [
    e.date,
    e.studyHours.toString(),
    `"${(e.subjects || []).join(', ').replace(/"/g, '""')}"`,
    `"${(e.topics || '').replace(/"/g, '""')}"`,
    `"${(e.completed || '').replace(/"/g, '""')}"`,
    `"${(e.wentWell || '').replace(/"/g, '""')}"`,
    `"${(e.wentWrong || '').replace(/"/g, '""')}"`,
    `"${(e.distractions || '').replace(/"/g, '""')}"`,
    `"${(e.tomorrowPlan || '').replace(/"/g, '""')}"`,
    `"${(e.testResult?.testName || '').replace(/"/g, '""')}"`,
    e.testResult ? e.testResult.percentage.toString() : '',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `study-history-${formatDateKey(new Date())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importDataJSON(jsonString: string): { config?: ChallengeConfig; entries?: DailyEntry[]; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') {
      return { error: 'Invalid JSON file format.' };
    }

    const config: ChallengeConfig = data.config && data.config.startDate ? data.config : getDefaultConfig();
    const entries: DailyEntry[] = Array.isArray(data.entries)
      ? data.entries.filter((e: any) => e && e.date && typeof e.studyHours === 'number')
      : [];

    return { config, entries };
  } catch (err) {
    return { error: 'Failed to parse JSON backup file.' };
  }
}
