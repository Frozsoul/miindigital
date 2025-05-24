import { Priority, TaskStatus, ChannelType, SocialPlatform, SocialPostStatus } from './types';

export const APP_NAME = "MiinDigital Hub";

export const PRIORITY_OPTIONS = Object.values(Priority);
export const STATUS_OPTIONS = Object.values(TaskStatus);
export const CHANNEL_TYPE_OPTIONS = Object.values(ChannelType);
export const SOCIAL_PLATFORM_OPTIONS = Object.values(SocialPlatform);
export const SOCIAL_POST_STATUS_OPTIONS = Object.values(SocialPostStatus);


export const GEMINI_API_KEY_WARNING = "Gemini API Key (process.env.API_KEY) is not configured. AI features will be unavailable or limited.";

export const PRIORITY_COLORS: { [key in Priority]: string } = {
  [Priority.HIGH]: 'bg-red-500 text-white',
  [Priority.MEDIUM]: 'bg-yellow-500 text-black',
  [Priority.LOW]: 'bg-green-500 text-white',
};

export const STATUS_COLORS: { [key in TaskStatus]: string } = {
  [TaskStatus.TODO]: 'bg-gray-500 text-white',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-500 text-white',
  [TaskStatus.DONE]: 'bg-purple-500 text-white',
};

export const SOCIAL_PLATFORM_THEMES: { [key in SocialPlatform]: { icon: string; color: string; charLimit?: number } } = {
  [SocialPlatform.X]: { icon: 'fab fa-twitter', color: 'bg-sky-500', charLimit: 280 },
  [SocialPlatform.LINKEDIN]: { icon: 'fab fa-linkedin', color: 'bg-blue-700', charLimit: 3000 },
  [SocialPlatform.INSTAGRAM]: { icon: 'fab fa-instagram', color: 'bg-pink-500', charLimit: 2200 },
};