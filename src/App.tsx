import React, { useState, useEffect, useCallback } from 'react';
import { ChallengeConfig, DailyEntry, ViewTab, AIRecommendation } from './types';
import {
  loadChallengeConfig,
  saveChallengeConfig,
  loadDailyEntries,
  saveDailyEntries,
  formatDateKey,
} from './utils/storage';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { CommandCenter } from './components/CommandCenter';
import { QuickEntryModal } from './components/QuickEntryModal';
import { DailyEntryModal } from './components/DailyEntryModal';
import { JournalHistory } from './components/JournalHistory';
import { ProgressAnalytics } from './components/ProgressAnalytics';
import { CalendarView } from './components/CalendarView';
import { WeeklyReviewView } from './components/WeeklyReviewView';
import { AIRecommendationView } from './components/AIRecommendationView';
import { SettingsView } from './components/SettingsView';
import { calculateCommandOverview } from './utils/analytics';

export default function App() {
  const [config, setConfig] = useState<ChallengeConfig>(() => loadChallengeConfig());
  const [entries, setEntries] = useState<DailyEntry[]>(() => loadDailyEntries());
  const [currentTab, setCurrentTab] = useState<ViewTab>('home');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('study_tracker_90_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  // Modal States
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState<boolean>(false);
  const [isFullModalOpen, setIsFullModalOpen] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<DailyEntry | null>(null);
  const [targetModalDate, setTargetModalDate] = useState<string | undefined>(undefined);

  // AI Recommendation State
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);

  // Sync dark mode class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('study_tracker_90_dark_mode', darkMode.toString());
    } catch (e) {
      console.error(e);
    }
  }, [darkMode]);

  // Save entries to localStorage
  const updateAndSaveEntries = (newEntries: DailyEntry[]) => {
    setEntries(newEntries);
    saveDailyEntries(newEntries);
  };

  // Save config to localStorage
  const updateAndSaveConfig = (newConfig: ChallengeConfig) => {
    setConfig(newConfig);
    saveChallengeConfig(newConfig);
  };

  // Fetch AI recommendation from Express backend /api/ai/recommendation
  const handleFetchAIRecommendation = useCallback(async () => {
    setIsLoadingAI(true);
    try {
      const response = await fetch('/api/ai/recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, entries }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      setAiRecommendation(data);
    } catch (err) {
      console.warn('AI API fetch failed, generating client fallback recommendation:', err);
      // Generate intelligent fallback recommendation locally
      const recent = entries.slice(0, 5);
      const recentHours = recent.reduce((sum, e) => sum + e.studyHours, 0) / (recent.length || 1);

      setAiRecommendation({
        title: 'Focus Plan for Tomorrow',
        summary: `Your recent study average is ${recentHours.toFixed(1)}h/day against your target of ${config.dailyTargetHours}h/day.`,
        actionableSteps: [
          `Aim for a focused ${config.dailyTargetHours}-hour study session split into 2 blocks.`,
          'Review the topics you marked as difficult in recent logs.',
          'Solve 20-25 practice problems in your core subject.',
          'Keep your mobile phone in another room during study blocks.',
        ],
        reasoning: `Recommended because your recent average is ${recentHours.toFixed(1)}h/day and target completion is at ${Math.round((recentHours / config.dailyTargetHours) * 100)}%.`,
        generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDataSufficient: entries.length > 0,
      });
    } finally {
      setIsLoadingAI(false);
    }
  }, [config, entries]);

  // Initial AI load when component mounts or entries change
  useEffect(() => {
    if (entries.length > 0 && !aiRecommendation) {
      handleFetchAIRecommendation();
    }
  }, [entries.length]);

  // Save entry handler (add or update)
  const handleSaveEntry = (entryToSave: Partial<DailyEntry>) => {
    const existingIdx = entries.findIndex((e) => e.date === entryToSave.date || e.id === entryToSave.id);

    let updatedList: DailyEntry[];
    if (existingIdx >= 0) {
      const existing = entries[existingIdx];
      const merged: DailyEntry = {
        ...existing,
        ...entryToSave,
        updatedAt: Date.now(),
      } as DailyEntry;

      updatedList = [...entries];
      updatedList[existingIdx] = merged;
    } else {
      const newEntry: DailyEntry = {
        id: entryToSave.id || `entry-${Date.now()}`,
        date: entryToSave.date || formatDateKey(new Date()),
        studyHours: typeof entryToSave.studyHours === 'number' ? entryToSave.studyHours : 0,
        subjects: entryToSave.subjects || [],
        topics: entryToSave.topics || '',
        completed: entryToSave.completed,
        wentWell: entryToSave.wentWell,
        wentWrong: entryToSave.wentWrong,
        distractions: entryToSave.distractions,
        tomorrowPlan: entryToSave.tomorrowPlan,
        notes: entryToSave.notes,
        testResult: entryToSave.testResult,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      updatedList = [newEntry, ...entries];
    }

    // Sort chronologically descending
    updatedList.sort((a, b) => b.date.localeCompare(a.date));
    updateAndSaveEntries(updatedList);
  };

  // Delete entry
  const handleDeleteEntry = (id: string) => {
    const filtered = entries.filter((e) => e.id !== id);
    updateAndSaveEntries(filtered);
  };

  // Open Full Entry Modal for date
  const handleOpenFullModal = (dateStr?: string) => {
    if (dateStr) {
      const existing = entries.find((e) => e.date === dateStr);
      if (existing) {
        setEditingEntry(existing);
        setTargetModalDate(dateStr);
      } else {
        setEditingEntry(null);
        setTargetModalDate(dateStr);
      }
    } else {
      setEditingEntry(null);
      setTargetModalDate(formatDateKey(new Date()));
    }
    setIsFullModalOpen(true);
  };

  const overview = calculateCommandOverview(config, entries);

  return (
    <div className="min-h-screen bg-[#fbf9f5] dark:bg-[#1c1a17] text-[#2c2825] dark:text-[#f0ece1] flex flex-col font-sans transition-colors duration-200">
      
      {/* Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        dayNumber={overview.dayNumber}
        totalDays={config.durationDays}
        onOpenQuickEntry={() => setIsQuickEntryOpen(true)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-12">
        {currentTab === 'home' && (
          <CommandCenter
            config={config}
            entries={entries}
            aiRecommendation={aiRecommendation}
            isLoadingAI={isLoadingAI}
            onRefreshAI={handleFetchAIRecommendation}
            onOpenQuickEntry={() => setIsQuickEntryOpen(true)}
            onOpenFullModal={handleOpenFullModal}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'journal' && (
          <JournalHistory
            entries={entries}
            availableSubjects={config.availableSubjects}
            onEditEntry={(entry) => {
              setEditingEntry(entry);
              setIsFullModalOpen(true);
            }}
            onDeleteEntry={handleDeleteEntry}
            onAddNewEntry={() => handleOpenFullModal()}
          />
        )}

        {currentTab === 'progress' && (
          <ProgressAnalytics
            config={config}
            entries={entries}
          />
        )}

        {currentTab === 'calendar' && (
          <CalendarView
            config={config}
            entries={entries}
            onSelectDay={handleOpenFullModal}
          />
        )}

        {currentTab === 'review' && (
          <div className="space-y-8">
            <AIRecommendationView
              config={config}
              entries={entries}
              aiRecommendation={aiRecommendation}
              isLoadingAI={isLoadingAI}
              onRefreshAI={handleFetchAIRecommendation}
            />

            <WeeklyReviewView
              config={config}
              entries={entries}
            />
          </div>
        )}

        {currentTab === 'settings' && (
          <SettingsView
            config={config}
            entries={entries}
            onSaveConfig={updateAndSaveConfig}
            onUpdateEntries={updateAndSaveEntries}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Quick Entry Modal */}
      <QuickEntryModal
        isOpen={isQuickEntryOpen}
        onClose={() => setIsQuickEntryOpen(false)}
        onSave={(entry) => handleSaveEntry(entry)}
        onOpenFullModal={handleOpenFullModal}
        existingEntries={entries}
        availableSubjects={config.availableSubjects}
      />

      {/* Full Daily Entry Modal */}
      <DailyEntryModal
        isOpen={isFullModalOpen}
        onClose={() => {
          setIsFullModalOpen(false);
          setEditingEntry(null);
        }}
        onSave={(entry) => handleSaveEntry(entry)}
        onDelete={handleDeleteEntry}
        editingEntry={editingEntry}
        targetDate={targetModalDate}
        availableSubjects={config.availableSubjects}
      />

    </div>
  );
}
