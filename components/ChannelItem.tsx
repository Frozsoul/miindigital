import React from 'react';
import { Channel } from '../types';

interface ChannelItemProps {
  channel: Channel;
  onEdit: (channel: Channel) => void;
  onDelete: (channelId: string) => void;
}

export const ChannelItem: React.FC<ChannelItemProps> = ({ channel, onEdit, onDelete }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">{channel.name}</h3>
          <p className="text-sm text-gray-600">{channel.type}</p>
          {channel.platform && <p className="text-xs text-gray-500 italic">Platform: {channel.platform}</p>}
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => onEdit(channel)} 
            className="text-gray-500 hover:text-brandYellow-dark transition-colors" 
            title="Edit Channel"
            aria-label={`Edit channel ${channel.name}`}
            >
            <i className="fas fa-edit"></i>
          </button>
          <button 
            onClick={() => onDelete(channel.id)} 
            className="text-gray-500 hover:text-red-500 transition-colors" 
            title="Delete Channel"
            aria-label={`Delete channel ${channel.name}`}
            >
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
      {channel.description && <p className="mt-2 text-sm text-gray-700">{channel.description}</p>}
    </div>
  );
};