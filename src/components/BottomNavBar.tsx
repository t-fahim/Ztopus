import React from 'react';
import { Compass, CalendarDays, Sparkles, PlusCircle } from 'lucide-react';
import { ViewMode } from '../types/campus';

interface BottomNavBarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  onRefreshRadar: () => void;
  onOpenProfile?: () => void;
  savedCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentView,
  onSelectView,
  onRefreshRadar,
  savedCount
}) => {
  const handleRadarClick = () => {
    if (currentView === 'feed') {
      onRefreshRadar();
    } else {
      onSelectView('feed');
      onRefreshRadar();
    }
  };

  return (
    <nav className="sticky bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1.5 shrink-0 select-none">
      <div className="grid grid-cols-4 items-center justify-around">
        {/* Radar Tab (Clicking triggers auto-refresh) */}
        <button
          onClick={handleRadarClick}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors relative group ${
            currentView === 'feed' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Click to refresh opportunities"
        >
          <Compass
            className={`w-5 h-5 transition-transform duration-150 ${
              currentView === 'feed' ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'
            }`}
          />
          <span
            className={`text-[10px] font-medium tracking-tight mt-1 truncate max-w-full ${
              currentView === 'feed' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Radar
          </span>
        </button>

        {/* Ztopus AI Tab */}
        <button
          onClick={() => onSelectView('ai-chat')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors relative group ${
            currentView === 'ai-chat' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles
            className={`w-5 h-5 transition-transform duration-150 ${
              currentView === 'ai-chat' ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'
            }`}
          />
          <span
            className={`text-[10px] font-medium tracking-tight mt-1 truncate max-w-full ${
              currentView === 'ai-chat' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Ztopus AI
          </span>
        </button>

        {/* Deadlines Tab */}
        <button
          onClick={() => onSelectView('calendar')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors relative group ${
            currentView === 'calendar' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <CalendarDays
              className={`w-5 h-5 transition-transform duration-150 ${
                currentView === 'calendar' ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'
              }`}
            />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-bold text-[9px] flex items-center justify-center font-mono tabular-nums">
                {savedCount}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] font-medium tracking-tight mt-1 truncate max-w-full ${
              currentView === 'calendar' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Deadlines
          </span>
        </button>

        {/* Post Event Tab */}
        <button
          onClick={() => onSelectView('bulletin')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors relative group ${
            currentView === 'bulletin' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PlusCircle
            className={`w-5 h-5 transition-transform duration-150 ${
              currentView === 'bulletin' ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'
            }`}
          />
          <span
            className={`text-[10px] font-medium tracking-tight mt-1 truncate max-w-full ${
              currentView === 'bulletin' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Post Event
          </span>
        </button>
      </div>
    </nav>
  );
};
