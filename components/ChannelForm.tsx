import React, { useState, useEffect } from 'react';
import { Channel, ChannelType } from '../types';
import { CHANNEL_TYPE_OPTIONS } from '../constants';
import { Modal } from './Modal';

interface ChannelFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (channel: Channel) => void;
  existingChannel?: Channel | null;
}

export const ChannelForm: React.FC<ChannelFormProps> = ({ isOpen, onClose, onSave, existingChannel }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<ChannelType>(ChannelType.SOCIAL_MEDIA);
  const [platform, setPlatform] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (existingChannel) {
      setName(existingChannel.name);
      setType(existingChannel.type);
      setPlatform(existingChannel.platform || '');
      setDescription(existingChannel.description || '');
    } else {
      setName('');
      setType(ChannelType.SOCIAL_MEDIA);
      setPlatform('');
      setDescription('');
    }
  }, [existingChannel, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Channel name cannot be empty.");
      return;
    }
    const channelData: Channel = {
      id: existingChannel ? existingChannel.id : Date.now().toString(),
      name,
      type,
      platform: platform.trim() || undefined,
      description: description.trim() || undefined,
    };
    onSave(channelData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingChannel ? 'Edit Channel' : 'Create New Channel'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="channelName" className="block text-sm font-medium text-gray-700">Channel Name</label>
          <input
            type="text"
            id="channelName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandYellow focus:border-brandYellow sm:text-sm"
            required
            aria-required="true"
          />
        </div>
        <div>
          <label htmlFor="channelType" className="block text-sm font-medium text-gray-700">Channel Type</label>
          <select
            id="channelType"
            value={type}
            onChange={(e) => setType(e.target.value as ChannelType)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandYellow focus:border-brandYellow sm:text-sm"
          >
            {CHANNEL_TYPE_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="channelPlatform" className="block text-sm font-medium text-gray-700">Platform (Optional)</label>
          <input
            type="text"
            id="channelPlatform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            placeholder="e.g., Twitter, Instagram, WordPress"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandYellow focus:border-brandYellow sm:text-sm"
          />
        </div>
         <div>
          <label htmlFor="channelDescription" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
          <textarea
            id="channelDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandYellow focus:border-brandYellow sm:text-sm"
          />
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
            {existingChannel ? 'Save Changes' : 'Create Channel'}
          </button>
        </div>
      </form>
    </Modal>
  );
};