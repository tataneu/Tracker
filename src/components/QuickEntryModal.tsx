import React, { useState, useEffect } from 'react';
import { DailyEntry } from '../types';
import { formatDateKey } from '../utils/storage';
import { X, Check, Zap, SlidersHorizontal } from 'lucide-react';

interface QuickEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Partial<DailyEntry>) => void;
  onOpenFullModal: (date?: string) => void;
  existingEntries: DailyEntry[];
  availableSubjects: string[];
}

export const QuickEntryModal: React.FC<QuickEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onOpenFullModal,
  existingEntries,
  availableSubjects,
}) => {
  const todayStr = formatDateKey(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [studyHours, setStudyHours] = useState<string>('5.0');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [topics, setTopics] = useState<string>('');
  const [quickInput, setQuickInput] = useState<string>('');
  const [useQuickText, setUseQuickText] = useState<boolean>(false);

  // Load existing entry if date changes
  useEffect(() => {
    const existing = existingEntries.find((e) => e.date === selectedDate);
    if (existing) {
      setStudyHours(existing.studyHours.toString());
      setSelectedSubjects(existing.subjects || []);
      setTopics(existing.topics || '');
    } else {
      setStudyHours('5.0');
      setSelectedSubjects([]);
      setTopics('');
    }
  }, [selectedDate, existingEntries, isOpen]);

  if (!isOpen) return null;

  // Smart parser for quick string input like: "5.5 hours — Physics: Optics & Maths: Matrices"
  const parseQuickText = () => {
    if (!quickInput.trim()) return;

    // Extract numbers like 5, 5.5, 4.2
    const hourMatch = quickInput.match(/(\d+(\.\d+)?)\s*(h|hrs|hours)?/i);
    if (hourMatch) {
      setStudyHours(hourMatch[1]);
    }

    // Match subjects
    const matchedSubs: string[] = [];
    availableSubjects.forEach((sub) => {
      if (new RegExp(sub, 'i').test(quickInput)) {
        matchedSubs.push(sub);
      }
    });

    if (matchedSubs.length > 0) {
      setSelectedSubjects(matchedSubs);
    }

    // Set topic string
    const topicText = quickInput.replace(/(\d+(\.\d+)?)\s*(h|hrs|hours)?\s*(—|-|:)?/gi, '').trim();
    if (topicText) {
      setTopics(topicText);
    }
  };

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

    onSave({
      date: selectedDate,
      studyHours: hours,
      subjects: selectedSubjects,
      topics: topics.trim(),
    });

    onClose();
  };

  const presetHours = [2.0, 4.0, 5.0, 6.0, 8.0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="bg-[#fbf9f5] dark:bg-[#23201c] border border-[#e8e2d5] dark:border-[#38332c] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e8e2d5] dark:border-[#38332c] flex items-center justify-between bg-[#f6f2e9] dark:bg-[#1c1a17]">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#3b6978] dark:text-[#68a3b5]" />
            <h2 className="font-heading font-semibold text-lg text-[#2c2825] dark:text-[#f0ece1]">
              Quick Study Log
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#78716c] hover:text-[#2c2825] dark:hover:text-[#f0ece1] hover:bg-[#eae3d5] dark:hover:bg-[#2e2a25] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Quick String Parser Switch */}
          <div className="flex items-center justify-between text-xs font-medium text-[#78716c] dark:text-[#a39c90]">
            <span>Fast mode</span>
            <button
              type="button"
              onClick={() => setUseQuickText(!useQuickText)}
              className="text-[#3b6978] dark:text-[#68a3b5] hover:underline font-semibold"
            >
              {useQuickText ? 'Use standard fields' : 'Type single-line log'}
            </button>
          </div>

          {useQuickText ? (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#57514a] dark:text-[#c4beb3]">
                Quick Text (e.g., "5.5h — Physics: Atoms & Calculus practice")
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  placeholder="5.5h — Physics: Optics & Maths"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#dcd6c8] dark:border-[#423c34] bg-white dark:bg-[#1c1a17] text-sm text-[#2c2825] dark:text-[#f0ece1] focus:outline-none focus:ring-2 focus:ring-[#3b6978]/30"
                />
                <button
                  type="button"
                  onClick={parseQuickText}
                  className="px-4 py-2.5 bg-[#eae4d5] dark:bg-[#332e27] hover:bg-[#ded7c5] text-[#2c2825] dark:text-[#f0ece1] text-xs font-semibold rounded-xl transition-colors shrink-0"
                >
                  Parse
                </button>
              </div>
            </div>
          ) : null}

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-[#57514a] dark:text-[#c4beb3] mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#dcd6c8] dark:border-[#423c34] bg-white dark:bg-[#1c1a17] text-sm text-[#2c2825] dark:text-[#f0ece1] focus:outline-none focus:ring-2 focus:ring-[#3b6978]/30"
            />
          </div>

          {/* Hours Studied */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#57514a] dark:text-[#c4beb3]">
                Hours Studied Today
              </label>
              <span className="text-sm font-bold text-[#3b6978] dark:text-[#68a3b5] tabular-nums">
                {studyHours} hrs
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="number"
                step="0.25"
                min="0"
                max="24"
                value={studyHours}
                onChange={(e) => setStudyHours(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#dcd6c8] dark:border-[#423c34] bg-white dark:bg-[#1c1a17] text-base font-semibold text-[#2c2825] dark:text-[#f0ece1] focus:outline-none focus:ring-2 focus:ring-[#3b6978]/30 tabular-nums"
              />
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {presetHours.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setStudyHours(h.toFixed(1))}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    parseFloat(studyHours) === h
                      ? 'bg-[#3b6978] text-white'
                      : 'bg-[#eae4d5] dark:bg-[#332e27] text-[#57514a] dark:text-[#c4beb3] hover:bg-[#ded7c5]'
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>

          {/* Subjects Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#57514a] dark:text-[#c4beb3] mb-1.5">
              Subjects Studied (Optional)
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {availableSubjects.map((sub) => {
                const isSelected = selectedSubjects.includes(sub);
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => handleSubjectToggle(sub)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#3b6978] text-white shadow-2xs'
                        : 'bg-[#ffffff] dark:bg-[#1c1a17] border border-[#dcd6c8] dark:border-[#3d3730] text-[#57514a] dark:text-[#a8a196] hover:border-[#3b6978]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 inline-block mr-1" />}
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topics Studied */}
          <div>
            <label className="block text-xs font-semibold text-[#57514a] dark:text-[#c4beb3] mb-1.5">
              What did you study? (Topics / Chapters)
            </label>
            <input
              type="text"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="e.g. Physics: Electrostatics + Maths: Integration"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#dcd6c8] dark:border-[#423c34] bg-white dark:bg-[#1c1a17] text-sm text-[#2c2825] dark:text-[#f0ece1] focus:outline-none focus:ring-2 focus:ring-[#3b6978]/30"
            />
          </div>

          {/* Buttons Footer */}
          <div className="pt-2 border-t border-[#e8e2d5] dark:border-[#38332c] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFullModal(selectedDate);
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-[#78716c] dark:text-[#a39c90] hover:text-[#3b6978] dark:hover:text-[#68a3b5]"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Full form (Reflections / Test scores)</span>
            </button>

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
                Save Progress
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
