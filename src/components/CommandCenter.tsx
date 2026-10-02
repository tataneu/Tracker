import React from 'react';
import { ChallengeConfig, DailyEntry, AIRecommendation } from '../types';
import { calculateCommandOverview } from '../utils/analytics';
import {
  Flame,
  Target,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Sliders,
  RotateCw,
} from 'lucide-react';

interface CommandCenterProps {
  config: ChallengeConfig;
  entries: DailyEntry[];
  aiRecommendation: AIRecommendation | null;
  isLoadingAI: boolean;
  onRefreshAI: () => void;
  onOpenQuickEntry: () => void;
  onOpenFullModal: (date?: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  config,
  entries,
  aiRecommendation,
  isLoadingAI,
  onRefreshAI,
  onOpenQuickEntry,
  onOpenFullModal,
  onNavigateTab,
}) => {
  const overview = calculateCommandOverview(config, entries);

  return (
    <div className="space-y-6 pb-12">
      
      {/* 90-Day Hero Progress Command Card */}
      <div className="bg-[#ffffff] dark:bg-[#23201c] border border-[#e8e2d5] dark:border-[#38332c] rounded-2xl p-6 sm:p-8 shadow-2xs relative overflow-hidden">
        
        {/* Subtle Decorative Background Accent */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-[#3b6978]/5 dark:bg-[#3b6978]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0ebd9] dark:bg-[#2e2a24] text-[#3b6978] dark:text-[#68a3b5] text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              <span>90-Day Challenge Command Center</span>
            </div>
            
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#2c2825] dark:text-[#f0ece1]">
              Day <span className="text-[#3b6978] dark:text-[#68a3b5]">{overview.dayNumber}</span> of 90
            </h2>

            <p className="text-xs sm:text-sm text-[#78716c] dark:text-[#a39c90] max-w-xl">
              {overview.daysCompleted} days completed · {overview.daysRemaining} days remaining ·{' '}
              <span className="font-semibold text-[#2c2825] dark:text-[#f0ece1]">
                {overview.progressPercentage}% through challenge
              </span>
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenQuickEntry}
              className="px-5 py-2.5 rounded-xl bg-[#3b6978] hover:bg-[#2d5360] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-2 active:scale-98"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Record Today's Study</span>
            </button>
            
            <button
              onClick={() => onNavigateTab('settings')}
              className="p-2.5 rounded-xl border border-[#dcd6c8] dark:border-[#3d3730] text-[#6e675f] dark:text-[#a39c90] hover:bg-[#f6f2e9] dark:hover:bg-[#2a2621] transition-colors"
              title="Edit Challenge Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Challenge Progress Bar */}
        <div className="mt-6 space-y-2 relative z-10">
          <div className="flex items-center justify-between text-xs font-semibold text-[#78716c] dark:text-[#a39c90]">
            <span>Challenge Timeline</span>
            <span className="tabular-nums">{overview.daysCompleted} / 90 Days ({overview.progressPercentage}%)</span>
          </div>
          <div className="h-3 w-full bg-[#f0ebd9] dark:bg-[#332e27] rounded-full overflow-hidden p-0.5 border border-[#e2dacb] dark:border-[#3d3730]">
            <div
              className="h-full bg-[#3b6978] dark:bg-[#528d9f] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, overview.progressPercentage)}%` }}
            />
          </div>
        </div>

      </div>

      {/* Primary Key Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Study Hours */}
        <div className="bg-[#ffffff] dark:bg-[#23201c] border border-[#e8e2d5] dark:border-[#38332c] rounded-2xl p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-[#78716c] dark:text-[#a39c90]">
            <span className="text-xs font-semibold">Total Study Time</span>
            <Clock className="w-4 h-4 text-[#3b6978]" />
          </div>
          <p className="font-heading font-bold text-2xl text-[#2c2825] dark:text-[#f0ece1] tabular-nums">
            {overview.totalStudyHours} <span className="text-xs font-normal text-[#78716c]">hrs</span>
          </p>
          <p className="text-[11px] text-[#78716c] dark:text-[#a39c90]">
            Avg <span className="font-semibold text-[#2c2825] dark:text-[#f0ece1]">{overview.avgStudyHoursPerDay} hrs/day</span> recorded
          </p>
        </div>

        {/* Current & Longest Streak */}
        <div className="bg-[#ffffff] dark:bg-[#23201c] border border-[#e8e2d5] dark:border-[#38332c] rounded-2xl p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-[#78716c] dark:text-[#a39c90]">
            <span className="text-xs font-semibold">Study Streak</span>
            <Flame className="w-4 h-4 text-[#d97757]" />
          </div>
          <p className="font-heading font-bold text-2xl text-[#2c2825] dark:text-[#f0ece1] tabular-nums">
            {overview.currentStreak} <span className="text-xs font-normal text-[#78716c]">days</span>
          </p>
          <p className="text-[11px] text-[#78716c] dark:text-[#a39c90]">
            Longest streak: <span className="font-semibold text-[#2c2825] dark:text-[#f0ece1]">{overview.longestStreak} days</span>
          </p>
        </div>

        {/* Target vs Actual */}
        <div className="bg-[#ffffff] dark:bg-[#23201c] border border-[#e8e2d5] dark:border-[#38332c] rounded-2xl p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-[#78716c] dark:text-[#a39c90]">
            <span className="text-xs font-semibold">Target vs Actual</span>
            <Target className="w-4 h-4 text-[#3b6978]" />
          </div>
          <p className="font-heading font-bold text-2xl text-[#2c2825] dark:text-[#f0ece1] tabular-nums">
            {overview.totalStudyHours} <span className="text-xs font-normal text-[#78716c]">/ {overview.targetStudyHours}h target</span>
          </p>
          <p className="text-[11px] text-[#78716c] dark:text-[#a39c90]">
            Pace:{' '}
            <span className={overview.targetVsActualDiff >= 0 ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-[#d97757] font-semibold'}>
              {overview.targetVsActualDiff >= 0 ? `+${overview.targetVsActualDiff}h ahead` : `${overview.targetVsActualDiff}h gap`}
            </span>
          </p>
        </div>

        {/* Today vs Yesterday */}
        <div className="bg-[#ffffff] dark:bg-[#23201c] border border-[#e8e2d5] dark:border-[#38332c] rounded-2xl p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-[#78716c] dark:text-[#a39c90]">
            <span className="text-xs font-semibold">Today vs Yesterday</span>
            <TrendingUp className="w-4 h-4 text-[#3b6978]" />
          </div>
          <p className="font-heading font-bold text-2xl text-[#2c2825] dark:text-[#f0ece1] tabular-nums">
            {overview.todaysHours} <span className="text-xs font-normal text-[#78716c]">hrs today</span>
          </p>
          <p className="text-[11px] text-[#78716c] dark:text-[#a39c90]">
            Yesterday: <span className="font-semibold text-[#2c2825] dark:text-[#f0ece1]">{overview.yesterdaysHours} hrs</span>
          </p>
        </div>

      </div>

      {/* Today's Log Card & AI Tomorrow Recommendation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Status Box */}
        <div className="bg-[#ffffff] dark:bg-[#23201c] border border-[#e8e2d5] dark:border-[#38332c] rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#78716c] dark:text-[#a39c90]">Today's Progress</span>
              {overview.todayEntry ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                  <CheckCircle2 className="w-3 h-3" /> Recorded
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-[#d97757] bg-[#fbf0ec] dark:bg-[#2e221d] px-2.5 py-0.5 rounded-full border border-[#f3d9ce] dark:border-[#423129]">
                  Not recorded yet
                </span>
              )}
            </div>

            {overview.todayEntry ? (
              <div className="space-y-2">
                <p className="font-heading font-bold text-3xl text-[#2c2825] dark:text-[#f0ece1] tabular-nums">
                  {overview.todayEntry.studyHours} <span className="text-sm font-normal text-[#78716c]">hours studied</span>
                </p>
                {overview.todayEntry.subjects && overview.todayEntry.subjects.length > 0 && (
                  <p className="text-xs font-medium text-[#57514a] dark:text-[#c4beb3]">
                    Subjects: {overview.todayEntry.subjects.join(', ')}
                  </p>
                )}
                {overview.todayEntry.topics && (
                  <p className="text-xs text-[#78716c] dark:text-[#a39c90] line-clamp-2">
                    Topics: {overview.todayEntry.topics}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <p className="font-heading font-semibold text-lg text-[#2c2825] dark:text-[#f0ece1]">
                  Haven't logged today's study?
                </p>
                <p className="text-xs text-[#78716c] dark:text-[#a39c90]">
                  Record your study hours now to maintain your daily streak and update your 90-day progress.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={onOpenQuickEntry}
            className="w-full py-2.5 rounded-xl bg-[#eae4d5] dark:bg-[#2e2a25] hover:bg-[#ded7c5] dark:hover:bg-[#36312c] text-[#2c2825] dark:text-[#f0ece1] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{overview.todayEntry ? "Update Today's Entry" : "Add Today's Progress"}</span>
          </button>
        </div>

        {/* AI "What Should I Do Tomorrow?" Teaser Panel */}
        <div className="lg:col-span-2 bg-[#ffffff] dark:bg-[#23201c] border border-[#e8e2d5] dark:border-[#38332c] rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-2xs">
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#3b6978] dark:text-[#68a3b5]" />
                <h3 className="font-heading font-semibold text-sm text-[#2c2825] dark:text-[#f0ece1]">
                  What Should I Do Tomorrow? (AI Recommendation)
                </h3>
              </div>

              <button
                onClick={onRefreshAI}
                disabled={isLoadingAI}
                className="p-1.5 text-[#78716c] hover:text-[#2c2825] dark:hover:text-[#f0ece1] rounded-lg hover:bg-[#f6f2e9] dark:hover:bg-[#282420] transition-colors disabled:opacity-50"
                title="Refresh AI recommendation"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isLoadingAI ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {isLoadingAI ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-[#3b6978] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-[#78716c] dark:text-[#a39c90]">
                  Analyzing recent study logs and test accuracy...
                </p>
              </div>
            ) : aiRecommendation ? (
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <h4 className="font-semibold text-sm text-[#3b6978] dark:text-[#68a3b5]">
                    {aiRecommendation.title}
                  </h4>
                  {aiRecommendation.generatedAt && (
                    <span className="text-[10px] text-[#8e877c]">
                      Generated at {aiRecommendation.generatedAt}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#57514a] dark:text-[#c4beb3] leading-relaxed">
                  {aiRecommendation.summary}
                </p>

                {/* Steps preview */}
                <ul className="space-y-1.5 pt-1">
                  {aiRecommendation.actionableSteps.slice(0, 3).map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#2c2825] dark:text-[#f0ece1]">
                      <span className="w-4 h-4 rounded-full bg-[#f0ebd9] dark:bg-[#2e2a25] text-[#3b6978] dark:text-[#68a3b5] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>

                {aiRecommendation.reasoning && (
                  <p className="text-[11px] text-[#78716c] dark:text-[#a39c90] italic border-l-2 border-[#3b6978]/30 pl-2.5 mt-2">
                    Data Reason: {aiRecommendation.reasoning}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#78716c] dark:text-[#a39c90] py-4">
                Click refresh or open the Review tab to generate personalized AI study recommendations based on your recorded entries.
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-[#e8e2d5] dark:border-[#38332c] flex items-center justify-between">
            <span className="text-[11px] text-[#857d73] dark:text-[#8e877c]">
              Grounded in recorded study hours, target gaps & reflections
            </span>

            <button
              onClick={() => onNavigateTab('review')}
              className="flex items-center gap-1 text-xs font-semibold text-[#3b6978] dark:text-[#68a3b5] hover:underline"
            >
              <span>Full AI Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
