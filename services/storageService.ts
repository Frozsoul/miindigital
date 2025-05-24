import { Task, Channel, GeneratedContent, SocialPost } from '../types';

const TASKS_KEY = 'miindigital_tasks';
const CHANNELS_KEY = 'miindigital_channels';
const GENERATED_CONTENT_KEY = 'miindigital_generated_content';
const SOCIAL_POSTS_KEY = 'miindigital_social_posts';

// ========== TASKS ==========
// TODO: Replace localStorage with actual API calls to Cloud SQL (PostgreSQL) backend.

export const fetchTasksFromAPI = (): Task[] => {
  console.info("Mock API: Fetching tasks from localStorage.");
  const tasksJson = localStorage.getItem(TASKS_KEY);
  return tasksJson ? JSON.parse(tasksJson) : [];
};

export const saveTaskToAPI = async (task: Task): Promise<Task> => {
  // Simulates creating or updating a task.
  console.info(`Mock API: Saving task ${task.id ? ' (update)' : '(create)'} to localStorage.`);
  let tasks = fetchTasksFromAPI();
  if (tasks.find(t => t.id === task.id)) {
    tasks = tasks.map(t => t.id === task.id ? task : t);
  } else {
    tasks.push(task);
  }
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  return task; // In a real API, this would return the saved/updated task from the server.
};

export const deleteTaskFromAPI = async (taskId: string): Promise<void> => {
  console.info(`Mock API: Deleting task ${taskId} from localStorage.`);
  let tasks = fetchTasksFromAPI();
  tasks = tasks.filter(t => t.id !== taskId);
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

// Bulk save for initial load or major updates (used by useEffect in App.tsx)
export const saveAllTasksToStorage = (tasks: Task[]): void => {
  console.info("Mock API: Bulk saving all tasks to localStorage.");
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};


// ========== CHANNELS ==========
// TODO: Replace localStorage with actual API calls.

export const fetchChannelsFromAPI = (): Channel[] => {
  console.info("Mock API: Fetching channels from localStorage.");
  const channelsJson = localStorage.getItem(CHANNELS_KEY);
  return channelsJson ? JSON.parse(channelsJson) : [];
};

export const saveChannelToAPI = async (channel: Channel): Promise<Channel> => {
  console.info(`Mock API: Saving channel ${channel.id ? ' (update)' : '(create)'} to localStorage.`);
  let channels = fetchChannelsFromAPI();
  if (channels.find(c => c.id === channel.id)) {
    channels = channels.map(c => c.id === channel.id ? channel : c);
  } else {
    channels.push(channel);
  }
  localStorage.setItem(CHANNELS_KEY, JSON.stringify(channels));
  return channel;
};

export const deleteChannelFromAPI = async (channelId: string): Promise<void> => {
  console.info(`Mock API: Deleting channel ${channelId} from localStorage.`);
  let channels = fetchChannelsFromAPI();
  channels = channels.filter(c => c.id !== channelId);
  localStorage.setItem(CHANNELS_KEY, JSON.stringify(channels));
};

export const saveAllChannelsToStorage = (channels: Channel[]): void => {
  console.info("Mock API: Bulk saving all channels to localStorage.");
  localStorage.setItem(CHANNELS_KEY, JSON.stringify(channels));
};


// ========== GENERATED CONTENT ==========
// This can remain localStorage based for now, or also move to backend if content needs to be shared/persisted.

export const getGeneratedContents = (): GeneratedContent[] => {
  const contentsJson = localStorage.getItem(GENERATED_CONTENT_KEY);
  return contentsJson ? JSON.parse(contentsJson) : [];
};

export const saveGeneratedContents = (contents: GeneratedContent[]): void => {
  localStorage.setItem(GENERATED_CONTENT_KEY, JSON.stringify(contents));
};


// ========== SOCIAL POSTS ==========
// TODO: Replace localStorage with actual API calls to backend for scheduling and platform APIs for posting.

export const fetchSocialPostsFromAPI = (): SocialPost[] => {
  console.info("Mock API: Fetching social posts from localStorage.");
  const postsJson = localStorage.getItem(SOCIAL_POSTS_KEY);
  return postsJson ? JSON.parse(postsJson) : [];
};

export const saveSocialPostToAPI = async (post: SocialPost): Promise<SocialPost> => {
  console.info(`Mock API: Saving social post ${post.id ? ' (update)' : '(create)'} to localStorage.`);
  let posts = fetchSocialPostsFromAPI();
  if (posts.find(p => p.id === post.id)) {
    posts = posts.map(p => p.id === post.id ? post : p);
  } else {
    posts.push(post);
  }
  localStorage.setItem(SOCIAL_POSTS_KEY, JSON.stringify(posts));
  return post; 
};

export const deleteSocialPostFromAPI = async (postId: string): Promise<void> => {
  console.info(`Mock API: Deleting social post ${postId} from localStorage.`);
  let posts = fetchSocialPostsFromAPI();
  posts = posts.filter(p => p.id !== postId);
  localStorage.setItem(SOCIAL_POSTS_KEY, JSON.stringify(posts));
};

export const saveAllSocialPostsToStorage = (posts: SocialPost[]): void => {
  console.info("Mock API: Bulk saving all social posts to localStorage.");
  localStorage.setItem(SOCIAL_POSTS_KEY, JSON.stringify(posts));
};