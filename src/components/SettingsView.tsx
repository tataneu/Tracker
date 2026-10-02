import React, { useState } from 'react';
import { ChallengeConfig, DailyEntry } from '../types';
import { exportDataCSV, exportDataJSON, generateDemoEntries, importDataJSON } from '../utils/storage';
import { Sliders, Download, Upload, Trash2, RefreshCw, Plus, X, Sun, Moon, Database } from 'lucide-react';

interface SettingsViewProps {
  config: ChallengeConfig;
  entries: DailyEntry[];
  onSaveConfig: (newConfig: ChallengeConfig) => void;
  onUpdateEntries: (newEntries: DailyEntry[]) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  config,
  entries,
  onSaveConfig,
  onUpdateEntries,
  darkMode,
  setDarkMode,
}) => {
  const [startDate, setStartDate] = useState<string>(config.startDate);
  const [dailyTargetHours, setDailyTargetHours] = useState<string>(config.dailyTargetHours.toString());
  const [weeklyTargetHours, setWeeklyTargetHours] = useState<string>(config.weeklyTargetHours.toString());
  const [overallTargetHours, setOverallTargetHours] = useState<string>(config.overallTargetHours.toString());
  const [subjects, setSubjects] = useState<string[]>(config.availableSubjects || []);
  const [newSubjectInput, setNewSubjectInput] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const handleSaveChallengeSettings = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedConfig: ChallengeConfig = {
      ...config,
      startDate,
      dailyTargetHours: parseFloat(dailyTargetHours) || 6,
      weeklyTargetHours: parseFloat(weeklyTargetHours) || 42,
      overallTargetHours: parseFloat(overallTargetHours) || 450,
      availableSubjects: subjects,
    };

    onSaveConfig(updatedConfig);
    alert('Challenge settings updated successfully!');
  };

  const handleAddSubject = () => {
    const trimmed = newSubjectInput.trim();
    if (trimmed && !subjects.includes(trimmed)) {
      setSubjects([...subjects, trimmed]);
      setNewSubjectInput('');
    }
  };

  const handleRemoveSubject = (sub: string) => {
    setSubjects(subjects.filter((s) => s !== sub));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importDataJSON(content);

      if (res.error) {
        setImportError(res.error);
        setImportSuccess(null);
      } else {
        if (res.config) onSaveConfig(res.config);
        if (res.entries) onUpdateEntries(res.entries);
        setImportSuccess(`Successfully imported backup with ${res.entries?.length || 0} study entries.`);
        setImportError(null);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadDemoData = () => {
    if (confirm('Load demo dataset? This will populate 25 realistic study days to preview full charts and analytics.')) {
      const demo = generateDemoEntries(startDate);
      onUpdateEntries(demo);
      alert('Demo data loaded successfully!');
    }
  };

  const handleClearAllData = () => {
    if (confirm('WARNING: Are you sure you want to clear ALL recorded study data? This action cannot be undone unless you exported a JSON backup.')) {
      onUpdateEntries([]);
      alert('All study logs cleared.');
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      
      {/* Section 1: Challenge Setup & Targets */}
      <div className="bg-[#ffffff] dark:bg-[#23201c] border border-[#e8e2d5] dark:border-[#38332c] rounded-2xl p-6 shadow-2xs space-y-6">
        
        <div className="flex items-center gap-2 border-b border-[#e8e2d5] dark:border-[#38332c] pb-4">
          <Sliders className="w-5 h-5 text-[#3b6978] dark:text-[#68a3b5]" />
          <h2 className="font-heading font-bold text-lg text-[#2c2825] dark:text-[#f0ece1]">
            90-Day Challenge Configuration
          </h2>
        </div>

        <form onSubmit={handleSaveChallengeSettings} className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#57514a] dark:text-[#c4beb3] mb-1">
                Challenge Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#dcd6c8] dark:border-[#423c34] bg-white dark:bg-[#1c1a17] text-sm text-[#2c2825] dark:text-[#f0ece1] focus:outline-none focus:ring-2 focus:ring-[#3b6978]/30"
              />
              <span className="text-[11px] text-[#8e877c] mt-1 block">
                Challenge runs for 90 days starting from this date
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#57514a] dark:text-[#c4beb3] mb-1">
                Daily Study Target (Hours)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="24"
                value={dailyTargetHours}
                onChange={(e) => setDailyTargetHours(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#dcd6c8] dark:border-[#423c34] bg-white dark:bg-[#1c1a17] text-sm text-[#2c2825] dark:text-[#f0ece1] focus:outline-none focus:ring-2 focus:ring-[#3b6978]/30 tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#57514a] dark:text-[#c4beb3] mb-1">
                Weekly Study Target (Hours)
              </label>
              <input
                type="number"
                step="1"
                value={weeklyTargetHours}
                onChange={(e) => setWeeklyTargetHours(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#dcd6c8] dark:border-[#423c34] bg-white dark:bg-[#1c1a17] text-sm text-[#2c2825] dark:text-[#f0ece1] focus:outline-none focus:ring-2 focus:ring-[#3b6978]/30 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#57514a] dark:text-[#c4beb3] mb-1">
                Overall 90-Day Target (Hours)
              </label>
              <input
                type="number"
                step="10"
                value={overallTargetHours}
                onChange={(e) => setOverallTargetHours(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#dcd6c8] dark:border-[#423c34] bg-white dark:bg-[#1c1a17] text-sm text-[#2c2825] dark:text-[#f0ece1] focus:outline-none focus:ring-2 focus:ring-[#3b6978]/30 tabular-nums"
              />
            </div>
          </div>

          {/* Subjects Manager */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#57514a] dark:text-[#c4beb3]">
              Available Subjects
            </label>
            <div className="flex items-center gap-1.5 flex-wrap pb-2">
              {subjects.map((sub) => (
                <span
                  key={sub}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-medium bg-[#f0ebd9] dark:bg-[#2e2a25] text-[#2c2825] dark:text-[#f0ece1] border border-[#e2dacb] dark:border-[#38332c]"
                >
                  {sub}
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(sub)}
                    className="hover:text-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                value={newSubjectInput}
                onChange={(e) => setNewSubjectInput(e.target.value)}
                placeholder="Add new subject e.g. Biology"
                className="w-full px-3.5 py-2 rounded-xl border border-[#dcd6c8] dark:border-[#423c34] bg-white dark:bg-[#1c1a17] text-xs text-[#2c2825] dark:text-[#f0ece1] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubject}
                className="px-3 py-2 bg-[#eae4d5] dark:bg-[#332e27] hover:bg-[#ded7c5] text-[#2c2825] dark:text-[#f0ece1] text-xs font-semibold rounded-xl shrink-0 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-[#3b6978] hover:bg-[#2d5360] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              Save Challenge Settings
            </button>
          </div>

        </form>

      </div>

      {/* Section 2: Appearance / Theme */}
      <div className="bg-[#ffffff] dark:bg-[#23201c] border border-[#e8e2d5] dark:border-[#38332c] rounded-2xl p-6 shadow-2xs space-y-4">
        <h3 className="font-heading font-bold text-base text-[#2c2825] dark:text-[#f0ece1]">
          Theme & Visual Appearance
        </h3>
        <p className="text-xs text-[#78716c] dark:text-[#a39c90]">
          The default theme is warm light/sand to prevent eye strain during long study sessions.
        </p>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => setDarkMode(false)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              !darkMode
                ? 'bg-[#3b6978] text-white border-[#2e5461]'
                : 'bg-[#fbf9f5] dark:bg-[#1c1a17] border-[#dcd6c8] text-[#57514a]'
            }`}
          >
            <Sun className="w-4 h-4 text-[#e0a96d]" />
            <span>Warm Sand Light (Default)</span>
          </button>

          <button
            onClick={() => setDarkMode(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              darkMode
                ? 'bg-[#3b6978] text-white border-[#2e5461]'
                : 'bg-[#fbf9f5] dark:bg-[#1c1a17] border-[#dcd6c8] text-[#57514a]'
            }`}
          >
            <Moon className="w-4 h-4 text-[#e0a96d]" />
            <span>Warm Dark Theme</span>
          </button>
        </div>
      </div>

      {/* Section 3: Data Backup, Export & Import */}
      <div className="bg-[#ffffff] dark:bg-[#23201c] border border-[#e8e2d5] dark:border-[#38332c] rounded-2xl p-6 shadow-2xs space-y-6">
        
        <div className="flex items-center gap-2 border-b border-[#e8e2d5] dark:border-[#38332c] pb-4">
          <Database className="w-5 h-5 text-[#3b6978] dark:text-[#68a3b5]" />
          <h2 className="font-heading font-bold text-lg text-[#2c2825] dark:text-[#f0ece1]">
            Data Management & Backups
          </h2>
        </div>

        <p className="text-xs text-[#78716c] dark:text-[#a39c90]">
          You own your study data. Your logs survive page refreshes and browser closes via offline LocalStorage.
        </p>

        {importError && (
          <p className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            {importError}
          </p>
        )}

        {importSuccess && (
          <p className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200">
            {importSuccess}
          </p>
        )}

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <button
            onClick={() => exportDataJSON(config, entries)}
            className="p-4 bg-[#fbf9f5] dark:bg-[#1c1a17] border border-[#e8e2d5] dark:border-[#38332c] hover:border-[#3b6978] rounded-xl text-left transition-colors space-y-1"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-[#2c2825] dark:text-[#f0ece1]">
              <span>Export Backup (JSON)</span>
              <Download className="w-4 h-4 text-[#3b6978]" />
            </div>
            <p className="text-[11px] text-[#78716c] dark:text-[#a39c90]">
              Full backup of settings and daily entries
            </p>
          </button>

          <button
            onClick={() => exportDataCSV(entries)}
            className="p-4 bg-[#fbf9f5] dark:bg-[#1c1a17] border border-[#e8e2d5] dark:border-[#38332c] hover:border-[#3b6978] rounded-xl text-left transition-colors space-y-1"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-[#2c2825] dark:text-[#f0ece1]">
              <span>Export History (CSV)</span>
              <Download className="w-4 h-4 text-[#3b6978]" />
            </div>
            <p className="text-[11px] text-[#78716c] dark:text-[#a39c90]">
              Spreadsheet compatible format
            </p>
          </button>

          <label className="p-4 bg-[#fbf9f5] dark:bg-[#1c1a17] border border-[#e8e2d5] dark:border-[#38332c] hover:border-[#3b6978] rounded-xl text-left transition-colors space-y-1 cursor-pointer block">
            <div className="flex items-center justify-between text-xs font-semibold text-[#2c2825] dark:text-[#f0ece1]">
              <span>Import JSON Backup</span>
              <Upload className="w-4 h-4 text-[#3b6978]" />
            </div>
            <p className="text-[11px] text-[#78716c] dark:text-[#a39c90]">
              Restore settings and study logs from file
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={handleLoadDemoData}
            className="p-4 bg-[#fbf9f5] dark:bg-[#1c1a17] border border-[#e8e2d5] dark:border-[#38332c] hover:border-[#3b6978] rounded-xl text-left transition-colors space-y-1"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-[#2c2825] dark:text-[#f0ece1]">
              <span>Load Demo Dataset</span>
              <RefreshCw className="w-4 h-4 text-[#3b6978]" />
            </div>
            <p className="text-[11px] text-[#78716c] dark:text-[#a39c90]">
              Pre-fill 25 realistic study days to test charts & AI
            </p>
          </button>

        </div>

        {/* Clear All Data */}
        <div className="pt-4 border-t border-[#e8e2d5] dark:border-[#38332c] flex items-center justify-between">
          <span className="text-xs text-[#78716c]">Danger Zone</span>
          <button
            onClick={handleClearAllData}
            className="px-4 py-2 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs font-semibold rounded-xl hover:bg-red-100 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Data</span>
          </button>
        </div>

      </div>

    </div>
  );
};
