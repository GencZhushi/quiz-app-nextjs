'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface NumericQuestionData {
  text: string;
  type: 'NUMERIC';
  orderIndex: number;
  minValue?: number;
  maxValue?: number;
  decimalPlaces: number;
  unit?: string;
  correctAnswer: number;
  tolerance: number;
}

interface NumericQuestionBuilderProps {
  question: NumericQuestionData;
  onChange: (question: NumericQuestionData) => void;
  onRemove: () => void;
  questionIndex: number;
}

export function NumericQuestionBuilder({
  question,
  onChange,
  onRemove,
  questionIndex
}: NumericQuestionBuilderProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateQuestion = (field: keyof NumericQuestionData, value: any) => {
    const updatedQuestion = { ...question, [field]: value };
    
    // Clear related errors
    const newErrors = { ...errors };
    delete newErrors[field];
    
    // Validate ranges
    if (field === 'minValue' || field === 'maxValue' || field === 'correctAnswer') {
      const minVal = field === 'minValue' ? value : updatedQuestion.minValue;
      const maxVal = field === 'maxValue' ? value : updatedQuestion.maxValue;
      const correctVal = field === 'correctAnswer' ? value : updatedQuestion.correctAnswer;
      
      if (minVal !== undefined && maxVal !== undefined && minVal > maxVal) {
        newErrors.maxValue = 'Maximum value must be greater than minimum value';
      }
      
      if (minVal !== undefined && correctVal < minVal) {
        newErrors.correctAnswer = 'Correct answer must be within the specified range';
      }
      
      if (maxVal !== undefined && correctVal > maxVal) {
        newErrors.correctAnswer = 'Correct answer must be within the specified range';
      }
    }
    
    setErrors(newErrors);
    onChange(updatedQuestion);
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700 p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-white/90">
          Question {questionIndex + 1} - Numeric Input
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRemove}
          className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
        >
          Remove
        </Button>
      </div>

      <div className="space-y-4">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Question Text *
          </label>
          <Input
            type="text"
            value={question.text}
            onChange={(e) => updateQuestion('text', e.target.value)}
            placeholder="Enter your numeric question..."
            className="bg-gray-700 border-gray-600 text-white"
            required
          />
        </div>

        {/* Correct Answer */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Correct Answer *
          </label>
          <Input
            type="number"
            step={1 / Math.pow(10, question.decimalPlaces)}
            value={question.correctAnswer || ''}
            onChange={(e) => updateQuestion('correctAnswer', parseFloat(e.target.value) || 0)}
            placeholder="Enter the correct answer"
            className={`bg-gray-700 border-gray-600 text-white ${
              errors.correctAnswer ? 'border-red-500' : ''
            }`}
            required
          />
          {errors.correctAnswer && (
            <p className="text-sm text-red-400 mt-1">{errors.correctAnswer}</p>
          )}
        </div>

        {/* Range Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Minimum Value (Optional)
            </label>
            <Input
              type="number"
              value={question.minValue || ''}
              onChange={(e) => updateQuestion('minValue', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="No minimum"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Maximum Value (Optional)
            </label>
            <Input
              type="number"
              value={question.maxValue || ''}
              onChange={(e) => updateQuestion('maxValue', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="No maximum"
              className={`bg-gray-700 border-gray-600 text-white ${
                errors.maxValue ? 'border-red-500' : ''
              }`}
            />
            {errors.maxValue && (
              <p className="text-sm text-red-400 mt-1">{errors.maxValue}</p>
            )}
          </div>
        </div>

        {/* Decimal Places and Unit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Decimal Places
            </label>
            <select
              value={question.decimalPlaces}
              onChange={(e) => updateQuestion('decimalPlaces', parseInt(e.target.value))}
              className="w-full bg-gray-700 border-gray-600 text-white rounded px-3 py-2"
            >
              <option value={0}>0 (Whole numbers)</option>
              <option value={1}>1 decimal place</option>
              <option value={2}>2 decimal places</option>
              <option value={3}>3 decimal places</option>
              <option value={4}>4 decimal places</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Unit (Optional)
            </label>
            <Input
              type="text"
              value={question.unit || ''}
              onChange={(e) => updateQuestion('unit', e.target.value || undefined)}
              placeholder="e.g., meters, dollars, %"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </div>

        {/* Tolerance */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Tolerance (±)
          </label>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={question.tolerance}
            onChange={(e) => updateQuestion('tolerance', parseFloat(e.target.value) || 0)}
            placeholder="0 for exact match"
            className="bg-gray-700 border-gray-600 text-white"
          />
          <p className="text-xs text-white/60 mt-1">
            Answers within ±{question.tolerance} of the correct answer will be accepted as correct
          </p>
        </div>

        {/* Preview */}
        <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white/90 mb-2">Preview:</h4>
          <div className="space-y-2">
            <p className="text-white/80">{question.text || 'Enter your question text above'}</p>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder={`Enter a number${question.unit ? ` (${question.unit})` : ''}`}
                className="bg-gray-600 border-gray-500 text-white rounded px-3 py-2"
                disabled
              />
              {question.unit && (
                <span className="text-sm text-white/70">{question.unit}</span>
              )}
            </div>
            {(question.minValue !== undefined || question.maxValue !== undefined) && (
              <p className="text-xs text-white/60">
                {question.minValue !== undefined && question.maxValue !== undefined
                  ? `Range: ${question.minValue} to ${question.maxValue}`
                  : question.minValue !== undefined
                  ? `Minimum: ${question.minValue}`
                  : `Maximum: ${question.maxValue}`
                }
                {question.unit && ` ${question.unit}`}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default NumericQuestionBuilder;
