import React, { useState } from 'react';
import { Channel } from '../types';
import { ChannelForm } from './ChannelForm';
import { ChannelItem } from './ChannelItem';

interface ChannelManagerProps {
  channels: Channel[];
  onAddChannel: (channel: Channel) => void;
  onUpdateChannel: (channel: Channel) => void;
  onDeleteChannel: (channelId: string) => void;
}

export const ChannelManager: React.FC<ChannelManagerProps> = ({ channels, onAddChannel, onUpdateChannel, onDeleteChannel }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);

  const handleOpenForm = (channel?: Channel) => {
    setEditingChannel(channel || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingChannel(null);
  };

  const handleSaveChannel = (channel: Channel) => {
    if (editingChannel) {
      onUpdateChannel(channel);
    } else {
      onAddChannel(channel);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Marketing Channels</h2>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center px-4 py-2 text-sm font-medium text-black bg-brandYellow hover:bg-brandYellow-dark rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandYellow-dark"
          aria-label="Add new channel"
        >
          <i className="fas fa-plus mr-2"></i>
          Add Channel
        </button>
      </div>

      {channels.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No channels added yet. Click "Add Channel" to get started.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map(channel => (
            <ChannelItem
              key={channel.id}
              channel={channel}
              onEdit={() => handleOpenForm(channel)}
              onDelete={onDeleteChannel}
            />
          ))}
        </div>
      )}

      <ChannelForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSaveChannel}
        existingChannel={editingChannel}
      />
    </div>
  );
};