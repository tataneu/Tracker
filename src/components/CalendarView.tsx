import React from 'react';
import { ChallengeConfig, DailyEntry } from '../types';
import { addDays, daysBetween, formatDateKey } from '../utils/storage';
import { Calendar as CalendarIcon, Info } from 'lucide-react';

interface CalendarViewProps {
  config: ChallengeConfig;
  entries: DailyEntry[];
  onSelectDay: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ config, entries, onSelectDay }) => {
  const todayStr = formatDateKey(new Date());

  // Create quick lookup map
  const entryMap = new Map<string, DailyEntry>();
  entries.forEach((e) => entryMap.set(e.date, e));

  // Build all 90 days array starting from challenge startDate
  const daysList = [];
  for (let i = 0; i < config.durationDays; i++) {
    const dStr = addDays(config.startDate, i);
    const entry = entryMap.get(dStr);
    daysList.push({
      dayNumber: i + 1,
      date: dStr,
      entry,
    });
  }

  // Determine intensity style
  const getDayStyle = (entry?: DailyEntry, isToday?: boolean) => {
    if (!entry) {
      return {
        bg: 'bg-[#f6f2e9] dark:bg-[#1c1a17] border-[#e8e2d5] dark:border-[#332f2a] hover:border-[#3b6978]',
        label: 'No entry',
      };
    }

    if (entry.studyHours === 0) {
      return {
        bg: 'bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        label: '0h logged',
      };
    }

    if (entry.studyHours < 3) {
      return {
        bg: 'bg-[#e0eee8] dark:bg-[#1e332c] text-[#22483b] dark:text-[#88c5b2] border-[#c2ded3] dark:border-[#2b4c41]',
        label: `${entry.studyHours}h (low)`,
      };
    }

    if (entry.studyHours < config.dailyTargetHours) {
      return {
        bg: 'bg-[#b3d6cb] dark:bg-[#254f42] text-[#13382c] dark:text-[#a1dbc9] border-[#93c7b7] dark:border-[#336757]',
        label: `${entry.studyHours}h (moderate)`,
      };
    }

    // Target met or exceeded
    return {
      bg: 'bg-[#3b6978] text-white border-[#2e5461] shadow-2xs',
      label: `${entry.studyHours}h (target met!)`,
    };
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Calendar Header Card */}
      <div className="bg-[#ffffff] dark:bg-[#23201c] border border-[#e8e2d5] dark:border-[#38332c] rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#3b6978] dark:text-[#68a3b5]" />
              <h2 className="font-heading font-bold text-xl text-[#2c2825] dark:text-[#f0ece1]">
                90-Day Challenge Matrix
              </h2>
            </div>
            <p className="text-xs text-[#78716c] dark:text-[#a39c90] mt-1">
              Click or tap any day to view or record study details. Darker shades indicate higher study hours.
            </p>
          </div>

          {/* Color Legend */}
          <div className="flex items-center gap-2 flex-wrap text-[11px] font-semibold text-[#57514a] dark:text-[#c4beb3]">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-md bg-[#f6f2e9] dark:bg-[#1c1a17] border border-[#e8e2d5]" /> No entry
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300" /> 0h
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-md bg-[#e0eee8] border border-[#c2ded3]" /> 1-3h
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-md bg-[#b3d6cb] border border-[#93c7b7]" /> 4-5.9h
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-md bg-[#3b6978]" /> Target (6h+)
            </span>
          </div>
        </div>

        {/* 90-Day Matrix Grid */}
        <div className="grid grid-cols-5 sm:grid-cols-9 md:grid-cols-10 gap-2 pt-2">
          {daysList.map((d) => {
            const isToday = d.date === todayStr;
            const style = getDayStyle(d.entry, isToday);

            return (
              <button
                key={d.date}
                onClick={() => onSelectDay(d.date)}
                className={`p-2 rounded-xl border text-left transition-all active:scale-95 flex flex-col justify-between h-16 relative group ${style.bg} ${
                  isToday ? 'ring-2 ring-[#3b6978] ring-offset-1 dark:ring-offset-[#23201c]' : ''
                }`}
                title={`Day ${d.dayNumber} (${d.date}): ${style.label}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-bold opacity-80">
                    D{d.dayNumber}
                  </span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Today" />
                  )}
                </div>

                <div className="text-right">
                  <span className="font-heading font-bold text-xs tabular-nums block">
                    {d.entry ? `${d.entry.studyHours}h` : '-'}
                  </span>
                  <span className="text-[9px] opacity-75 truncate block">
                    {d.date.slice(5)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

      </div>

    </div>
  );
};
