'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DROPDOWN_CONFIGS, DropdownConfig } from '@/lib/validation/dropdownQuestion';

interface DropdownQuestionData {
  text: string;
  type: 'DROPDOWN';
  orderIndex: number;
  options: Array<{
    text: string;
    isCorrect: boolean;
    orderIndex: number;
  }>;
  placeholder?: string;
  allowSearch?: boolean;
  showOptionNumbers?: boolean;
}

interface DropdownQuestionBuilderProps {
  question: DropdownQuestionData;
  onChange: (question: DropdownQuestionData) => void;
  onRemove: () => void;
  questionIndex: number;
}

export default function DropdownQuestionBuilder({
  question,
  onChange,
  onRemove,
  questionIndex
}: DropdownQuestionBuilderProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateQuestion = (field: keyof DropdownQuestionData, value: string | boolean | Array<any>) => {
    const updatedQuestion = { ...question, [field]: value };
    
    // Clear related errors
    const newErrors = { ...errors };
    delete newErrors[field];
    setErrors(newErrors);
    
    onChange(updatedQuestion);
  };

  const updateOption = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    const updatedOptions = question.options.map((opt, i) => {
      if (i === index) {
        // If setting this option as correct, unset all others (dropdown allows only one correct answer)
        if (field === 'isCorrect' && value === true) {
          return { ...opt, [field]: value };
        }
        return { ...opt, [field]: value };
      } else if (field === 'isCorrect' && value === true) {
        // Unset other options when setting one as correct
        return { ...opt, isCorrect: false };
      }
      return opt;
    });
    
    updateQuestion('options', updatedOptions);
  };

  const addOption = () => {
    const newOption = {
      text: '',
      isCorrect: false,
      orderIndex: question.options.length
    };
    updateQuestion('options', [...question.options, newOption]);
  };

  const removeOption = (index: number) => {
    if (question.options.length <= 2) return; // Minimum 2 options required
    
    const updatedOptions = question.options
      .filter((_, i) => i !== index)
      .map((opt, i) => ({ ...opt, orderIndex: i }));
    
    updateQuestion('options', updatedOptions);
  };

  const moveOption = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= question.options.length) return;

    const updatedOptions = [...question.options];
    [updatedOptions[index], updatedOptions[newIndex]] = [updatedOptions[newIndex], updatedOptions[index]];
    
    // Update order indices
    updatedOptions.forEach((opt, i) => {
      opt.orderIndex = i;
    });
    
    updateQuestion('options', updatedOptions);
  };

  const applyDropdownConfig = (configType: DropdownConfig) => {
    const config = DROPDOWN_CONFIGS[configType];
    // Apply all config settings at once
    const updatedQuestion = {
      ...question,
      placeholder: config.placeholder,
      allowSearch: config.allowSearch,
      showOptionNumbers: config.showOptionNumbers
    };
    onChange(updatedQuestion);
  };

  // Helper function to determine current dropdown style
  const getCurrentDropdownStyle = (): DropdownConfig | null => {
    for (const [key, config] of Object.entries(DROPDOWN_CONFIGS)) {
      if (
        question.placeholder === config.placeholder &&
        question.allowSearch === config.allowSearch &&
        question.showOptionNumbers === config.showOptionNumbers
      ) {
        return key as DropdownConfig;
      }
    }
    return null;
  };

  // Validate question
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    
    if (!question.text.trim()) {
      newErrors.text = 'Question text is required';
    }
    
    if (question.options.length < 2) {
      newErrors.options = 'At least 2 options are required';
    }
    
    const correctOptions = question.options.filter(opt => opt.isCorrect);
    if (correctOptions.length === 0) {
      newErrors.correctAnswer = 'Please select one correct answer';
    } else if (correctOptions.length > 1) {
      newErrors.correctAnswer = 'Dropdown questions can have only one correct answer';
    }
    
    const emptyOptions = question.options.filter(opt => !opt.text.trim());
    if (emptyOptions.length > 0) {
      newErrors.emptyOptions = 'All options must have text';
    }
    
    setErrors(newErrors);
  }, [question]);

  const renderPreview = () => {
    const placeholder = question.placeholder || 'Select an option...';
    const correctOption = question.options.find(opt => opt.isCorrect);
    
    return (
      <div className="space-y-3">
        <div className="text-white/90 mb-3">{question.text || 'Your question text will appear here'}</div>
        
        {/* Mock Dropdown */}
        <div className="relative">
          <div className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 flex items-center justify-between">
            <span>{placeholder}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {/* Preview Options */}
          <div className="mt-2 space-y-1">
            {question.options.map((option, index) => (
              <div
                key={index}
                className={`px-3 py-2 text-sm rounded border-l-2 ${
                  option.isCorrect
                    ? 'bg-green-400/10 border-green-400 text-green-300'
                    : 'bg-gray-800/30 border-gray-600 text-white/70'
                }`}
              >
                {question.showOptionNumbers ? `${index + 1}. ` : ''}
                {option.text || `Option ${index + 1}`}
                {option.isCorrect && <span className="ml-2 text-xs">(Correct)</span>}
              </div>
            ))}
          </div>
        </div>
        
        {/* Configuration indicators */}
        <div className="flex items-center space-x-4 text-xs">
          {question.allowSearch && (
            <div className="text-blue-400 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search enabled
            </div>
          )}
          {question.showOptionNumbers && (
            <div className="text-green-400 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              Numbers shown
            </div>
          )}
          {!question.allowSearch && !question.showOptionNumbers && (
            <div className="text-gray-400">Basic dropdown</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6 bg-gray-800/50 border border-gray-700 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white/90">
          Question {questionIndex + 1} - Dropdown Select
        </h3>
        <Button
          onClick={onRemove}
          variant="outline"
          size="sm"
          className="text-red-400 border-red-400/50 hover:bg-red-400/10"
        >
          Remove Question
        </Button>
      </div>

      {/* Question Text */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Question Text *
        </label>
        <Input
          value={question.text}
          onChange={(e) => updateQuestion('text', e.target.value)}
          placeholder="e.g., Which of the following is the capital of France?"
          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
        />
        {errors.text && (
          <p className="text-red-400 text-sm mt-1">{errors.text}</p>
        )}
      </div>

      {/* Dropdown Configuration Presets */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Dropdown Style *
        </label>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(DROPDOWN_CONFIGS).map(([key, config]) => {
            const isSelected = getCurrentDropdownStyle() === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => applyDropdownConfig(key as DropdownConfig)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'border-blue-400 bg-blue-400/10 text-blue-300'
                    : 'border-gray-600 bg-gray-800/30 text-white/80 hover:border-gray-500 hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{config.icon}</span>
                  <div>
                    <div className="font-medium">{config.name}</div>
                    <div className="text-xs text-gray-400">{config.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Configuration */}
      <div className="space-y-4">
        <h4 className="font-medium text-white/90">Custom Settings</h4>
        
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Placeholder Text
          </label>
          <Input
            value={question.placeholder || ''}
            onChange={(e) => updateQuestion('placeholder', e.target.value)}
            placeholder="Select an option..."
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
        </div>

        <div className="flex items-center space-x-6">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={question.allowSearch || false}
              onChange={(e) => updateQuestion('allowSearch', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-white/80">Enable search</span>
          </label>
          
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={question.showOptionNumbers || false}
              onChange={(e) => updateQuestion('showOptionNumbers', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-white/80">Number options</span>
          </label>
        </div>
      </div>

      {/* Options */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-white/70">
            Options * (Select one correct answer)
          </label>
          <Button
            type="button"
            onClick={addOption}
            variant="outline"
            size="sm"
            className="text-green-400 border-green-400/50 hover:bg-green-400/10"
          >
            Add Option
          </Button>
        </div>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`correct-${questionIndex}`}
                  checked={option.isCorrect}
                  onChange={(e) => updateOption(index, 'isCorrect', e.target.checked)}
                  className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 focus:ring-green-500"
                />
                <span className="text-xs text-white/60 w-8">#{index + 1}</span>
              </div>
              
              <Input
                value={option.text}
                onChange={(e) => updateOption(index, 'text', e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
              
              <div className="flex items-center space-x-1">
                <Button
                  type="button"
                  onClick={() => moveOption(index, 'up')}
                  disabled={index === 0}
                  variant="outline"
                  size="sm"
                  className="text-gray-400 border-gray-600 hover:bg-gray-600 disabled:opacity-50"
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  onClick={() => moveOption(index, 'down')}
                  disabled={index === question.options.length - 1}
                  variant="outline"
                  size="sm"
                  className="text-gray-400 border-gray-600 hover:bg-gray-600 disabled:opacity-50"
                >
                  ↓
                </Button>
                <Button
                  type="button"
                  onClick={() => removeOption(index)}
                  disabled={question.options.length <= 2}
                  variant="outline"
                  size="sm"
                  className="text-red-400 border-red-400/50 hover:bg-red-400/10 disabled:opacity-50"
                >
                  ×
                </Button>
              </div>
            </div>
          ))}
        </div>

        {errors.options && (
          <p className="text-red-400 text-sm mt-1">{errors.options}</p>
        )}
        {errors.correctAnswer && (
          <p className="text-red-400 text-sm mt-1">{errors.correctAnswer}</p>
        )}
        {errors.emptyOptions && (
          <p className="text-red-400 text-sm mt-1">{errors.emptyOptions}</p>
        )}
      </div>

      {/* Preview */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-3">
          Preview
        </label>
        <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600">
          {renderPreview()}
        </div>
      </div>

      <div className="text-xs text-gray-400 p-3 bg-gray-800/50 rounded-md">
        💡 <strong>Dropdown Questions:</strong> Perfect for single-choice selections from a list of options. 
        Great for categories, classifications, multiple choice with many options, or when you want to save screen space.
      </div>
    </div>
  );
}
