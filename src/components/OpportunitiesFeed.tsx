import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Compass, Globe, MapPin, RefreshCw, Check, Sparkles, Flame, User, SlidersHorizontal, X } from 'lucide-react';
import { Opportunity, OpportunityCategory, UserProfile } from '../types/campus';
import { OpportunityCard } from './OpportunityCard';

interface OpportunitiesFeedProps {
  opportunities: Opportunity[];
  savedIds: string[];
  lovedIds: string[];
  loveCounts: { [id: string]: number };
  userProfile: UserProfile;
  refreshTrigger?: number;
  onToggleBookmark: (id: string) => void;
  onToggleLove: (id: string) => void;
  onSelectOpportunity: (opp: Opportunity) => void;
  onAskAI: (opp: Opportunity) => void;
  onOpenSetupGuide: () => void;
  onOpenProfile: () => void;
  onOpenWatchedSources: () => void;
  onOpenClipper: () => void;
  onPerformAutoRefresh?: () => void;
  onInstallPwa?: () => void;
  isInstallable?: boolean;
}

const CATEGORIES: { id: 'all' | OpportunityCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'hackday', label: 'Hackathons' },
  { id: 'scholarship', label: 'Scholarships' },
  { id: 'university-event', label: 'Campus Events' },
  { id: 'internship', label: 'Internships' },
  { id: 'workshop', label: 'Workshops' }
];

export const OpportunitiesFeed: React.FC<OpportunitiesFeedProps> = ({
  opportunities,
  savedIds,
  lovedIds,
  loveCounts,
  userProfile,
  refreshTrigger,
  onToggleBookmark,
  onToggleLove,
  onSelectOpportunity,
  onAskAI,
  onOpenProfile,
  onOpenClipper,
  onPerformAutoRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | OpportunityCategory>('all');
  const [locationFilter, setLocationFilter] = useState<'all' | 'local' | 'global_online'>('all');
  const [sortByTrending, setSortByTrending] = useState(false);
  const [onlyMyMajor, setOnlyMyMajor] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Pull-to-refresh & Auto-refresh touch states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-refresh triggered when parent updates refreshTrigger (e.g. user pressed Radar tab)
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      triggerRefresh('Feed refreshed via Radar');
    }
  }, [refreshTrigger]);

  const triggerRefresh = (sourceNote = 'Feed refreshed') => {
    setIsRefreshing(true);
    setPullDistance(0);

    if (onPerformAutoRefresh) {
      onPerformAutoRefresh();
    }

    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshNotice(sourceNote);
      setTimeout(() => setRefreshNotice(null), 2500);
    }, 800);
  };

  // Touch Swipe Down (Pull-to-Refresh) handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
    } else {
      touchStartY.current = 0;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current > 0 && containerRef.current && containerRef.current.scrollTop <= 0) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - touchStartY.current;
      if (diff > 0) {
        setPullDistance(Math.min(diff * 0.4, 70));
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 40 && !isRefreshing) {
      triggerRefresh('Feed refreshed via swipe down');
    } else {
      setPullDistance(0);
    }
    touchStartY.current = 0;
  };

  const checkIsLocalCampus = (opp: Opportunity) => {
    return (
      opp.format === 'In-Person' ||
      (opp.format === 'Hybrid' && !opp.location.toLowerCase().includes('virtual only')) ||
      opp.isOfficialCampusEvent === true
    );
  };

  const checkIsGlobalOnline = (opp: Opportunity) => {
    return (
      opp.format === 'Virtual' ||
      opp.format === 'Hybrid' ||
      opp.location.toLowerCase().includes('online') ||
      opp.location.toLowerCase().includes('discord') ||
      opp.location.toLowerCase().includes('virtual') ||
      opp.tags.includes('youtube-live') ||
      opp.tags.includes('hacktoberfest')
    );
  };

  const uniqueOpportunities = useMemo(() => {
    const seen = new Set<string>();
    return opportunities.filter((o) => {
      if (!o || !o.id || seen.has(o.id)) return false;
      seen.add(o.id);
      return true;
    });
  }, [opportunities]);

  const localCount = useMemo(
    () => uniqueOpportunities.filter(checkIsLocalCampus).length,
    [uniqueOpportunities]
  );
  const globalCount = useMemo(
    () => uniqueOpportunities.filter(checkIsGlobalOnline).length,
    [uniqueOpportunities]
  );

  const filteredOpportunities = useMemo(() => {
    let list = uniqueOpportunities.filter((opp) => {
      const matchesSearch =
        !searchQuery ||
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || opp.category === selectedCategory;

      const matchesMajor =
        !onlyMyMajor ||
        (opp.targetMajors &&
          opp.targetMajors.some(
            (m) =>
              m.toLowerCase().includes(userProfile.major.toLowerCase()) ||
              userProfile.major.toLowerCase().includes(m.toLowerCase()) ||
              m === 'All Majors'
          ));

      let matchesLocation = true;
      if (locationFilter === 'local') {
        matchesLocation = checkIsLocalCampus(opp);
      } else if (locationFilter === 'global_online') {
        matchesLocation = checkIsGlobalOnline(opp);
      }

      return matchesSearch && matchesCat && matchesMajor && matchesLocation;
    });

    if (sortByTrending) {
      return [...list].sort((a, b) => {
        const countA = loveCounts[a.id] ?? a.loveCount ?? 0;
        const countB = loveCounts[b.id] ?? b.loveCount ?? 0;
        return countB - countA;
      });
    }

    return list;
  }, [
    uniqueOpportunities,
    searchQuery,
    selectedCategory,
    locationFilter,
    onlyMyMajor,
    sortByTrending,
    userProfile,
    loveCounts
  ]);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="flex-1 flex flex-col p-3.5 sm:p-4 space-y-3.5 overflow-y-auto relative overscroll-y-contain"
    >
      {/* Pull-To-Refresh / Auto-Refresh Indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          style={{ height: `${isRefreshing ? 44 : pullDistance}px` }}
          className="w-full flex items-center justify-center overflow-hidden transition-all duration-150 text-xs text-emerald-400 bg-emerald-950/20 rounded-xl border border-emerald-500/20 shrink-0"
        >
          <div className="flex items-center gap-2">
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : 'text-slate-400'}`}
              style={{ transform: !isRefreshing ? `rotate(${pullDistance * 5}deg)` : undefined }}
            />
            <span className="font-medium text-[11px]">
              {isRefreshing
                ? 'Refreshing opportunities...'
                : pullDistance > 40
                ? 'Release to refresh'
                : 'Pull down to refresh'}
            </span>
          </div>
        </div>
      )}

      {/* Clean Success Toast Notice */}
      {refreshNotice && (
        <div className="p-2 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center justify-between shrink-0 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-[11px] font-medium">{refreshNotice}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Synced</span>
        </div>
      )}

      {/* Minimal Header Bar: Brand + Quick Actions */}
      <div className="flex items-center justify-between gap-3 shrink-0 pt-0.5">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-base font-bold text-white tracking-tight leading-none">
              Ztopus
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            {userProfile.university || 'Campus Network'} · {userProfile.major}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Manual Refresh button */}
          <button
            onClick={() => triggerRefresh('Refreshed')}
            disabled={isRefreshing}
            className="p-2 text-slate-400 hover:text-emerald-400 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors"
            title="Refresh opportunities"
            aria-label="Refresh feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* User Account / Watched Scrapers Shortcut */}
          <button
            onClick={onOpenProfile}
            className="p-1.5 rounded-xl border border-slate-800 text-slate-300 hover:text-emerald-400 bg-slate-900/60 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            title="Account & Watched Scrapers"
          >
            <div className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
              {userProfile.name.charAt(0)}
            </div>
            <span className="text-xs font-medium hidden sm:inline truncate max-w-[80px]">
              {userProfile.name}
            </span>
          </button>
        </div>
      </div>

      {/* Minimal Location-Based Filter: All vs Local Campus vs Global/Online */}
      <div className="p-1 bg-slate-900/80 border border-slate-800/80 rounded-xl grid grid-cols-3 gap-1 shrink-0">
        <button
          onClick={() => setLocationFilter('all')}
          className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
            locationFilter === 'all'
              ? 'bg-slate-800 text-white shadow-xs font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>All Events</span>
          <span className="text-[10px] text-slate-500 font-mono">({uniqueOpportunities.length})</span>
        </button>

        <button
          onClick={() => setLocationFilter('local')}
          className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
            locationFilter === 'local'
              ? 'bg-emerald-600 text-white shadow-xs font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Events in-person or on your campus"
        >
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">Local</span>
          <span className="text-[10px] opacity-80 font-mono">({localCount})</span>
        </button>

        <button
          onClick={() => setLocationFilter('global_online')}
          className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
            locationFilter === 'global_online'
              ? 'bg-sky-600 text-white shadow-xs font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Virtual, remote, and global student opportunities"
        >
          <Globe className="w-3 h-3 shrink-0" />
          <span className="truncate">Online</span>
          <span className="text-[10px] opacity-80 font-mono">({globalCount})</span>
        </button>
      </div>

      {/* Minimal Search Bar */}
      <div className="relative shrink-0">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by keywords, hackathons, grants..."
          className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Horizontal Category Scroll */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 shrink-0">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-xs'
                : 'bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Minimal Sub-Bar: Count & Quick Refine Toggles */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5 shrink-0">
        <span className="font-mono text-[11px] text-slate-500 tabular-nums">
          {filteredOpportunities.length} {filteredOpportunities.length === 1 ? 'event' : 'events'}
        </span>

        <div className="flex items-center gap-1.5">
          {/* Subtle Trending Toggle */}
          <button
            onClick={() => setSortByTrending(!sortByTrending)}
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 border ${
              sortByTrending
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Sort by student love reactions"
          >
            <Flame className={`w-3 h-3 ${sortByTrending ? 'text-rose-400 fill-rose-400' : 'text-slate-500'}`} />
            <span>Loved</span>
          </button>

          {/* Subtle Major Toggle */}
          <button
            onClick={() => setOnlyMyMajor(!onlyMyMajor)}
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 border ${
              onlyMyMajor
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={`Filter for ${userProfile.major}`}
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>My Major</span>
          </button>
        </div>
      </div>

      {/* Minimal Opportunities List */}
      <div className="space-y-2.5 pb-4">
        {filteredOpportunities.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/20 border border-slate-800/60 rounded-2xl space-y-2">
            <p className="text-xs font-medium text-slate-300">No opportunities match your filter</p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Swipe down or tap Radar to auto-refresh latest events.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setLocationFilter('all');
                setSortByTrending(false);
                setOnlyMyMajor(false);
              }}
              className="px-3 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors inline-block mt-1"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredOpportunities.map((opp) => {
            const isLoved = lovedIds.includes(opp.id);
            const currentLoveCount = loveCounts[opp.id] ?? opp.loveCount ?? 0;

            return (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                isBookmarked={savedIds.includes(opp.id)}
                isLoved={isLoved}
                loveCount={currentLoveCount}
                onToggleBookmark={onToggleBookmark}
                onToggleLove={onToggleLove}
                onSelect={onSelectOpportunity}
                onAskAI={onAskAI}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
