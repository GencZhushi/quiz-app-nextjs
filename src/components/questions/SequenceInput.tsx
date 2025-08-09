'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface SequenceOption {
  id: string;
  text: string;
  orderIndex: number;
}

interface SequenceInputProps {
  questionId: string;
  questionText: string;
  options: SequenceOption[];
  onAnswerChange: (questionId: string, answer: { type: 'SEQUENCE'; sequence: string[] }) => void;
  disabled?: boolean;
  initialAnswer?: string[];
  showError?: boolean;
  errorMessage?: string;
}

export default function SequenceInput({
  questionId,
  questionText,
  options,
  onAnswerChange,
  disabled = false,
  initialAnswer = [],
  showError = false,
  errorMessage
}: SequenceInputProps) {
  // Initialize sequence with shuffled options or provided initial answer
  const [sequence, setSequence] = useState<SequenceOption[]>(() => {
    if (initialAnswer.length > 0) {
      // Reconstruct sequence from initial answer
      return initialAnswer.map(id => options.find(opt => opt.id === id)).filter(Boolean) as SequenceOption[];
    }
    
    // Shuffle options for initial display
    const shuffled = [...options].sort(() => Math.random() - 0.5);
    return shuffled;
  });

  // Update parent component when sequence changes
  useEffect(() => {
    const sequenceIds = sequence.map(item => item.id);
    onAnswerChange(questionId, {
      type: 'SEQUENCE',
      sequence: sequenceIds
    });
  }, [sequence, questionId, onAnswerChange]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || disabled) {
      return;
    }

    const items = Array.from(sequence);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSequence(items);
  };

  const resetSequence = () => {
    if (disabled) return;
    
    // Shuffle the options again
    const shuffled = [...options].sort(() => Math.random() - 0.5);
    setSequence(shuffled);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-medium text-white/90">{questionText}</h3>
        <button
          onClick={resetSequence}
          disabled={disabled}
          className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white/80 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Shuffle
        </button>
      </div>
      
      <div className="text-sm text-white/70 mb-4">
        Drag and drop the items below to arrange them in the correct order:
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sequence">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-2 p-4 rounded-lg border-2 border-dashed transition-colors ${
                snapshot.isDraggingOver
                  ? 'border-blue-400 bg-blue-400/10'
                  : 'border-gray-600 bg-gray-800/30'
              }`}
            >
              {sequence.map((item, index) => (
                <Draggable
                  key={item.id}
                  draggableId={item.id}
                  index={index}
                  isDragDisabled={disabled}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`p-4 rounded-lg border transition-all duration-200 ${
                        snapshot.isDragging
                          ? 'bg-blue-600 border-blue-400 shadow-lg scale-105 rotate-2'
                          : disabled
                          ? 'bg-gray-700 border-gray-600 cursor-not-allowed opacity-60'
                          : 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-gray-500 cursor-grab active:cursor-grabbing'
                      }`}
                      style={{
                        ...provided.draggableProps.style,
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white/80 text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1 text-white/90">{item.text}</div>
                        <div className="flex-shrink-0 text-gray-400">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 8h16M4 16h16"
                            />
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

      {showError && errorMessage && (
        <div className="text-red-400 text-sm mt-2 p-3 bg-red-400/10 border border-red-400/20 rounded-md">
          {errorMessage}
        </div>
      )}

      <div className="text-xs text-gray-400 mt-3">
        💡 Tip: Click and drag items to reorder them. Use the shuffle button to randomize the order.
      </div>
    </div>
  );
}
