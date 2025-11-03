import React from 'react';
import { DashboardStats } from '../../types/Dashboard';

interface StatsCardProps {
  stat: DashboardStats;
}

const getColorClasses = (color: string) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-300',
      icon: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-700 dark:text-green-300',
      icon: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800'
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      text: 'text-yellow-700 dark:text-yellow-300',
      icon: 'text-yellow-600 dark:text-yellow-400',
      border: 'border-yellow-200 dark:border-yellow-800'
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-300',
      icon: 'text-red-600 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-700 dark:text-purple-300',
      icon: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800'
    },
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      text: 'text-indigo-700 dark:text-indigo-300',
      icon: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-200 dark:border-indigo-800'
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-700 dark:text-emerald-300',
      icon: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800'
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      text: 'text-orange-700 dark:text-orange-300',
      icon: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-800'
    }
  };
  return colorMap[color as keyof typeof colorMap] || colorMap.blue;
};

const getChangeClasses = (changeType?: string) => {
  switch (changeType) {
    case 'increase':
      return 'text-green-600 dark:text-green-400';
    case 'decrease':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

export const StatsCard: React.FC<StatsCardProps> = ({ stat }) => {
  const colors = getColorClasses(stat.color);
  const Icon = stat.icon;

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-xl p-6 transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${colors.bg}`}>
            <Icon className={`h-6 w-6 ${colors.icon}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {stat.label}
            </p>
            <p className={`text-2xl font-bold ${colors.text}`}>
              {typeof stat.value === 'number' && stat.value > 999 
                ? (stat.value / 1000).toFixed(1) + 'k' 
                : stat.value}
            </p>
          </div>
        </div>
        
        {stat.change !== undefined && (
          <div className={`text-sm font-medium ${getChangeClasses(stat.changeType)}`}>
            <span className="flex items-center">
              {stat.changeType === 'increase' ? '↗' : stat.changeType === 'decrease' ? '↘' : '→'}
              <span className="ml-1">
                {stat.change > 0 ? '+' : ''}{stat.change}%
              </span>
            </span>
          </div>
        )}
      </div>
      
      {stat.description && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          {stat.description}
        </p>
      )}
    </div>
  );
};