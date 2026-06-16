export interface Workspace {
  id: string;
  name: string;
  purpose: "project" | "blog" | "other";
  details: string | null;
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
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type SocialPlatform = "x" | "linkedin" | "telegram";
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
  scheduledAt?: Date;
}

export interface OnboardingData {
  purpose: "project" | "blog" | "other" | null;
  details: string;
  platforms: SocialPlatform[];
  workspaceName: string;
}
