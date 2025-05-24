import React from 'react';
import { Task, Channel, Priority, TaskStatus } from '../types';
import { PRIORITY_COLORS, STATUS_COLORS } from '../constants';

interface TaskItemProps {
  task: Task;
  channel?: Channel;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, channel, onEdit, onDelete, onStatusChange }) => {
  const formattedDueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'No due date';
  const priorityColor = PRIORITY_COLORS[task.priority] || 'bg-gray-200 text-gray-800';
  const statusColor = STATUS_COLORS[task.status] || 'bg-gray-200 text-gray-800';

  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-700">{task.title}</h3>
          <div className="flex space-x-3">
            <button 
              onClick={() => onEdit(task)} 
              className="text-gray-500 hover:text-brandYellow-dark transition-colors" 
              title="Edit Task"
              aria-label={`Edit task ${task.title}`}
              >
              <i className="fas fa-edit"></i>
            </button>
            <button 
              onClick={() => onDelete(task.id)} 
              className="text-gray-500 hover:text-red-500 transition-colors" 
              title="Delete Task"
              aria-label={`Delete task ${task.title}`}
              >
              <i className="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
        {task.description && <p className="text-sm text-gray-700 mb-2 break-words">{task.description}</p>}
        <div className="text-xs text-gray-500 mb-3 space-y-1">
            <p><i className="far fa-calendar-alt mr-1 text-gray-400"></i>Due: {formattedDueDate}</p>
            {channel && <p><i className="fas fa-project-diagram mr-1 text-gray-400"></i>Channel: <span className="font-medium text-secondary">{channel.name}</span></p>}
        </div>
        {task.contentIdeas && task.contentIdeas.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-gray-600 mb-1">
              <i className="far fa-lightbulb mr-1 text-gray-400"></i>Content Ideas:
            </h4>
            <ul className="list-disc list-inside pl-2 space-y-0.5">
              {task.contentIdeas.slice(0, 2).map((idea, index) => (
                <li key={index} className="text-xs text-gray-500 truncate" title={idea}>{idea}</li>
              ))}
              {task.contentIdeas.length > 2 && <li className="text-xs text-gray-400 italic">...and {task.contentIdeas.length - 2} more</li>}
            </ul>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${priorityColor}`}>
            {task.priority}
          </span>
           <select
              value={task.status}
              onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
              className={`px-2 py-0.5 text-xs font-semibold rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brandYellow-dark ${statusColor}`}
              aria-label={`Change status for task ${task.title}`}
            >
              {Object.values(TaskStatus).map(s => <option key={s} value={s} className="bg-white text-black">{s}</option>)}
            </select>
        </div>
      </div>
    </div>
  );
};