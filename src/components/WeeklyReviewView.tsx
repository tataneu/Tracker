import React, { useState } from 'react';
import { ChallengeConfig, DailyEntry } from '../types';
import { generateWeeklyReview } from '../utils/analytics';
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, Target, CheckCircle2 } from 'lucide-react';

interface WeeklyReviewViewProps {
  config: ChallengeConfig;
  entries: DailyEntry[];
}

export const WeeklyReviewView: React.FC<WeeklyReviewViewProps> = ({ config, entries }) => {
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  const review = generateWeeklyReview(config, entries, selectedWeek);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Week Selector Bar */}
      <div className="bg-[#ffffff] dark:bg-[#23201c] border border-[#e8e2d5] dark:border-[#38332c] rounded-2xl p-4 shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#3b6978] dark:text-[#68a3b5]" />
          <h2 className="font-heading font-bold text-lg text-[#2c2825] dark:text-[#f0ece1]">
            Weekly Review Summaries
          </h2>
        </div>

        {/* 13 Week Selector Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full p-1 bg-[#f0ebd9] dark:bg-[#1c1a17] rounded-xl border border-[#e2dacb] dark:border-[#38332c]">
          {Array.from({ length: 13 }, (_, i) => i + 1).map((wNum) => (
            <button
              key={wNum}
              onClick={() => setSelectedWeek(wNum)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                selectedWeek === wNum
                  ? 'bg-[#3b6978] text-white shadow-2xs'
                  : 'text-[#6e675f] dark:text-[#a39c90] hover:text-[#2c2825] dark:hover:text-[#f0ece1]'
              }`}
            >
              Week {wNum}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Week Summary Card */}
      <div className="bg-[#ffffff] dark:bg-[#23201c] border border-[#e8e2d5] dark:border-[#38332c] rounded-2xl p-6 shadow-2xs space-y-6">
        
        {/* Header Metadata */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e8e2d5] dark:border-[#38332c] pb-4">
          <div>
            <h3 className="font-heading font-bold text-xl text-[#2c2825] dark:text-[#f0ece1]">
              Week {review.weekNumber} Summary
            </h3>
            <p className="text-xs text-[#78716c] dark:text-[#a39c90]">
              {review.startDate} to {review.endDate}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#3b6978] bg-[#f0ebd9] dark:bg-[#2e2a25] px-3 py-1 rounded-full">
              Target Completion: {review.targetAchievementPct}%
            </span>
          </div>
        </div>

        {/* Stat Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-[#fbf9f5] dark:bg-[#1c1a17] rounded-xl border border-[#e8e2d5] dark:border-[#332f2a]">
            <span className="text-xs font-semibold text-[#78716c]">Total Study Hours</span>
            <p className="font-heading font-bold text-xl text-[#2c2825] dark:text-[#f0ece1] mt-1 tabular-nums">
              {review.totalHours} <span className="text-xs font-normal">/ {review.targetHours}h</span>
            </p>
          </div>

          <div className="p-4 bg-[#fbf9f5] dark:bg-[#1c1a17] rounded-xl border border-[#e8e2d5] dark:border-[#332f2a]">
            <span className="text-xs font-semibold text-[#78716c]">Daily Average</span>
            <p className="font-heading font-bold text-xl text-[#2c2825] dark:text-[#f0ece1] mt-1 tabular-nums">
              {review.avgHoursPerDay} hrs/day
            </p>
          </div>

          <div className="p-4 bg-[#fbf9f5] dark:bg-[#1c1a17] rounded-xl border border-[#e8e2d5] dark:border-[#332f2a]">
            <span className="text-xs font-semibold text-[#78716c]">Study Days Count</span>
            <p className="font-heading font-bold text-xl text-[#2c2825] dark:text-[#f0ece1] mt-1 tabular-nums">
              {review.studyDaysCount} / 7 days
            </p>
          </div>

          <div className="p-4 bg-[#fbf9f5] dark:bg-[#1c1a17] rounded-xl border border-[#e8e2d5] dark:border-[#332f2a]">
            <span className="text-xs font-semibold text-[#78716c]">Test Average</span>
            <p className="font-heading font-bold text-xl text-[#d97757] mt-1 tabular-nums">
              {review.avgTestScore !== null ? `${review.avgTestScore}%` : 'No tests'}
            </p>
          </div>
        </div>

        {/* 4 Cards: Improved, Declined, Neglected, Focus */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Improved */}
          <div className="p-4 bg-[#f4f8f6] dark:bg-[#1d2b25] border border-[#d2e4dc] dark:border-[#2a453a] rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs">
              <TrendingUp className="w-4 h-4" />
              <span>What Improved</span>
            </div>
            {review.improved.length > 0 ? (
              <ul className="space-y-1 text-xs text-[#2c2825] dark:text-[#f0ece1]">
                {review.improved.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#78716c]">No notable improvements recorded in this week's entries.</p>
            )}
          </div>

          {/* Declined */}
          <div className="p-4 bg-[#fcf4f2] dark:bg-[#2b1f1c] border border-[#f5d9d3] dark:border-[#452d27] rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-[#d97757] font-semibold text-xs">
              <TrendingDown className="w-4 h-4" />
              <span>Areas Short of Target</span>
            </div>
            {review.declined.length > 0 ? (
              <ul className="space-y-1 text-xs text-[#2c2825] dark:text-[#f0ece1]">
                {review.declined.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d97757] mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-emerald-700 font-semibold">No target declines in this week!</p>
            )}
          </div>

          {/* Neglected Subjects */}
          <div className="p-4 bg-[#fbf9f5] dark:bg-[#1c1a17] border border-[#e8e2d5] dark:border-[#38332c] rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>Neglected / Low Attention Subjects</span>
            </div>
            {review.neglectedSubjects.length > 0 ? (
              <p className="text-xs text-[#2c2825] dark:text-[#f0ece1]">
                {review.neglectedSubjects.join(', ')} received less than 1 hour of study time this week.
              </p>
            ) : (
              <p className="text-xs text-[#78716c]">All subjects received balanced study time this week.</p>
            )}
          </div>

          {/* Next Week Focus */}
          <div className="p-4 bg-[#f0ebd9]/60 dark:bg-[#28241f] border border-[#e2dacb] dark:border-[#38332c] rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-[#3b6978] dark:text-[#68a3b5] font-semibold text-xs">
              <Target className="w-4 h-4" />
              <span>Next Week's Action Focus</span>
            </div>
            <p className="text-xs font-semibold text-[#2c2825] dark:text-[#f0ece1] leading-relaxed">
              {review.nextWeekFocus}
            </p>
          </div>

        </div>

        {/* Pattern Summary */}
        <div className="p-4 bg-[#fbf9f5] dark:bg-[#1c1a17] border border-[#e8e2d5] dark:border-[#38332c] rounded-xl text-xs text-[#57514a] dark:text-[#c4beb3] leading-relaxed">
          <strong className="text-[#2c2825] dark:text-[#f0ece1]">Biggest Pattern Observed:</strong> {review.mainPattern}
        </div>

      </div>

    </div>
  );
};
