# CampusPulse — Student Opportunity & Hackday Command Hub (Revised)

A distraction-free, student-first platform delivering verified news on hackdays, university scholarships, research grants, and campus workshops aggregated across social media (Facebook, Instagram, LinkedIn, YouTube, university newspapers) with real-time scraping, student love-reaction ranking, 1-click Google Calendar integration, source verification, and an AI communication hub.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Duplicate Key & Cache Bug Resolution**:
> The duplicate key warnings (`opp-1` through `opp-5`) were caused by cached entries in local storage and a service worker returning stale HTML bundles. The storage schema has been migrated to `_v3`, legacy keys have been wiped, service worker cache has been made network-first, and all feed mappings have strict defensive deduplication guards so every rendered card has a strictly unique key.

- **Automated Multi-Source Scraper Hub Under Account**: Scrapers for Facebook groups, Instagram pages, LinkedIn hubs, YouTube channels, and campus newspapers are housed in the student Account panel. Every time you tap the **Radar** tab or perform a **Swipe-Down / Pull-to-Refresh**, an automated scraping sweep runs across all watched URLs with live status badges.
- **Student Communication & AI Collaboration Hub**: The AI assistant is upgraded into a dual-purpose communication center:
  1. *Opportunity Advisor*: Helps students evaluate eligibility, summarize complex application criteria, and brainstorm hackday project ideas.
  2. *Student Peer Communication & Teaming Hub*: Generates project pitches, finds hackday teammates by major (e.g., pairing Bioinformatics with Computer Science or Design), and drafts application emails.
- **Zero-Distraction News Feed with Clean Source Verification**: Filter easily between **Local University Campus** events and **Global / Online** hackathons, react with love hearts to spread trending opportunities, and verify information directly via verified source badges.
- **Easy Google Sign-In & Calendar Integration**: Effortless 1-click Google authentication with automated event synchronization and `.ics` download options.

---

## 1. Overview & Core Concept

### What It Does
CampusPulse provides university students with a clean, distraction-free feed of upcoming hackathons, campus workshops, institutional scholarships, and research grants without needing social media accounts. Students can:
1. **Monitor Custom Sources**: Add Facebook groups, Instagram handles, LinkedIn pages, and newspaper URLs to their watched scraper list.
2. **Auto-Refresh via Gestures**: Swipe down or tap the Radar tab to refresh and scrape new opportunities.
3. **Engage with the Community**: Love react to boost high-impact opportunities on the campus leaderboard.
4. **Communicate & Team Up**: Use CampusBot to draft outreach messages, find hackday teammates, and structure competition entries.
5. **Sync Deadlines**: Add deadlines directly to Google Calendar or export full ICS calendars.

### Target Audience
University students who want to stay informed about career-launching hackdays, grants, and academic opportunities without endless social media scrolling or algorithmic distractions.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Explore & Filter Opportunities**:
   - Seamless top segment switcher: **All Events** | **Local Campus** | **Global / Online**.
   - Category filters: Hackdays, Scholarships, University Events, Internships, Workshops.
   - Smart sorting: **Most Loved on Campus** (trending), **For My Major**, and **Urgent Deadlines**.
2. **Auto-Refresh & Swipe Down**:
   - Pull-to-refresh spring indicator triggers background scrapers and updates counts with smooth animation feedback.
3. **Inspect & Verify**:
   - Bottom sheet details modal displaying eligibility, host credentials, source verification pill, direct link to original post, and 1-click Google Calendar add button.
4. **AI Communication & Team Matcher**:
   - Pre-loaded interactive prompt chips: *"Find me Hackday teammates"*, *"Draft motivation email"*, *"Explain eligibility"*, *"Brainstorm hackday project idea"*.
5. **Account & Custom Scrapers**:
   - Profile settings to configure major, university, and followed tags.
   - URL manager to add any Facebook group, Instagram handle, LinkedIn page, or RSS URL to the scraper watch list.

### Visual Identity & Theme
- **Color Palette**: Dark OLED theme (`#0b0f17` slate background, `#10b981` emerald accent for university opportunities, `#3b82f6` blue for tech/hackathons, `#f43f5e` rose for student love reactions).
- **Typography**: Clean hierarchy with `Plus Jakarta Sans` for body text and `JetBrains Mono` for dates, counts, and verification badges.
- **Viewport**: Fluid responsive interface that adapts seamlessly between full-screen mobile devices, installed PWA mode, and desktop browsers.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Scraper Ingestion Engine Architecture**
  - *Chosen Approach*: Client-orchestrated scraper manager with mock live ingestion presets + URL clipping parser powered by the backend Gemini API (`/api/gemini/chat`).
  - *Why*: Allows students to paste raw URLs or post text and immediately extract structured event data (dates, hosts, prizes, eligibility) reliably without CORS blocks from social media platforms.
- **Decision 2: Local Storage Persistence with Seed Protection**
  - *Chosen Approach*: Isolated versioned cache (`v3`) that clearly distinguishes user-submitted/scraped opportunities from baseline seed catalog to prevent duplicated keys.
  - *Why*: Guarantees zero rendering glitches, instantaneous offline availability, and persists user likes, bookmarks, and custom sources across sessions.

---

## 4. Technical Architecture & Data Strategy

### System & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CampusPulse Mobile Shell                        │
├────────────────────────────────────────────────────────────────────────┤
│  Top Bar: Account Avatar (Scrapers) │ University Badge │ Google Status │
├────────────────────────────────────────────────────────────────────────┤
│  Location Toggle: [All Events]   │   [Local Campus]   │ [Global/Online]│
├────────────────────────────────────────────────────────────────────────┤
│  Search & Filter Engine: Category Pills │ For My Major │ Most Loved   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [Swipe-to-Refresh Gesture Handler]                                    │
│        │                                                               │
│        ▼                                                               │
│  ┌──────────────────────┐  ┌─────────────────────┐  ┌────────────────┐ │
│  │  OpportunitiesFeed   │  │ CalendarDeadlines   │  │   AIChatView   │ │
│  │  - OpportunityCards  │  │ - 1-Click GCalendar │  │ - Gemini 3.8   │ │
│  │  - Love Reactions    │  │ - ICS File Exporter │  │ - Team Matcher │ │
│  │  - Source Badges     │  │ - Urgency Timeline  │  │ - Pitch Drafter│ │
│  └──────────────────────┘  └─────────────────────┘  └────────────────┘ │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│  Modals & Drawers:                                                     │
│  - OpportunityDetailSheet (Source Verification & Full Criteria)        │
│  - UserProfileModal (Watched Scraper URL Manager & Major Preferences)  │
│  - AIClipperModal (Instant URL / Text Post Ingestion)                  │
│  - SubmitOpportunityModal (Student Manual Submission)                  │
│  - GoogleLoginModal (Google Auth & Calendar Sync)                      │
├────────────────────────────────────────────────────────────────────────┤
│  Bottom Nav: [Radar] │ [Deadlines] │ [Submit (+)] │ [AI Assist] │ [App]│
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │                Backend Express Server                    │
       │  - POST /api/gemini/chat (Gemini 3.8 Flash Advisor)     │
       │  - POST /api/gemini/suggest-opportunities (URL Parser)  │
       └─────────────────────────────────────────────────────────┘
```

### Data Model & Key Entities
- **Opportunity**: `id`, `title`, `host`, `category`, `format`, `location`, `deadline`, `eventDate`, `awardOrPrize`, `eligibility`, `description`, `tags`, `applyUrl`, `sourcePlatform`, `sourceName`, `sourceUrl`, `scrapedAt`, `fromWatchedSource`, `loveCount`, `isOfficialCampusEvent`.
- **WatchedSource**: `id`, `name`, `url`, `platform` (Facebook, Instagram, LinkedIn, YouTube, Newspaper), `categoryHint`, `lastScraped`, `active`, `itemCount`.
- **UserProfile**: `name`, `university`, `major`, `gradYear`, `interests`, `followedTags`, `notificationsEnabled`.
- **GoogleAuthUser**: `isSignedIn`, `email`, `name`, `googleCalendarSynced`.
