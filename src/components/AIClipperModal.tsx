import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight, Globe, AlertCircle, Share2 } from 'lucide-react';
import { Opportunity, SourcePlatform } from '../types/campus';

interface AIClipperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpportunityCreated: (opp: Opportunity) => void;
}

export const AIClipperModal: React.FC<AIClipperModalProps> = ({
  isOpen,
  onClose,
  onOpportunityCreated
}) => {
  const [rawText, setRawText] = useState('');
  const [sourcePlatform, setSourcePlatform] = useState<SourcePlatform>('facebook');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedOpp, setExtractedOpp] = useState<Partial<Opportunity> | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExtract = async () => {
    if (!rawText.trim()) return;

    setIsExtracting(true);
    setErrorMsg(null);
    setExtractedOpp(null);

    try {
      const response = await fetch('/api/scraper/parse-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText,
          sourcePlatform,
          sourceUrl: sourceUrl.trim() || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to parse text with AI');
      }

      const data = await response.json();
      if (data.parsedOpportunity) {
        setExtractedOpp({
          ...data.parsedOpportunity,
          id: `clip-${Date.now()}`,
          applyUrl: sourceUrl.trim() || 'https://university.edu',
          sourcePlatform,
          sourceName: `${sourcePlatform.toUpperCase()} Announcement`,
          sourceUrl: sourceUrl.trim() || undefined,
          scrapedAt: 'Just now',
          isOfficialCampusEvent: true,
          fromWatchedSource: true
        });
      }
    } catch (err: any) {
      setErrorMsg('Could not parse opportunity. Please check the text or try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handlePublish = () => {
    if (!extractedOpp || !extractedOpp.title) return;

    const finalOpp: Opportunity = {
      id: extractedOpp.id || `clip-${Date.now()}`,
      title: extractedOpp.title,
      host: extractedOpp.host || 'Campus Organization',
      category: (extractedOpp.category as any) || 'university-event',
      format: (extractedOpp.format as any) || 'In-Person',
      location: extractedOpp.location || 'Campus',
      deadline: extractedOpp.deadline || '2026-11-15',
      eventDate: extractedOpp.eventDate || 'Upcoming',
      awardOrPrize: extractedOpp.awardOrPrize || undefined,
      eligibility: extractedOpp.eligibility || 'All students',
      description: extractedOpp.description || '',
      tags: extractedOpp.tags || ['campus', 'student'],
      applyUrl: extractedOpp.applyUrl || sourceUrl || 'https://university.edu',
      isOfficialCampusEvent: false,
      userSubmitted: true,
      sourcePlatform,
      sourceName: `${sourcePlatform.toUpperCase()} Post`,
      sourceUrl: sourceUrl || undefined,
      scrapedAt: 'Just now',
      fromWatchedSource: true
    };

    onOpportunityCreated(finalOpp);
    onClose();
  };

  const sampleFacebookPost = `🔥 ATTENTION CS & BIOINFO MAJORS! 🔥
The 2026 Fall Hacktoberfest Campus Hackday registration is officially OPEN!
When: Oct 24-25, 2026
Where: Student Center Ballroom & Online Discord
Over $5,000 in prizes, free food, pizza, and exclusive GitHub/DigitalOcean swag bags!
Beginners welcome, we have mentors to help you make your first pull request.
Deadline to apply is Oct 22 at midnight! Link to register: https://hackday.campus-cs.org`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Smart AI Post Clipper</h2>
              <p className="text-xs text-slate-400">Paste any messy social post, flyer text, or news snippet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
          {!extractedOpp ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-200">
                  Paste Post Content or Email Flyer Text:
                </label>
                <button
                  type="button"
                  onClick={() => setRawText(sampleFacebookPost)}
                  className="text-emerald-400 hover:underline text-[11px]"
                >
                  Load Sample Post
                </button>
              </div>

              <textarea
                rows={5}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste the caption from an Instagram post, Facebook group notice, or email newsletter here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Source Platform</label>
                  <select
                    value={sourcePlatform}
                    onChange={(e) => setSourcePlatform(e.target.value as SourcePlatform)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="facebook">Facebook Group / Post</option>
                    <option value="instagram">Instagram Story / Caption</option>
                    <option value="linkedin">LinkedIn Post</option>
                    <option value="newspaper">Campus Newspaper</option>
                    <option value="youtube">YouTube Stream</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Original URL (Optional)</label>
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                onClick={handleExtract}
                disabled={!rawText.trim() || isExtracting}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Sparkles className={`w-4 h-4 ${isExtracting ? 'animate-spin' : ''}`} />
                <span>{isExtracting ? 'Gemini AI is parsing details...' : 'Auto-Extract Opportunity with AI'}</span>
              </button>
            </div>
          ) : (
            /* Extracted Preview View */
            <div className="space-y-3 animate-in fade-in">
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>AI successfully structured this opportunity!</span>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="text-emerald-400 font-semibold uppercase">{extractedOpp.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{extractedOpp.format}</span>
                  <span aria-hidden="true">·</span>
                  <span>{extractedOpp.host}</span>
                </div>

                <h3 className="text-sm font-bold text-white">{extractedOpp.title}</h3>

                <p className="text-slate-300 text-xs leading-relaxed">{extractedOpp.description}</p>

                <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-3 text-[11px] text-slate-400 font-mono">
                  <span>📅 {extractedOpp.eventDate}</span>
                  <span>⏳ Deadline: {extractedOpp.deadline}</span>
                  {extractedOpp.awardOrPrize && <span>🏆 {extractedOpp.awardOrPrize}</span>}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setExtractedOpp(null)}
                  className="px-3.5 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Edit / Paste Another
                </button>

                <button
                  onClick={handlePublish}
                  className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Publish to Campus Radar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
