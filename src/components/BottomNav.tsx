import React from 'react';
import { ViewTab } from '../types';
import { LayoutDashboard, BookOpen, BarChart2, Calendar, Sparkles, Settings } from 'lucide-react';

interface BottomNavProps {
  currentTab: ViewTab;
  setCurrentTab: (tab: ViewTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setCurrentTab }) => {
  const navItems: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Command', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'journal', label: 'Journal', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'progress', label: 'Analytics', icon: <BarChart2 className="w-5 h-5" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-5 h-5" /> },
    { id: 'review', label: 'Review', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#fbf9f5]/95 dark:bg-[#1c1a17]/95 backdrop-blur-lg border-t border-[#e8e2d5] dark:border-[#332f2a] px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[11px] font-semibold transition-all ${
                isActive
                  ? 'text-[#3b6978] dark:text-[#68a3b5]'
                  : 'text-[#857d73] dark:text-[#8e877c] hover:text-[#2c2825] dark:hover:text-[#f0ece1]'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-[#3b6978]/10 dark:bg-[#3b6978]/20' : ''}`}>
                {item.icon}
              </div>
              <span className="mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
