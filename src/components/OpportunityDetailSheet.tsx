import React, { useState } from 'react';
import { X, Calendar, MapPin, Award, ExternalLink, Bookmark, Sparkles, Check, Download, Mail, Users, Heart, ShieldCheck, Globe } from 'lucide-react';
import { Opportunity } from '../types/campus';
import { getGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';

interface OpportunityDetailSheetProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  isLoved?: boolean;
  loveCount?: number;
  onToggleBookmark: (id: string) => void;
  onToggleLove: (id: string) => void;
  onAskAI: (opp: Opportunity) => void;
}

export const OpportunityDetailSheet: React.FC<OpportunityDetailSheetProps> = ({
  opportunity,
  isOpen,
  onClose,
  isBookmarked,
  isLoved = false,
  loveCount = 0,
  onToggleBookmark,
  onToggleLove,
  onAskAI
}) => {
  const [calendarDownloaded, setCalendarDownloaded] = useState(false);

  if (!isOpen || !opportunity) return null;

  const handleDownloadICS = () => {
    downloadIcsFile(opportunity);
    setCalendarDownloaded(true);
    setTimeout(() => setCalendarDownloaded(false), 2500);
  };

  const verifyUrl = opportunity.sourceUrl || opportunity.applyUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200">
        {/* Mobile Drag Handle */}
        <div className="pt-2 pb-1 sm:hidden flex justify-center">
          <div className="w-10 h-1 bg-slate-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-emerald-400 font-medium capitalize">
                {opportunity.category.replace('-', ' ')}
              </span>
              <span aria-hidden="true">·</span>
              <span>{opportunity.format}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{opportunity.host}</span>
            </div>
            <h2 className="text-lg font-bold text-white leading-snug">
              {opportunity.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm text-slate-300">
          {/* Student Interest Counter Banner */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Heart className={`w-4 h-4 ${isLoved ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
              <span>
                <strong className="text-white font-mono tabular-nums">{loveCount}</strong> students interested in this event
              </span>
            </div>

            <button
              onClick={() => onToggleLove(opportunity.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                isLoved
                  ? 'border-rose-500/50 text-rose-400 bg-rose-950/40'
                  : 'border-slate-800 text-slate-400 hover:text-rose-400 bg-slate-900'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLoved ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{isLoved ? 'Loved' : 'Love React'}</span>
            </button>
          </div>

          {/* Source Verification Banner */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Source Origin &amp; Verification</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[10px] font-medium">
                Verified
              </span>
            </div>

            <div className="text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 truncate">
                <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">
                  {opportunity.sourceName || `${opportunity.sourcePlatform || 'Web'} Ingestion`}
                </span>
                {opportunity.scrapedAt && (
                  <span className="text-slate-500 text-[11px] font-mono">({opportunity.scrapedAt})</span>
                )}
              </div>

              {verifyUrl && (
                <a
                  href={verifyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                >
                  <span>Go to Source to Verify</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Key Facts strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-500 block">Application Deadline</span>
              <span className="font-semibold text-slate-200 font-mono">
                {opportunity.deadline}
              </span>
            </div>
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-500 block">Event / Program Date</span>
              <span className="font-semibold text-slate-200 font-mono">
                {opportunity.eventDate}
              </span>
            </div>
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1 col-span-2 sm:col-span-1">
              <span className="text-slate-500 block">Venue &amp; Location</span>
              <span className="font-semibold text-slate-200 flex items-center gap-1 truncate" title={opportunity.location}>
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">{opportunity.location}</span>
              </span>
            </div>
          </div>

          {/* 1-Click Calendar Add Options */}
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">
              Add to Your Personal Calendar
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {/* Google Calendar Web Intent */}
              <a
                href={getGoogleCalendarUrl(opportunity)}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 transition-colors flex items-center gap-2 text-slate-200"
              >
                <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="font-medium truncate">1-Click Google Calendar</span>
              </a>

              {/* Apple / Phone .ics file download */}
              <button
                onClick={handleDownloadICS}
                className="p-2.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 transition-colors flex items-center gap-2 text-slate-200 text-left"
              >
                <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium truncate">
                  {calendarDownloaded ? 'Downloaded (.ics)' : 'Apple / Phone Calendar (.ics)'}
                </span>
              </button>
            </div>
          </div>

          {/* Award or Grant banner */}
          {opportunity.awardOrPrize && (
            <div className="p-3.5 bg-amber-950/20 border border-amber-500/20 rounded-xl flex items-center gap-3 text-xs text-amber-200">
              <Award className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-semibold text-amber-300 block">Award &amp; Benefits:</span>
                <span>{opportunity.awardOrPrize}</span>
              </div>
            </div>
          )}

          {/* Eligibility Section */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Eligibility &amp; Target Majors
            </h3>
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed">
              <p className="mb-2">{opportunity.eligibility}</p>
              {opportunity.targetMajors && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span className="text-slate-500">Majors:</span>
                  {opportunity.targetMajors.map((m, idx) => (
                    <span key={idx} className="bg-slate-900 px-2 py-0.5 rounded text-slate-300">
                      {m}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              About This Opportunity
            </h3>
            <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed bg-slate-950/40 p-4 border border-slate-800/60 rounded-xl">
              {opportunity.description}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-1">
            <span className="text-slate-500">Tags:</span>
            {opportunity.tags.map((tag, idx) => (
              <span key={idx} className="text-slate-300 font-mono text-[11px]">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleBookmark(opportunity.id)}
              className={`p-2.5 rounded-xl border text-xs transition-colors flex items-center gap-1.5 ${
                isBookmarked
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                  : 'border-slate-800 text-slate-400 hover:text-slate-200 bg-slate-900'
              }`}
              title={isBookmarked ? 'Saved to My Deadlines' : 'Save to My Deadlines'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-emerald-400 text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">{isBookmarked ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onAskAI(opportunity);
              }}
              className="px-3 py-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/60 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask Ztopus AI</span>
            </button>
          </div>

          <a
            href={opportunity.applyUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors flex items-center gap-1.5 ml-auto"
          >
            <span>Apply / Register</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
