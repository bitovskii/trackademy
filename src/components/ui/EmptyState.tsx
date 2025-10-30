'use client';

import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <div className="card text-center py-16">
      <div className="text-gray-400 dark:text-gray-500 mb-4">
        <Icon className="mx-auto h-16 w-16" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        {description}
      </p>
      <button
        onClick={onAction}
        className="btn-primary"
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        {actionLabel}
      </button>
    </div>
  );
};