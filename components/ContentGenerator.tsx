import React, { useState } from 'react';
import { generatePlatformSpecificContent, isGeminiAvailable } from '../services/geminiService';
import { Task, GeneratedContent, SocialPlatform } from '../types';
import { GEMINI_API_KEY_WARNING, SOCIAL_PLATFORM_OPTIONS, SOCIAL_PLATFORM_THEMES } from '../constants';

interface ContentGeneratorProps {
  tasks: Task[];
  onSaveGeneratedContent: (content: GeneratedContent) => void;
  onUpdateTaskWithContent: (taskId: string, contentIdea: string) => void;
}

export const ContentGenerator: React.FC<ContentGeneratorProps> = ({ tasks, onSaveGeneratedContent, onUpdateTaskWithContent }) => {
  const [platform, setPlatform] = useState<SocialPlatform>(SocialPlatform.X);
  const [topic, setTopic] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [tone, setTone] = useState('');
  const [keywords, setKeywords] = useState('');
  
  const [generatedText, setGeneratedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);

  const geminiReady = isGeminiAvailable();

  const handleGenerateContent = async () => {
    if (!topic.trim() && !customPrompt.trim()) {
      setError('Topic or custom prompt cannot be empty.');
      return;
    }
    if (!geminiReady) {
      setError(GEMINI_API_KEY_WARNING);
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedText('');
    try {
      const result = await generatePlatformSpecificContent(
        customPrompt.trim() || `Generate a post about ${topic}`, 
        platform,
        topic.trim(), 
        tone.trim() || undefined,
        keywords.trim() || undefined
      );
      setGeneratedText(result);
      const newContent: GeneratedContent = {
        id: Date.now().toString(),
        prompt: `Platform: ${platform}, Topic: ${topic}, Tone: ${tone}, Keywords: ${keywords}, Custom: ${customPrompt}`,
        text: result,
        createdAt: new Date().toISOString(),
      };
      onSaveGeneratedContent(newContent);

    } catch (err) {
      setError((err as Error).message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContentToTask = () => {
    if (!selectedTaskId || !generatedText) {
      alert("Please select a task and generate content first.");
      return;
    }
    onUpdateTaskWithContent(selectedTaskId, generatedText);
    alert(`Content added as an idea to task: ${tasks.find(t=>t.id === selectedTaskId)?.title}`);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center mb-6">
        <i className="fas fa-wand-sparkles fa-2x text-accent mr-3"></i>
        <h2 className="text-2xl font-semibold text-gray-800">AI Content Generator</h2>
      </div>

      {!geminiReady && (
        <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded">
          <p className="font-medium">Heads up!</p>
          <p>{GEMINI_API_KEY_WARNING}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contentPlatform" className="block text-sm font-medium text-gray-700">Target Platform</label>
            <select
              id="contentPlatform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value as SocialPlatform)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandYellow focus:border-brandYellow sm:text-sm"
              disabled={!geminiReady || isLoading}
            >
              {SOCIAL_PLATFORM_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="contentTopic" className="block text-sm font-medium text-gray-700">Main Topic/Product</label>
            <input
              type="text"
              id="contentTopic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandYellow focus:border-brandYellow sm:text-sm"
              placeholder="e.g., New Summer Collection, AI in Marketing"
              disabled={!geminiReady || isLoading}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="customPrompt" className="block text-sm font-medium text-gray-700">
            Specific Instructions / Custom Prompt (Optional)
          </label>
          <textarea
            id="customPrompt"
            rows={3}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandYellow focus:border-brandYellow sm:text-sm"
            placeholder="e.g., 'Highlight the eco-friendly aspects', 'Write three variations of a hook'"
            disabled={!geminiReady || isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contentTone" className="block text-sm font-medium text-gray-700">Desired Tone (Optional)</label>
            <input
              type="text"
              id="contentTone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandYellow focus:border-brandYellow sm:text-sm"
              placeholder="e.g., Professional, Witty, Urgent, Friendly"
              disabled={!geminiReady || isLoading}
            />
          </div>
          <div>
            <label htmlFor="contentKeywords" className="block text-sm font-medium text-gray-700">Keywords (Optional, comma-separated)</label>
            <input
              type="text"
              id="contentKeywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandYellow focus:border-brandYellow sm:text-sm"
              placeholder="e.g., innovation, sustainability, #TechTuesday"
              disabled={!geminiReady || isLoading}
            />
          </div>
        </div>
        
        <button
          onClick={handleGenerateContent}
          disabled={!geminiReady || isLoading || (!topic.trim() && !customPrompt.trim())}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-black bg-brandYellow hover:bg-brandYellow-dark rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandYellow-dark disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <i className="fas fa-spinner fa-spin mr-2"></i>
          ) : (
            <i className="fas fa-wand-sparkles mr-2"></i>
          )}
          {isLoading ? 'Generating...' : 'Generate Content'}
        </button>

        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md"><i className="fas fa-exclamation-triangle mr-2"></i>{error}</p>}

        {generatedText && (
          <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Generated Content for {platform}:</h3>
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans bg-white p-3 rounded border border-gray-200">{generatedText}</pre>
            
            <div className="mt-4 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <select 
                value={selectedTaskId || ''} 
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="flex-grow w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandYellow focus:border-brandYellow sm:text-sm"
                aria-label="Select task to add content idea"
              >
                <option value="" disabled>Add idea to task (optional)</option>
                {tasks.filter(task => task.status !== 'Done').map(task => (
                  <option key={task.id} value={task.id}>{task.title}</option>
                ))}
              </select>
              <button
                onClick={handleAddContentToTask}
                disabled={!selectedTaskId}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-secondary hover:bg-secondary-dark rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:bg-gray-300 disabled:text-gray-500"
              >
                <i className="fas fa-plus-circle mr-2"></i>Add to Task
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};