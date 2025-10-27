'use client';

import React from 'react';

interface RoleOption {
  value: number;
  label: string;
  icon: string;
  color: string;
}

interface RoleSelectionProps {
  selectedRole: number;
  onRoleChange: (role: number) => void;
  options: RoleOption[];
  error?: string;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({
  selectedRole,
  onRoleChange,
  options,
  error,
}) => {
  return (
    <div>
      <label className="form-label text-gray-700">
        Роль пользователя *
      </label>
      <div className="grid grid-cols-2 gap-2">
        {options.map((role) => (
          <button
            key={role.value}
            type="button"
            onClick={() => onRoleChange(role.value)}
            className={`relative p-2 rounded-lg border-2 transition-all duration-300 text-left ${
              selectedRole === role.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center space-x-2">
              <div
                className={`w-6 h-6 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center text-white text-xs`}
              >
                {role.icon}
              </div>
              <div>
                <div className="text-xs font-medium text-gray-900">
                  {role.label}
                </div>
              </div>
            </div>
            {selectedRole === role.value && (
              <div className="absolute top-1 right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            )}
          </button>
        ))}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};