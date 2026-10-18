import React, { useState } from 'react';
import { X, User, Check, Bell, Sparkles, BookOpen, GraduationCap, Globe, Plus, Trash2, RefreshCw, ExternalLink, Sun, Moon } from 'lucide-react';
import { UserProfile, OpportunityCategory, WatchedSource, SourcePlatform, Opportunity, AppTheme } from '../types/campus';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  watchedSources: WatchedSource[];
  currentTheme: AppTheme;
  onToggleTheme: (theme: AppTheme) => void;
  onSaveProfile: (updated: UserProfile) => void;
  onAddWatchedSource: (newSource: WatchedSource) => void;
  onRemoveWatchedSource: (id: string) => void;
  onToggleActiveSource: (id: string) => void;
  onScrapeCompleted: (newOpps: Opportunity[]) => void;
  onOpenClipper: () => void;
}

const ALL_CATEGORIES: { id: OpportunityCategory; label: string }[] = [
  { id: 'hackday', label: 'Hackdays & Hackathons' },
  { id: 'scholarship', label: 'Scholarships & Grants' },
  { id: 'university-event', label: 'University Events' },
  { id: 'internship', label: 'Research & Internships' },
  { id: 'workshop', label: 'Campus Workshops' }
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  watchedSources,
  currentTheme,
  onToggleTheme,
  onSaveProfile,
  onAddWatchedSource,
  onRemoveWatchedSource,
  onToggleActiveSource,
  onScrapeCompleted,
  onOpenClipper
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'scrapers'>('profile');

  // Profile form state
  const [name, setName] = useState(profile.name);
  const [university, setUniversity] = useState(profile.university);
  const [major, setMajor] = useState(profile.major);
  const [gradYear, setGradYear] = useState(profile.gradYear);
  const [selectedInterests, setSelectedInterests] = useState<OpportunityCategory[]>(profile.interests);
  const [tagInput, setTagInput] = useState('');
  const [followedTags, setFollowedTags] = useState<string[]>(profile.followedTags);
  const [notificationsEnabled, setNotificationsEnabled] = useState(profile.notificationsEnabled);
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>(currentTheme || profile.theme || 'dark');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state whenever modal is opened
  React.useEffect(() => {
    if (isOpen) {
      setName(profile.name);
      setUniversity(profile.university);
      setMajor(profile.major);
      setGradYear(profile.gradYear);
      setSelectedInterests(profile.interests);
      setFollowedTags(profile.followedTags);
      setNotificationsEnabled(profile.notificationsEnabled);
      setSelectedTheme(currentTheme || profile.theme || 'dark');
    }
  }, [isOpen, profile, currentTheme]);

  // Scrapers state
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourcePlatform, setSourcePlatform] = useState<SourcePlatform>('facebook');
  const [sourceCategory, setSourceCategory] = useState<OpportunityCategory>('hackday');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeSuccessMsg, setScrapeSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectTheme = (t: AppTheme) => {
    setSelectedTheme(t);
    onToggleTheme(t);
  };

  const toggleInterest = (cat: OpportunityCategory) => {
    setSelectedInterests((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const clean = tagInput.trim().replace(/^#/, '').toLowerCase();
    if (clean && !followedTags.includes(clean)) {
      setFollowedTags([...followedTags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFollowedTags(followedTags.filter((t) => t !== tagToRemove));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      name: name.trim(),
      university: university.trim(),
      major: major.trim(),
      gradYear: gradYear.trim(),
      interests: selectedInterests,
      followedTags,
      notificationsEnabled,
      theme: selectedTheme
    };
    onSaveProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleAddSourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceName.trim() || !sourceUrl.trim()) return;

    const newSource: WatchedSource = {
      id: `src-${Date.now()}`,
      name: sourceName.trim(),
      url: sourceUrl.trim(),
      platform: sourcePlatform,
      categoryHint: sourceCategory,
      lastScraped: 'Just now',
      active: true,
      itemCount: 0
    };

    onAddWatchedSource(newSource);
    setSourceName('');
    setSourceUrl('');
    setIsAddingSource(false);
  };

  const handleRunScraperNow = () => {
    setIsScraping(true);
    setScrapeSuccessMsg(null);

    setTimeout(() => {
      setIsScraping(false);
      setScrapeSuccessMsg('Scraper finished! 2 new opportunities extracted from your watched sources.');

      const sampleScraped: Opportunity[] = [
        {
          id: `scraped-${Date.now()}-1`,
          title: 'Auto-Scraped: Bioinfo & Health Hackathon ($2,500 Cash)',
          host: 'University Bioinformatics Society (Scraped from FB Group)',
          category: 'hackday',
          format: 'Hybrid',
          location: 'Life Sciences Hall 104',
          deadline: '2026-11-04',
          eventDate: 'Nov 6–8, 2026',
          awardOrPrize: '$2,500 Cash Prizes & Illumina Swag Bags',
          eligibility: 'All students with Python or data skills.',
          description: `Extracted from watched Facebook group: Build genomic or health prediction models over 48 hours. Mentors available!`,
          tags: ['bioinformatics', 'scraped', 'hackathon', 'python'],
          applyUrl: 'https://facebook.com/groups/campus.hackers',
          isOfficialCampusEvent: true,
          urgentDeadline: true,
          sourcePlatform: 'facebook',
          sourceName: 'University Hackers (FB Group)',
          sourceUrl: 'https://facebook.com/groups/campus.hackers',
          scrapedAt: 'Just now',
          fromWatchedSource: true,
          loveCount: 28
        }
      ];

      onScrapeCompleted(sampleScraped);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Student Account Settings</h2>
              <p className="text-xs text-slate-400">Preferences, major alerts &amp; automated scrapers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Profile vs Watched Scrapers */}
        <div className="flex items-center gap-1 px-5 pt-2.5 border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'profile'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/60 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Profile &amp; Interests
          </button>

          <button
            onClick={() => setActiveTab('scrapers')}
            className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'scrapers'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/60 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Watched Scrapers ({watchedSources.length})</span>
          </button>
        </div>

        {/* Tab 1: Profile & Interests */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
            {savedSuccess && (
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Preferences updated successfully!</span>
              </div>
            )}

            {/* Theme & Appearance Selector: Dark & Light */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  {selectedTheme === 'dark' ? (
                    <Moon className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  <span>App Theme &amp; Appearance</span>
                </span>
                <span className="text-[10px] text-slate-500 capitalize">{selectedTheme} mode</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectTheme('dark')}
                  className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                    selectedTheme === 'dark'
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-semibold shadow-xs ring-1 ring-emerald-500/30'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark Mode</span>
                  {selectedTheme === 'dark' && <Check className="w-3 h-3 text-emerald-400 ml-1" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTheme('light')}
                  className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                    selectedTheme === 'light'
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-semibold shadow-xs ring-1 ring-emerald-500/30'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light Mode</span>
                  {selectedTheme === 'light' && <Check className="w-3 h-3 text-emerald-400 ml-1" />}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Fahim"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Major / Department</label>
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="e.g. Bioinformatics"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Graduation Year</label>
                  <input
                    type="text"
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                    placeholder="e.g. 2027"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">University / Campus</label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="e.g. State University / College of Science"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Interests Category Checkboxes */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <label className="block text-slate-300 font-semibold">
                Which types of news &amp; opportunities are you interested in?
              </label>
              <div className="space-y-1.5">
                {ALL_CATEGORIES.map((cat) => {
                  const checked = selectedInterests.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleInterest(cat.id)}
                      className={`w-full p-2 rounded-lg border text-left flex items-center justify-between text-xs transition-colors ${
                        checked
                          ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        checked ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700'
                      }`}>
                        {checked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Keywords / Tags */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <label className="block text-slate-300 font-semibold">
                Keywords to prioritize in your feed
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="e.g. python, bioinfo, grant"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {followedTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[11px] text-slate-300 flex items-center gap-1"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-slate-500 hover:text-slate-300"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Notifications setting */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-medium text-slate-200 block">Deadline Alert Reminders</span>
                <span className="text-[11px] text-slate-400">Notify 48h before an application deadline</span>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-4 h-4 accent-emerald-500"
              />
            </div>

            {/* Footer Save */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Watched Scrapers (Moved Under Account) */}
        {activeTab === 'scrapers' && (
          <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Automated Web &amp; Social Scrapers</span>
                <button
                  onClick={handleRunScraperNow}
                  disabled={isScraping}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isScraping ? 'animate-spin' : ''}`} />
                  <span>{isScraping ? 'Scraping...' : 'Run Scraper'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Add specific Facebook groups, Instagram pages, LinkedIn hubs, and newspaper feeds. Our scraper extracts only verified opportunities without social media noise.
              </p>
            </div>

            {scrapeSuccessMsg && (
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{scrapeSuccessMsg}</span>
              </div>
            )}

            {/* Add Source Form Toggle */}
            {!isAddingSource ? (
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-300">{watchedSources.length} Monitored Pages</span>
                <button
                  onClick={() => setIsAddingSource(true)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1 border border-slate-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Watched URL</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddSourceSubmit} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Add New Social Page or Group</span>
                  <button
                    type="button"
                    onClick={() => setIsAddingSource(false)}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    &times;
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">Platform</label>
                    <select
                      value={sourcePlatform}
                      onChange={(e) => setSourcePlatform(e.target.value as SourcePlatform)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="facebook">Facebook Group</option>
                      <option value="instagram">Instagram Account</option>
                      <option value="linkedin">LinkedIn Page</option>
                      <option value="newspaper">Campus Newspaper</option>
                      <option value="youtube">YouTube Stream</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">Category Hint</label>
                    <select
                      value={sourceCategory}
                      onChange={(e) => setSourceCategory(e.target.value as OpportunityCategory)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="hackday">Hackdays</option>
                      <option value="scholarship">Scholarships</option>
                      <option value="university-event">University Events</option>
                      <option value="internship">Internships</option>
                      <option value="workshop">Workshops</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">Name or Club Handle</label>
                  <input
                    type="text"
                    required
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    placeholder="e.g. Stanford Bioinfo Society or @campus_gdsc"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">URL</label>
                  <input
                    type="url"
                    required
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://facebook.com/groups/..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingSource(false)}
                    className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-400 text-slate-950 font-bold"
                  >
                    Start Watching
                  </button>
                </div>
              </form>
            )}

            {/* List of Watched Sources */}
            <div className="space-y-2">
              {watchedSources.map((src) => (
                <div
                  key={src.id}
                  className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white truncate">{src.name}</span>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-500 hover:text-slate-300"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span className="capitalize">{src.platform}</span>
                      <span aria-hidden="true">·</span>
                      <span>Scraped: {src.lastScraped}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onToggleActiveSource(src.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                        src.active
                          ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20'
                          : 'border-slate-800 text-slate-500'
                      }`}
                    >
                      {src.active ? 'Active' : 'Paused'}
                    </button>
                    <button
                      onClick={() => onRemoveWatchedSource(src.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="Remove source"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
