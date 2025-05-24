import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'max-w-lg' | 'max-w-xl' | 'max-w-2xl' | 'max-w-3xl' | 'max-w-4xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'max-w-lg' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className={`bg-white rounded-lg shadow-xl p-6 w-full ${size} transform transition-all max-h-[90vh] flex flex-col`}>
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-brandYellow-dark transition-colors"
            aria-label="Close modal"
          >
            <i className="fas fa-times fa-lg"></i>
          </button>
        </div>
        <div className="overflow-y-auto flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
};