'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import NumericQuestionBuilder from '@/components/quiz-builder/NumericQuestionBuilder';
import SequenceQuestionBuilder from '@/components/quiz-builder/SequenceQuestionBuilder';
import RatingQuestionBuilder from '@/components/quiz-builder/RatingQuestionBuilder';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type QuestionType = 'SINGLE' | 'MULTIPLE' | 'TEXT' | 'NUMERIC' | 'SEQUENCE' | 'RATING';

interface Option {
  text: string;
  isCorrect: boolean;
  orderIndex: number;
}

interface Question {
  text: string;
  type: QuestionType;
  orderIndex: number;
  options: Option[];
  // Numeric question fields
  minValue?: number;
  maxValue?: number;
  decimalPlaces?: number;
  unit?: string;
  correctAnswer?: number;
  tolerance?: number;
  // Sequence question fields
  correctSequence?: string[];
  // Rating question fields
  ratingMin?: number;
  ratingMax?: number;
  ratingLabels?: string[];
  ratingType?: 'stars' | 'numbers' | 'emoji' | 'likert';
}

interface Quiz {
  title: string;
  description: string;
  questions: Question[];
}

export default function NewQuizPage() {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz>({
    title: '',
    description: '',
    questions: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addQuestion = () => {
    const newQuestion: Question = {
      text: '',
      type: 'SINGLE',
      orderIndex: quiz.questions.length,
      options: [
        { text: '', isCorrect: false, orderIndex: 0 },
        { text: '', isCorrect: true, orderIndex: 1 }
      ],
      // Default numeric fields
      decimalPlaces: 2,
      tolerance: 0,
      // Default sequence fields
      correctSequence: []
    };
    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const removeQuestion = (index: number) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const updateQuestion = (index: number, field: keyof Question, value: string | QuestionType | Option[] | number | undefined | string[]) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i === index) {
          const updated = { ...q, [field]: value };
          
          // Reset options when changing question type
          if (field === 'type') {
            if (value === 'TEXT' || value === 'NUMERIC') {
              updated.options = [];
            } else if (value === 'SINGLE' && q.type !== 'SINGLE') {
              updated.options = [
                { text: '', isCorrect: false, orderIndex: 0 },
                { text: '', isCorrect: true, orderIndex: 1 }
              ];
            } else if (value === 'MULTIPLE' && q.type !== 'MULTIPLE') {
              updated.options = [
                { text: '', isCorrect: true, orderIndex: 0 },
                { text: '', isCorrect: false, orderIndex: 1 }
              ];
            } else if (value === 'SEQUENCE' && q.type !== 'SEQUENCE') {
              updated.options = [
                { text: 'First item', isCorrect: false, orderIndex: 0 },
                { text: 'Second item', isCorrect: false, orderIndex: 1 },
              ];
              updated.correctSequence = ['First item', 'Second item'];
            } else if (value === 'RATING' && q.type !== 'RATING') {
              updated.ratingMin = 1;
              updated.ratingMax = 5;
              updated.ratingType = 'stars';
              updated.ratingLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
            }
            
            // Set default numeric values when switching to NUMERIC
            if (value === 'NUMERIC') {
              updated.minValue = 0;
              updated.maxValue = 100;
              updated.decimalPlaces = 2;
              updated.tolerance = 0;
              updated.correctAnswer = 0;
            }
          }
          
          return updated;
        }
        return q;
      })
    }));
  };

  const addOption = (questionIndex: number) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i === questionIndex) {
          return {
            ...q,
            options: [...q.options, {
              text: '',
              isCorrect: false,
              orderIndex: q.options.length
            }]
          };
        }
        return q;
      })
    }));
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i === questionIndex) {
          return {
            ...q,
            options: q.options.filter((_, oi) => oi !== optionIndex)
          };
        }
        return q;
      })
    }));
  };

  const updateOption = (questionIndex: number, optionIndex: number, field: keyof Option, value: string | boolean | number) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i === questionIndex) {
          return {
            ...q,
            options: q.options.map((o, oi) => {
              if (oi === optionIndex) {
                const updated = { ...o, [field]: value };
                
                // For single choice, uncheck other options when one is checked
                if (field === 'isCorrect' && value && q.type === 'SINGLE') {
                  return updated;
                }
                
                return updated;
              } else if (field === 'isCorrect' && value && q.type === 'SINGLE') {
                // Uncheck other options for single choice
                return { ...o, isCorrect: false };
              }
              return o;
            })
          };
        }
        return q;
      })
    }));
  };

  const validateQuiz = (): string | null => {
    if (!quiz.title.trim()) {
      return 'Quiz title is required';
    }

    if (quiz.questions.length === 0) {
      return 'At least one question is required';
    }

    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      
      if (!question.text.trim()) {
        return `Question ${i + 1} text is required`;
      }

      if (question.type === 'SINGLE' || question.type === 'MULTIPLE') {
        if (question.options.length < 2) {
          return `Question ${i + 1} must have at least 2 options`;
        }

        const correctOptions = question.options.filter(opt => opt.isCorrect);
        if (question.type === 'SINGLE' && correctOptions.length !== 1) {
          return `Question ${i + 1} must have exactly one correct option`;
        }

        if (question.type === 'MULTIPLE' && correctOptions.length === 0) {
          return `Question ${i + 1} must have at least one correct option`;
        }
      }

      // Validate numeric questions
      if (question.type === 'NUMERIC') {
        if (question.correctAnswer === undefined || question.correctAnswer === null) {
          return `Question ${i + 1} must have a correct answer`;
        }

        if (question.minValue !== undefined && question.maxValue !== undefined) {
          if (question.minValue > question.maxValue) {
            return `Question ${i + 1}: Minimum value must be less than or equal to maximum value`;
          }

          if (question.correctAnswer < question.minValue || question.correctAnswer > question.maxValue) {
            return `Question ${i + 1}: Correct answer must be within the specified range`;
          }
        }

        if (question.tolerance !== undefined && question.tolerance < 0) {
          return `Question ${i + 1}: Tolerance must be non-negative`;
        }
      }

      // Validate sequence questions
      if (question.type === 'SEQUENCE') {
        if (question.options.length < 2) {
          return `Question ${i + 1}: Sequence questions must have at least 2 items to order`;
        }

        const hasEmptyItems = question.options.some(opt => !opt.text.trim());
        if (hasEmptyItems) {
          return `Question ${i + 1}: All sequence items must have text`;
        }
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateQuiz();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quiz),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create quiz');
      }
      
      await response.json();
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Quiz</h1>
        <p className="text-gray-600">Build an engaging quiz with multiple question types</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quiz Details */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quiz Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Quiz Title *</label>
              <Input
                type="text"
                value={quiz.title}
                onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter quiz title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={quiz.description}
                onChange={(e) => setQuiz(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter quiz description (optional)"
              />
            </div>
          </div>
        </Card>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Questions</h2>
            <Button type="button" onClick={addQuestion}>
              Add Question
            </Button>
          </div>

          {quiz.questions.map((question, qIndex) => (
            <Card key={qIndex} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium">Question {qIndex + 1}</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeQuestion(qIndex)}
                >
                  Remove
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Question Text *</label>
                  <Input
                    type="text"
                    value={question.text}
                    onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                    placeholder="Enter your question"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Question Type</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={question.type}
                    onChange={(e) => updateQuestion(qIndex, 'type', e.target.value as QuestionType)}
                  >
                    <option value="SINGLE">Single Choice</option>
                    <option value="MULTIPLE">Multiple Choice</option>
                    <option value="TEXT">Text Answer</option>
                    <option value="NUMERIC">Numeric Input</option>
                    <option value="SEQUENCE">Sequence Ordering</option>
                    <option value="RATING">Rating Scale</option>
                  </select>
                </div>

                {/* Numeric question fields */}
                {question.type === 'NUMERIC' && (
                  <div className="space-y-4 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                    <h4 className="font-medium text-white/90">Numeric Question Settings</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-1">Correct Answer *</label>
                        <Input
                          type="number"
                          step={question.decimalPlaces ? 1 / Math.pow(10, question.decimalPlaces) : 1}
                          value={question.correctAnswer || ''}
                          onChange={(e) => updateQuestion(qIndex, 'correctAnswer', parseFloat(e.target.value) || 0)}
                          placeholder="Enter correct answer"
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-1">Unit (Optional)</label>
                        <Input
                          type="text"
                          value={question.unit || ''}
                          onChange={(e) => updateQuestion(qIndex, 'unit', e.target.value || undefined)}
                          placeholder="e.g., meters, dollars, %"
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-1">Min Value</label>
                        <Input
                          type="number"
                          value={question.minValue || ''}
                          onChange={(e) => updateQuestion(qIndex, 'minValue', e.target.value ? parseFloat(e.target.value) : undefined)}
                          placeholder="No minimum"
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-1">Max Value</label>
                        <Input
                          type="number"
                          value={question.maxValue || ''}
                          onChange={(e) => updateQuestion(qIndex, 'maxValue', e.target.value ? parseFloat(e.target.value) : undefined)}
                          placeholder="No maximum"
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-1">Decimal Places</label>
                        <select
                          className="w-full px-3 py-2 bg-gray-700 border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={question.decimalPlaces || 2}
                          onChange={(e) => updateQuestion(qIndex, 'decimalPlaces', parseInt(e.target.value))}
                        >
                          <option value={0}>0 (Whole numbers)</option>
                          <option value={1}>1 decimal place</option>
                          <option value={2}>2 decimal places</option>
                          <option value={3}>3 decimal places</option>
                          <option value={4}>4 decimal places</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">Tolerance (Optional)</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={question.tolerance || ''}
                        onChange={(e) => updateQuestion(qIndex, 'tolerance', e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="e.g., 0.1 for ±0.1"
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Acceptable margin of error for the answer
                      </p>
                    </div>
                  </div>
                )}

                {/* Sequence question fields */}
                {question.type === 'SEQUENCE' && (
                  <div className="space-y-4 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                    <h4 className="font-medium text-white/90">Sequence Ordering Settings</h4>
                    
                    <div className="text-sm text-white/70">
                      Add items that students will arrange in the correct order. You can set the correct sequence below.
                    </div>
                    
                    {/* Sequence Items */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-white/70">Sequence Items *</label>
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white/80 text-sm font-medium">
                            {optIndex + 1}
                          </div>
                          <Input
                            type="text"
                            value={option.text}
                            onChange={(e) => {
                              const updatedOptions = [...question.options];
                              updatedOptions[optIndex] = { ...option, text: e.target.value };
                              updateQuestion(qIndex, 'options', updatedOptions);
                            }}
                            placeholder={`Item ${optIndex + 1}`}
                            className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          />
                          <Button
                            type="button"
                            onClick={() => {
                              const updatedOptions = question.options.filter((_, i) => i !== optIndex);
                              updateQuestion(qIndex, 'options', updatedOptions);
                            }}
                            disabled={question.options.length <= 2}
                            className="text-red-400 border-red-400/50 hover:bg-red-400/10 disabled:opacity-50"
                            variant="outline"
                            size="sm"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        onClick={() => {
                          const newOption = {
                            text: '',
                            isCorrect: false,
                            orderIndex: question.options.length
                          };
                          updateQuestion(qIndex, 'options', [...question.options, newOption]);
                        }}
                        variant="outline"
                        size="sm"
                        className="text-blue-400 border-blue-400/50 hover:bg-blue-400/10"
                      >
                        Add Item
                      </Button>
                    </div>

                    {/* Correct Sequence Configuration */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-white/70">Correct Order *</label>
                        <Button
                          type="button"
                          onClick={() => {
                            // Shuffle the current sequence
                            const shuffled = [...question.options].sort(() => Math.random() - 0.5);
                            const shuffledIds = shuffled.map((_, idx) => idx.toString());
                            updateQuestion(qIndex, 'correctSequence', shuffledIds);
                          }}
                          variant="outline"
                          size="sm"
                          className="text-gray-400 border-gray-600 hover:bg-gray-700"
                        >
                          Shuffle
                        </Button>
                      </div>
                      
                      <div className="text-sm text-white/60 mb-3">
                        Drag and drop to set the correct order, or manually arrange:
                      </div>

                      <div className="space-y-2 p-3 bg-gray-800/30 rounded-lg border border-gray-600">
                        {question.options.map((option, idx) => (
                          <div key={idx} className="flex items-center space-x-3 p-2 bg-gray-700 rounded border border-gray-600">
                            <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {idx + 1}
                            </div>
                            <div className="flex-1 text-white/90">{option.text || `Item ${idx + 1}`}</div>
                            <div className="flex space-x-1">
                              <Button
                                type="button"
                                onClick={() => {
                                  if (idx > 0) {
                                    const updatedOptions = [...question.options];
                                    [updatedOptions[idx], updatedOptions[idx - 1]] = [updatedOptions[idx - 1], updatedOptions[idx]];
                                    updateQuestion(qIndex, 'options', updatedOptions);
                                  }
                                }}
                                disabled={idx === 0}
                                variant="outline"
                                size="sm"
                                className="text-gray-400 border-gray-600 hover:bg-gray-600 disabled:opacity-50"
                              >
                                ↑
                              </Button>
                              <Button
                                type="button"
                                onClick={() => {
                                  if (idx < question.options.length - 1) {
                                    const updatedOptions = [...question.options];
                                    [updatedOptions[idx], updatedOptions[idx + 1]] = [updatedOptions[idx + 1], updatedOptions[idx]];
                                    updateQuestion(qIndex, 'options', updatedOptions);
                                  }
                                }}
                                disabled={idx === question.options.length - 1}
                                variant="outline"
                                size="sm"
                                className="text-gray-400 border-gray-600 hover:bg-gray-600 disabled:opacity-50"
                              >
                                ↓
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-gray-400 p-3 bg-gray-800/50 rounded-md">
                      💡 <strong>Sequence Questions:</strong> Students will drag and drop items to arrange them in the correct order. 
                      Perfect for timelines, processes, rankings, or step-by-step procedures.
                    </div>
                  </div>
                )}

                {/* Rating question fields */}
                {question.type === 'RATING' && (
                  <RatingQuestionBuilder
                    question={question as any}
                    onChange={(updatedQuestion) => {
                      setQuiz(prev => ({
                        ...prev,
                        questions: prev.questions.map((q, i) => 
                          i === qIndex ? { ...q, ...updatedQuestion } : q
                        )
                      }));
                    }}
                    onRemove={() => removeQuestion(qIndex)}
                    questionIndex={qIndex}
                  />
                )}

                {/* Options for choice questions */}
                {(question.type === 'SINGLE' || question.type === 'MULTIPLE') && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium">Options</label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(qIndex)}
                      >
                        Add Option
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <input
                            type={question.type === 'SINGLE' ? 'radio' : 'checkbox'}
                            name={`question-${qIndex}-correct`}
                            checked={option.isCorrect}
                            onChange={(e) => updateOption(qIndex, oIndex, 'isCorrect', e.target.checked)}
                            className="flex-shrink-0"
                          />
                          <Input
                            type="text"
                            value={option.text}
                            onChange={(e) => updateOption(qIndex, oIndex, 'text', e.target.value)}
                            placeholder={`Option ${oIndex + 1}`}
                            className="flex-1"
                          />
                          {question.options.length > 2 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeOption(qIndex, oIndex)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}

          {quiz.questions.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-gray-500 mb-4">No questions added yet</p>
              <Button type="button" onClick={addQuestion}>
                Add Your First Question
              </Button>
            </Card>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Quiz...' : 'Create Quiz'}
          </Button>
        </div>
      </form>
    </div>
  );
}
