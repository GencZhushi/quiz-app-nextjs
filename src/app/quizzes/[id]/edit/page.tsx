'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { QuizDetailSkeleton } from "@/components/skeletons/QuizSkeleton";

type QuestionType = 'SINGLE' | 'MULTIPLE' | 'TEXT' | 'NUMERIC' | 'SEQUENCE' | 'RATING' | 'DROPDOWN';

interface Option {
  id?: string;
  text: string;
  isCorrect: boolean;
  orderIndex: number;
}

interface Question {
  id?: string;
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
  correctSequence?: string;
  
  // Rating question fields
  ratingMin?: number;
  ratingMax?: number;
  ratingLabels?: string;
  ratingType?: string;
  
  // Dropdown question fields
  placeholder?: string;
  allowSearch?: boolean;
  showOptionNumbers?: boolean;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  questions: Question[];
}

export default function EditQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;
  
  const [quiz, setQuiz] = useState<Quiz>({
    id: '',
    title: '',
    description: '',
    questions: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quizzes/${quizId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch quiz');
        }
        const data = await response.json();
        setQuiz({
          id: data.id,
          title: data.title,
          description: data.description || '',
          questions: data.questions.map((q: Question) => ({
            id: q.id,
            text: q.text,
            type: q.type,
            orderIndex: q.orderIndex,
            options: q.options || []
          }))
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  const addQuestion = () => {
    const newQuestion: Question = {
      text: '',
      type: 'SINGLE',
      orderIndex: quiz.questions.length,
      options: [
        { text: '', isCorrect: false, orderIndex: 0 },
        { text: '', isCorrect: true, orderIndex: 1 }
      ]
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

  const updateQuestion = (index: number, field: keyof Question, value: string | QuestionType | Option[] | number | boolean) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i === index) {
          const updated = { ...q, [field]: value };
          
          // Reset options and set defaults when changing question type
          if (field === 'type') {
            if (value === 'TEXT' || value === 'NUMERIC' || value === 'RATING') {
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
                { text: '', isCorrect: false, orderIndex: 0 },
                { text: '', isCorrect: false, orderIndex: 1 },
                { text: '', isCorrect: false, orderIndex: 2 }
              ];
            } else if (value === 'DROPDOWN' && q.type !== 'DROPDOWN') {
              updated.options = [
                { text: '', isCorrect: false, orderIndex: 0 },
                { text: '', isCorrect: true, orderIndex: 1 },
                { text: '', isCorrect: false, orderIndex: 2 }
              ];
            }
            
            // Set type-specific defaults
            if (value === 'NUMERIC') {
              updated.minValue = 0;
              updated.maxValue = 100;
              updated.decimalPlaces = 2;
              updated.tolerance = 0;
            } else if (value === 'RATING') {
              updated.ratingMin = 1;
              updated.ratingMax = 5;
              updated.ratingType = 'stars';
            } else if (value === 'DROPDOWN') {
              updated.placeholder = 'Select an option...';
              updated.allowSearch = false;
              updated.showOptionNumbers = false;
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
    if (!quiz.title.trim()) return 'Quiz title is required';
    if (quiz.questions.length === 0) return 'At least one question is required';
    
    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      if (!question.text.trim()) return `Question ${i + 1} text is required`;
      
      if (question.type === 'SINGLE' || question.type === 'MULTIPLE') {
        if (question.options.length < 2) {
          return `Question ${i + 1} must have at least 2 options`;
        }
        
        const hasEmptyOption = question.options.some(opt => !opt.text.trim());
        if (hasEmptyOption) {
          return `Question ${i + 1} has empty options`;
        }
        
        const correctOptions = question.options.filter(opt => opt.isCorrect);
        if (question.type === 'SINGLE' && correctOptions.length !== 1) {
          return `Question ${i + 1} must have exactly one correct option`;
        }
        
        if (question.type === 'MULTIPLE' && correctOptions.length === 0) {
          return `Question ${i + 1} must have at least one correct option`;
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
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: quiz.title,
          description: quiz.description || null,
          questions: quiz.questions
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update quiz');
      }
      
      // Redirect to quiz details page
      router.push(`/quizzes/${quizId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <QuizDetailSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white/90">Edit Quiz</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href={`/quizzes/${quizId}`}>
              <Button variant="outline" className="text-white border-gray-600 hover:bg-gray-700">
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quiz Details */}
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-white/90 mb-4">Quiz Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Quiz Title *</label>
                <Input
                  type="text"
                  value={quiz.title}
                  onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter quiz title"
                  required
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Description</label>
                <textarea
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  rows={3}
                  value={quiz.description || ''}
                  onChange={(e) => setQuiz(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter quiz description (optional)"
                />
              </div>
            </div>
          </Card>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white/90">Questions</h2>
              <Button type="button" onClick={addQuestion} className="bg-blue-500 hover:bg-blue-600">
                Add Question
              </Button>
            </div>

            {quiz.questions.map((question, qIndex) => (
              <Card key={qIndex} className="bg-gray-800/50 border-gray-700 p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-white/90">Question {qIndex + 1}</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                  >
                    Remove
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Question Text *</label>
                    <Input
                      type="text"
                      value={question.text}
                      onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                      placeholder="Enter your question"
                      required
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Question Type</label>
                    <select
                      value={question.type}
                      onChange={(e) => updateQuestion(qIndex, 'type', e.target.value as QuestionType)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="SINGLE">Single Choice</option>
                      <option value="MULTIPLE">Multiple Choice</option>
                      <option value="TEXT">Text Answer</option>
                      <option value="NUMERIC">Numeric Input</option>
                      <option value="SEQUENCE">Sequence Ordering</option>
                      <option value="RATING">Rating Scale</option>
                      <option value="DROPDOWN">Dropdown Select</option>
                    </select>
                  </div>

                  {/* Options for choice questions */}
                  {(question.type === 'SINGLE' || question.type === 'MULTIPLE' || question.type === 'SEQUENCE' || question.type === 'DROPDOWN') && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-white/70">Options</label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(qIndex)}
                          className="text-white border-gray-600 hover:bg-gray-700"
                        >
                          Add Option
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <input
                              type={
                                question.type === 'SINGLE' || question.type === 'DROPDOWN' 
                                  ? 'radio' 
                                  : question.type === 'SEQUENCE' 
                                    ? 'number'
                                    : 'checkbox'
                              }
                              name={`question-${qIndex}-correct`}
                              checked={question.type !== 'SEQUENCE' ? option.isCorrect : false}
                              value={question.type === 'SEQUENCE' ? option.orderIndex + 1 : undefined}
                              onChange={(e) => {
                                if (question.type === 'SEQUENCE') {
                                  updateOption(qIndex, oIndex, 'orderIndex', parseInt(e.target.value) - 1);
                                } else {
                                  updateOption(qIndex, oIndex, 'isCorrect', e.target.checked);
                                }
                              }}
                              placeholder={question.type === 'SEQUENCE' ? 'Order' : undefined}
                              className="flex-shrink-0"
                              min={question.type === 'SEQUENCE' ? '1' : undefined}
                              max={question.type === 'SEQUENCE' ? question.options.length.toString() : undefined}
                            />
                            <Input
                              type="text"
                              value={option.text}
                              onChange={(e) => updateOption(qIndex, oIndex, 'text', e.target.value)}
                              placeholder={`Option ${oIndex + 1}`}
                              className="flex-1 bg-gray-700 border-gray-600 text-white"
                            />
                            {question.options.length > 2 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeOption(qIndex, oIndex)}
                                className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Numeric question configuration */}
                  {question.type === 'NUMERIC' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Correct Answer *</label>
                        <Input
                          type="number"
                          value={question.correctAnswer || ''}
                          onChange={(e) => updateQuestion(qIndex, 'correctAnswer', parseFloat(e.target.value))}
                          placeholder="Enter correct answer"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Tolerance</label>
                        <Input
                          type="number"
                          value={question.tolerance || 0}
                          onChange={(e) => updateQuestion(qIndex, 'tolerance', parseFloat(e.target.value))}
                          placeholder="0"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Unit</label>
                        <Input
                          type="text"
                          value={question.unit || ''}
                          onChange={(e) => updateQuestion(qIndex, 'unit', e.target.value)}
                          placeholder="e.g., kg, m/s, °C"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Decimal Places</label>
                        <Input
                          type="number"
                          value={question.decimalPlaces || 2}
                          onChange={(e) => updateQuestion(qIndex, 'decimalPlaces', parseInt(e.target.value))}
                          min="0"
                          max="10"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* Rating question configuration */}
                  {question.type === 'RATING' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Rating Type</label>
                        <select
                          value={question.ratingType || 'stars'}
                          onChange={(e) => updateQuestion(qIndex, 'ratingType', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="stars">⭐ Stars</option>
                          <option value="numbers">🔢 Numbers</option>
                          <option value="emoji">😊 Emoji</option>
                          <option value="likert">📊 Likert Scale</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Scale Range</label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={question.ratingMin || 1}
                            onChange={(e) => updateQuestion(qIndex, 'ratingMin', parseInt(e.target.value))}
                            placeholder="Min"
                            min="1"
                            max="10"
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                          <span className="text-white/70 self-center">to</span>
                          <Input
                            type="number"
                            value={question.ratingMax || 5}
                            onChange={(e) => updateQuestion(qIndex, 'ratingMax', parseInt(e.target.value))}
                            placeholder="Max"
                            min="2"
                            max="10"
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dropdown question configuration */}
                  {question.type === 'DROPDOWN' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Placeholder Text</label>
                        <Input
                          type="text"
                          value={question.placeholder || 'Select an option...'}
                          onChange={(e) => updateQuestion(qIndex, 'placeholder', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div className="flex gap-4">
                        <label className="flex items-center text-white/70">
                          <input
                            type="checkbox"
                            checked={question.allowSearch || false}
                            onChange={(e) => updateQuestion(qIndex, 'allowSearch', e.target.checked)}
                            className="mr-2"
                          />
                          Enable Search
                        </label>
                        <label className="flex items-center text-white/70">
                          <input
                            type="checkbox"
                            checked={question.showOptionNumbers || false}
                            onChange={(e) => updateQuestion(qIndex, 'showOptionNumbers', e.target.checked)}
                            className="mr-2"
                          />
                          Show Option Numbers
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}

            {quiz.questions.length === 0 && (
              <Card className="bg-gray-800/50 border-gray-700 p-8 text-center">
                <p className="text-white/70 mb-4">No questions added yet</p>
                <Button type="button" onClick={addQuestion} className="bg-blue-500 hover:bg-blue-600">
                  Add Your First Question
                </Button>
              </Card>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/50 border border-red-700 rounded-md p-4">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <Link href={`/quizzes/${quizId}`}>
              <Button
                type="button"
                variant="outline"
                className="text-white border-gray-600 hover:bg-gray-700"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
