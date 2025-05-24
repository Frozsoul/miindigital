export enum Priority {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
}

export enum TaskStatus {
  TODO = "To Do",
  IN_PROGRESS = "In Progress",
  DONE = "Done",
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // ISO string for date
  priority: Priority;
  status: TaskStatus;
  channelId?: string;
  contentIdeas: string[];
  createdAt: string; // ISO string
}

export enum ChannelType {
  SOCIAL_MEDIA = "Social Media",
  BLOG = "Blog",
  EMAIL = "Email",
  ADS = "Ads",
  VIDEO = "Video",
  PODCAST = "Podcast",
  OTHER = "Other",
}

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  platform?: string;
  description?: string;
}

export interface GeneratedContent {
  id: string;
  prompt: string;
  text: string;
  taskId?: string; // Optional: link directly to a task
  createdAt: string;
}

export enum SocialPlatform {
  X = "X (Twitter)",
  LINKEDIN = "LinkedIn",
  INSTAGRAM = "Instagram",
}

export enum SocialPostStatus {
  DRAFT = "Draft",
  SCHEDULED = "Scheduled",
  POSTED = "Posted", // For future tracking
  ERROR = "Error", // For future tracking
}

export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  textContent: string;
  // image?: File | string; // Placeholder for image handling
  scheduledAt: string; // ISO string
  status: SocialPostStatus;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}