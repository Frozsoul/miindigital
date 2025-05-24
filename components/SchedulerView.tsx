import React, { useMemo } from 'react';
import { Task, Channel, Priority, TaskStatus } from '../types';
import { TaskItem } from './TaskItem'; 

interface SchedulerViewProps {
  tasks: Task[];
  channels: Channel[];
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
}

interface GroupedTasks {
  overdue: Task[];
  today: Task[];
  tomorrow: Task[];
  thisWeek: Task[];
  nextWeek: Task[];
  later: Task[];
  noDueDate: Task[];
}

export const SchedulerView: React.FC<SchedulerViewProps> = ({ tasks, channels, onUpdateTask, onDeleteTask, onEditTask }) => {
  
  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (taskToUpdate) {
      onUpdateTask({ ...taskToUpdate, status });
    }
  };

  const groupedTasks = useMemo<GroupedTasks>(() => {
    const groups: GroupedTasks = {
      overdue: [],
      today: [],
      tomorrow: [],
      thisWeek: [],
      nextWeek: [],
      later: [],
      noDueDate: [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - today.getDay())); // Assuming week ends on Saturday. Adjust if Sunday.
    endOfWeek.setHours(23, 59, 59, 999);

    const endOfNextWeek = new Date(endOfWeek);
    endOfNextWeek.setDate(endOfWeek.getDate() + 7);

    tasks.forEach(task => {
      if (task.status === TaskStatus.DONE) return; 

      if (!task.dueDate) {
        groups.noDueDate.push(task);
        return;
      }
      
      const taskDueDate = new Date(task.dueDate);
      const taskDueDateStartOfDay = new Date(taskDueDate.getFullYear(), taskDueDate.getMonth(), taskDueDate.getDate());

      if (taskDueDateStartOfDay < today) {
        groups.overdue.push(task);
      } else if (taskDueDateStartOfDay.getTime() === today.getTime()) {
        groups.today.push(task);
      } else if (taskDueDateStartOfDay.getTime() === tomorrow.getTime()) {
        groups.tomorrow.push(task);
      } else if (taskDueDateStartOfDay > tomorrow && taskDueDateStartOfDay <= endOfWeek) {
        groups.thisWeek.push(task);
      } else if (taskDueDateStartOfDay > endOfWeek && taskDueDateStartOfDay <= endOfNextWeek) {
        groups.nextWeek.push(task);
      } else if (taskDueDateStartOfDay > endOfNextWeek) {
        groups.later.push(task);
      } else { 
        // This case should ideally not be hit if logic is correct, but as a fallback:
        groups.noDueDate.push(task);
      }
    });

    for (const key in groups) {
        groups[key as keyof GroupedTasks].sort((a,b) => {
            const priorityOrder = { [Priority.HIGH]: 1, [Priority.MEDIUM]: 2, [Priority.LOW]: 3 };
            if(priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            if(a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            if(a.dueDate) return -1; // Tasks with due dates come before those without
            if(b.dueDate) return 1;
            return a.title.localeCompare(b.title); // Alphabetical by title as a tie-breaker
        });
    }
    return groups;
  }, [tasks]);

  const renderTaskGroup = (title: string, tasksInGroup: Task[], iconClass?: string) => {
    if (tasksInGroup.length === 0 && !(title === "Overdue" || title === "Today" || title === "Tomorrow")) return null;
    
    return (
      <div key={title} className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-300 flex items-center">
          {iconClass && <i className={`${iconClass} mr-2 text-gray-500`}></i>}
          {title} 
          <span className="ml-2 text-sm font-normal text-gray-500">({tasksInGroup.length})</span>
        </h3>
        {tasksInGroup.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasksInGroup.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                channel={channels.find(c => c.id === task.channelId)}
                onEdit={() => onEditTask(task)}
                onDelete={onDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic pl-1">No tasks for this period.</p>
        )}
      </div>
    );
  };
  
  const activeTasks = tasks.filter(t => t.status !== TaskStatus.DONE);
  const allTasksDoneOrNoTasks = activeTasks.length === 0;


  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Task Schedule</h2>
        <button 
          onClick={() => alert('Google Calendar Sync: This feature requires backend and Google API integration (OAuth). Coming soon!')}
          className="mt-3 sm:mt-0 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandYellow-dark"
          title="Sync with Google Calendar (Future Feature)"
        >
          <i className="fab fa-google-calendar-alt mr-2"></i>Connect Google Calendar
        </button>
      </div>
      
      {tasks.length > 0 && allTasksDoneOrNoTasks && (
          <p className="text-center text-green-600 font-semibold py-4 text-lg">
            <i className="fas fa-check-circle mr-2"></i>All tasks are completed! 🎉
          </p>
      )}
      {tasks.length === 0 && <p className="text-center text-gray-500 py-8">No tasks scheduled yet.</p>}

      {renderTaskGroup("Overdue", groupedTasks.overdue, "fas fa-exclamation-triangle text-red-500")}
      {renderTaskGroup("Today", groupedTasks.today, "fas fa-star text-yellow-500")}
      {renderTaskGroup("Tomorrow", groupedTasks.tomorrow, "fas fa-hourglass-half text-blue-500")}
      {renderTaskGroup("This Week", groupedTasks.thisWeek, "fas fa-calendar-alt")}
      {renderTaskGroup("Next Week", groupedTasks.nextWeek, "fas fa-calendar-plus")}
      {renderTaskGroup("Later", groupedTasks.later, "fas fa-calendar-day")}
      {renderTaskGroup("No Due Date", groupedTasks.noDueDate, "fas fa-question-circle")}
    </div>
  );
};