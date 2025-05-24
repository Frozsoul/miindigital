import React, { useState, useEffect } from 'react';
import { Task, Priority, TaskStatus, Channel } from '../types';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../constants';
import { Modal } from './Modal';
import { suggestTaskPriority, isGeminiAvailable } from '../services/geminiService';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  existingTask?: Task | null;
  channels: Channel[];
}

export const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, onSave, existingTask, channels }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [channelId, setChannelId] = useState<string | undefined>(undefined);
  const [isSuggestingPriority, setIsSuggestingPriority] = useState(false);
  const [aiSuggestionError, setAiSuggestionError] = useState<string | null>(null);

  const geminiReady = isGeminiAvailable();

  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setDescription(existingTask.description || '');
      setDueDate(existingTask.dueDate ? existingTask.dueDate.substring(0, 10) : ''); // Format for date input
      setPriority(existingTask.priority);
      setStatus(existingTask.status);
      setChannelId(existingTask.channelId);
    } else {
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority(Priority.MEDIUM);
      setStatus(TaskStatus.TODO);
      setChannelId(undefined);
    }
    setAiSuggestionError(null);
  }, [existingTask, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     if (!title.trim()) {
      alert("Task title cannot be empty.");
      return;
    }
    const taskData: Task = {
      id: existingTask ? existingTask.id : Date.now().toString(),
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
      priority,
      status,
      channelId: channelId || undefined,
      contentIdeas: existingTask ? existingTask.contentIdeas : [],
      createdAt: existingTask ? existingTask.createdAt : new Date().toISOString(),
    };
    onSave(taskData);
    onClose();
  };

  const handleSuggestPriority = async () => {
    if (!title.trim() && !description.trim()) {
        setAiSuggestionError("Please enter a title or description for AI suggestion.");
        return;
    }
    setIsSuggestingPriority(true);
    setAiSuggestionError(null);
    try {
        const suggested = await suggestTaskPriority(title, description, dueDate);
        setPriority(suggested);
    } catch (error) {
        setAiSuggestionError((error as Error).message || "Failed to get AI priority suggestion.");
        console.error("AI Priority Suggestion Error:", error);
    } finally {
        setIsSuggestingPriority(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingTask ? 'Edit Task' : 'Create New Task'} size="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            id="taskTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandYellow focus:border-brandYellow sm:text-sm"
            required
            aria-required="true"
          />
        </div>
        <div>
          <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
          <textarea
            id="taskDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandYellow focus:border-brandYellow sm:text-sm"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="taskDueDate" className="block text-sm font-medium text-gray-700">Due Date (Optional)</label>
            <input
              type="date"
              id="taskDueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandYellow focus:border-brandYellow sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="taskPriority" className="block text-sm font-medium text-gray-700">Priority</label>
            <div className="flex items-center space-x-2 mt-1">
                <select
                id="taskPriority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandYellow focus:border-brandYellow sm:text-sm"
                >
                {PRIORITY_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
                </select>
                {geminiReady && (
                    <button 
                        type="button" 
                        onClick={handleSuggestPriority}
                        disabled={isSuggestingPriority}
                        className="p-2 text-sm text-white bg-accent hover:bg-pink-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-accent disabled:bg-gray-300"
                        title="Suggest priority with AI"
                        aria-label="Suggest priority with AI"
                    >
                        {isSuggestingPriority ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-wand-sparkles"></i>}
                    </button>
                )}
            </div>
            {aiSuggestionError && <p className="text-xs text-red-500 mt-1">{aiSuggestionError}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="taskStatus" className="block text-sm font-medium text-gray-700">Status</label>
                <select
                id="taskStatus"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandYellow focus:border-brandYellow sm:text-sm"
                >
                {STATUS_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
                </select>
            </div>
            <div>
                <label htmlFor="taskChannel" className="block text-sm font-medium text-gray-700">Channel (Optional)</label>
                <select
                id="taskChannel"
                value={channelId || ''}
                onChange={(e) => setChannelId(e.target.value || undefined)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandYellow focus:border-brandYellow sm:text-sm"
                >
                <option value="">None</option>
                {channels.map(channel => (
                    <option key={channel.id} value={channel.id}>{channel.name}</option>
                ))}
                </select>
            </div>
        </div>
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandYellow-dark"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-black bg-brandYellow hover:bg-brandYellow-dark rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandYellow-dark"
          >
            {existingTask ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};