'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { QuizListSkeleton } from "@/components/skeletons/QuizSkeleton";

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  orderIndex: number;
}

interface Question {
  id: string;
  text: string;
  type: 'SINGLE' | 'MULTIPLE' | 'TEXT';
  orderIndex: number;
  options: Option[];
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  questions: Question[];
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch('/api/quizzes');
        if (!response.ok) {
          throw new Error('Failed to fetch quizzes');
        }
        const data = await response.json();
        setQuizzes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
      default:
        return type;
    }
  };

  if (isLoading) {
    return <QuizListSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-400 mb-4">Error: {error}</div>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
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
            <h1 className="text-2xl font-bold text-white/90">My Quizzes</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" className="text-white border-gray-600 hover:bg-gray-700">
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/quizzes/new">
              <Button className="bg-red-500 hover:bg-red-600 text-white">
                Create New Quiz
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {quizzes.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-white/90 mb-4">No Quizzes Yet</h2>
              <p className="text-white/70 mb-6">
                You haven&apos;t created any quizzes yet. Start building your first quiz to engage your audience!
              </p>
              <Link href="/quizzes/new">
                <Button className="bg-red-500 hover:bg-red-600 text-white">
                  Create Your First Quiz
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-white/70">
                {quizzes.length} quiz{quizzes.length !== 1 ? 'es' : ''} found
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {quizzes.map((quiz) => (
                <Card key={quiz.id} className="bg-gray-800/50 border-gray-700 p-6 hover:bg-gray-800/70 transition-colors">
                  <div className="space-y-4">
                    {/* Quiz Header */}
                    <div>
                      <h3 className="text-lg font-semibold text-white/90 mb-2">
                        {quiz.title}
                      </h3>
                      {quiz.description && (
                        <p className="text-white/70 text-sm line-clamp-2">
                          {quiz.description}
                        </p>
                      )}
                    </div>

                    {/* Quiz Stats */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Questions:</span>
                        <span className="text-white/90">{quiz.questions.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Created:</span>
                        <span className="text-white/90">{formatDate(quiz.createdAt)}</span>
                      </div>
                      {quiz.updatedAt !== quiz.createdAt && (
                        <div className="flex justify-between">
                          <span className="text-white/60">Updated:</span>
                          <span className="text-white/90">{formatDate(quiz.updatedAt)}</span>
                        </div>
                      )}
                    </div>

                    {/* Question Types Summary */}
                    {quiz.questions.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-white/60 text-sm">Question Types:</div>
                        <div className="flex flex-wrap gap-1">
                          {Array.from(new Set(quiz.questions.map(q => q.type))).map(type => (
                            <span
                              key={type}
                              className="px-2 py-1 bg-gray-700 text-white/80 text-xs rounded"
                            >
                              {getQuestionTypeLabel(type)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Link href={`/quizzes/${quiz.id}`} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-white border-gray-600 hover:bg-gray-700"
                        >
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/quizzes/${quiz.id}/edit`} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-white border-gray-600 hover:bg-gray-700"
                        >
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
