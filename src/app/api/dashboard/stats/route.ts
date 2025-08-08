import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get quiz count
    const quizCount = await prisma.quiz.count();
    
    // Get total questions count across all quizzes
    const questionCount = await prisma.question.count();
    
    // Get total responses (for now, we'll use question count as a placeholder)
    // In the future, you can add a Response/Answer model to track actual responses
    const totalResponses = questionCount * 2; // Placeholder calculation
    
    const stats = {
      quizzesCreated: quizCount,
      studentsEnrolled: 0, // Placeholder - you can add User role logic later
      totalResponses: totalResponses,
      totalQuestions: questionCount
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
