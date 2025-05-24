import React, { useState, useMemo } from 'react';
import { Task, Channel, Priority, TaskStatus } from '../types';
import { TaskForm } from './TaskForm';
import { TaskItem } from './TaskItem';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../constants';

interface TaskManagerProps {
  tasks: Task[];
  channels: Channel[];
  onAddTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ tasks, channels, onAddTask, onUpdateTask, onDeleteTask }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | ''>('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('');
  const [filterChannel, setFilterChannel] = useState<string | ''>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'dueDate' | 'priority'>('createdAt');

  const handleOpenForm = (task?: Task) => {
    setEditingTask(task || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = (task: Task) => {
    if (editingTask) {
      onUpdateTask(task);
    } else {
      onAddTask(task);
    }
  };

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (taskToUpdate) {
      onUpdateTask({ ...taskToUpdate, status });
    }
  };

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (filterPriority) {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }
    if (filterStatus) {
      filtered = filtered.filter(task => task.status === filterStatus);
    }
    if (filterChannel) {
      filtered = filtered.filter(task => task.channelId === filterChannel);
    }
    
    // Secondary sort by title for consistent ordering within groups
    const priorityOrder = { [Priority.HIGH]: 1, [Priority.MEDIUM]: 2, [Priority.LOW]: 3 };
    return filtered.sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return a.title.localeCompare(b.title);
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        const dateComparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        return dateComparison === 0 ? a.title.localeCompare(b.title) : dateComparison;
      }
      if (sortBy === 'priority') {
        const priorityComparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        return priorityComparison === 0 ? a.title.localeCompare(b.title) : priorityComparison;
      }
      // Default: createdAt (newest first)
      const dateComparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return dateComparison === 0 ? a.title.localeCompare(b.title) : dateComparison;
    });
  }, [tasks, searchTerm, filterPriority, filterStatus, filterChannel, sortBy]);

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">Task Management</h2>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center px-4 py-2 text-sm font-medium text-black bg-brandYellow hover:bg-brandYellow-dark rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandYellow-dark w-full md:w-auto"
          aria-label="Add new task"
        >
          <i className="fas fa-plus mr-2"></i>
          Add Task
        </button>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div className="col-span-1 sm:col-span-2 lg:col-span-2">
          <label htmlFor="taskSearch" className="sr-only">Search tasks</label>
          <input
            type="text"
            id="taskSearch"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandYellow focus:border-brandYellow sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="filterPriority" className="sr-only">Filter by priority</label>
          <select id="filterPriority" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as Priority | '')} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandYellow focus:border-brandYellow sm:text-sm">
            <option value="">All Priorities</option>
            {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="filterStatus" className="sr-only">Filter by status</label>
          <select id="filterStatus" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as TaskStatus | '')} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandYellow focus:border-brandYellow sm:text-sm">
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
         <div>
           <label htmlFor="filterChannel" className="sr-only">Filter by channel</label>
           <select id="filterChannel" value={filterChannel} onChange={(e) => setFilterChannel(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandYellow focus:border-brandYellow sm:text-sm">
            <option value="">All Channels</option>
            {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
         <div>
           <label htmlFor="sortBy" className="sr-only">Sort by</label>
           <select id="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'priority' | 'createdAt')} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandYellow focus:border-brandYellow sm:text-sm">
            <option value="createdAt">Sort: Created</option>
            <option value="dueDate">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
          </select>
        </div>
      </div>

      {filteredAndSortedTasks.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No tasks match your criteria, or no tasks added yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              channel={channels.find(c => c.id === task.channelId)}
              onEdit={() => handleOpenForm(task)}
              onDelete={onDeleteTask}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      <TaskForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSaveTask}
        existingTask={editingTask}
        channels={channels}
      />
    </div>
  );
};