import React, { useState, useEffect } from 'react';
import { DailyEntry, TestResult } from '../types';
import { formatDateKey } from '../utils/storage';
import { X, ChevronDown, ChevronUp, Trophy, Sparkles, AlertCircle } from 'lucide-react';

interface DailyEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: DailyEntry) => void;
  onDelete?: (id: string) => void;
  editingEntry?: DailyEntry | null;
  targetDate?: string;
  availableSubjects: string[];
}

export const DailyEntryModal: React.FC<DailyEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingEntry,
  targetDate,
  availableSubjects,
}) => {
  const todayStr = formatDateKey(new Date());

  const [id, setId] = useState<string>('');
  const [date, setDate] = useState<string>(targetDate || todayStr);
  const [studyHours, setStudyHours] = useState<string>('6.0');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [topics, setTopics] = useState<string>('');

  // Reflections
  const [showReflections, setShowReflections] = useState<boolean>(false);
  const [completed, setCompleted] = useState<string>('');
  const [wentWell, setWentWell] = useState<string>('');
  const [wentWrong, setWentWrong] = useState<string>('');
  const [distractions, setDistractions] = useState<string>('');
  const [tomorrowPlan, setTomorrowPlan] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Test Section (Optional)
  const [showTestSection, setShowTestSection] = useState<boolean>(false);
  const [testName, setTestName] = useState<string>('');
  const [testSubject, setTestSubject] = useState<string>('');
  const [testScore, setTestScore] = useState<string>('');
  const [testMaxMarks, setTestMaxMarks] = useState<string>('100');
  const [testAttempted, setTestAttempted] = useState<string>('');
  const [testCorrect, setTestCorrect] = useState<string>('');
  const [testWrong, setTestWrong] = useState<string>('');
  const [testTimeTaken, setTestTimeTaken] = useState<string>('');

  useEffect(() => {
    if (editingEntry) {
      setId(editingEntry.id);
      setDate(editingEntry.date);
      setStudyHours(editingEntry.studyHours.toString());
      setStartTime(editingEntry.startTime || '');
      setEndTime(editingEntry.endTime || '');
      setSelectedSubjects(editingEntry.subjects || []);
      setTopics(editingEntry.topics || '');

      setCompleted(editingEntry.completed || '');
      setWentWell(editingEntry.wentWell || '');
      setWentWrong(editingEntry.wentWrong || '');
      setDistractions(editingEntry.distractions || '');
      setTomorrowPlan(editingEntry.tomorrowPlan || '');
      setNotes(editingEntry.notes || '');

      if (editingEntry.completed || editingEntry.wentWell || editingEntry.wentWrong || editingEntry.distractions) {
        setShowReflections(true);
      } else {
        setShowReflections(false);
      }

      if (editingEntry.testResult) {
        setShowTestSection(true);
        setTestName(editingEntry.testResult.testName || '');
        setTestSubject(editingEntry.testResult.subject || '');
        setTestScore(editingEntry.testResult.score.toString());
        setTestMaxMarks(editingEntry.testResult.maxMarks.toString());
        setTestAttempted(editingEntry.testResult.questionsAttempted?.toString() || '');
        setTestCorrect(editingEntry.testResult.correct?.toString() || '');
        setTestWrong(editingEntry.testResult.wrong?.toString() || '');
        setTestTimeTaken(editingEntry.testResult.timeTakenMinutes?.toString() || '');
      } else {
        setShowTestSection(false);
        setTestName('');
        setTestSubject('');
        setTestScore('');
        setTestMaxMarks('100');
        setTestAttempted('');
        setTestCorrect('');
        setTestWrong('');
        setTestTimeTaken('');
      }
    } else {
      setId(`entry-${Date.now()}`);
      setDate(targetDate || todayStr);
      setStudyHours('6.0');
      setStartTime('');
      setEndTime('');
      setSelectedSubjects([]);
      setTopics('');
      setCompleted('');
      setWentWell('');
      setWentWrong('');
      setDistractions('');
      setTomorrowPlan('');
      setNotes('');
      setShowReflections(false);

      setShowTestSection(false);
      setTestName('');
      setTestSubject('');
      setTestScore('');
      setTestMaxMarks('100');
      setTestAttempted('');
      setTestCorrect('');
      setTestWrong('');
      setTestTimeTaken('');
    }
  }, [editingEntry, targetDate, isOpen]);

  if (!isOpen) return null;

  const handleSubjectToggle = (sub: string) => {
    if (selectedSubjects.includes(sub)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== sub));
    } else {
      setSelectedSubjects([...selectedSubjects, sub]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const hours = parseFloat(studyHours) || 0;

    let testObj: TestResult | undefined = undefined;
    if (showTestSection && testName.trim()) {
      const sc = parseFloat(testScore) || 0;
      const maxM = parseFloat(testMaxMarks) || 100;
      const pct = maxM > 0 ? Number(((sc / maxM) * 100).toFixed(1)) : 0;

      testObj = {
        testName: testName.trim(),
        subject: testSubject || (selectedSubjects[0] || 'General'),
        score: sc,
        maxMarks: maxM,
        percentage: pct,
        questionsAttempted: testAttempted ? parseInt(testAttempted, 10) : undefined,
        correct: testCorrect ? parseInt(testCorrect, 10) : undefined,
        wrong: testWrong ? parseInt(testWrong, 10) : undefined,
        timeTakenMinutes: testTimeTaken ? parseInt(testTimeTaken, 10) : undefined,
      };
    }

    const newEntry: DailyEntry = {
      id: id || `entry-${Date.now()}`,
      date,
      studyHours: hours,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      subjects: selectedSubjects,
      topics: topics.trim() || undefined,
      completed: completed.trim() || undefined,
      wentWell: wentWell.trim() || undefined,
      wentWrong: wentWrong.trim() || undefined,
      distractions: distractions.trim() || undefined,
      tomorrowPlan: tomorrowPlan.trim() || undefined,
      notes: notes.trim() || undefined,
      testResult: testObj,
      createdAt: editingEntry ? editingEntry.createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    onSave(newEntry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="bg-[#fbf9f5] dark:bg-[#23201c] border border-[#e8e2d5] dark:border-[#38332c] rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e8e2d5] dark:border-[#38332c] flex items-center justify-between bg-[#f6f2e9] dark:bg-[#1c1a17]">
          <div>
            <h2 className="font-heading font-semibold text-lg text-[#2c2825] dark:text-[#f0ece1]">
              {editingEntry ? 'Edit Study Entry' : 'New Study Entry'}
            </h2>
            <p className="text-xs text-[#78716c] dark:text-[#a39c90]">
              All fields except date are optional
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#78716c] hover:text-[#2c2825] dark:hover:text-[#f0ece1] hover:bg-[#eae3d5] dark:hover:bg-[#2e2a25] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Essential Info Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#57514a] dark:text-[#c4beb3] mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#dcd6c8] dark:border-[#423c34] bg-white dark:bg-[#1c1a17] text-sm text-[#2c2825] dark:text-[#f0ece1] focus:outline-none focus:ring-2 focus:ring-[#3b6978]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#57514a] dark:text-[#c4beb3] mb-1">
                Total Study Hours
              </label>
              <input
                type="number"
                step="0.25"
                min="0"
                max="24"
                value={studyHours}
                onChange={(e) => setStudyHours(e.target.value)}
                placeholder="e.g. 6.0"
                className="w-full px-3.5 py-2 rounded-xl border border-[#dcd6c8] dark:border-[#423c34] bg-white dark:bg-[#1c1a17] text-sm text-[#2c2825] dark:text-[#f0ece1] focus:outline-none focus:ring-2 focus:ring-[#3b6978]/30 tabular-nums"
              />
            </div>
          </div>

          {/* Optional Start/End Times */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#78716c] dark:text-[#a39c90] mb-1">
                Start Time (Optional)
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-[#dcd6c8] dark:border-[#423c34] bg-white dark:bg-[#1c1a17] text-xs text-[#2c2825] dark:text-[#f0ece1] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#78716c] dark:text-[#a39c90] mb-1">
                End Time (Optional)
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-[#dcd6c8] dark:border-[#423c34] bg-white dark:bg-[#1c1a17] text-xs text-[#2c2825] dark:text-[#f0ece1] focus:outline-none"
              />
            </div>
          </div>

          {/* Subjects Studied */}
          <div>
            <label className="block text-xs font-semibold text-[#57514a] dark:text-[#c4beb3] mb-1.5">
              Subjects Studied
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {availableSubjects.map((sub) => {
                const isSelected = selectedSubjects.includes(sub);
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => handleSubjectToggle(sub)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#3b6978] text-white shadow-2xs'
                        : 'bg-[#ffffff] dark:bg-[#1c1a17] border border-[#dcd6c8] dark:border-[#3d3730] text-[#57514a] dark:text-[#a8a196] hover:border-[#3b6978]'
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topics Covered */}
          <div>
            <label className="block text-xs font-semibold text-[#57514a] dark:text-[#c4beb3] mb-1">
              Topics / Chapters Covered
            </label>
            <textarea
              rows={2}
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="e.g. Physics: Electric Potential & Capacitance; Maths: Definite Integrals"
              className="w-full px-3.5 py-2 rounded-xl border border-[#dcd6c8] dark:border-[#423c34] bg-white dark:bg-[#1c1a17] text-sm text-[#2c2825] dark:text-[#f0ece1] focus:outline-none focus:ring-2 focus:ring-[#3b6978]/30"
            />
          </div>

          {/* Progressive Disclosure Section 1: Daily Reflection */}
          <div className="border border-[#e8e2d5] dark:border-[#38332c] rounded-xl overflow-hidden bg-white/50 dark:bg-[#1c1a17]/50">
            <button
              type="button"
              onClick={() => setShowReflections(!showReflections)}
              className="w-full px-4 py-3 flex items-center justify-between text-left font-semibold text-xs text-[#2c2825] dark:text-[#f0ece1] hover:bg-[#f6f2e9] dark:hover:bg-[#26231f] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#3b6978] dark:text-[#68a3b5]" />
                <span>Daily Reflection & Progress Notes (Optional)</span>
              </div>
              {showReflections ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showReflections && (
              <div className="p-4 space-y-3 border-t border-[#e8e2d5] dark:border-[#38332c] bg-white dark:bg-[#201d19]">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6e675f] dark:text-[#a39c90] mb-1">
                    What did you complete today?
                  </label>
                  <input
                    type="text"
                    value={completed}
                    onChange={(e) => setCompleted(e.target.value)}
                    placeholder="e.g. Solved 25 questions, revised chapter 3 notes"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#dcd6c8] dark:border-[#3d3730] text-xs text-[#2c2825] dark:text-[#f0ece1]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6e675f] dark:text-[#a39c90] mb-1">
                      What went well?
                    </label>
                    <input
                      type="text"
                      value={wentWell}
                      onChange={(e) => setWentWell(e.target.value)}
                      placeholder="e.g. High focus during morning calculus session"
                      className="w-full px-3 py-1.5 rounded-lg border border-[#dcd6c8] dark:border-[#3d3730] text-xs text-[#2c2825] dark:text-[#f0ece1]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6e675f] dark:text-[#a39c90] mb-1">
                      What went wrong / struggled?
                    </label>
                    <input
                      type="text"
                      value={wentWrong}
                      onChange={(e) => setWentWrong(e.target.value)}
                      placeholder="e.g. Got stuck on organic reaction mechanisms"
                      className="w-full px-3 py-1.5 rounded-lg border border-[#dcd6c8] dark:border-[#3d3730] text-xs text-[#2c2825] dark:text-[#f0ece1]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6e675f] dark:text-[#a39c90] mb-1">
                      What distracted you?
                    </label>
                    <input
                      type="text"
                      value={distractions}
                      onChange={(e) => setDistractions(e.target.value)}
                      placeholder="e.g. Social media notifications, noisy environment"
                      className="w-full px-3 py-1.5 rounded-lg border border-[#dcd6c8] dark:border-[#3d3730] text-xs text-[#2c2825] dark:text-[#f0ece1]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6e675f] dark:text-[#a39c90] mb-1">
                      What should you improve tomorrow?
                    </label>
                    <input
                      type="text"
                      value={tomorrowPlan}
                      onChange={(e) => setTomorrowPlan(e.target.value)}
                      placeholder="e.g. Put phone in another room during study blocks"
                      className="w-full px-3 py-1.5 rounded-lg border border-[#dcd6c8] dark:border-[#3d3730] text-xs text-[#2c2825] dark:text-[#f0ece1]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6e675f] dark:text-[#a39c90] mb-1">
                    General Notes
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any general thoughts, formulas to remember, or reminders..."
                    className="w-full px-3 py-1.5 rounded-lg border border-[#dcd6c8] dark:border-[#3d3730] text-xs text-[#2c2825] dark:text-[#f0ece1]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Progressive Disclosure Section 2: Test Result */}
          <div className="border border-[#e8e2d5] dark:border-[#38332c] rounded-xl overflow-hidden bg-white/50 dark:bg-[#1c1a17]/50">
            <button
              type="button"
              onClick={() => setShowTestSection(!showTestSection)}
              className="w-full px-4 py-3 flex items-center justify-between text-left font-semibold text-xs text-[#2c2825] dark:text-[#f0ece1] hover:bg-[#f6f2e9] dark:hover:bg-[#26231f] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#d97757]" />
                <span>Test / Quiz Result (Only if taken today)</span>
              </div>
              {showTestSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showTestSection && (
              <div className="p-4 space-y-3 border-t border-[#e8e2d5] dark:border-[#38332c] bg-white dark:bg-[#201d19]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6e675f] dark:text-[#a39c90] mb-1">
                      Test / Quiz Name
                    </label>
                    <input
                      type="text"
                      value={testName}
                      onChange={(e) => setTestName(e.target.value)}
                      placeholder="e.g. Physics Chapter 3 Mock Quiz"
                      className="w-full px-3 py-1.5 rounded-lg border border-[#dcd6c8] dark:border-[#3d3730] text-xs text-[#2c2825] dark:text-[#f0ece1]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6e675f] dark:text-[#a39c90] mb-1">
                      Subject
                    </label>
                    <select
                      value={testSubject}
                      onChange={(e) => setTestSubject(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#dcd6c8] dark:border-[#3d3730] text-xs text-[#2c2825] dark:text-[#f0ece1] bg-white dark:bg-[#1c1a17]"
                    >
                      <option value="">Select subject...</option>
                      {availableSubjects.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6e675f] dark:text-[#a39c90] mb-1">
                      Score
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={testScore}
                      onChange={(e) => setTestScore(e.target.value)}
                      placeholder="e.g. 78"
                      className="w-full px-3 py-1.5 rounded-lg border border-[#dcd6c8] dark:border-[#3d3730] text-xs text-[#2c2825] dark:text-[#f0ece1] tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6e675f] dark:text-[#a39c90] mb-1">
                      Max Marks
                    </label>
                    <input
                      type="number"
                      value={testMaxMarks}
                      onChange={(e) => setTestMaxMarks(e.target.value)}
                      placeholder="100"
                      className="w-full px-3 py-1.5 rounded-lg border border-[#dcd6c8] dark:border-[#3d3730] text-xs text-[#2c2825] dark:text-[#f0ece1] tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6e675f] dark:text-[#a39c90] mb-1">
                      Questions Attempted
                    </label>
                    <input
                      type="number"
                      value={testAttempted}
                      onChange={(e) => setTestAttempted(e.target.value)}
                      placeholder="30"
                      className="w-full px-3 py-1.5 rounded-lg border border-[#dcd6c8] dark:border-[#3d3730] text-xs text-[#2c2825] dark:text-[#f0ece1] tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6e675f] dark:text-[#a39c90] mb-1">
                      Correct Answers
                    </label>
                    <input
                      type="number"
                      value={testCorrect}
                      onChange={(e) => setTestCorrect(e.target.value)}
                      placeholder="24"
                      className="w-full px-3 py-1.5 rounded-lg border border-[#dcd6c8] dark:border-[#3d3730] text-xs text-[#2c2825] dark:text-[#f0ece1] tabular-nums"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6e675f] dark:text-[#a39c90] mb-1">
                      Wrong Answers
                    </label>
                    <input
                      type="number"
                      value={testWrong}
                      onChange={(e) => setTestWrong(e.target.value)}
                      placeholder="5"
                      className="w-full px-3 py-1.5 rounded-lg border border-[#dcd6c8] dark:border-[#3d3730] text-xs text-[#2c2825] dark:text-[#f0ece1] tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6e675f] dark:text-[#a39c90] mb-1">
                      Time Taken (Mins)
                    </label>
                    <input
                      type="number"
                      value={testTimeTaken}
                      onChange={(e) => setTestTimeTaken(e.target.value)}
                      placeholder="60"
                      className="w-full px-3 py-1.5 rounded-lg border border-[#dcd6c8] dark:border-[#3d3730] text-xs text-[#2c2825] dark:text-[#f0ece1] tabular-nums"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-[#e8e2d5] dark:border-[#38332c] flex items-center justify-between">
            {editingEntry && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this study entry?')) {
                    onDelete(editingEntry.id);
                    onClose();
                  }
                }}
                className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline"
              >
                Delete Entry
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#57514a] dark:text-[#c4beb3] hover:bg-[#eae3d5] dark:hover:bg-[#332e27] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#3b6978] hover:bg-[#2d5360] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                Save Entry
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
