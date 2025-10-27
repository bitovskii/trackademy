'use client';

import React from 'react';

interface FormFieldProps {
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ children, className = '' }) => {
  return (
    <div className={`form-group ${className}`}>
      {children}
    </div>
  );
};

interface FormLabelProps {
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormLabel: React.FC<FormLabelProps> = ({ 
  htmlFor, 
  required = false, 
  children, 
  className = '' 
}) => {
  return (
    <label htmlFor={htmlFor} className={`form-label text-gray-700 ${className}`}>
      {children}
      {required && ' *'}
    </label>
  );
};

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const FormInput: React.FC<FormInputProps> = ({ 
  error, 
  className = '', 
  onKeyDown,
  ...props 
}) => {
  return (
    <input
      className={`input-field text-gray-900 bg-white ${error ? 'border-red-500' : ''} ${className}`}
      onKeyDown={onKeyDown}
      {...props}
    />
  );
};

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({ 
  error, 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <select
      className={`input-field text-gray-900 bg-white ${error ? 'border-red-500' : ''} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};

interface FormErrorProps {
  error?: string;
  className?: string;
}

export const FormError: React.FC<FormErrorProps> = ({ error, className = '' }) => {
  if (!error) return null;
  
  return (
    <p className={`text-red-500 text-xs mt-1 ${className}`}>
      {error}
    </p>
  );
};

interface PasswordInputProps extends Omit<FormInputProps, 'type'> {
  showPassword: boolean;
  onTogglePassword: () => void;
  toggleIcon?: React.ReactNode;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  showPassword,
  onTogglePassword,
  toggleIcon,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="password-container">
      <FormInput
        type={showPassword ? 'text' : 'password'}
        error={error}
        className={className}
        {...props}
      />
      <button
        type="button"
        onClick={onTogglePassword}
        className="password-toggle"
      >
        {toggleIcon}
      </button>
    </div>
  );
};