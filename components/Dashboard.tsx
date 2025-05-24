import React from 'react';
import { Task, Channel, TaskStatus, Priority } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  tasks: Task[];
  channels: Channel[];
}

const COLORS_PRIORITY = {
  [Priority.HIGH]: '#EF4444', // red-500
  [Priority.MEDIUM]: '#F59E0B', // yellow-500
  [Priority.LOW]: '#22C55E', // green-500
};

const COLORS_STATUS = {
  [TaskStatus.TODO]: '#6B7280', // gray-500
  [TaskStatus.IN_PROGRESS]: '#3B82F6', // blue-500
  [TaskStatus.DONE]: '#8B5CF6', // purple-500
};


export const Dashboard: React.FC<DashboardProps> = ({ tasks, channels }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === TaskStatus.DONE).length;
  const openTasks = tasks.filter(task => task.status !== TaskStatus.DONE);
  const highPriorityTasks = openTasks.filter(task => task.priority === Priority.HIGH).length;
  
  const tasksDueSoon = openTasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0,0,0,0); // Start of today
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);
    return dueDate >= today && dueDate <= sevenDaysFromNow;
  }).length;

  const taskStatusData = Object.values(TaskStatus).map(status => ({
    name: status,
    value: tasks.filter(task => task.status === status).length,
  })).filter(item => item.value > 0);

  const taskPriorityData = Object.values(Priority).map(priority => ({
    name: priority,
    value: tasks.filter(task => task.priority === priority).length,
  })).filter(item => item.value > 0);
  
  const tasksPerChannelData = channels.map(channel => ({
    name: channel.name,
    tasks: tasks.filter(task => task.channelId === channel.id).length,
  })).filter(data => data.tasks > 0);


  const MetricCard: React.FC<{title: string; value: string | number; icon: string; colorClass: string;}> = ({title, value, icon, colorClass}) => (
    <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
        <div className={`p-3 rounded-full ${colorClass} text-white`}>
            <i className={`fas ${icon} fa-lg`}></i>
        </div>
        <div>
            <p className="text-gray-600 text-sm">{title}</p>
            <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
        </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Marketing Dashboard</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Tasks" value={totalTasks} icon="fa-tasks" colorClass="bg-blue-500" />
        <MetricCard title="Completed Tasks" value={completedTasks} icon="fa-check-circle" colorClass="bg-green-500" />
        <MetricCard title="Open High Priority" value={highPriorityTasks} icon="fa-exclamation-triangle" colorClass="bg-red-500" />
        <MetricCard title="Due This Week" value={tasksDueSoon} icon="fa-calendar-week" colorClass="bg-yellow-500" />
      </div>

      {/* Charts */}
      {tasks.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Task Status Distribution */}
          {taskStatusData.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Task Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={taskStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                      const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                      return (percent * 100) > 5 ? (
                        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12px">
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      ) : null;
                    }}>
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-status-${index}`} fill={COLORS_STATUS[entry.name as TaskStatus]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Task Priority Distribution */}
          {taskPriorityData.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Task Priority Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={taskPriorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                        return (percent * 100) > 5 ? (
                          <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12px">
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        ) : null;
                      }}>
                    {taskPriorityData.map((entry, index) => (
                      <Cell key={`cell-priority-${index}`} fill={COLORS_PRIORITY[entry.name as Priority]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      ) : <p className="text-gray-500 text-center py-10 col-span-full">No task data available for charts.</p>}
      
      {/* Tasks per Channel */}
      {channels.length > 0 && tasks.length > 0 && tasksPerChannelData.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Tasks per Channel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tasksPerChannelData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-15} textAnchor="end" height={50} interval={0} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="tasks" fill="#ffce00" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};