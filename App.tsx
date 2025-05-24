import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, NavLink, Link } from 'react-router-dom';
import { Task, Channel, GeneratedContent, SocialPost, Priority } from './types';
import { 
  fetchTasksFromAPI, saveTaskToAPI, deleteTaskFromAPI, saveAllTasksToStorage,
  fetchChannelsFromAPI, saveChannelToAPI, deleteChannelFromAPI, saveAllChannelsToStorage,
  getGeneratedContents, saveGeneratedContents,
  fetchSocialPostsFromAPI, saveSocialPostToAPI, deleteSocialPostFromAPI, saveAllSocialPostsToStorage
} from './services/storageService';
import { Dashboard } from './components/Dashboard';
import { TaskManager } from './components/TaskManager';
import { ChannelManager } from './components/ChannelManager';
import { ContentGenerator } from './components/ContentGenerator';
import { SchedulerView } from './components/SchedulerView';
import { SocialPostScheduler } from './components/SocialPostScheduler'; // New component
import { APP_NAME, GEMINI_API_KEY_WARNING } from './constants';
import { isGeminiAvailable } from './services/geminiService';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [generatedContents, setGeneratedContents] = useState<GeneratedContent[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Mock authentication

  useEffect(() => {
    setTasks(fetchTasksFromAPI());
    setChannels(fetchChannelsFromAPI());
    setGeneratedContents(getGeneratedContents());
    setSocialPosts(fetchSocialPostsFromAPI());

    if (!isGeminiAvailable()) {
      setIsApiKeyMissing(true);
      console.warn(GEMINI_API_KEY_WARNING);
    }
  }, []);

  useEffect(() => { saveAllTasksToStorage(tasks); }, [tasks]);
  useEffect(() => { saveAllChannelsToStorage(channels); }, [channels]);
  useEffect(() => { saveGeneratedContents(generatedContents); }, [generatedContents]);
  useEffect(() => { saveAllSocialPostsToStorage(socialPosts); }, [socialPosts]);


  // --- Task Handlers ---
  const handleAddTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'contentIdeas'>) => {
    const newTask: Task = { 
      ...taskData, 
      id: Date.now().toString(), 
      createdAt: new Date().toISOString(),
      contentIdeas: [],
      priority: taskData.priority || Priority.MEDIUM // Ensure priority is set
    };
    await saveTaskToAPI(newTask);
    setTasks(prev => [...prev, newTask].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, []);

  const handleUpdateTask = useCallback(async (updatedTask: Task) => {
    await saveTaskToAPI(updatedTask);
    setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
  }, []);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    await deleteTaskFromAPI(taskId);
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  // --- Channel Handlers ---
  const handleAddChannel = useCallback(async (channelData: Omit<Channel, 'id'>) => {
    const newChannel : Channel = { ...channelData, id: Date.now().toString()};
    await saveChannelToAPI(newChannel);
    setChannels(prev => [...prev, newChannel]);
  }, []);

  const handleUpdateChannel = useCallback(async (updatedChannel: Channel) => {
    await saveChannelToAPI(updatedChannel);
    setChannels(prev => prev.map(channel => channel.id === updatedChannel.id ? updatedChannel : channel));
  }, []);

  const handleDeleteChannel = useCallback(async (channelId: string) => {
    await deleteChannelFromAPI(channelId);
    setChannels(prev => prev.filter(channel => channel.id !== channelId));
    setTasks(prevTasks => prevTasks.map(task => task.channelId === channelId ? {...task, channelId: undefined} : task));
  }, []);

  // --- Content Generation Handlers ---
  const handleSaveGeneratedContent = useCallback((content: GeneratedContent) => {
    setGeneratedContents(prev => [content, ...prev]); // Add new content to the beginning
  }, []);
  
  const handleUpdateTaskWithContent = useCallback((taskId: string, contentIdea: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, contentIdeas: [contentIdea, ...task.contentIdeas] } // Add new idea to beginning
          : task
      )
    );
  }, []);

  // --- Social Post Handlers ---
  const handleAddSocialPost = useCallback(async (postData: Omit<SocialPost, 'id'|'createdAt'|'updatedAt'>) => {
    const now = new Date().toISOString();
    const newPost: SocialPost = {
        ...postData,
        id: Date.now().toString(),
        createdAt: now,
        updatedAt: now,
    };
    await saveSocialPostToAPI(newPost);
    setSocialPosts(prev => [newPost, ...prev].sort((a,b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()));
  }, []);

  const handleUpdateSocialPost = useCallback(async (updatedPost: SocialPost) => {
    const postWithTimestamp = { ...updatedPost, updatedAt: new Date().toISOString() };
    await saveSocialPostToAPI(postWithTimestamp);
    setSocialPosts(prev => prev.map(post => post.id === updatedPost.id ? postWithTimestamp : post));
  }, []);

  const handleDeleteSocialPost = useCallback(async (postId: string) => {
    await deleteSocialPostFromAPI(postId);
    setSocialPosts(prev => prev.filter(post => post.id !== postId));
  }, []);


  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
      isActive ? 'bg-brandYellow text-black shadow-md' : 'text-gray-700 hover:bg-brandYellow-dark hover:text-black'
    }`;
  
  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-md text-base font-medium ${
        isActive ? 'bg-brandYellow text-black' : 'text-gray-700 hover:bg-yellow-100 hover:text-black'
    }`;

  const handleAuth = () => {
    // Mock authentication toggle. Real implementation would involve Google Sign-In SDK.
    alert(isAuthenticated ? "Mock Sign Out successful." : "Mock Sign In: This would typically open the Google Sign-In flow.");
    setIsAuthenticated(!isAuthenticated);
  }

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-gray-100 font-sans">
        <header className="bg-white shadow-md sticky top-0 z-40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center" aria-label={`${APP_NAME} - Home`}>
                <img src="/assets/miindigital-logo.png" alt="MiinDigital Logo" className="h-10 w-auto" />
                {/* <span className="ml-3 text-2xl font-bold text-gray-800">{APP_NAME}</span> */}
              </Link>
              <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
                <NavLink to="/" className={navLinkClass} end>Dashboard</NavLink>
                <NavLink to="/tasks" className={navLinkClass}>Tasks</NavLink>
                <NavLink to="/schedule" className={navLinkClass}>Schedule</NavLink>
                <NavLink to="/social-posts" className={navLinkClass}>Social Posts</NavLink>
                <NavLink to="/channels" className={navLinkClass}>Channels</NavLink>
                <NavLink to="/content" className={navLinkClass}>AI Content</NavLink>
                <button 
                    onClick={handleAuth}
                    className="ml-3 px-3 py-2 rounded-md text-sm font-medium text-black bg-brandYellow hover:bg-brandYellow-dark"
                >
                    <i className={`fas ${isAuthenticated ? 'fa-sign-out-alt' : 'fa-sign-in-alt'} mr-2`}></i>
                    {isAuthenticated ? 'Sign Out' : 'Sign In'}
                </button>
              </div>
              <div className="md:hidden flex items-center">
                 <button 
                    onClick={handleAuth}
                    className="mr-2 p-2 rounded-md text-gray-600 hover:text-brandYellow-dark hover:bg-yellow-50"
                    aria-label={isAuthenticated ? "Sign Out" : "Sign In"}
                >
                    <i className={`fas ${isAuthenticated ? 'fa-user-check' : 'fa-user-circle'} fa-lg`}></i>
                </button>
                 <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-md text-gray-600 hover:text-brandYellow-dark hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brandYellow"
                    aria-expanded={isMobileMenuOpen}
                    aria-controls="mobile-menu"
                 >
                    <span className="sr-only">Open main menu</span>
                    {isMobileMenuOpen ? <i className="fas fa-times fa-lg"></i> : <i className="fas fa-bars fa-lg"></i>}
                 </button>
              </div>
            </div>
            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden pb-3 space-y-1" id="mobile-menu">
                    <NavLink to="/" className={mobileNavLinkClass} onClick={()=>setIsMobileMenuOpen(false)} end>Dashboard</NavLink>
                    <NavLink to="/tasks" className={mobileNavLinkClass} onClick={()=>setIsMobileMenuOpen(false)}>Tasks</NavLink>
                    <NavLink to="/schedule" className={mobileNavLinkClass} onClick={()=>setIsMobileMenuOpen(false)}>Schedule</NavLink>
                    <NavLink to="/social-posts" className={mobileNavLinkClass} onClick={()=>setIsMobileMenuOpen(false)}>Social Posts</NavLink>
                    <NavLink to="/channels" className={mobileNavLinkClass} onClick={()=>setIsMobileMenuOpen(false)}>Channels</NavLink>
                    <NavLink to="/content" className={mobileNavLinkClass} onClick={()=>setIsMobileMenuOpen(false)}>AI Content</NavLink>
                </div>
            )}
          </div>
        </header>
        
        {isApiKeyMissing && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 text-sm text-center" role="alert">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            {GEMINI_API_KEY_WARNING} AI features may be unavailable or limited.
          </div>
        )}

        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard tasks={tasks} channels={channels} />} />
            <Route path="/tasks" element={<TaskManager tasks={tasks} channels={channels} onAddTask={(data) => handleAddTask(data as any)} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} />} />
            <Route path="/schedule" element={<SchedulerView tasks={tasks} channels={channels} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} onEditTask={handleUpdateTask} />} />
            <Route path="/social-posts" element={<SocialPostScheduler posts={socialPosts} onAddPost={handleAddSocialPost} onUpdatePost={handleUpdateSocialPost} onDeletePost={handleDeleteSocialPost} />} />
            <Route path="/channels" element={<ChannelManager channels={channels} onAddChannel={(data) => handleAddChannel(data as any)} onUpdateChannel={handleUpdateChannel} onDeleteChannel={handleDeleteChannel} />} />
            <Route path="/content" element={<ContentGenerator tasks={tasks} onSaveGeneratedContent={handleSaveGeneratedContent} onUpdateTaskWithContent={handleUpdateTaskWithContent} />} />
          </Routes>
        </main>

        <footer className="bg-gray-800 text-white text-center p-4 mt-auto">
          <p>&copy; {new Date().getFullYear()} {APP_NAME}. All Rights Reserved.</p>
          <p className="text-xs text-gray-400">Powered by MiinDigital Innovations</p>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;