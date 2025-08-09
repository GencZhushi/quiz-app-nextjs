'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { formatDropdownOptions } from '@/lib/validation/dropdownQuestion';

interface DropdownInputProps {
  questionId: string;
  questionText: string;
  options: Array<{
    text: string;
    isCorrect: boolean;
    orderIndex: number;
  }>;
  placeholder?: string;
  allowSearch?: boolean;
  showOptionNumbers?: boolean;
  onAnswerChange: (questionId: string, answer: { type: 'DROPDOWN'; selectedOption: string }) => void;
  disabled?: boolean;
  initialAnswer?: string;
  showError?: boolean;
  errorMessage?: string;
}

export default function DropdownInput({
  questionId,
  questionText,
  options,
  placeholder = 'Select an option...',
  allowSearch = false,
  showOptionNumbers = false,
  onAnswerChange,
  disabled = false,
  initialAnswer,
  showError = false,
  errorMessage
}: DropdownInputProps) {
  const [selectedOption, setSelectedOption] = useState<string>(initialAnswer || '');
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Format options for display
  const formattedOptions = useMemo(() => {
    return formatDropdownOptions(options, showOptionNumbers);
  }, [options, showOptionNumbers]);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!allowSearch || !searchTerm.trim()) {
      return formattedOptions;
    }
    
    const term = searchTerm.toLowerCase();
    return formattedOptions.filter(option => 
      option.displayText.toLowerCase().includes(term) ||
      option.text.toLowerCase().includes(term)
    );
  }, [formattedOptions, searchTerm, allowSearch]);

  // Update parent component when selection changes
  useEffect(() => {
    if (selectedOption) {
      onAnswerChange(questionId, {
        type: 'DROPDOWN',
        selectedOption
      });
    }
  }, [selectedOption, questionId, onAnswerChange]);

  const handleOptionSelect = (optionValue: string) => {
    if (disabled) return;
    setSelectedOption(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen && allowSearch) {
      setSearchTerm('');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const getSelectedOptionDisplay = () => {
    const selected = formattedOptions.find(opt => opt.value === selectedOption);
    return selected ? selected.displayText : placeholder;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleToggleDropdown();
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          // Focus first option
          const firstOption = document.querySelector('[data-dropdown-option="0"]') as HTMLElement;
          firstOption?.focus();
        }
        break;
    }
  };

  const handleOptionKeyDown = (e: React.KeyboardEvent, optionValue: string, index: number) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleOptionSelect(optionValue);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        const nextOption = document.querySelector(`[data-dropdown-option="${index + 1}"]`) as HTMLElement;
        nextOption?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (index === 0) {
          // Focus back to dropdown trigger
          const trigger = document.querySelector(`[data-dropdown-trigger="${questionId}"]`) as HTMLElement;
          trigger?.focus();
        } else {
          const prevOption = document.querySelector(`[data-dropdown-option="${index - 1}"]`) as HTMLElement;
          prevOption?.focus();
        }
        break;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white/90">{questionText}</h3>
      
      <div className="relative">
        {/* Dropdown Trigger */}
        <button
          type="button"
          onClick={handleToggleDropdown}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          data-dropdown-trigger={questionId}
          className={`w-full px-4 py-3 text-left bg-gray-700 border rounded-lg transition-all duration-200 flex items-center justify-between ${
            disabled
              ? 'cursor-not-allowed opacity-50 border-gray-600'
              : isOpen
              ? 'border-blue-400 ring-2 ring-blue-400/20'
              : 'border-gray-600 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
          } ${showError ? 'border-red-400 ring-2 ring-red-400/20' : ''}`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={`Select option for: ${questionText}`}
        >
          <span className={selectedOption ? 'text-white' : 'text-gray-400'}>
            {getSelectedOptionDisplay()}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
            {/* Search Input */}
            {allowSearch && (
              <div className="p-3 border-b border-gray-600">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search options..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            )}

            {/* Options List */}
            <div className="max-h-48 overflow-y-auto" role="listbox">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionSelect(option.value)}
                    onKeyDown={(e) => handleOptionKeyDown(e, option.value, index)}
                    data-dropdown-option={index}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-700 focus:bg-gray-700 focus:outline-none transition-colors ${
                      selectedOption === option.value
                        ? 'bg-blue-600/20 text-blue-300 border-r-2 border-blue-400'
                        : 'text-white/90'
                    }`}
                    role="option"
                    aria-selected={selectedOption === option.value}
                  >
                    <div className="flex items-center">
                      {selectedOption === option.value && (
                        <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className={selectedOption === option.value ? '' : 'ml-6'}>
                        {option.displayText}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-400 text-center">
                  {allowSearch ? 'No options match your search' : 'No options available'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Click outside to close */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Selected Option Feedback */}
      {selectedOption && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600/20 border border-blue-400/30 rounded-lg">
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-blue-300 text-sm font-medium">
              Selected: {formattedOptions.find(opt => opt.value === selectedOption)?.displayText}
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {showError && errorMessage && (
        <div className="text-red-400 text-sm mt-2 p-3 bg-red-400/10 border border-red-400/20 rounded-md">
          {errorMessage}
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-400 mt-3 text-center">
        💡 Tip: {allowSearch 
          ? 'Use the search box to quickly find options, or use arrow keys to navigate'
          : 'Click the dropdown to see all available options, or use arrow keys to navigate'
        }
      </div>
    </div>
  );
}
