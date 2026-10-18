export type OpportunityCategory =
  | 'hackday'
  | 'scholarship'
  | 'university-event'
  | 'internship'
  | 'workshop';

export type EventFormat = 'In-Person' | 'Virtual' | 'Hybrid';

export type SourcePlatform =
  | 'facebook'
  | 'linkedin'
  | 'instagram'
  | 'youtube'
  | 'newspaper'
  | 'official_portal'
  | 'manual_submission';

export interface Opportunity {
  id: string;
  title: string;
  host: string;
  category: OpportunityCategory;
  format: EventFormat;
  location: string;
  deadline: string; // ISO date e.g. 2026-10-31
  eventDate: string;
  awardOrPrize?: string;
  eligibility: string;
  description: string;
  tags: string[];
  applyUrl: string;
  isOfficialCampusEvent: boolean;
  urgentDeadline?: boolean;
  contactEmail?: string;
  targetMajors?: string[];
  isBookmarked?: boolean;
  userSubmitted?: boolean;
  // Scraper & Source Metadata
  sourcePlatform?: SourcePlatform;
  sourceName?: string;
  sourceUrl?: string;
  scrapedAt?: string;
  fromWatchedSource?: boolean;
  // Love Reactions & Student Interest
  loveCount?: number;
  isLoved?: boolean;
}

export interface WatchedSource {
  id: string;
  name: string;
  url: string;
  platform: SourcePlatform;
  categoryHint: OpportunityCategory;
  lastScraped: string;
  active: boolean;
  itemCount: number;
}

export type AppTheme = 'dark' | 'light';

export interface UserProfile {
  name: string;
  university: string;
  major: string;
  gradYear: string;
  interests: OpportunityCategory[];
  followedTags: string[];
  notificationsEnabled: boolean;
  theme?: AppTheme;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  contextOpportunityId?: string;
  suggestedActions?: string[];
}

export type ViewMode =
  | 'feed'
  | 'calendar'
  | 'ai-chat'
  | 'watched-sources'
  | 'bulletin'
  | 'android-guide';
