'use client';

import React, { useState, useEffect } from 'react';

interface RatingInputProps {
  questionId: string;
  questionText: string;
  ratingMin: number;
  ratingMax: number;
  ratingType: 'stars' | 'numbers' | 'emoji' | 'likert';
  ratingLabels?: string[];
  onAnswerChange: (questionId: string, answer: { type: 'RATING'; rating: number }) => void;
  disabled?: boolean;
  initialAnswer?: number;
  showError?: boolean;
  errorMessage?: string;
}

export default function RatingInput({
  questionId,
  questionText,
  ratingMin,
  ratingMax,
  ratingType,
  ratingLabels = [],
  onAnswerChange,
  disabled = false,
  initialAnswer,
  showError = false,
  errorMessage
}: RatingInputProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(initialAnswer || null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  // Update parent component when rating changes
  useEffect(() => {
    if (selectedRating !== null) {
      onAnswerChange(questionId, {
        type: 'RATING',
        rating: selectedRating
      });
    }
  }, [selectedRating, questionId, onAnswerChange]);

  const handleRatingClick = (rating: number) => {
    if (disabled) return;
    setSelectedRating(rating);
  };

  const handleRatingHover = (rating: number | null) => {
    if (disabled) return;
    setHoveredRating(rating);
  };

  const getRatingLabel = (rating: number): string => {
    const index = rating - ratingMin;
    return ratingLabels[index] || `${rating}`;
  };

  const renderStarRating = () => {
    const stars = [];
    for (let i = ratingMin; i <= ratingMax; i++) {
      const isSelected = selectedRating !== null && i <= selectedRating;
      const isHovered = hoveredRating !== null && i <= hoveredRating;
      const isActive = isSelected || isHovered;

      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleRatingClick(i)}
          onMouseEnter={() => handleRatingHover(i)}
          onMouseLeave={() => handleRatingHover(null)}
          disabled={disabled}
          className={`text-3xl transition-all duration-200 ${
            disabled
              ? 'cursor-not-allowed opacity-50'
              : 'cursor-pointer hover:scale-110'
          } ${
            isActive
              ? 'text-yellow-400'
              : 'text-gray-600 hover:text-yellow-300'
          }`}
          aria-label={`Rate ${i} stars`}
        >
          ★
        </button>
      );
    }
    return stars;
  };

  const renderNumberRating = () => {
    const numbers = [];
    for (let i = ratingMin; i <= ratingMax; i++) {
      const isSelected = selectedRating === i;
      const isHovered = hoveredRating === i;

      numbers.push(
        <button
          key={i}
          type="button"
          onClick={() => handleRatingClick(i)}
          onMouseEnter={() => handleRatingHover(i)}
          onMouseLeave={() => handleRatingHover(null)}
          disabled={disabled}
          className={`w-12 h-12 rounded-full border-2 font-semibold transition-all duration-200 ${
            disabled
              ? 'cursor-not-allowed opacity-50'
              : 'cursor-pointer hover:scale-105'
          } ${
            isSelected || isHovered
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'bg-gray-700 border-gray-600 text-white/80 hover:bg-gray-600 hover:border-gray-500'
          }`}
          aria-label={`Rate ${i}`}
        >
          {i}
        </button>
      );
    }
    return numbers;
  };

  const renderEmojiRating = () => {
    const emojiMap: Record<number, string> = {
      1: '😞',
      2: '😟',
      3: '😐',
      4: '😊',
      5: '😍',
      6: '🤩',
      7: '🥳'
    };

    const emojis = [];
    for (let i = ratingMin; i <= ratingMax; i++) {
      const isSelected = selectedRating === i;
      const isHovered = hoveredRating === i;
      const emoji = emojiMap[i] || '😐';

      emojis.push(
        <button
          key={i}
          type="button"
          onClick={() => handleRatingClick(i)}
          onMouseEnter={() => handleRatingHover(i)}
          onMouseLeave={() => handleRatingHover(null)}
          disabled={disabled}
          className={`text-4xl transition-all duration-200 p-2 rounded-full ${
            disabled
              ? 'cursor-not-allowed opacity-50'
              : 'cursor-pointer hover:scale-110'
          } ${
            isSelected || isHovered
              ? 'bg-blue-600/20 ring-2 ring-blue-400'
              : 'hover:bg-gray-700/50'
          }`}
          aria-label={`Rate ${i} - ${emoji}`}
        >
          {emoji}
        </button>
      );
    }
    return emojis;
  };

  const renderLikertRating = () => {
    const options = [];
    for (let i = ratingMin; i <= ratingMax; i++) {
      const isSelected = selectedRating === i;
      const label = getRatingLabel(i);

      options.push(
        <label
          key={i}
          className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
            disabled
              ? 'cursor-not-allowed opacity-50'
              : 'cursor-pointer hover:bg-gray-700/50'
          } ${
            isSelected
              ? 'bg-blue-600/20 border-blue-400 text-blue-300'
              : 'bg-gray-800/50 border-gray-600 text-white/80 hover:border-gray-500'
          }`}
        >
          <input
            type="radio"
            name={`rating-${questionId}`}
            value={i}
            checked={isSelected}
            onChange={() => handleRatingClick(i)}
            disabled={disabled}
            className="sr-only"
          />
          <div
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              isSelected
                ? 'border-blue-400 bg-blue-600'
                : 'border-gray-500'
            }`}
          >
            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
          <span className="text-sm font-medium">{label}</span>
        </label>
      );
    }
    return options;
  };

  const renderRatingInterface = () => {
    switch (ratingType) {
      case 'stars':
        return (
          <div className="flex items-center space-x-1 justify-center">
            {renderStarRating()}
          </div>
        );
      case 'numbers':
        return (
          <div className="flex items-center space-x-2 justify-center flex-wrap">
            {renderNumberRating()}
          </div>
        );
      case 'emoji':
        return (
          <div className="flex items-center space-x-2 justify-center flex-wrap">
            {renderEmojiRating()}
          </div>
        );
      case 'likert':
        return (
          <div className="space-y-2">
            {renderLikertRating()}
          </div>
        );
      default:
        return renderNumberRating();
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-white/90">{questionText}</h3>
      
      <div className="space-y-4">
        {renderRatingInterface()}
        
        {/* Show selected rating feedback */}
        {selectedRating !== null && (
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600/20 border border-blue-400/30 rounded-lg">
              <span className="text-blue-300 text-sm font-medium">
                Selected: {getRatingLabel(selectedRating)}
              </span>
            </div>
          </div>
        )}
        
        {/* Show scale labels if available */}
        {ratingType !== 'likert' && ratingLabels.length > 0 && (
          <div className="flex justify-between text-xs text-gray-400 px-2">
            <span>{ratingLabels[0]}</span>
            {ratingLabels.length > 2 && ratingLabels[ratingLabels.length - 1] && (
              <span>{ratingLabels[ratingLabels.length - 1]}</span>
            )}
          </div>
        )}
      </div>

      {showError && errorMessage && (
        <div className="text-red-400 text-sm mt-2 p-3 bg-red-400/10 border border-red-400/20 rounded-md">
          {errorMessage}
        </div>
      )}

      <div className="text-xs text-gray-400 mt-3 text-center">
        💡 Tip: {ratingType === 'stars' ? 'Click on the stars' : 
                ratingType === 'emoji' ? 'Click on the emoji that represents your feeling' :
                ratingType === 'likert' ? 'Select the option that best represents your opinion' :
                'Click on a number'} to rate this item.
      </div>
    </div>
  );
}
