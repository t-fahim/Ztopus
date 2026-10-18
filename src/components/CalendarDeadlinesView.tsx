import React from 'react';
import { Calendar, Clock, Bookmark, ExternalLink, Trash2, Sparkles, Award, ShieldCheck, Download } from 'lucide-react';
import { Opportunity } from '../types/campus';
import { getGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';

interface CalendarDeadlinesViewProps {
  opportunities: Opportunity[];
  savedIds: string[];
  onToggleBookmark: (id: string) => void;
  onSelectOpportunity: (opp: Opportunity) => void;
  onAskAI: (opp: Opportunity) => void;
  onExploreFeed: () => void;
}

export const CalendarDeadlinesView: React.FC<CalendarDeadlinesViewProps> = ({
  opportunities,
  savedIds,
  onToggleBookmark,
  onSelectOpportunity,
  onAskAI,
  onExploreFeed
}) => {
  const savedOpportunities = React.useMemo(() => {
    const seen = new Set<string>();
    return opportunities
      .filter((opp) => {
        if (!opp || !opp.id || !savedIds.includes(opp.id) || seen.has(opp.id)) {
          return false;
        }
        seen.add(opp.id);
        return true;
      })
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [opportunities, savedIds]);

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

  const handleExportAllICS = () => {
    if (savedOpportunities.length === 0) return;

    const eventsText = savedOpportunities
      .map((opp) => {
        const cleanDate = (opp.deadline || '').replace(/[^0-9]/g, '').slice(0, 8) || '20261101';
        return [
          'BEGIN:VEVENT',
          `SUMMARY:[Deadline] ${opp.title.replace(/[\r\n]+/g, ' ')}`,
          `DESCRIPTION:${opp.description.replace(/\n/g, '\\n')}\\n\\nApply: ${opp.applyUrl}`,
          `LOCATION:${opp.location.replace(/[\r\n]+/g, ' ')}`,
          `URL:${opp.applyUrl}`,
          `DTSTART:${cleanDate}T090000Z`,
          `DTEND:${cleanDate}T180000Z`,
          'END:VEVENT'
        ].join('\r\n');
      })
      .join('\r\n');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Ztopus//Student Opportunity Radar//EN',
      eventsText,
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ztopus-all-deadlines.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
      {/* Header Banner */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>My Opportunity Deadlines</span>
          </h2>
          <p className="text-xs text-slate-400">
            {savedOpportunities.length} {savedOpportunities.length === 1 ? 'event' : 'events'} bookmarked
          </p>
        </div>

        {savedOpportunities.length > 0 && (
          <button
            onClick={handleExportAllICS}
            className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700/80 flex items-center gap-1.5"
            title="Download full .ics calendar file"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export All (.ics)</span>
          </button>
        )}
      </div>

      {/* Deadlines List */}
      {savedOpportunities.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/30 border border-slate-800/80 rounded-2xl space-y-3 my-auto">
          <div className="w-10 h-10 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-slate-500">
            <Bookmark className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-200">No saved opportunities yet</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Browse the feed and tap the bookmark icon on hackathons, scholarships, or research opportunities to build your deadline timeline!
            </p>
          </div>
          <button
            onClick={onExploreFeed}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors inline-block"
          >
            Discover Opportunities
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {savedOpportunities.map((opp) => {
            const daysRemaining = calculateDaysRemaining(opp.deadline);
            const isUrgent = daysRemaining >= 0 && daysRemaining <= 7;
            const isPassed = daysRemaining < 0;
            const verifyUrl = opp.sourceUrl || opp.applyUrl;

            return (
              <div
                key={opp.id}
                onClick={() => onSelectOpportunity(opp)}
                className="p-4 bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 rounded-2xl transition-all cursor-pointer space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="text-emerald-400 font-medium capitalize">
                        {opp.category.replace('-', ' ')}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{opp.host}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-100 hover:text-emerald-400 transition-colors leading-snug">
                      {opp.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Direct 1-Click Google Calendar */}
                    <a
                      href={getGoogleCalendarUrl(opp)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-blue-400 hover:border-blue-500/30 bg-slate-950/60 transition-colors"
                      title="1-Click: Add deadline to Google Calendar"
                    >
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    </a>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(opp.id);
                      }}
                      className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Deadline urgency indicator and Verify link */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 border-t border-slate-800/60">
                  <div className="flex items-center gap-1.5 font-mono tabular-nums">
                    <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span className={isPassed ? 'text-slate-500 line-through' : isUrgent ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                      {daysRemaining > 0
                        ? `${daysRemaining} days left (${opp.deadline})`
                        : daysRemaining === 0
                        ? `Deadline today (${opp.deadline})`
                        : `Deadline passed (${opp.deadline})`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {verifyUrl && (
                      <a
                        href={verifyUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 hover:underline"
                        title="Go to original source to verify"
                      >
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>Verify Source</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAskAI(opp);
                      }}
                      className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Ask AI</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
