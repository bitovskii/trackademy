'use client';

import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  stats?: Array<{
    label: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
  }>;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  gradient,
  stats = [],
  actions
}) => {
  return (
    <div className="page-header-gradient" style={{ background: gradient }}>
      <div className="page-header-content">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <Icon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            <p className="text-white/80 text-lg">{subtitle}</p>
          </div>
        </div>
        
        {/* Stats Section */}
        {stats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                <div className="flex items-center">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-white/80 text-sm font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Button */}
        {actions && (
          <div className="flex justify-end">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};