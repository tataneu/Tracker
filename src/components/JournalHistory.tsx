import React, { useState, useMemo } from 'react';
import { DailyEntry } from '../types';
import { Search, Filter, Calendar, Edit2, Trash2, ChevronDown, ChevronUp, Plus, Trophy } from 'lucide-react';

interface JournalHistoryProps {
  entries: DailyEntry[];
  availableSubjects: string[];
  onEditEntry: (entry: DailyEntry) => void;
  onDeleteEntry: (id: string) => void;
  onAddNewEntry: () => void;
}

export const JournalHistory: React.FC<JournalHistoryProps> = ({
  entries,
  availableSubjects,
  onEditEntry,
  onDeleteEntry,
  onAddNewEntry,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedIds(next);
  };

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      // Subject filter
      if (subjectFilter !== 'all') {
        if (!e.subjects || !e.subjects.includes(subjectFilter)) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDate = e.date.toLowerCase().includes(q);
        const matchesTopics = e.topics?.toLowerCase().includes(q) || false;
        const matchesSubjects = e.subjects?.some((s) => s.toLowerCase().includes(q)) || false;
        const matchesNotes = e.notes?.toLowerCase().includes(q) || false;
        const matchesCompleted = e.completed?.toLowerCase().includes(q) || false;
        const matchesTest = e.testResult?.testName.toLowerCase().includes(q) || false;

        return matchesDate || matchesTopics || matchesSubjects || matchesNotes || matchesCompleted || matchesTest;
      }

      return true;
    });
  }, [entries, searchQuery, subjectFilter]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Search & Filter Header Bar */}
      <div className="bg-[#ffffff] dark:bg-[#23201c] border border-[#e8e2d5] dark:border-[#38332c] rounded-2xl p-4 shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#857d73] dark:text-[#8e877c] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics, subjects, reflections, test names..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#dcd6c8] dark:border-[#3d3730] bg-[#fbf9f5] dark:bg-[#1c1a17] text-xs text-[#2c2825] dark:text-[#f0ece1] focus:outline-none focus:ring-2 focus:ring-[#3b6978]/30"
          />
        </div>

        {/* Subject Filter Dropdown & New Entry Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#dcd6c8] dark:border-[#3d3730] bg-[#fbf9f5] dark:bg-[#1c1a17]">
            <Filter className="w-3.5 h-3.5 text-[#857d73]" />
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#2c2825] dark:text-[#f0ece1] focus:outline-none cursor-pointer"
            >
              <option value="all">All Subjects</option>
              {availableSubjects.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <button
            onClick={onAddNewEntry}
            className="px-3.5 py-2 rounded-xl bg-[#3b6978] hover:bg-[#2d5360] text-white text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Entry</span>
          </button>
        </div>

      </div>

      {/* Entries List Timeline */}
      {filteredEntries.length === 0 ? (
        <div className="bg-[#ffffff] dark:bg-[#23201c] border border-[#e8e2d5] dark:border-[#38332c] rounded-2xl p-12 text-center space-y-3">
          <Calendar className="w-8 h-8 text-[#a8a196] mx-auto" />
          <h3 className="font-heading font-semibold text-base text-[#2c2825] dark:text-[#f0ece1]">
            No daily study logs found
          </h3>
          <p className="text-xs text-[#78716c] dark:text-[#a39c90] max-w-sm mx-auto">
            {searchQuery || subjectFilter !== 'all'
              ? 'Try clearing your search query or subject filter.'
              : 'Start logging your daily progress to build your 90-day study journal.'}
          </p>
          <button
            onClick={onAddNewEntry}
            className="mt-2 px-4 py-2 bg-[#3b6978] text-white text-xs font-semibold rounded-xl"
          >
            Create First Entry
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => {
            const isExpanded = expandedIds.has(entry.id);
            const isZeroHours = entry.studyHours === 0;

            return (
              <div
                key={entry.id}
                className="bg-[#ffffff] dark:bg-[#23201c] border border-[#e8e2d5] dark:border-[#38332c] rounded-2xl p-5 shadow-2xs hover:border-[#3b6978]/40 transition-all space-y-3"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-4">
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading font-bold text-base text-[#2c2825] dark:text-[#f0ece1]">
                        {entry.date}
                      </span>

                      {/* Study Hours Badge */}
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          isZeroHours
                            ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-[#f0ebd9] dark:bg-[#2e2a25] text-[#3b6978] dark:text-[#68a3b5] border border-[#e2dacb] dark:border-[#3d3730]'
                        }`}
                      >
                        {isZeroHours ? 'Explicit 0 hrs' : `${entry.studyHours} hrs studied`}
                      </span>

                      {/* Test Score Badge if present */}
                      {entry.testResult && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#d97757] bg-[#fbf0ec] dark:bg-[#2e221d] px-2.5 py-0.5 rounded-full border border-[#f3d9ce] dark:border-[#423129]">
                          <Trophy className="w-3 h-3" />
                          {entry.testResult.testName}: {entry.testResult.score}/{entry.testResult.maxMarks} ({entry.testResult.percentage}%)
                        </span>
                      )}
                    </div>

                    {/* Subjects Unboxed List */}
                    {entry.subjects && entry.subjects.length > 0 && (
                      <p className="text-xs font-medium text-[#57514a] dark:text-[#c4beb3]">
                        {entry.subjects.join(' · ')}
                      </p>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onEditEntry(entry)}
                      className="p-1.5 rounded-lg text-[#78716c] hover:text-[#2c2825] dark:hover:text-[#f0ece1] hover:bg-[#f6f2e9] dark:hover:bg-[#282420] transition-colors"
                      title="Edit Entry"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this study log entry?')) {
                          onDeleteEntry(entry.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-[#78716c] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleExpand(entry.id)}
                      className="p-1.5 rounded-lg text-[#78716c] hover:text-[#2c2825] dark:hover:text-[#f0ece1] hover:bg-[#f6f2e9] dark:hover:bg-[#282420] transition-colors"
                      title={isExpanded ? 'Collapse' : 'Expand Details'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                </div>

                {/* Topics Summary */}
                {entry.topics && (
                  <p className="text-xs text-[#2c2825] dark:text-[#f0ece1] leading-relaxed">
                    <span className="font-semibold text-[#57514a] dark:text-[#c4beb3]">Topics:</span> {entry.topics}
                  </p>
                )}

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="pt-3 border-t border-[#e8e2d5] dark:border-[#38332c] space-y-2 text-xs text-[#57514a] dark:text-[#c4beb3]">
                    
                    {entry.completed && (
                      <p>
                        <strong className="text-[#2c2825] dark:text-[#f0ece1]">Completed:</strong> {entry.completed}
                      </p>
                    )}

                    {entry.wentWell && (
                      <p>
                        <strong className="text-[#2c2825] dark:text-[#f0ece1]">Went Well:</strong> {entry.wentWell}
                      </p>
                    )}

                    {entry.wentWrong && (
                      <p>
                        <strong className="text-[#2c2825] dark:text-[#f0ece1]">Struggles / Impediments:</strong> {entry.wentWrong}
                      </p>
                    )}

                    {entry.distractions && (
                      <p>
                        <strong className="text-[#2c2825] dark:text-[#f0ece1]">Distractions:</strong> {entry.distractions}
                      </p>
                    )}

                    {entry.tomorrowPlan && (
                      <p>
                        <strong className="text-[#2c2825] dark:text-[#f0ece1]">Tomorrow's Target:</strong> {entry.tomorrowPlan}
                      </p>
                    )}

                    {entry.notes && (
                      <p className="italic text-[#78716c] dark:text-[#a39c90]">
                        <strong>Notes:</strong> {entry.notes}
                      </p>
                    )}

                    {/* Full Test Details if present */}
                    {entry.testResult && (
                      <div className="mt-2 p-3 bg-[#fbf9f5] dark:bg-[#1c1a17] rounded-xl border border-[#e8e2d5] dark:border-[#332f2a] space-y-1">
                        <p className="font-semibold text-xs text-[#2c2825] dark:text-[#f0ece1]">
                          Test Details: {entry.testResult.testName}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#78716c] dark:text-[#a39c90]">
                          <span>Score: {entry.testResult.score} / {entry.testResult.maxMarks}</span>
                          {entry.testResult.questionsAttempted && <span>Attempted: {entry.testResult.questionsAttempted}</span>}
                          {entry.testResult.correct && <span>Correct: {entry.testResult.correct}</span>}
                          {entry.testResult.wrong && <span>Wrong: {entry.testResult.wrong}</span>}
                          {entry.testResult.timeTakenMinutes && <span>Time: {entry.testResult.timeTakenMinutes} mins</span>}
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
