'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SequenceOption {
  id: string;
  text: string;
  orderIndex: number;
  isCorrect: boolean;
}

interface SequenceQuestionData {
  text: string;
  type: 'SEQUENCE';
  orderIndex: number;
  options: SequenceOption[];
  correctSequence?: string[];
}

interface SequenceQuestionBuilderProps {
  question: SequenceQuestionData;
  onChange: (question: SequenceQuestionData) => void;
  onRemove: () => void;
  questionIndex: number;
}

export default function SequenceQuestionBuilder({
  question,
  onChange,
  onRemove,
  questionIndex
}: SequenceQuestionBuilderProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [correctSequence, setCorrectSequence] = useState<SequenceOption[]>(() => {
    // Initialize correct sequence from question data or default order
    if (question.correctSequence && question.correctSequence.length > 0) {
      return question.correctSequence
        .map(id => question.options.find(opt => opt.id === id))
        .filter(Boolean) as SequenceOption[];
    }
    return [...question.options];
  });

  const updateQuestion = (field: keyof SequenceQuestionData, value: string | SequenceOption[] | string[]) => {
    const updatedQuestion = { ...question, [field]: value };
    
    // Clear related errors
    const newErrors = { ...errors };
    delete newErrors[field];
    setErrors(newErrors);
    
    onChange(updatedQuestion);
  };

  const addOption = () => {
    const newOption: SequenceOption = {
      id: `option_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: '',
      orderIndex: question.options.length,
      isCorrect: false // Not used for sequence questions
    };
    
    const updatedOptions = [...question.options, newOption];
    const updatedCorrectSequence = [...correctSequence, newOption];
    
    updateQuestion('options', updatedOptions);
    setCorrectSequence(updatedCorrectSequence);
    updateCorrectSequence(updatedCorrectSequence);
  };

  const removeOption = (index: number) => {
    if (question.options.length <= 2) return; // Minimum 2 options required
    
    const optionToRemove = question.options[index];
    const updatedOptions = question.options.filter((_, i) => i !== index);
    const updatedCorrectSequence = correctSequence.filter(opt => opt.id !== optionToRemove.id);
    
    updateQuestion('options', updatedOptions);
    setCorrectSequence(updatedCorrectSequence);
    updateCorrectSequence(updatedCorrectSequence);
  };

  const updateOption = (index: number, field: keyof SequenceOption, value: string) => {
    const updatedOptions = question.options.map((option, i) => 
      i === index ? { ...option, [field]: value } : option
    );
    
    // Update correct sequence to reflect text changes
    const updatedCorrectSequence = correctSequence.map(seqOption => {
      const updatedOption = updatedOptions.find(opt => opt.id === seqOption.id);
      return updatedOption || seqOption;
    });
    
    updateQuestion('options', updatedOptions);
    setCorrectSequence(updatedCorrectSequence);
    updateCorrectSequence(updatedCorrectSequence);
  };

  const handleCorrectSequenceDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(correctSequence);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCorrectSequence(items);
    updateCorrectSequence(items);
  };

  const updateCorrectSequence = (sequence: SequenceOption[]) => {
    const sequenceIds = sequence.map(option => option.id);
    updateQuestion('correctSequence', sequenceIds);
  };

  const shuffleCorrectSequence = () => {
    const shuffled = [...correctSequence].sort(() => Math.random() - 0.5);
    setCorrectSequence(shuffled);
    updateCorrectSequence(shuffled);
  };

  // Validate question
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    
    if (!question.text.trim()) {
      newErrors.text = 'Question text is required';
    }
    
    if (question.options.length < 2) {
      newErrors.options = 'At least 2 items are required for sequencing';
    }
    
    const hasEmptyOptions = question.options.some(opt => !opt.text.trim());
    if (hasEmptyOptions) {
      newErrors.options = 'All sequence items must have text';
    }
    
    setErrors(newErrors);
  }, [question]);

  return (
    <div className="space-y-6 p-6 bg-gray-800/50 border border-gray-700 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white/90">
          Question {questionIndex + 1} - Sequence Ordering
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
          placeholder="e.g., Arrange these historical events in chronological order:"
          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
        />
        {errors.text && (
          <p className="text-red-400 text-sm mt-1">{errors.text}</p>
        )}
      </div>

      {/* Sequence Items */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Sequence Items *
        </label>
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <div key={option.id} className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white/80 text-sm font-medium">
                {index + 1}
              </div>
              <Input
                value={option.text}
                onChange={(e) => updateOption(index, 'text', e.target.value)}
                placeholder={`Item ${index + 1}`}
                className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
              <Button
                onClick={() => removeOption(index)}
                disabled={question.options.length <= 2}
                variant="outline"
                size="sm"
                className="text-red-400 border-red-400/50 hover:bg-red-400/10 disabled:opacity-50"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
        
        <Button
          onClick={addOption}
          variant="outline"
          size="sm"
          className="mt-3 text-blue-400 border-blue-400/50 hover:bg-blue-400/10"
        >
          Add Item
        </Button>
        
        {errors.options && (
          <p className="text-red-400 text-sm mt-2">{errors.options}</p>
        )}
      </div>

      {/* Correct Sequence Configuration */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-white/70">
            Correct Sequence *
          </label>
          <Button
            onClick={shuffleCorrectSequence}
            variant="outline"
            size="sm"
            className="text-gray-400 border-gray-600 hover:bg-gray-700"
          >
            Shuffle
          </Button>
        </div>
        
        <div className="text-sm text-white/60 mb-3">
          Drag and drop to set the correct order:
        </div>

        <DragDropContext onDragEnd={handleCorrectSequenceDragEnd}>
          <Droppable droppableId="correct-sequence">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`space-y-2 p-4 rounded-lg border-2 border-dashed transition-colors ${
                  snapshot.isDraggingOver
                    ? 'border-green-400 bg-green-400/10'
                    : 'border-gray-600 bg-gray-800/30'
                }`}
              >
                {correctSequence.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`p-3 rounded-lg border transition-all duration-200 ${
                          snapshot.isDragging
                            ? 'bg-green-600 border-green-400 shadow-lg scale-105'
                            : 'bg-gray-700 border-gray-600 hover:bg-gray-600 cursor-grab active:cursor-grabbing'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1 text-white/90">{item.text || `Item ${index + 1}`}</div>
                          <div className="flex-shrink-0 text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <div className="text-xs text-gray-400 p-3 bg-gray-800/50 rounded-md">
        💡 <strong>Sequence Questions:</strong> Students will drag and drop items to arrange them in the correct order. 
        Perfect for timelines, processes, rankings, or step-by-step procedures.
      </div>
    </div>
  );
}
