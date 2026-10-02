import React, { useState, useMemo } from 'react';
import { ChallengeConfig, DailyEntry } from '../types';
import {
  calculateRangeStats,
  calculateSubjectBreakdown,
  calculateWeeklyBreakdown,
  generateEfficiencyInsights,
} from '../utils/analytics';
import {
  BarChart,
  LineChart,
  PieChart,
  Calendar,
  Zap,
  TrendingUp,
  Award,
  AlertCircle,
} from 'lucide-react';

interface ProgressAnalyticsProps {
  config: ChallengeConfig;
  entries: DailyEntry[];
}

type RangeFilter = 'today' | '3days' | '7days' | '14days' | '30days' | '90days' | 'custom';
type ActiveChart = 'line' | 'bar' | 'weekly' | 'subject' | 'test' | 'target';

export const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({ config, entries }) => {
  const [rangeFilter, setRangeFilter] = useState<RangeFilter>('30days');
  const [activeChart, setActiveChart] = useState<ActiveChart>('line');
  const [hoveredPoint, setHoveredPoint] = useState<{ label: string; value: string } | null>(null);

  // Range statistics
  const rangeStats = useMemo(() => {
    return calculateRangeStats(config, entries, rangeFilter);
  }, [config, entries, rangeFilter]);

  // Subject distribution
  const subjectBreakdown = useMemo(() => {
    return calculateSubjectBreakdown(entries);
  }, [entries]);

  // Weekly breakdown
  const weeklyBreakdown = useMemo(() => {
    return calculateWeeklyBreakdown(config, entries);
  }, [config, entries]);

  // Efficiency insights
  const efficiencyInsights = useMemo(() => {
    return generateEfficiencyInsights(entries);
  }, [entries]);

  // Sorted entries chronologically for charts
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => a.date.localeCompare(b.date));
  }, [entries]);

  // Test entries
  const testEntries = useMemo(() => {
    return sortedEntries.filter((e) => e.testResult && typeof e.testResult.percentage === 'number');
  }, [sortedEntries]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Date Range Selector Segmented Control */}
      <div className="bg-[#ffffff] dark:bg-[#23201c] border border-[#e8e2d5] dark:border-[#38332c] rounded-2xl p-4 shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
        <span className="text-xs font-semibold text-[#57514a] dark:text-[#c4beb3]">Time Horizon:</span>
        <div className="flex items-center gap-1 p-1 bg-[#f0ebd9] dark:bg-[#1c1a17] rounded-xl border border-[#e2dacb] dark:border-[#38332c] overflow-x-auto max-w-full">
          {[
            { id: 'today', label: 'Today' },
            { id: '3days', label: 'Last 3d' },
            { id: '7days', label: 'Last 7d' },
            { id: '14days', label: 'Last 14d' },
            { id: '30days', label: 'Last 30d' },
            { id: '90days', label: 'Full 90d' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setRangeFilter(item.id as RangeFilter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                rangeFilter === item.id
                  ? 'bg-[#ffffff] dark:bg-[#332f2a] text-[#2c2825] dark:text-[#f0ece1] shadow-2xs'
                  : 'text-[#6e675f] dark:text-[#a39c90] hover:text-[#2c2825] dark:hover:text-[#f0ece1]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Analytics Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="bg-[#ffffff] dark:bg-[#23201c] border border-[#e8e2d5] dark:border-[#38332c] rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-semibold text-[#78716c] dark:text-[#a39c90]">Total Hours</span>
          <p className="font-heading font-bold text-xl text-[#2c2825] dark:text-[#f0ece1] tabular-nums">
            {rangeStats.totalHours}h
          </p>
          <p className="text-[10px] text-[#8e877c]">Across selected range</p>
        </div>

        <div className="bg-[#ffffff] dark:bg-[#23201c] border border-[#e8e2d5] dark:border-[#38332c] rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-semibold text-[#78716c] dark:text-[#a39c90]">Avg Daily</span>
          <p className="font-heading font-bold text-xl text-[#2c2825] dark:text-[#f0ece1] tabular-nums">
            {rangeStats.avgHoursPerDay}h
          </p>
          <p className="text-[10px] text-[#8e877c]">Recorded days</p>
        </div>

        <div className="bg-[#ffffff] dark:bg-[#23201c] border border-[#e8e2d5] dark:border-[#38332c] rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-semibold text-[#78716c] dark:text-[#a39c90]">Median Study</span>
          <p className="font-heading font-bold text-xl text-[#2c2825] dark:text-[#f0ece1] tabular-nums">
            {rangeStats.medianHours}h
          </p>
          <p className="text-[10px] text-[#8e877c]">Midpoint session</p>
        </div>

        <div className="bg-[#ffffff] dark:bg-[#23201c] border border-[#e8e2d5] dark:border-[#38332c] rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-semibold text-[#78716c] dark:text-[#a39c90]">Highest / Lowest</span>
          <p className="font-heading font-bold text-lg text-[#2c2825] dark:text-[#f0ece1] tabular-nums">
            {rangeStats.maxDay ? `${rangeStats.maxDay.hours}h` : '-'} / {rangeStats.minRecordedDay ? `${rangeStats.minRecordedDay.hours}h` : '-'}
          </p>
          <p className="text-[10px] text-[#8e877c]">Peak vs trough</p>
        </div>

        <div className="bg-[#ffffff] dark:bg-[#23201c] border border-[#e8e2d5] dark:border-[#38332c] rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-semibold text-[#78716c] dark:text-[#a39c90]">Target Achieved</span>
          <p className="font-heading font-bold text-xl text-[#3b6978] dark:text-[#68a3b5] tabular-nums">
            {rangeStats.targetAchievementPct}%
          </p>
          <p className="text-[10px] text-[#8e877c]">vs expected target</p>
        </div>

        <div className="bg-[#ffffff] dark:bg-[#23201c] border border-[#e8e2d5] dark:border-[#38332c] rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-semibold text-[#78716c] dark:text-[#a39c90]">Avg Test Score</span>
          <p className="font-heading font-bold text-xl text-[#d97757] tabular-nums">
            {rangeStats.avgTestScore !== null ? `${rangeStats.avgTestScore}%` : 'No tests'}
          </p>
          <p className="text-[10px] text-[#8e877c]">
            {rangeStats.scoreTrend !== null
              ? rangeStats.scoreTrend >= 0 ? `+${rangeStats.scoreTrend}% trend` : `${rangeStats.scoreTrend}% trend`
              : 'Add quiz scores'}
          </p>
        </div>

      </div>

      {/* Interactive Visualizations Canvas Panel */}
      <div className="bg-[#ffffff] dark:bg-[#23201c] border border-[#e8e2d5] dark:border-[#38332c] rounded-2xl p-6 shadow-2xs space-y-6">
        
        {/* Chart Selector Tabs */}
        <div className="flex items-center justify-between gap-2 flex-wrap border-b border-[#e8e2d5] dark:border-[#38332c] pb-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveChart('line')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeChart === 'line'
                  ? 'bg-[#3b6978] text-white shadow-2xs'
                  : 'bg-[#f0ebd9]/50 dark:bg-[#2e2a24] text-[#6e675f] dark:text-[#a39c90] hover:bg-[#eae3d2]'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Study Hours Line</span>
            </button>

            <button
              onClick={() => setActiveChart('bar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeChart === 'bar'
                  ? 'bg-[#3b6978] text-white shadow-2xs'
                  : 'bg-[#f0ebd9]/50 dark:bg-[#2e2a24] text-[#6e675f] dark:text-[#a39c90] hover:bg-[#eae3d2]'
              }`}
            >
              <BarChart className="w-3.5 h-3.5" />
              <span>Daily Hours Bar</span>
            </button>

            <button
              onClick={() => setActiveChart('weekly')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeChart === 'weekly'
                  ? 'bg-[#3b6978] text-white shadow-2xs'
                  : 'bg-[#f0ebd9]/50 dark:bg-[#2e2a24] text-[#6e675f] dark:text-[#a39c90] hover:bg-[#eae3d2]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>13-Week Challenge</span>
            </button>

            <button
              onClick={() => setActiveChart('subject')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeChart === 'subject'
                  ? 'bg-[#3b6978] text-white shadow-2xs'
                  : 'bg-[#f0ebd9]/50 dark:bg-[#2e2a24] text-[#6e675f] dark:text-[#a39c90] hover:bg-[#eae3d2]'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Subject Breakdown</span>
            </button>

            <button
              onClick={() => setActiveChart('test')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeChart === 'test'
                  ? 'bg-[#3b6978] text-white shadow-2xs'
                  : 'bg-[#f0ebd9]/50 dark:bg-[#2e2a24] text-[#6e675f] dark:text-[#a39c90] hover:bg-[#eae3d2]'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Test Score Trend</span>
            </button>
          </div>

          {hoveredPoint && (
            <span className="text-xs font-semibold text-[#3b6978] dark:text-[#68a3b5] bg-[#f0ebd9] dark:bg-[#2e2a25] px-3 py-1 rounded-lg">
              {hoveredPoint.label}: <strong className="tabular-nums">{hoveredPoint.value}</strong>
            </span>
          )}
        </div>

        {/* Chart View Rendering */}
        <div className="h-72 w-full flex items-center justify-center relative">
          
          {/* 1. Line Chart */}
          {activeChart === 'line' && (
            sortedEntries.length === 0 ? (
              <div className="text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-[#a8a196] mx-auto" />
                <p className="text-xs text-[#78716c]">Add study entries to render study hours trend.</p>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col justify-between pt-4 pb-2">
                <svg className="w-full h-56 overflow-visible">
                  {/* Target Reference Line */}
                  <line
                    x1="0"
                    y1={224 - (config.dailyTargetHours / 12) * 200}
                    x2="100%"
                    y2={224 - (config.dailyTargetHours / 12) * 200}
                    stroke="#d97757"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <text
                    x="8"
                    y={216 - (config.dailyTargetHours / 12) * 200}
                    fill="#d97757"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    Target ({config.dailyTargetHours}h)
                  </text>

                  {/* SVG Data Points & Polyline */}
                  {(() => {
                    const width = 100;
                    const points = sortedEntries.map((e, idx) => {
                      const x = sortedEntries.length > 1 ? (idx / (sortedEntries.length - 1)) * 100 : 50;
                      const y = Math.max(10, 224 - (Math.min(12, e.studyHours) / 12) * 200);
                      return { x, y, entry: e };
                    });

                    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x}% ${p.y}`).join(' ');

                    return (
                      <>
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#3b6978"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {points.map((p, idx) => (
                          <circle
                            key={idx}
                            cx={`${p.x}%`}
                            cy={p.y}
                            r="4"
                            className="fill-[#3b6978] stroke-white dark:stroke-[#23201c] stroke-2 hover:r-6 transition-all cursor-pointer"
                            onMouseEnter={() => setHoveredPoint({ label: p.entry.date, value: `${p.entry.studyHours} hours` })}
                            onMouseLeave={() => setHoveredPoint(null)}
                          />
                        ))}
                      </>
                    );
                  })()}
                </svg>

                <div className="flex justify-between text-[10px] text-[#857d73] dark:text-[#8e877c] pt-2 border-t border-[#e8e2d5] dark:border-[#38332c]">
                  <span>{sortedEntries[0]?.date || ''}</span>
                  <span>{sortedEntries[Math.floor(sortedEntries.length / 2)]?.date || ''}</span>
                  <span>{sortedEntries[sortedEntries.length - 1]?.date || ''}</span>
                </div>
              </div>
            )
          )}

          {/* 2. Bar Chart */}
          {activeChart === 'bar' && (
            sortedEntries.length === 0 ? (
              <p className="text-xs text-[#78716c]">Add study entries to see bar chart.</p>
            ) : (
              <div className="w-full h-full flex items-end gap-1.5 pt-6 pb-4 overflow-x-auto">
                {sortedEntries.map((e) => {
                  const heightPct = Math.min(100, Math.max(5, (e.studyHours / 12) * 100));
                  const isMet = e.studyHours >= config.dailyTargetHours;

                  return (
                    <div
                      key={e.id}
                      className="flex-1 min-w-[20px] flex flex-col items-center justify-end h-full group"
                      onMouseEnter={() => setHoveredPoint({ label: e.date, value: `${e.studyHours} hrs` })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-t-md transition-all ${
                          isMet ? 'bg-[#3b6978] group-hover:bg-[#2d5360]' : 'bg-[#dcd6c8] dark:bg-[#3d3730] group-hover:bg-[#3b6978]/60'
                        }`}
                      />
                      <span className="text-[9px] text-[#8e877c] mt-1 truncate max-w-full">
                        {e.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* 3. 13-Week Challenge Comparison */}
          {activeChart === 'weekly' && (
            <div className="w-full h-full flex items-end gap-2 pt-6 pb-4 overflow-x-auto">
              {weeklyBreakdown.map((w) => {
                const heightPct = Math.min(100, Math.max(4, (w.actualHours / (config.weeklyTargetHours * 1.2)) * 100));
                const isMet = w.actualHours >= w.targetHours;

                return (
                  <div
                    key={w.weekNumber}
                    className="flex-1 min-w-[32px] flex flex-col items-center justify-end h-full group"
                    onMouseEnter={() =>
                      setHoveredPoint({
                        label: `Week ${w.weekNumber} (${w.startDate.slice(5)})`,
                        value: `${w.actualHours}h / ${w.targetHours}h target`,
                      })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    <span className="text-[9px] font-bold text-[#78716c] mb-1 tabular-nums">
                      {w.actualHours > 0 ? `${w.actualHours}h` : ''}
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-lg transition-all ${
                        isMet
                          ? 'bg-[#3b6978]'
                          : w.actualHours > 0
                          ? 'bg-[#d97757]/80'
                          : 'bg-[#e8e2d5] dark:bg-[#2e2a25]'
                      }`}
                    />
                    <span className="text-[10px] font-semibold text-[#57514a] dark:text-[#c4beb3] mt-1">
                      W{w.weekNumber}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* 4. Subject Breakdown Donut */}
          {activeChart === 'subject' && (
            subjectBreakdown.length === 0 ? (
              <p className="text-xs text-[#78716c]">No subject information recorded in study entries.</p>
            ) : (
              <div className="w-full h-full flex items-center justify-center gap-8">
                <div className="space-y-2 max-w-xs w-full">
                  {subjectBreakdown.map((s, idx) => {
                    const colors = ['#3b6978', '#d97757', '#528d9f', '#e0a96d', '#6e675f', '#a8a196'];
                    const color = colors[idx % colors.length];

                    return (
                      <div key={s.subject} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold text-[#2c2825] dark:text-[#f0ece1]">
                          <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                            {s.subject}
                          </span>
                          <span className="tabular-nums">{s.hours} hrs ({s.percentage}%)</span>
                        </div>
                        <div className="h-2 w-full bg-[#f0ebd9] dark:bg-[#332e27] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${s.percentage}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}

          {/* 5. Test Score Trend */}
          {activeChart === 'test' && (
            testEntries.length === 0 ? (
              <div className="text-center space-y-2">
                <Award className="w-6 h-6 text-[#a8a196] mx-auto" />
                <p className="text-xs text-[#78716c]">No test scores recorded yet in daily entries.</p>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col justify-between pt-4 pb-2">
                <svg className="w-full h-56 overflow-visible">
                  {(() => {
                    const points = testEntries.map((e, idx) => {
                      const x = testEntries.length > 1 ? (idx / (testEntries.length - 1)) * 100 : 50;
                      const scorePct = e.testResult?.percentage || 0;
                      const y = Math.max(10, 224 - (scorePct / 100) * 200);
                      return { x, y, entry: e, pct: scorePct };
                    });

                    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x}% ${p.y}`).join(' ');

                    return (
                      <>
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#d97757"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {points.map((p, idx) => (
                          <circle
                            key={idx}
                            cx={`${p.x}%`}
                            cy={p.y}
                            r="4"
                            className="fill-[#d97757] stroke-white dark:stroke-[#23201c] stroke-2 hover:r-6 transition-all cursor-pointer"
                            onMouseEnter={() =>
                              setHoveredPoint({
                                label: `${p.entry.testResult?.testName} (${p.entry.date})`,
                                value: `${p.pct}%`,
                              })
                            }
                            onMouseLeave={() => setHoveredPoint(null)}
                          />
                        ))}
                      </>
                    );
                  })()}
                </svg>
                <div className="flex justify-between text-[10px] text-[#857d73] pt-2 border-t border-[#e8e2d5] dark:border-[#38332c]">
                  <span>{testEntries[0]?.date}</span>
                  <span>{testEntries[testEntries.length - 1]?.date}</span>
                </div>
              </div>
            )
          )}

        </div>

      </div>

      {/* Study Efficiency Insights Panel */}
      <div className="bg-[#ffffff] dark:bg-[#23201c] border border-[#e8e2d5] dark:border-[#38332c] rounded-2xl p-6 shadow-2xs space-y-4">
        
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#3b6978] dark:text-[#68a3b5]" />
          <h3 className="font-heading font-semibold text-base text-[#2c2825] dark:text-[#f0ece1]">
            Study Efficiency & Data Insights
          </h3>
        </div>

        <p className="text-xs text-[#78716c] dark:text-[#a39c90]">
          Efficiency analysis evaluates whether increased study hours translate into better test performance, accuracy, and output quality.
        </p>

        <ul className="space-y-2.5 pt-2">
          {efficiencyInsights.map((obs, idx) => (
            <li
              key={idx}
              className="p-3.5 bg-[#fbf9f5] dark:bg-[#1c1a17] border border-[#e8e2d5] dark:border-[#332f2a] rounded-xl text-xs text-[#2c2825] dark:text-[#f0ece1] leading-relaxed flex items-start gap-2.5"
            >
              <span className="w-2 h-2 rounded-full bg-[#3b6978] mt-1.5 shrink-0" />
              <span>{obs}</span>
            </li>
          ))}
        </ul>

      </div>

    </div>
  );
};
