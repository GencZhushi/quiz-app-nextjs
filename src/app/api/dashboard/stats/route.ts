import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuthentication } from '@/lib/auth';

export async function GET() {
  try {
    // Require authentication and get user ID
    const userId = await requireAuthentication();
    
    // Get quiz count for the authenticated user only
    const quizCount = await prisma.quiz.count({
      where: {
        user: { is: { id: userId } }
      }
    });
    
    // Get total questions count across user's quizzes only
    const questionCount = await prisma.question.count({
      where: {
        quiz: {
          user: { is: { id: userId } }
        }
      }
    });
    
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
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
