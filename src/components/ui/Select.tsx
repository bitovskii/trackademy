'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SelectOption {
  id: number;
  name: string;
  color?: string;
  icon?: string;
}

interface SelectProps {
  options: SelectOption[];
  selectedValues: number[];
  onChange: (values: number[]) => void;
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder = "Выберите...",
  disabled = false,
  multiple = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOption = (optionId: number) => {
    if (multiple) {
      const isSelected = selectedValues.includes(optionId);
      if (isSelected) {
        onChange(selectedValues.filter(id => id !== optionId));
      } else {
        onChange([...selectedValues, optionId]);
      }
    } else {
      onChange([optionId]);
      setIsOpen(false);
    }
  };

  const handleRemoveOption = (optionId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    onChange(selectedValues.filter(id => id !== optionId));
  };

  const getSelectedOptions = () => {
    return selectedValues
      .map(id => options.find(option => option.id === id))
      .filter(Boolean) as SelectOption[];
  };

  const selectedOptions = getSelectedOptions();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`relative w-full min-h-[42px] px-3 py-2 border rounded-md bg-white 
                   text-left cursor-pointer transition-all duration-200 ${
          disabled 
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
            : isOpen 
              ? 'border-blue-500 ring-1 ring-blue-500' 
              : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <div className="flex items-center justify-between min-h-[26px]">
          <div className="flex-1 flex flex-wrap gap-1">
            {selectedOptions.length === 0 ? (
              <span className="text-gray-500 text-sm">
                {placeholder}
              </span>
            ) : multiple ? (
              selectedOptions.map((option) => (
                <span
                  key={option.id}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800 border border-blue-200"
                >
                  {option.icon && <span className="mr-1">{option.icon}</span>}
                  {option.name}
                  {!disabled && (
                    <button
                      onClick={(e) => handleRemoveOption(option.id, e)}
                      className="ml-1 hover:opacity-70"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))
            ) : (
              <span className="text-gray-900 text-sm flex items-center">
                {selectedOptions[0]?.icon && (
                  <span className="mr-2">{selectedOptions[0].icon}</span>
                )}
                {selectedOptions[0]?.name}
              </span>
            )}
          </div>
          
          <ChevronDownIcon 
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ml-2 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 
                       rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1">
          
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              Нет доступных опций
            </div>
          ) : (
            options.map((option) => {
              const isSelected = selectedValues.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => handleToggleOption(option.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left
                             transition-colors ${
                    isSelected
                      ? 'bg-blue-50 text-blue-900'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    {option.icon && (
                      <span className="mr-2 text-base">{option.icon}</span>
                    )}
                    <span>{option.name}</span>
                  </div>
                  
                  {multiple && isSelected && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};