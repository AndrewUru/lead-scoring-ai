export type LeadStatus = "hot" | "warm" | "nurturing" | "cold";
export type SocialPlatform =
  | "instagram"
  | "linkedin"
  | "tiktok"
  | "facebook"
  | "x"
  | "youtube"
  | "other";

export interface ScoreBreakdown {
  fit: number;
  intent: number;
  engagement: number;
  dataQuality: number;
  semantic: number;
}

export interface LeadScore {
  total: number;
  status: LeadStatus;
  confidence: number;
  breakdown: ScoreBreakdown;
  positiveSignals: string[];
  negativeSignals: string[];
  recommendedAction: string;
  scoringVersion: number;
  calculatedAt: string;
}

export interface Lead {
  id: string;
  workspaceId: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  industry?: string;
  country?: string;
  source?: string;
  socialPlatform?: SocialPlatform;
  socialHandle?: string;
  socialProfileUrl?: string;
  followerCount?: number;
  socialEngagementRate?: number;
  directMessages?: number;
  postComments?: number;
  socialClicks?: number;
  campaign?: string;
  companySize?: number;
  estimatedBudget?: number;
  websiteVisits?: number;
  emailOpens?: number;
  emailClicks?: number;
  formSubmissions?: number;
  requestedDemo?: boolean;
  requestedQuote?: boolean;
  downloadedResource?: boolean;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  score?: LeadScore;
}
