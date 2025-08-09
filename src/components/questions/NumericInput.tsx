'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { validateNumericInput } from '@/lib/grading/numericGrader';

interface NumericQuestion {
  id: string;
  text: string;
  type: 'NUMERIC';
  minValue?: number;
  maxValue?: number;
  decimalPlaces: number;
  unit?: string;
  correctAnswer: number;
  tolerance: number;
}

interface NumericInputProps {
  question: NumericQuestion;
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
  showValidation?: boolean;
}

export function NumericInput({ 
  question, 
  value, 
  onChange, 
  disabled = false,
  showValidation = true 
}: NumericInputProps) {
  const [inputValue, setInputValue] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Sync input value with prop value
  useEffect(() => {
    if (value !== null) {
      setInputValue(value.toString());
    } else {
      setInputValue('');
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInputValue = e.target.value;
    setInputValue(newInputValue);
    
    if (!newInputValue.trim()) {
      onChange(null);
      setError('');
      return;
    }

    if (showValidation) {
      const validation = validateNumericInput(
        newInputValue,
        question.minValue,
        question.maxValue
      );
      
      if (validation.isValid && validation.value !== undefined) {
        onChange(validation.value);
        setError('');
      } else {
        onChange(null);
        setError(validation.error || '');
      }
    } else {
      // For quiz builder, allow any numeric input without validation
      const numericValue = parseFloat(newInputValue);
      if (!isNaN(numericValue) && isFinite(numericValue)) {
        onChange(numericValue);
        setError('');
      } else {
        onChange(null);
        setError('Please enter a valid number');
      }
    }
  };

  const stepValue = question.decimalPlaces > 0 
    ? 1 / Math.pow(10, question.decimalPlaces)
    : 1;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white/90">
        {question.text}
      </label>
      
      {/* Show range hint if min/max values are specified */}
      {showValidation && (question.minValue !== undefined || question.maxValue !== undefined) && (
        <p className="text-xs text-white/70">
          {question.minValue !== undefined && question.maxValue !== undefined
            ? `Enter a value between ${question.minValue} and ${question.maxValue}`
            : question.minValue !== undefined
            ? `Enter a value of ${question.minValue} or greater`
            : `Enter a value of ${question.maxValue} or less`
          }
          {question.unit && ` (in ${question.unit})`}
        </p>
      )}
      
      <div className="flex items-center space-x-2">
        <Input
          type="number"
          step={stepValue}
          min={question.minValue}
          max={question.maxValue}
          value={inputValue}
          onChange={handleInputChange}
          disabled={disabled}
          placeholder={`Enter a number${question.unit ? ` (${question.unit})` : ''}`}
          className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${
            error ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'
          }`}
        />
        
        {question.unit && (
          <span className="text-sm text-white/70 font-medium min-w-fit">
            {question.unit}
          </span>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      
      {/* Show decimal places hint */}
      {question.decimalPlaces > 0 && (
        <p className="text-xs text-white/60">
          Answer will be rounded to {question.decimalPlaces} decimal place{question.decimalPlaces !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

export default NumericInput;
