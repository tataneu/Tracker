import React, { useState } from 'react';
import { AIRecommendation, ChallengeConfig, DailyEntry } from '../types';
import { Sparkles, RotateCw, CheckSquare, Square, Brain, AlertCircle, Info, Shield } from 'lucide-react';

interface AIRecommendationViewProps {
  config: ChallengeConfig;
  entries: DailyEntry[];
  aiRecommendation: AIRecommendation | null;
  isLoadingAI: boolean;
  onRefreshAI: () => void;
}

export const AIRecommendationView: React.FC<AIRecommendationViewProps> = ({
  config,
  entries,
  aiRecommendation,
  isLoadingAI,
  onRefreshAI,
}) => {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (idx: number) => {
    const next = new Set(completedSteps);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.add(idx);
    }
    setCompletedSteps(next);
  };

  // Synthesize reflection insights locally from user entries
  const synthesizeReflections = () => {
    const distractionsList: string[] = [];
    const strugglesList: string[] = [];

    entries.forEach((e) => {
      if (e.distractions && e.distractions.trim().length > 2) {
        distractionsList.push(e.distractions.trim());
      }
      if (e.wentWrong && e.wentWrong.trim().length > 2) {
        strugglesList.push(e.wentWrong.trim());
      }
    });

    return {
      distractionsCount: distractionsList.length,
      distractionsExamples: distractionsList.slice(0, 3),
      strugglesCount: strugglesList.length,
      strugglesExamples: strugglesList.slice(0, 3),
    };
  };

  const reflectionData = synthesizeReflections();

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="bg-[#ffffff] dark:bg-[#23201c] border border-[#e8e2d5] dark:border-[#38332c] rounded-2xl p-6 shadow-2xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#3b6978] dark:text-[#68a3b5]" />
              <h2 className="font-heading font-bold text-xl text-[#2c2825] dark:text-[#f0ece1]">
                What Should I Do Tomorrow?
              </h2>
            </div>
            <p className="text-xs text-[#78716c] dark:text-[#a39c90]">
              Data-backed AI recommendations generated specifically for your next study day.
            </p>
          </div>

          <button
            onClick={onRefreshAI}
            disabled={isLoadingAI}
            className="px-4 py-2 bg-[#3b6978] hover:bg-[#2d5360] text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center gap-2 disabled:opacity-50 shrink-0"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoadingAI ? 'animate-spin' : ''}`} />
            <span>Generate Fresh Plan</span>
          </button>
        </div>

      </div>

      {/* Main Recommendation Output Card */}
      <div className="bg-[#ffffff] dark:bg-[#23201c] border border-[#e8e2d5] dark:border-[#38332c] rounded-2xl p-6 shadow-2xs space-y-6">
        
        {isLoadingAI ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#3b6978] border-t-transparent rounded-full animate-spin mx-auto" />
            <h3 className="font-heading font-semibold text-base text-[#2c2825] dark:text-[#f0ece1]">
              Analyzing your 90-day study entries...
            </h3>
            <p className="text-xs text-[#78716c] dark:text-[#a39c90] max-w-sm mx-auto">
              Synthesizing study hours, target gaps, test accuracy, and reported reflections.
            </p>
          </div>
        ) : aiRecommendation ? (
          <div className="space-y-6">
            
            {!aiRecommendation.isDataSufficient ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl flex items-start gap-3 text-amber-900 dark:text-amber-200 text-xs">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-xs">{aiRecommendation.title}</h4>
                  <p className="mt-1 leading-relaxed">{aiRecommendation.summary}</p>
                </div>
              </div>
            ) : (
              <>
                {/* Title & Summary */}
                <div className="border-b border-[#e8e2d5] dark:border-[#38332c] pb-4 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-heading font-bold text-xl text-[#3b6978] dark:text-[#68a3b5]">
                      {aiRecommendation.title}
                    </h3>
                    {aiRecommendation.generatedAt && (
                      <span className="text-xs font-medium text-[#8e877c] tabular-nums">
                        Generated {aiRecommendation.generatedAt}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-[#57514a] dark:text-[#c4beb3] leading-relaxed">
                    {aiRecommendation.summary}
                  </p>
                </div>

                {/* Interactive Actionable Steps Checklist */}
                <div className="space-y-3">
                  <h4 className="font-heading font-semibold text-sm text-[#2c2825] dark:text-[#f0ece1]">
                    Recommended Action Steps for Tomorrow:
                  </h4>

                  <div className="space-y-2">
                    {aiRecommendation.actionableSteps.map((step, idx) => {
                      const isChecked = completedSteps.has(idx);
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleStep(idx)}
                          className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                            isChecked
                              ? 'bg-[#f4f8f6] dark:bg-[#1e2f27] border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 line-through opacity-80'
                              : 'bg-[#fbf9f5] dark:bg-[#1c1a17] border-[#e8e2d5] dark:border-[#332f2a] text-[#2c2825] dark:text-[#f0ece1] hover:border-[#3b6978]'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-4 h-4 text-[#8e877c] shrink-0 mt-0.5" />
                          )}
                          <span className="text-xs font-medium leading-relaxed">{step}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Grounded Reasoning Explanation */}
                <div className="p-4 bg-[#f0ebd9]/60 dark:bg-[#28241f] border border-[#e2dacb] dark:border-[#38332c] rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3b6978] dark:text-[#68a3b5]">
                    <Brain className="w-4 h-4" />
                    <span>Why this plan was recommended:</span>
                  </div>
                  <p className="text-xs text-[#57514a] dark:text-[#c4beb3] leading-relaxed italic">
                    "{aiRecommendation.reasoning}"
                  </p>
                </div>
              </>
            )}

          </div>
        ) : (
          <div className="py-12 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-[#3b6978] mx-auto" />
            <h3 className="font-heading font-semibold text-base text-[#2c2825] dark:text-[#f0ece1]">
              Ready to generate your study plan?
            </h3>
            <p className="text-xs text-[#78716c] max-w-sm mx-auto">
              Click the button above to generate a personalized study strategy based on your 90-day progress entries.
            </p>
            <button
              onClick={onRefreshAI}
              className="mt-2 px-4 py-2 bg-[#3b6978] text-white text-xs font-semibold rounded-xl"
            >
              Generate Recommendation
            </button>
          </div>
        )}

      </div>

      {/* Section 2: Daily Reflection Insights */}
      <div className="bg-[#ffffff] dark:bg-[#23201c] border border-[#e8e2d5] dark:border-[#38332c] rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#3b6978] dark:text-[#68a3b5]" />
          <h3 className="font-heading font-semibold text-base text-[#2c2825] dark:text-[#f0ece1]">
            Daily Reflection Synthesis & Patterns
          </h3>
        </div>

        <p className="text-xs text-[#78716c] dark:text-[#a39c90]">
          Synthesized directly from your reported reflections, distractions, and notes in your daily entries.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          <div className="p-4 bg-[#fbf9f5] dark:bg-[#1c1a17] border border-[#e8e2d5] dark:border-[#332f2a] rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#2c2825] dark:text-[#f0ece1]">
              <span>Reported Distractions</span>
              <span className="text-[#3b6978] tabular-nums">{reflectionData.distractionsCount} occurrences</span>
            </div>
            {reflectionData.distractionsExamples.length > 0 ? (
              <ul className="space-y-1 text-xs text-[#57514a] dark:text-[#c4beb3] list-disc list-inside">
                {reflectionData.distractionsExamples.map((ex, idx) => (
                  <li key={idx}>"{ex}"</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#8e877c]">No recurring distractions logged in recent entries.</p>
            )}
          </div>

          <div className="p-4 bg-[#fbf9f5] dark:bg-[#1c1a17] border border-[#e8e2d5] dark:border-[#332f2a] rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#2c2825] dark:text-[#f0ece1]">
              <span>Reported Topic Struggles</span>
              <span className="text-[#d97757] tabular-nums">{reflectionData.strugglesCount} occurrences</span>
            </div>
            {reflectionData.strugglesExamples.length > 0 ? (
              <ul className="space-y-1 text-xs text-[#57514a] dark:text-[#c4beb3] list-disc list-inside">
                {reflectionData.strugglesExamples.map((ex, idx) => (
                  <li key={idx}>"{ex}"</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#8e877c]">No topic struggles logged in recent entries.</p>
            )}
          </div>

        </div>

        {/* Privacy Note */}
        <div className="flex items-center gap-2 text-[11px] text-[#8e877c] pt-2 border-t border-[#e8e2d5] dark:border-[#38332c]">
          <Shield className="w-3.5 h-3.5 text-[#3b6978]" />
          <span>Your study reflections remain private and locally stored in your browser.</span>
        </div>

      </div>

    </div>
  );
};
