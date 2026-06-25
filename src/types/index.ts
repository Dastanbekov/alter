export interface Workspace {
  id: string;
  name: string;
  purpose: "project" | "blog" | "other" | string;
  details: string | null;
  website?: string | null;
  services?: string[];
  logoUrl?: string | null;
  colors?: string[];
  fonts?: string[];
  toneOfVoice?: string | null;
  targetAudience?: string | null;
  brandStyle?: string[];
  tagline?: string | null;
  angle?: string | null;
  strategyChecklist?: StrategyTask[] | null;
  userId: string;
  socials: WorkspaceSocial[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceSocial {
  id: string;
  workspaceId: string;
  platform: SocialPlatform;
}

export interface Post {
  id: string;
  workspaceId: string;
  platform: SocialPlatform;
  content: string;
  status: PostStatus;
  mediaUrls: string[];
  scheduledAt: Date | null;
  publishedAt: Date | null;
  errorMsg: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  workspaceId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface Integration {
  id: string;
  userId: string;
  platform: SocialPlatform;
  metadata: Record<string, string> | null;
  toneOfVoice?: string | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type SocialPlatform = "x" | "linkedin" | "telegram" | "threads";
export type PostStatus = "draft" | "published" | "scheduled" | "failed";

export interface GeneratedPostGroup {
  id: string; // client-side temp id
  context: string; // what the user wrote
  posts: GeneratedPostItem[];
  createdAt: Date;
}

export interface GeneratedPostItem {
  id: string;
  platform: SocialPlatform;
  content: string;
  status: PostStatus;
  mediaUrls?: string[];
  scheduledAt?: Date;
  imageRecommendations?: string[];
}

export interface StrategyTask {
  id: string;
  title: string;
  description: string;
  suggestedPrompt: string;
}

export interface OnboardingData {
  purpose: "project" | "blog" | "other" | string | null;
  details: string;
  platforms: SocialPlatform[];
  workspaceName: string;
  website?: string;
  services?: string[];
  logoUrl?: string;
  colors?: string[];
  fonts?: string[];
  toneOfVoice?: string;
  targetAudience?: string;
  brandStyle?: string[];
  tagline?: string;
  angle?: string;
  strategyChecklist?: StrategyTask[];
}

export interface StoryNode {
  id: string;
  label: string;          // e.g. "The Problem"
  day: number;            // relative campaign day: 1, 3, 5…
  scheduledAt: string;    // ISO datetime string chosen by AI
  platform: SocialPlatform;
  content: string;
  mediaUrls?: string[];
  imageRecommendations?: string[];
}

export interface Story {
  id: string;
  workspaceId: string;
  title: string;
  brief: string;
  platforms: SocialPlatform[];
  nodes: StoryNode[];
  status: "draft" | "approved";
  createdAt: string;
  updatedAt: string;
}
