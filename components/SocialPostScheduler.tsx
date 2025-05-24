import React, { useState, useMemo, useEffect } from 'react';
import { SocialPost, SocialPlatform, SocialPostStatus } from '../types';
import { SOCIAL_PLATFORM_OPTIONS, SOCIAL_POST_STATUS_OPTIONS, SOCIAL_PLATFORM_THEMES } from '../constants';
import { Modal } from './Modal';
// import { generatePlatformSpecificContent, isGeminiAvailable } from '../services/geminiService'; // Optional AI integration

interface SocialPostSchedulerProps {
  posts: SocialPost[];
  onAddPost: (post: Omit<SocialPost, 'id'|'createdAt'|'updatedAt'>) => void;
  onUpdatePost: (post: SocialPost) => void;
  onDeletePost: (postId: string) => void;
}

const PostForm: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (post: Omit<SocialPost, 'id'|'createdAt'|'updatedAt'> | SocialPost) => void;
    existingPost?: SocialPost | null;
}> = ({ isOpen, onClose, onSave, existingPost }) => {
    const [platform, setPlatform] = useState<SocialPlatform>(SocialPlatform.X);
    const [textContent, setTextContent] = useState('');
    const [scheduledAtDate, setScheduledAtDate] = useState('');
    const [scheduledAtTime, setScheduledAtTime] = useState('');
    const [status, setStatus] = useState<SocialPostStatus>(SocialPostStatus.DRAFT);

    // const [isGeneratingAI, setIsGeneratingAI] = useState(false); // For optional AI content generation within form

    useEffect(() => {
        if (existingPost) {
            setPlatform(existingPost.platform);
            setTextContent(existingPost.textContent);
            if (existingPost.scheduledAt) {
                const date = new Date(existingPost.scheduledAt);
                setScheduledAtDate(date.toISOString().substring(0, 10));
                setScheduledAtTime(date.toTimeString().substring(0,5));
            } else {
                setScheduledAtDate('');
                setScheduledAtTime('');
            }
            setStatus(existingPost.status);
        } else {
            setPlatform(SocialPlatform.X);
            setTextContent('');
            setScheduledAtDate('');
            setScheduledAtTime('');
            setStatus(SocialPostStatus.DRAFT);
        }
    }, [existingPost, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!textContent.trim()) {
            alert("Post content cannot be empty.");
            return;
        }
        if (!scheduledAtDate || !scheduledAtTime) {
            alert("Please select a schedule date and time.");
            return;
        }
        const scheduledAtISO = new Date(`${scheduledAtDate}T${scheduledAtTime}`).toISOString();

        const postData = {
            platform,
            textContent: textContent.trim(),
            scheduledAt: scheduledAtISO,
            status,
        };

        if (existingPost) {
            onSave({ ...existingPost, ...postData });
        } else {
            onSave(postData);
        }
        onClose();
    };
    
    const currentPlatformTheme = SOCIAL_PLATFORM_THEMES[platform];
    const charLimit = currentPlatformTheme.charLimit;
    const charsLeft = charLimit ? charLimit - textContent.length : null;


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={existingPost ? 'Edit Social Post' : 'Create Social Post'} size="max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="postPlatform" className="block text-sm font-medium text-gray-700">Platform</label>
                    <select id="postPlatform" value={platform} onChange={e => setPlatform(e.target.value as SocialPlatform)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandYellow focus:border-brandYellow sm:text-sm">
                        {SOCIAL_PLATFORM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="postTextContent" className="block text-sm font-medium text-gray-700">Content</label>
                    <textarea id="postTextContent" value={textContent} onChange={e => setTextContent(e.target.value)} rows={5}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandYellow focus:border-brandYellow sm:text-sm"
                        placeholder={`Write your post for ${platform}...`} required aria-required="true"
                    />
                    {charLimit !== undefined && (
                        <p className={`text-xs mt-1 ${charsLeft !== null && charsLeft < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                            Characters left: {charsLeft ?? 'N/A'} (Limit: {charLimit})
                        </p>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="postScheduledDate" className="block text-sm font-medium text-gray-700">Schedule Date</label>
                        <input type="date" id="postScheduledDate" value={scheduledAtDate} onChange={e => setScheduledAtDate(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandYellow focus:border-brandYellow sm:text-sm" required aria-required="true"/>
                    </div>
                    <div>
                        <label htmlFor="postScheduledTime" className="block text-sm font-medium text-gray-700">Schedule Time</label>
                        <input type="time" id="postScheduledTime" value={scheduledAtTime} onChange={e => setScheduledAtTime(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandYellow focus:border-brandYellow sm:text-sm" required aria-required="true"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="postStatus" className="block text-sm font-medium text-gray-700">Status</label>
                    <select id="postStatus" value={status} onChange={e => setStatus(e.target.value as SocialPostStatus)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandYellow focus:border-brandYellow sm:text-sm">
                        {SOCIAL_POST_STATUS_OPTIONS.filter(s => s !== SocialPostStatus.POSTED && s !== SocialPostStatus.ERROR).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                    <button type="button" onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandYellow-dark">
                        Cancel
                    </button>
                    <button type="submit"
                        className="px-4 py-2 text-sm font-medium text-black bg-brandYellow hover:bg-brandYellow-dark rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandYellow-dark">
                        {existingPost ? 'Save Changes' : 'Schedule Post'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

const PostItem: React.FC<{post: SocialPost; onEdit: (post: SocialPost) => void; onDelete: (postId: string) => void;}> = ({ post, onEdit, onDelete }) => {
    const platformTheme = SOCIAL_PLATFORM_THEMES[post.platform];
    const scheduledDate = new Date(post.scheduledAt);

    return (
        <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                    <i className={`${platformTheme.icon} ${platformTheme.color} text-white p-2 rounded-full mr-3`}></i>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700">{post.platform}</h3>
                        <p className="text-xs text-gray-500">
                            Scheduled: {scheduledDate.toLocaleDateString()} @ {scheduledDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button onClick={() => onEdit(post)} className="text-gray-400 hover:text-brandYellow-dark" title="Edit Post" aria-label={`Edit post for ${post.platform}`}>
                        <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={() => onDelete(post.id)} className="text-gray-400 hover:text-red-500" title="Delete Post" aria-label={`Delete post for ${post.platform}`}>
                        <i className="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <p className="text-sm text-gray-600 whitespace-pre-line break-words mb-3">{post.textContent.substring(0,150)}{post.textContent.length > 150 ? '...' : ''}</p>
            <div className="text-xs">
                <span className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${
                    post.status === SocialPostStatus.SCHEDULED ? 'bg-green-500' : 
                    post.status === SocialPostStatus.DRAFT ? 'bg-yellow-500' : 'bg-gray-400'
                }`}>
                    {post.status}
                </span>
                 <span className="ml-2 text-gray-400">Created: {new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
    )
}


export const SocialPostScheduler: React.FC<SocialPostSchedulerProps> = ({ posts, onAddPost, onUpdatePost, onDeletePost }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
  // TODO: Add filters for platform, status, date range

  const handleOpenForm = (post?: SocialPost) => {
    setEditingPost(post || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPost(null);
  };

  const handleSavePost = (postData: Omit<SocialPost, 'id'|'createdAt'|'updatedAt'> | SocialPost) => {
    if ('id' in postData) { // existing post
        onUpdatePost(postData as SocialPost);
    } else { // new post
        onAddPost(postData as Omit<SocialPost, 'id'|'createdAt'|'updatedAt'>);
    }
  };

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a,b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }, [posts]);

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <h2 className="text-2xl font-semibold text-gray-800">Social Post Scheduler</h2>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center px-4 py-2 text-sm font-medium text-black bg-brandYellow hover:bg-brandYellow-dark rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandYellow-dark w-full sm:w-auto"
          aria-label="Create new social post"
        >
          <i className="fas fa-plus mr-2"></i>
          Create Post
        </button>
      </div>
      
      {/* Placeholder for API connection status/warnings */}
      <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-700 rounded text-sm">
        <i className="fas fa-info-circle mr-2"></i>
        <strong>Note:</strong> This scheduler is currently using local storage. Actual posting to social media platforms requires backend integration with X, LinkedIn, and Instagram APIs.
      </div>


      {sortedPosts.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No posts scheduled yet. Click "Create Post" to get started.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPosts.map(post => (
            <PostItem 
                key={post.id} 
                post={post}
                onEdit={() => handleOpenForm(post)}
                onDelete={onDeletePost}
            />
          ))}
        </div>
      )}

      <PostForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSavePost}
        existingPost={editingPost}
      />
    </div>
  );
};