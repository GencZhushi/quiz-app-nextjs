'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RATING_TYPES, getDefaultLabels } from '@/lib/validation/ratingQuestion';

interface RatingQuestionData {
  text: string;
  type: 'RATING';
  orderIndex: number;
  ratingMin: number;
  ratingMax: number;
  ratingType: 'stars' | 'numbers' | 'emoji' | 'likert';
  ratingLabels?: string[];
}

interface RatingQuestionBuilderProps {
  question: RatingQuestionData;
  onChange: (question: RatingQuestionData) => void;
  onRemove: () => void;
  questionIndex: number;
}

export default function RatingQuestionBuilder({
  question,
  onChange,
  onRemove,
  questionIndex
}: RatingQuestionBuilderProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customLabels, setCustomLabels] = useState<string[]>(
    question.ratingLabels || getDefaultLabels(question.ratingType, question.ratingMax - question.ratingMin + 1)
  );

  const updateQuestion = (field: keyof RatingQuestionData, value: string | number | string[]) => {
    const updatedQuestion = { ...question, [field]: value };
    
    // Clear related errors
    const newErrors = { ...errors };
    delete newErrors[field];
    setErrors(newErrors);
    
    onChange(updatedQuestion);
  };

  const updateRatingType = (newType: 'stars' | 'numbers' | 'emoji' | 'likert') => {
    const typeConfig = RATING_TYPES[newType];
    const newMin = typeConfig.defaultMin;
    const newMax = typeConfig.defaultMax;
    const scale = newMax - newMin + 1;
    
    const newLabels = getDefaultLabels(newType, scale);
    setCustomLabels(newLabels);
    
    const updatedQuestion = {
      ...question,
      ratingType: newType,
      ratingMin: newMin,
      ratingMax: newMax,
      ratingLabels: newLabels
    };
    
    onChange(updatedQuestion);
  };

  const updateScale = (min: number, max: number) => {
    if (max <= min) return;
    
    const scale = max - min + 1;
    const newLabels = getDefaultLabels(question.ratingType, scale);
    setCustomLabels(newLabels);
    
    const updatedQuestion = {
      ...question,
      ratingMin: min,
      ratingMax: max,
      ratingLabels: newLabels
    };
    
    onChange(updatedQuestion);
  };

  const updateCustomLabel = (index: number, label: string) => {
    const newLabels = [...customLabels];
    newLabels[index] = label;
    setCustomLabels(newLabels);
    updateQuestion('ratingLabels', newLabels);
  };

  const resetToDefaultLabels = () => {
    const scale = question.ratingMax - question.ratingMin + 1;
    const defaultLabels = getDefaultLabels(question.ratingType, scale);
    setCustomLabels(defaultLabels);
    updateQuestion('ratingLabels', defaultLabels);
  };

  // Validate question
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    
    if (!question.text.trim()) {
      newErrors.text = 'Question text is required';
    }
    
    if (question.ratingMax <= question.ratingMin) {
      newErrors.scale = 'Maximum rating must be greater than minimum rating';
    }
    
    if (question.ratingMin < 1 || question.ratingMax > 10) {
      newErrors.scale = 'Rating scale must be between 1 and 10';
    }
    
    setErrors(newErrors);
  }, [question]);

  const renderPreview = () => {
    const scale = question.ratingMax - question.ratingMin + 1;
    
    switch (question.ratingType) {
      case 'stars':
        return (
          <div className="flex items-center space-x-1 justify-center">
            {Array.from({ length: scale }, (_, i) => (
              <span key={i} className="text-2xl text-yellow-400">★</span>
            ))}
          </div>
        );
      case 'numbers':
        return (
          <div className="flex items-center space-x-2 justify-center flex-wrap">
            {Array.from({ length: scale }, (_, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center">
                {question.ratingMin + i}
              </div>
            ))}
          </div>
        );
      case 'emoji':
        const emojiMap = ['😞', '😟', '😐', '😊', '😍', '🤩', '🥳'];
        return (
          <div className="flex items-center space-x-2 justify-center flex-wrap">
            {Array.from({ length: scale }, (_, i) => (
              <span key={i} className="text-2xl">{emojiMap[i] || '😐'}</span>
            ))}
          </div>
        );
      case 'likert':
        return (
          <div className="space-y-1">
            {customLabels.slice(0, scale).map((label, i) => (
              <div key={i} className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 rounded-full border-2 border-blue-400"></div>
                <span className="text-white/80">{label}</span>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gray-800/50 border border-gray-700 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white/90">
          Question {questionIndex + 1} - Rating Scale
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
          placeholder="e.g., How satisfied are you with this service?"
          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
        />
        {errors.text && (
          <p className="text-red-400 text-sm mt-1">{errors.text}</p>
        )}
      </div>

      {/* Rating Type Selection */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Rating Type *
        </label>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(RATING_TYPES).map(([key, config]: [string, any]) => (
            <button
              key={key}
              type="button"
              onClick={() => updateRatingType(key as any)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                question.ratingType === key
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
          ))}
        </div>
      </div>

      {/* Scale Configuration */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Rating Scale *
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/60 mb-1">Minimum</label>
            <select
              className="w-full px-3 py-2 bg-gray-700 border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={question.ratingMin}
              onChange={(e) => updateScale(parseInt(e.target.value), question.ratingMax)}
            >
              {[1, 2, 3].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1">Maximum</label>
            <select
              className="w-full px-3 py-2 bg-gray-700 border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={question.ratingMax}
              onChange={(e) => updateScale(question.ratingMin, parseInt(e.target.value))}
            >
              {[3, 4, 5, 6, 7, 8, 9, 10].filter(num => num > question.ratingMin).map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        </div>
        {errors.scale && (
          <p className="text-red-400 text-sm mt-1">{errors.scale}</p>
        )}
      </div>

      {/* Custom Labels */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-white/70">
            Custom Labels (Optional)
          </label>
          <Button
            type="button"
            onClick={resetToDefaultLabels}
            variant="outline"
            size="sm"
            className="text-gray-400 border-gray-600 hover:bg-gray-700"
          >
            Reset to Default
          </Button>
        </div>
        
        <div className="space-y-2">
          {customLabels.slice(0, question.ratingMax - question.ratingMin + 1).map((label, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white/80 text-sm font-medium">
                {question.ratingMin + index}
              </div>
              <Input
                value={label}
                onChange={(e) => updateCustomLabel(index, e.target.value)}
                placeholder={`Label for ${question.ratingMin + index}`}
                className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-3">
          Preview
        </label>
        <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600">
          <div className="text-white/90 mb-4">{question.text || 'Your question text will appear here'}</div>
          {renderPreview()}
        </div>
      </div>

      <div className="text-xs text-gray-400 p-3 bg-gray-800/50 rounded-md">
        💡 <strong>Rating Questions:</strong> Perfect for surveys, feedback, satisfaction ratings, and opinion scales. 
        Students can provide quantitative feedback that's easy to analyze.
      </div>
    </div>
  );
}
