import React, { useState, useEffect } from 'react';
import { Opportunity, ViewMode, UserProfile, WatchedSource, AppTheme } from './types/campus';
import { INITIAL_OPPORTUNITIES, INITIAL_USER_PROFILE, INITIAL_WATCHED_SOURCES } from './data/mockOpportunities';
import { AndroidFrame } from './components/AndroidFrame';
import { BottomNavBar } from './components/BottomNavBar';
import { OpportunitiesFeed } from './components/OpportunitiesFeed';
import { CalendarDeadlinesView } from './components/CalendarDeadlinesView';
import { AIChatView } from './components/AIChatView';
import { OpportunityDetailSheet } from './components/OpportunityDetailSheet';
import { AndroidSetupGuideModal } from './components/AndroidSetupGuideModal';
import { SubmitOpportunityModal } from './components/SubmitOpportunityModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AIClipperModal } from './components/AIClipperModal';
import { GoogleLoginModal, GoogleAuthUser } from './components/GoogleLoginModal';
import { usePWAInstall } from './hooks/usePWAInstall';

const SAVED_STORAGE_KEY = 'campuspulse_saved_opportunities_v2';
const USER_OPP_STORAGE_KEY = 'campuspulse_user_opportunities_v3';
const PROFILE_STORAGE_KEY = 'campuspulse_user_profile_v2';
const SOURCES_STORAGE_KEY = 'campuspulse_watched_sources_v2';
const LOVED_STORAGE_KEY = 'campuspulse_loved_opportunities_v1';
const COUNTS_STORAGE_KEY = 'campuspulse_love_counts_v1';
const GOOGLE_AUTH_KEY = 'campuspulse_google_auth_v1';
const THEME_STORAGE_KEY = 'ztopus_app_theme';

export default function App() {
  const [googleUser, setGoogleUser] = useState<GoogleAuthUser>(() => {
    try {
      const stored = localStorage.getItem(GOOGLE_AUTH_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      isSignedIn: true,
      email: 'fahim.bioinfo@gmail.com',
      name: 'Fahim',
      googleCalendarSynced: true
    };
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_USER_PROFILE;
  });

  const [theme, setTheme] = useState<AppTheme>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {}
    return userProfile.theme || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  const [watchedSources, setWatchedSources] = useState<WatchedSource[]>(() => {
    try {
      const stored = localStorage.getItem(SOURCES_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_WATCHED_SOURCES;
  });

  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => {
    // Purge legacy corrupted storage keys
    try {
      localStorage.removeItem('campuspulse_user_opportunities_v1');
      localStorage.removeItem('campuspulse_user_opportunities_v2');
    } catch {}

    try {
      const stored = localStorage.getItem(USER_OPP_STORAGE_KEY);
      if (stored) {
        const userCreated = JSON.parse(stored) as Opportunity[];
        const initialIds = new Set(INITIAL_OPPORTUNITIES.map((o) => o.id));
        // Keep only custom user submitted or scraped items that aren't in INITIAL_OPPORTUNITIES
        const customOnly = Array.isArray(userCreated)
          ? userCreated.filter((o) => o && o.id && !initialIds.has(o.id))
          : [];

        const combined = [...customOnly, ...INITIAL_OPPORTUNITIES];
        const seenIds = new Set<string>();
        const uniqueList: Opportunity[] = [];
        for (const opp of combined) {
          if (opp && opp.id && !seenIds.has(opp.id)) {
            seenIds.add(opp.id);
            uniqueList.push(opp);
          }
        }
        try {
          localStorage.setItem(USER_OPP_STORAGE_KEY, JSON.stringify(customOnly));
        } catch {}
        return uniqueList;
      }
    } catch {}
    return INITIAL_OPPORTUNITIES;
  });

  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(SAVED_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return Array.from(new Set(parsed));
        }
      }
    } catch {}
    return ['opp-1', 'opp-2'];
  });

  const [lovedIds, setLovedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(LOVED_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return Array.from(new Set(parsed));
        }
      }
    } catch {}
    return ['opp-1', 'opp-3'];
  });

  const [loveCounts, setLoveCounts] = useState<{ [id: string]: number }>(() => {
    try {
      const stored = localStorage.getItem(COUNTS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    const initialMap: { [id: string]: number } = {};
    INITIAL_OPPORTUNITIES.forEach((o) => {
      initialMap[o.id] = o.loveCount || 10;
    });
    return initialMap;
  });

  const [currentView, setCurrentView] = useState<ViewMode>('feed');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [activeContextOpportunity, setActiveContextOpportunity] = useState<Opportunity | null>(null);
  const [isPhoneFrameActive, setIsPhoneFrameActive] = useState<boolean>(true);
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState<boolean>(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isClipperModalOpen, setIsClipperModalOpen] = useState<boolean>(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const { isInstallable, isInstalled, install } = usePWAInstall();

  const handleSignInWithGoogle = (email: string, name: string) => {
    const updatedUser: GoogleAuthUser = {
      isSignedIn: true,
      email,
      name,
      googleCalendarSynced: true
    };
    setGoogleUser(updatedUser);
    setUserProfile((prev) => ({ ...prev, name }));
    try {
      localStorage.setItem(GOOGLE_AUTH_KEY, JSON.stringify(updatedUser));
    } catch {}
  };

  const handleSignOutGoogle = () => {
    const updatedUser: GoogleAuthUser = {
      isSignedIn: false,
      email: '',
      name: '',
      googleCalendarSynced: false
    };
    setGoogleUser(updatedUser);
    try {
      localStorage.setItem(GOOGLE_AUTH_KEY, JSON.stringify(updatedUser));
    } catch {}
  };

  const handleToggleGoogleCalendarSync = () => {
    setGoogleUser((prev) => {
      const next = { ...prev, googleCalendarSynced: !prev.googleCalendarSynced };
      try {
        localStorage.setItem(GOOGLE_AUTH_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleToggleBookmark = (id: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      try {
        localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleToggleLove = (id: string) => {
    const isCurrentlyLoved = lovedIds.includes(id);
    const nextLovedIds = isCurrentlyLoved
      ? lovedIds.filter((item) => item !== id)
      : [...lovedIds, id];

    setLovedIds(nextLovedIds);
    try {
      localStorage.setItem(LOVED_STORAGE_KEY, JSON.stringify(nextLovedIds));
    } catch {}

    setLoveCounts((prev) => {
      const currentCount = prev[id] ?? 10;
      const nextCount = isCurrentlyLoved ? Math.max(0, currentCount - 1) : currentCount + 1;
      const nextMap = { ...prev, [id]: nextCount };
      try {
        localStorage.setItem(COUNTS_STORAGE_KEY, JSON.stringify(nextMap));
      } catch {}
      return nextMap;
    });
  };

  const handleSaveProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    if (updated.theme) {
      setTheme(updated.theme);
    }
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleToggleTheme = (newTheme: AppTheme) => {
    setTheme(newTheme);
    setUserProfile((prev) => {
      const updated = { ...prev, theme: newTheme };
      try {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleAddWatchedSource = (newSource: WatchedSource) => {
    setWatchedSources((prev) => {
      const next = [newSource, ...prev];
      try {
        localStorage.setItem(SOURCES_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleRemoveWatchedSource = (id: string) => {
    setWatchedSources((prev) => {
      const next = prev.filter((s) => s.id !== id);
      try {
        localStorage.setItem(SOURCES_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleToggleActiveSource = (id: string) => {
    setWatchedSources((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s));
      try {
        localStorage.setItem(SOURCES_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleAddNewOpportunity = (newOpp: Opportunity) => {
    const initialLove = newOpp.loveCount || 1;
    setLoveCounts((prev) => ({ ...prev, [newOpp.id]: initialLove }));
    setOpportunities((prev) => {
      const filteredPrev = prev.filter((o) => o.id !== newOpp.id);
      const next = [newOpp, ...filteredPrev];
      try {
        const initialIds = new Set(INITIAL_OPPORTUNITIES.map((o) => o.id));
        const userCreated = next.filter((o) => !initialIds.has(o.id) && (o.userSubmitted || o.fromWatchedSource));
        localStorage.setItem(USER_OPP_STORAGE_KEY, JSON.stringify(userCreated));
      } catch {}
      return next;
    });
  };

  const handleScrapeCompleted = (newOpps: Opportunity[]) => {
    setOpportunities((prev) => {
      const existingIds = new Set(prev.map((o) => o.id));
      const filteredNew = newOpps.filter((o) => !existingIds.has(o.id));
      const next = [...filteredNew, ...prev];
      try {
        const initialIds = new Set(INITIAL_OPPORTUNITIES.map((o) => o.id));
        const userCreated = next.filter((o) => !initialIds.has(o.id) && (o.userSubmitted || o.fromWatchedSource));
        localStorage.setItem(USER_OPP_STORAGE_KEY, JSON.stringify(userCreated));
      } catch {}
      return next;
    });

    setLoveCounts((prev) => {
      const nextMap = { ...prev };
      newOpps.forEach((o) => {
        nextMap[o.id] = Math.floor(Math.random() * 25) + 12;
      });
      try {
        localStorage.setItem(COUNTS_STORAGE_KEY, JSON.stringify(nextMap));
      } catch {}
      return nextMap;
    });
  };

  const handleAskAIAboutOpportunity = (opp: Opportunity) => {
    setActiveContextOpportunity(opp);
    setCurrentView('ai-chat');
  };

  const handleAutoScrape = () => {
    const SCRAPED_POOL: Opportunity[] = [
      {
        id: `scraped-fb-${Date.now()}`,
        title: 'Facebook Group Alert: 2026 Student AI Health Hackday ($3,500 Prizes)',
        host: 'University Hackers & Coders (FB Group)',
        category: 'hackday',
        format: 'Hybrid',
        location: 'Student Innovation Center Lab 204',
        deadline: '2026-11-12',
        eventDate: 'November 18–19, 2026',
        awardOrPrize: '$3,500 Cash + AWS Cloud Credits ($1,000/team)',
        eligibility: 'All undergraduate and graduate students. Free food & mentor support.',
        description: 'Automated scrape from Facebook group: 36-hour hackday building machine learning diagnostics and bioinformatics web apps with mentor sessions.',
        tags: ['hackday', 'ai', 'bioinformatics', 'health', 'facebook-scraped'],
        applyUrl: 'https://facebook.com/groups/campus.hackers',
        isOfficialCampusEvent: true,
        urgentDeadline: true,
        targetMajors: ['Computer Science', 'Bioinformatics', 'Data Science', 'Engineering'],
        sourcePlatform: 'facebook',
        sourceName: 'University Hackers & Coders (FB Group)',
        sourceUrl: 'https://facebook.com/groups/campus.hackers/posts/991823',
        scrapedAt: 'Just now',
        fromWatchedSource: true,
        loveCount: 42
      },
      {
        id: `scraped-news-${Date.now()}`,
        title: 'Campus Daily RSS: Alumni STEM Leadership & Research Fellowship ($4,000)',
        host: 'University Alumni Association & Academic Affairs',
        category: 'scholarship',
        format: 'Virtual',
        location: 'Financial Aid & Fellowship Portal',
        deadline: '2026-11-28',
        eventDate: 'Spring 2027 Term',
        awardOrPrize: '$4,000 Merit Stipend + Dedicated Faculty Mentorship',
        eligibility: 'Sophomore, Junior, or Senior students with GPA 3.0+ in any STEM field.',
        description: 'Extracted from campus newspaper feed: Annual endowment for students engaged in undergraduate research projects in biology, computing, or engineering.',
        tags: ['scholarship', 'stem', 'grant', 'fellowship', 'newspaper-scraped'],
        applyUrl: 'https://campusnewspaper.edu/articles/alumni-fellowship-2026',
        isOfficialCampusEvent: true,
        urgentDeadline: false,
        targetMajors: ['Bioinformatics', 'Computer Science', 'Chemistry', 'Biology', 'Engineering'],
        sourcePlatform: 'newspaper',
        sourceName: 'The Campus Daily (Newspaper & RSS)',
        sourceUrl: 'https://campusnewspaper.edu/rss/scholarships/alumni-grant',
        scrapedAt: 'Just now',
        fromWatchedSource: true,
        loveCount: 58
      },
      {
        id: `scraped-ig-${Date.now()}`,
        title: 'Instagram Flash: GDSC Flutter & Mobile Dev Weekend Sprint',
        host: 'Google Developer Student Club (@campus_gdsc)',
        category: 'workshop',
        format: 'In-Person',
        location: 'Computer Science Building Room 101',
        deadline: '2026-11-05',
        eventDate: 'November 7, 2026 (10:00 AM)',
        awardOrPrize: 'Google Swag Packs & Android Certification Vouchers',
        eligibility: 'Free for all campus students.',
        description: 'Scraped from Instagram post: Hands-on weekend workshop building native Android and cross-platform apps with Firebase backends.',
        tags: ['workshop', 'android', 'flutter', 'instagram-scraped', 'gdsc'],
        applyUrl: 'https://instagram.com/campus_gdsc',
        isOfficialCampusEvent: true,
        targetMajors: ['Computer Science', 'Engineering', 'Design', 'All Majors'],
        sourcePlatform: 'instagram',
        sourceName: '@campus_gdsc (Instagram)',
        sourceUrl: 'https://instagram.com/p/DB902xKaZ',
        scrapedAt: 'Just now',
        fromWatchedSource: true,
        loveCount: 47
      },
      {
        id: `scraped-li-${Date.now()}`,
        title: 'LinkedIn Network Lead: Genomic Data Pipeline Paid Co-Op',
        host: 'Student Bioinformatics Society (LinkedIn Hub)',
        category: 'internship',
        format: 'Hybrid',
        location: 'Biotech Incubator Suite 300 / Remote',
        deadline: '2026-11-18',
        eventDate: 'Dec 2026 – May 2027',
        awardOrPrize: '$25/hour Paid Internship (15 hrs/wk during semester)',
        eligibility: 'Students with Python or R skills.',
        description: 'Scraped from LinkedIn update: Paid semester co-op working on next-generation sequencing analysis algorithms and pipeline automation.',
        tags: ['internship', 'bioinformatics', 'genomics', 'python', 'linkedin-scraped'],
        applyUrl: 'https://linkedin.com/company/student-bioinfo-network',
        isOfficialCampusEvent: true,
        urgentDeadline: false,
        targetMajors: ['Bioinformatics', 'Computer Science', 'Statistics'],
        sourcePlatform: 'linkedin',
        sourceName: 'Student Bioinformatics Society (LinkedIn Hub)',
        sourceUrl: 'https://linkedin.com/feed/update/urn:li:activity:725910',
        scrapedAt: 'Just now',
        fromWatchedSource: true,
        loveCount: 71
      }
    ];

    setOpportunities((prev) => {
      const existingTitles = new Set(prev.map((o) => o.title));
      const unadded = SCRAPED_POOL.filter((c) => !existingTitles.has(c.title));
      if (unadded.length === 0) return prev;
      const newScraped = unadded[0];
      setLoveCounts((l) => ({ ...l, [newScraped.id]: newScraped.loveCount || 20 }));
      const next = [newScraped, ...prev];
      try {
        const initialIds = new Set(INITIAL_OPPORTUNITIES.map((o) => o.id));
        const customOnly = next.filter((o) => !initialIds.has(o.id));
        localStorage.setItem(USER_OPP_STORAGE_KEY, JSON.stringify(customOnly));
      } catch {}
      return next;
    });

    setWatchedSources((prev) => {
      const next = prev.map((s) => ({
        ...s,
        lastScraped: 'Just now',
        itemCount: s.itemCount + 1
      }));
      try {
        localStorage.setItem(SOURCES_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleRadarRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
    handleAutoScrape();
  };

  return (
    <AndroidFrame
      isPhoneFrameActive={isPhoneFrameActive}
      googleUserEmail={googleUser.email}
      isGoogleSignedIn={googleUser.isSignedIn}
      onTogglePhoneFrame={() => setIsPhoneFrameActive(!isPhoneFrameActive)}
      onOpenSetupGuide={() => setIsSetupGuideOpen(true)}
      onOpenGoogleLogin={() => setIsGoogleModalOpen(true)}
    >
      {/* View Switcher based on currentView */}
      {currentView === 'feed' && (
        <OpportunitiesFeed
          opportunities={opportunities}
          savedIds={savedIds}
          lovedIds={lovedIds}
          loveCounts={loveCounts}
          userProfile={userProfile}
          refreshTrigger={refreshTrigger}
          onToggleBookmark={handleToggleBookmark}
          onToggleLove={handleToggleLove}
          onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
          onAskAI={handleAskAIAboutOpportunity}
          onOpenSetupGuide={() => setIsSetupGuideOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenWatchedSources={() => setIsProfileModalOpen(true)}
          onOpenClipper={() => setIsClipperModalOpen(true)}
          onPerformAutoRefresh={handleAutoScrape}
          onInstallPwa={install}
          isInstallable={isInstallable && !isInstalled}
        />
      )}

      {currentView === 'calendar' && (
        <CalendarDeadlinesView
          opportunities={opportunities}
          savedIds={savedIds}
          onToggleBookmark={handleToggleBookmark}
          onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
          onAskAI={handleAskAIAboutOpportunity}
          onExploreFeed={() => {
            setCurrentView('feed');
            handleRadarRefresh();
          }}
        />
      )}

      {currentView === 'ai-chat' && (
        <AIChatView
          activeContextOpportunity={activeContextOpportunity}
          onClearContext={() => setActiveContextOpportunity(null)}
          onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
        />
      )}

      {currentView === 'bulletin' && (
        <div className="flex-1 p-6 space-y-4 flex flex-col justify-center items-center text-center overflow-y-auto">
          <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h2 className="text-base font-bold text-white">Manual Opportunity Submission</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Post details of an event, hackday, or scholarship you're organizing or found so others in your university community stay informed!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-xs">
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-colors shadow-sm"
            >
              Manual Form Entry
            </button>
            <button
              onClick={() => setIsClipperModalOpen(true)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors border border-slate-700"
            >
              Smart AI Clipper
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation: Clean 5 tabs without Scrapers */}
      <BottomNavBar
        currentView={currentView}
        onSelectView={(view) => setCurrentView(view)}
        onRefreshRadar={handleRadarRefresh}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        savedCount={savedIds.length}
      />

      {/* Opportunity Detail Drawer / Bottom Sheet */}
      <OpportunityDetailSheet
        opportunity={selectedOpportunity}
        isOpen={!!selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
        isBookmarked={selectedOpportunity ? savedIds.includes(selectedOpportunity.id) : false}
        isLoved={selectedOpportunity ? lovedIds.includes(selectedOpportunity.id) : false}
        loveCount={selectedOpportunity ? (loveCounts[selectedOpportunity.id] ?? selectedOpportunity.loveCount ?? 0) : 0}
        onToggleBookmark={handleToggleBookmark}
        onToggleLove={handleToggleLove}
        onAskAI={handleAskAIAboutOpportunity}
      />

      {/* User Profile & Watched Scrapers Modal (Scrapers housed under Account) */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={userProfile}
        watchedSources={watchedSources}
        currentTheme={theme}
        onToggleTheme={handleToggleTheme}
        onSaveProfile={handleSaveProfile}
        onAddWatchedSource={handleAddWatchedSource}
        onRemoveWatchedSource={handleRemoveWatchedSource}
        onToggleActiveSource={handleToggleActiveSource}
        onScrapeCompleted={handleScrapeCompleted}
        onOpenClipper={() => setIsClipperModalOpen(true)}
      />

      {/* Google Login Modal */}
      <GoogleLoginModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        authUser={googleUser}
        userProfile={userProfile}
        onSignInWithGoogle={handleSignInWithGoogle}
        onSignOut={handleSignOutGoogle}
        onToggleCalendarSync={handleToggleGoogleCalendarSync}
      />

      {/* AI Clipper Modal */}
      <AIClipperModal
        isOpen={isClipperModalOpen}
        onClose={() => setIsClipperModalOpen(false)}
        onOpportunityCreated={handleAddNewOpportunity}
      />

      {/* Submit Opportunity Modal */}
      <SubmitOpportunityModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmit={handleAddNewOpportunity}
      />

      {/* Android Setup & Export Guide Modal */}
      <AndroidSetupGuideModal
        isOpen={isSetupGuideOpen}
        onClose={() => setIsSetupGuideOpen(false)}
        onInstallPwa={install}
        isInstallable={isInstallable && !isInstalled}
      />
    </AndroidFrame>
  );
}
