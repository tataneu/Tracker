import React from 'react';
import { ViewTab } from '../types';
import { LayoutDashboard, BookOpen, BarChart2, Calendar, Sparkles, Settings, Plus, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  currentTab: ViewTab;
  setCurrentTab: (tab: ViewTab) => void;
  dayNumber: number;
  totalDays: number;
  onOpenQuickEntry: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  dayNumber,
  totalDays,
  onOpenQuickEntry,
  darkMode,
  setDarkMode,
}) => {
  const navItems: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Command', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'journal', label: 'Journal', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'progress', label: 'Analytics', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    { id: 'review', label: 'Review & AI', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#fbf9f5]/90 dark:bg-[#1c1a17]/90 backdrop-blur-md border-b border-[#e8e2d5] dark:border-[#332f2a] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Day Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#3b6978] text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:bg-[#2e5461] transition-colors">
              90
            </div>
            <div>
              <h1 className="font-heading font-semibold text-base sm:text-lg text-[#2c2825] dark:text-[#f0ece1] leading-tight">
                Study Tracker
              </h1>
              <p className="text-[11px] text-[#78716c] dark:text-[#a8a196] font-medium flex items-center gap-1.5">
                <span>Day {dayNumber} of {totalDays}</span>
                <span className="inline-block w-1 h-1 rounded-full bg-[#3b6978]"></span>
                <span className="text-[#3b6978] dark:text-[#68a3b5]">Challenge</span>
              </p>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-[#f0ebd9]/60 dark:bg-[#26231f] rounded-xl border border-[#e2dacb] dark:border-[#38332c]">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#ffffff] dark:bg-[#332f2a] text-[#2c2825] dark:text-[#f0ece1] shadow-xs'
                    : 'text-[#6e675f] dark:text-[#a39c90] hover:text-[#2c2825] dark:hover:text-[#f0ece1] hover:bg-[#e8e2d2]/40 dark:hover:bg-[#2c2825]/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Actions Zone: Quick Entry & Dark Mode */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenQuickEntry}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#3b6978] hover:bg-[#2d5360] text-white shadow-xs transition-all active:scale-98 shrink-0"
            title="Add Today's Study Progress"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Entry</span>
            <span className="sm:hidden">Log</span>
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl text-[#6e675f] dark:text-[#a39c90] hover:bg-[#f0ebd9] dark:hover:bg-[#292521] border border-transparent hover:border-[#e2dacb] dark:hover:border-[#3d3730] transition-colors"
            title={darkMode ? 'Switch to Warm Sand Light Theme' : 'Switch to Warm Dark Theme'}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-[#e0a96d]" /> : <Moon className="w-4 h-4 text-[#5c5449]" />}
          </button>
        </div>

      </div>
    </header>
  );
};
