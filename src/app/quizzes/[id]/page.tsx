'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  orderIndex: number;
}

interface Question {
  id: string;
  text: string;
  type: 'SINGLE' | 'MULTIPLE' | 'TEXT' | 'NUMERIC' | 'SEQUENCE' | 'RATING' | 'DROPDOWN';
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
  createdAt: string;
  updatedAt: string;
  questions: Question[];
}

export default function QuizDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quizzes/${quizId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Quiz not found');
          }
          throw new Error('Failed to fetch quiz');
        }
        const data = await response.json();
        setQuiz(data);
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

  const handleDelete = async () => {
    if (!quiz) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete "${quiz.title}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete quiz');
      }

      // Redirect to quizzes list after successful deletion
      router.push('/quizzes');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete quiz');
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'SINGLE':
        return 'Single Choice';
      case 'MULTIPLE':
        return 'Multiple Choice';
      case 'TEXT':
        return 'Text Answer';
      case 'NUMERIC':
        return 'Numeric Input';
      case 'SEQUENCE':
        return 'Sequence Ordering';
      case 'RATING':
        return 'Rating Scale';
      case 'DROPDOWN':
        return 'Dropdown Select';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-white/90">Loading quiz details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-400 mb-4">Error: {error || 'Quiz not found'}</div>
              <Link href="/quizzes">
                <Button>Back to Quizzes</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white/90">Quiz Details</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/quizzes">
              <Button variant="outline" className="text-white border-gray-600 hover:bg-gray-700">
                Back to Quizzes
              </Button>
            </Link>
            <Link href={`/quizzes/${quizId}/edit`}>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                Edit Quiz
              </Button>
            </Link>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? 'Deleting...' : 'Delete Quiz'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Quiz Header */}
        <Card className="bg-gray-800/50 border-gray-700 p-6 mb-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-3xl font-bold text-white/90 mb-2">{quiz.title}</h2>
              {quiz.description && (
                <p className="text-white/70 text-lg">{quiz.description}</p>
              )}
            </div>
            
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-white/60">Questions:</span>
                <span className="text-white/90 font-medium">{quiz.questions.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/60">Created:</span>
                <span className="text-white/90">{formatDate(quiz.createdAt)}</span>
              </div>
              {quiz.updatedAt !== quiz.createdAt && (
                <div className="flex items-center gap-2">
                  <span className="text-white/60">Last Updated:</span>
                  <span className="text-white/90">{formatDate(quiz.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Questions */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white/90">Questions</h3>
          
          {quiz.questions.map((question, index) => (
            <Card key={question.id} className="bg-gray-800/50 border-gray-700 p-6">
              <div className="space-y-4">
                {/* Question Header */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-white/90 font-medium">Question {index + 1}</span>
                      <span className="px-2 py-1 bg-gray-700 text-white/80 text-xs rounded">
                        {getQuestionTypeLabel(question.type)}
                      </span>
                    </div>
                    <p className="text-white/90 text-lg">{question.text}</p>
                  </div>
                </div>

                {/* Options for choice questions */}
                {(question.type === 'SINGLE' || question.type === 'MULTIPLE') && question.options.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-white/70 font-medium">Answer Options:</h4>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={option.id}
                          className={`flex items-center gap-3 p-3 rounded-lg ${
                            option.isCorrect 
                              ? 'bg-green-900/30 border border-green-700/50' 
                              : 'bg-gray-700/30'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {question.type === 'SINGLE' ? (
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                option.isCorrect 
                                  ? 'bg-green-500 border-green-500' 
                                  : 'border-gray-400'
                              }`}>
                                {option.isCorrect && (
                                  <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                                )}
                              </div>
                            ) : (
                              <div className={`w-4 h-4 rounded border-2 ${
                                option.isCorrect 
                                  ? 'bg-green-500 border-green-500' 
                                  : 'border-gray-400'
                              }`}>
                                {option.isCorrect && (
                                  <svg className="w-3 h-3 text-white m-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            )}
                            <span className="text-gray-400 text-sm">
                              {String.fromCharCode(65 + optionIndex)}
                            </span>
                          </div>
                          <span className={`flex-1 ${
                            option.isCorrect ? 'text-green-200' : 'text-white/80'
                          }`}>
                            {option.text}
                          </span>
                          {option.isCorrect && (
                            <span className="text-green-400 text-sm font-medium">
                              ✓ Correct
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Text answer note */}
                {question.type === 'TEXT' && (
                  <div className="bg-gray-700/30 p-3 rounded-lg">
                    <p className="text-white/70 text-sm">
                      This is a text answer question. Students will provide their own written response.
                    </p>
                  </div>
                )}

                {/* Numeric question configuration */}
                {question.type === 'NUMERIC' && (
                  <div className="space-y-3">
                    <h4 className="text-white/70 font-medium">Numeric Configuration:</h4>
                    <div className="bg-blue-900/20 border border-blue-700/30 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-blue-300 font-medium">Correct Answer:</span>
                          <span className="text-white/90 ml-2">
                            {question.correctAnswer !== undefined ? question.correctAnswer : 'Not set'}
                            {question.unit && ` ${question.unit}`}
                          </span>
                        </div>
                        <div>
                          <span className="text-blue-300 font-medium">Tolerance:</span>
                          <span className="text-white/90 ml-2">±{question.tolerance || 0}</span>
                        </div>
                        <div>
                          <span className="text-blue-300 font-medium">Range:</span>
                          <span className="text-white/90 ml-2">
                            {question.minValue !== undefined ? question.minValue : 'No min'} to {question.maxValue !== undefined ? question.maxValue : 'No max'}
                          </span>
                        </div>
                        <div>
                          <span className="text-blue-300 font-medium">Decimal Places:</span>
                          <span className="text-white/90 ml-2">{question.decimalPlaces || 2}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sequence question configuration */}
                {question.type === 'SEQUENCE' && question.options.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-white/70 font-medium">Sequence Items:</h4>
                    <div className="bg-purple-900/20 border border-purple-700/30 p-4 rounded-lg">
                      <p className="text-purple-300 text-sm mb-3">Students will drag and drop these items to arrange them in the correct order:</p>
                      <div className="space-y-2">
                        {question.options
                          .sort((a, b) => a.orderIndex - b.orderIndex)
                          .map((option, index) => (
                            <div key={option.id} className="flex items-center gap-3 p-2 bg-gray-700/30 rounded">
                              <span className="text-purple-300 font-medium w-8 text-center">
                                {index + 1}.
                              </span>
                              <span className="text-white/90">{option.text}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Rating question configuration */}
                {question.type === 'RATING' && (
                  <div className="space-y-3">
                    <h4 className="text-white/70 font-medium">Rating Configuration:</h4>
                    <div className="bg-yellow-900/20 border border-yellow-700/30 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-yellow-300 font-medium">Rating Type:</span>
                          <span className="text-white/90 ml-2">
                            {question.ratingType === 'stars' && '⭐ Stars'}
                            {question.ratingType === 'numbers' && '🔢 Numbers'}
                            {question.ratingType === 'emoji' && '😊 Emoji'}
                            {question.ratingType === 'likert' && '📊 Likert Scale'}
                            {!question.ratingType && '⭐ Stars (default)'}
                          </span>
                        </div>
                        <div>
                          <span className="text-yellow-300 font-medium">Scale Range:</span>
                          <span className="text-white/90 ml-2">
                            {question.ratingMin || 1} to {question.ratingMax || 5}
                          </span>
                        </div>
                      </div>
                      {question.ratingLabels && (
                        <div className="mt-3">
                          <span className="text-yellow-300 font-medium">Custom Labels:</span>
                          <div className="text-white/90 text-sm mt-1">
                            {JSON.parse(question.ratingLabels).join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Dropdown question configuration */}
                {question.type === 'DROPDOWN' && question.options.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-white/70 font-medium">Dropdown Options:</h4>
                    <div className="bg-green-900/20 border border-green-700/30 p-4 rounded-lg">
                      <div className="mb-3">
                        <span className="text-green-300 font-medium">Placeholder:</span>
                        <span className="text-white/90 ml-2">&quot;{question.placeholder || 'Select an option...'}&quot;</span>
                      </div>
                      <div className="flex gap-4 mb-3 text-sm">
                        <div className="flex items-center">
                          <span className="text-green-300 font-medium">Search:</span>
                          <span className={`ml-2 ${question.allowSearch ? 'text-green-400' : 'text-gray-400'}`}>
                            {question.allowSearch ? '✓ Enabled' : '✗ Disabled'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-green-300 font-medium">Numbers:</span>
                          <span className={`ml-2 ${question.showOptionNumbers ? 'text-green-400' : 'text-gray-400'}`}>
                            {question.showOptionNumbers ? '✓ Shown' : '✗ Hidden'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={option.id}
                            className={`flex items-center gap-3 p-2 rounded ${
                              option.isCorrect 
                                ? 'bg-green-800/30 border border-green-600/50' 
                                : 'bg-gray-700/30'
                            }`}
                          >
                            <span className="text-green-300 text-sm">
                              {question.showOptionNumbers ? `${optionIndex + 1}.` : '•'}
                            </span>
                            <span className={`flex-1 ${option.isCorrect ? 'text-green-200' : 'text-white/80'}`}>
                              {option.text}
                            </span>
                            {option.isCorrect && (
                              <span className="text-green-400 text-sm font-medium">✓ Correct</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
