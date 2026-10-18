import React from 'react';
import { Bookmark, MapPin, Globe, Clock, Heart, ChevronRight } from 'lucide-react';
import { Opportunity } from '../types/campus';

interface OpportunityCardProps {
  opportunity: Opportunity;
  isBookmarked: boolean;
  isLoved?: boolean;
  loveCount?: number;
  onToggleBookmark: (id: string) => void;
  onToggleLove: (id: string) => void;
  onSelect: (opp: Opportunity) => void;
  onAskAI?: (opp: Opportunity) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  isBookmarked,
  isLoved = false,
  loveCount = 0,
  onToggleBookmark,
  onToggleLove,
  onSelect
}) => {
  const calculateDaysRemaining = (deadlineStr: string) => {
    if (!deadlineStr) return 0;
    const deadline = new Date(deadlineStr);
    if (isNaN(deadline.getTime())) return 0;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
    const diffTime = target.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = calculateDaysRemaining(opportunity.deadline);
  const isUrgent = daysRemaining >= 0 && daysRemaining <= 5;
  const isPassed = daysRemaining < 0;

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'hackday':
        return 'Hackday';
      case 'scholarship':
        return 'Scholarship';
      case 'university-event':
        return 'University Event';
      case 'internship':
        return 'Internship';
      case 'workshop':
        return 'Workshop';
      default:
        return category;
    }
  };

  const isLocalCampus =
    opportunity.format === 'In-Person' ||
    (opportunity.format === 'Hybrid' && !opportunity.location.toLowerCase().includes('virtual only')) ||
    opportunity.isOfficialCampusEvent;

  return (
    <div
      onClick={() => onSelect(opportunity)}
      className="p-4 bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl transition-all cursor-pointer space-y-2.5 group active:scale-[0.99]"
    >
      {/* Minimal Top Meta Row: Location Pill + Category + Deadline + Bookmark */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          {/* Location Badge */}
          {isLocalCampus ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-500/20 px-2 py-0.5 rounded-md shrink-0">
              <MapPin className="w-2.5 h-2.5" />
              <span>Local</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-sky-400 bg-sky-950/50 border border-sky-500/20 px-2 py-0.5 rounded-md shrink-0">
              <Globe className="w-2.5 h-2.5" />
              <span>Online</span>
            </span>
          )}

          {/* Category */}
          <span className="text-[11px] text-slate-400 font-medium">
            {getCategoryLabel(opportunity.category)}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-[11px] font-mono flex items-center gap-1 tabular-nums ${
              isPassed
                ? 'text-slate-500 line-through'
                : isUrgent
                ? 'text-amber-400 font-semibold'
                : 'text-slate-400'
            }`}
          >
            <Clock className={`w-3 h-3 ${isUrgent ? 'text-amber-400' : 'text-slate-500'}`} />
            <span>
              {daysRemaining > 0
                ? `${daysRemaining}d left`
                : daysRemaining === 0
                ? 'Due today'
                : 'Ended'}
            </span>
          </span>

          {/* Quick Bookmark Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(opportunity.id);
            }}
            className={`p-1.5 rounded-lg border transition-colors ${
              isBookmarked
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-slate-800/80 text-slate-500 hover:text-slate-200 bg-slate-950/40 hover:bg-slate-800'
            }`}
            title={isBookmarked ? 'Saved to My Deadlines' : 'Save to My Deadlines'}
            aria-label="Save opportunity"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Primary Title (Clean & prominent) */}
      <h3 className="text-sm sm:text-base font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2">
        {opportunity.title}
      </h3>

      {/* Host / Organizer (Minimal subtitle) */}
      <p className="text-xs text-slate-400 truncate">
        {opportunity.host}
      </p>

      {/* Clean Bottom Row: Student Love Count & Details Prompt */}
      <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLove(opportunity.id);
          }}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium transition-colors ${
            isLoved
              ? 'text-rose-400 border-rose-500/30 bg-rose-950/40'
              : 'text-slate-400 border-slate-800/60 bg-slate-950/30 hover:text-rose-400'
          }`}
          title={isLoved ? 'Unlike' : 'Love react'}
        >
          <Heart className={`w-3 h-3 ${isLoved ? 'fill-rose-500 text-rose-500' : ''}`} />
          <span className="font-mono tabular-nums">{loveCount}</span>
        </button>

        <span className="text-xs text-slate-400 group-hover:text-emerald-400 transition-colors flex items-center gap-1 font-medium">
          <span>Details</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </div>
  );
};
