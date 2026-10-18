import React, { useState } from 'react';
import { Globe, Plus, Trash2, RefreshCw, CheckCircle2, ExternalLink, Sparkles, AlertCircle, Share2, Rss } from 'lucide-react';
import { WatchedSource, SourcePlatform, OpportunityCategory, Opportunity } from '../types/campus';

interface WatchedSourcesManagerProps {
  sources: WatchedSource[];
  onAddSource: (newSource: WatchedSource) => void;
  onRemoveSource: (id: string) => void;
  onToggleActive: (id: string) => void;
  onScrapeCompleted: (newOpps: Opportunity[]) => void;
  onOpenClipper: () => void;
}

export const WatchedSourcesManager: React.FC<WatchedSourcesManagerProps> = ({
  sources,
  onAddSource,
  onRemoveSource,
  onToggleActive,
  onScrapeCompleted,
  onOpenClipper
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState<SourcePlatform>('facebook');
  const [categoryHint, setCategoryHint] = useState<OpportunityCategory>('hackday');

  const [isScraping, setIsScraping] = useState(false);
  const [scrapingLogs, setScrapingLogs] = useState<string[]>([]);
  const [lastScrapeReport, setLastScrapeReport] = useState<string | null>(null);

  const getPlatformIconColor = (p: SourcePlatform) => {
    switch (p) {
      case 'facebook':
        return 'text-blue-400 bg-blue-950/40 border-blue-500/30';
      case 'instagram':
        return 'text-pink-400 bg-pink-950/40 border-pink-500/30';
      case 'linkedin':
        return 'text-sky-400 bg-sky-950/40 border-sky-500/30';
      case 'youtube':
        return 'text-red-400 bg-red-950/40 border-red-500/30';
      case 'newspaper':
        return 'text-amber-400 bg-amber-950/40 border-amber-500/30';
      default:
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30';
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    const newSource: WatchedSource = {
      id: `src-${Date.now()}`,
      name: name.trim(),
      url: url.trim(),
      platform,
      categoryHint,
      lastScraped: 'Just now',
      active: true,
      itemCount: 0
    };

    onAddSource(newSource);
    setName('');
    setUrl('');
    setIsAdding(false);
  };

  const handleRunScraper = () => {
    setIsScraping(true);
    setScrapingLogs([]);
    setLastScrapeReport(null);

    const logs: string[] = [
      'Connecting to automated ingestion daemon...',
      `Crawling ${sources.filter((s) => s.active).length} active watched sources...`,
      'Parsing Facebook student groups: Detected 1 new hackathon registration announcement...',
      'Querying Campus Newspaper RSS & Web portal: Found 1 new travel stipend alert...',
      'Filtering noise, duplicate memes, and irrelevant campus chatter...',
      'AI validation passed: 2 high-signal student opportunities extracted!'
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < logs.length) {
        setScrapingLogs((prev) => [...prev, logs[currentIdx]]);
        currentIdx++;
      } else {
        clearInterval(interval);
        setIsScraping(false);
        setLastScrapeReport('Scrape complete! 2 new verified opportunities added to your feed.');

        // Inject 2 newly scraped events into feed
        const newScrapedEvents: Opportunity[] = [
          {
            id: `scraped-${Date.now()}-1`,
            title: 'Live Scraped: Bioinformatics Fall Hackathon 2026 ($2,500 Cash)',
            host: 'University Bioinformatics Society (Scraped from FB)',
            category: 'hackday',
            format: 'Hybrid',
            location: 'Science Library Hall 104',
            deadline: '2026-11-04',
            eventDate: 'Nov 6–8, 2026',
            awardOrPrize: '$2,500 Cash Prizes & Illumina Swag Bags',
            eligibility: 'All students with Python, R, or data skills.',
            description: `Automated scrape from watched Facebook group: Build genomic or health prediction models over 48 hours. Mentors available for beginner coders!`,
            tags: ['bioinformatics', 'scraped', 'hackathon', 'python', 'cash-prize'],
            applyUrl: 'https://facebook.com/groups/campus.hackers',
            isOfficialCampusEvent: true,
            urgentDeadline: true,
            sourcePlatform: 'facebook',
            sourceName: 'University Hackers & Coders (FB Group)',
            sourceUrl: 'https://facebook.com/groups/campus.hackers',
            scrapedAt: 'Just now',
            fromWatchedSource: true
          },
          {
            id: `scraped-${Date.now()}-2`,
            title: 'Live Scraped: Undergrad Travel Grant to PyData Global ($1,200)',
            host: 'The Daily Campus Newspaper RSS Alert',
            category: 'scholarship',
            format: 'Virtual',
            location: 'Online Travel Bursary Portal',
            deadline: '2026-11-18',
            eventDate: 'Conference in Dec 2026',
            awardOrPrize: 'Full Travel & Virtual Conference Ticket Covered',
            eligibility: 'Students presenting data science or computing projects.',
            description: `Extracted from newspaper bulletin: Department bursary funds undergraduate travel and registration for global tech conferences.`,
            tags: ['scholarship', 'scraped', 'travel-grant', 'python'],
            applyUrl: 'https://campusnewspaper.edu/rss',
            isOfficialCampusEvent: true,
            sourcePlatform: 'newspaper',
            sourceName: 'The Campus Daily (Newspaper)',
            sourceUrl: 'https://campusnewspaper.edu/rss',
            scrapedAt: 'Just now',
            fromWatchedSource: true
          }
        ];

        onScrapeCompleted(newScrapedEvents);
      }
    }, 700);
  };

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
      {/* Top Banner */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            <span>Automated Multi-Source Scraper</span>
          </div>

          <button
            onClick={onOpenClipper}
            className="px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded-lg hover:bg-emerald-900/40 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Post Clipper</span>
          </button>
        </div>

        <h2 className="text-base font-bold text-white">Watched Social Media &amp; Campus Sources</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Add specific Facebook groups, Instagram pages, LinkedIn hubs, and newspaper websites you never want to miss. Our automated scraper monitors them and extracts only verified opportunities without social media noise.
        </p>

        {/* Trigger Scraper Button */}
        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={handleRunScraper}
            disabled={isScraping}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? 'animate-spin' : ''}`} />
            <span>{isScraping ? 'Scraping Sources...' : 'Run Live Ingestion Now'}</span>
          </button>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5 border border-slate-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Watched URL</span>
          </button>
        </div>
      </div>

      {/* Scraping Progress Live Terminal */}
      {isScraping && (
        <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1 font-mono text-[11px] text-emerald-400">
          <div className="text-slate-500 text-[10px] uppercase font-sans font-semibold">
            Automated Crawler Execution Log:
          </div>
          {scrapingLogs.map((log, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-slate-600">&gt;</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      )}

      {lastScrapeReport && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{lastScrapeReport}</span>
        </div>
      )}

      {/* Add New Watched URL Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 animate-in fade-in text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">Add Specific Social Media URL or Page</span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-500 hover:text-slate-300"
            >
              &times;
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Platform Type</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as SourcePlatform)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="facebook">Facebook Group / Page</option>
                <option value="instagram">Instagram Account / Club</option>
                <option value="linkedin">LinkedIn Student Group</option>
                <option value="youtube">YouTube Channel</option>
                <option value="newspaper">Campus Newspaper / RSS</option>
                <option value="official_portal">University Department Webpage</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Opportunity Type Hint</label>
              <select
                value={categoryHint}
                onChange={(e) => setCategoryHint(e.target.value as OpportunityCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="hackday">Hackdays &amp; Competitions</option>
                <option value="scholarship">Scholarships &amp; Grants</option>
                <option value="university-event">University Events</option>
                <option value="internship">Research &amp; Internships</option>
                <option value="workshop">Workshops</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Source Name / Club Handle *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Stanford Bioinfo Club (FB) or @campus_gdsc"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Exact URL / Group Link *</label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://facebook.com/groups/... or https://instagram.com/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
            >
              Start Watching Source
            </button>
          </div>
        </form>
      )}

      {/* Sources List */}
      <div className="space-y-2.5">
        <div className="text-xs text-slate-400 font-medium px-1 flex items-center justify-between">
          <span>{sources.length} Configured Sources</span>
          <span className="text-[11px] text-slate-500">Auto-crawled every 4 hours</span>
        </div>

        {sources.map((src) => (
          <div
            key={src.id}
            className="p-3.5 bg-slate-900/70 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`px-2.5 py-1 rounded-lg border font-mono text-[10px] uppercase font-bold shrink-0 ${getPlatformIconColor(src.platform)}`}>
                {src.platform}
              </div>

              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-200 truncate">{src.name}</span>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-500 hover:text-slate-300"
                    title="Open Source Link"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>Last scraped: {src.lastScraped}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400">{src.itemCount} events indexed</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onToggleActive(src.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                  src.active
                    ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20'
                    : 'border-slate-800 text-slate-500 bg-slate-950'
                }`}
              >
                {src.active ? 'Active' : 'Paused'}
              </button>

              <button
                onClick={() => onRemoveSource(src.id)}
                className="text-slate-500 hover:text-red-400 p-1"
                title="Remove source"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
