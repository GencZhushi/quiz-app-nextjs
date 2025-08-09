import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { QuestionType } from '@prisma/client';
import { z } from 'zod';
import { requireAuthentication, userOwnsQuiz } from '@/lib/auth';

const OptionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean(),
  orderIndex: z.number().int().min(0),
});

const QuestionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Question text is required'),
  type: z.enum(['SINGLE', 'MULTIPLE', 'TEXT', 'NUMERIC', 'SEQUENCE', 'RATING', 'DROPDOWN']),
  orderIndex: z.number().int().min(0),
  options: z.array(OptionSchema).optional(),
  // Numeric question fields
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  decimalPlaces: z.number().int().min(0).max(10).default(2).optional(),
  unit: z.string().optional(),
  correctAnswer: z.number().optional(),
  tolerance: z.number().min(0).default(0).optional(),
  // Sequence question fields
  correctSequence: z.string().optional(), // JSON string in database
  // Rating question fields
  ratingMin: z.number().int().min(1).max(10).optional(),
  ratingMax: z.number().int().min(2).max(10).optional(),
  ratingLabels: z.string().optional(), // JSON string in database
  ratingType: z.enum(['stars', 'numbers', 'emoji', 'likert']).optional(),
  // Dropdown question fields
  placeholder: z.string().optional(),
  allowSearch: z.boolean().optional(),
  showOptionNumbers: z.boolean().optional(),
});

const UpdateQuizSchema = z.object({
  title: z.string().min(1, 'Quiz title is required'),
  description: z.string().optional(),
  questions: z.array(QuestionSchema).min(1, 'At least one question is required'),
});

// GET /api/quizzes/[id] - Get a specific quiz
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Require authentication and get user ID
    const userId = await requireAuthentication();
    
    // Verify user owns this quiz
    const ownsQuiz = await userOwnsQuiz(userId, id);
    if (!ownsQuiz) {
      return NextResponse.json(
        { error: 'Quiz not found or access denied' },
        { status: 404 }
      );
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            options: {
              orderBy: { orderIndex: 'asc' }
            }
          },
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/quizzes/[id] - Update a specific quiz
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Require authentication and get user ID
    const userId = await requireAuthentication();
    
    // Verify user owns this quiz
    const ownsQuiz = await userOwnsQuiz(userId, id);
    if (!ownsQuiz) {
      return NextResponse.json(
        { error: 'Quiz not found or access denied' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = UpdateQuizSchema.parse(body);

    // Additional validation for choice questions
    for (const question of validatedData.questions) {
      if (question.type === 'SINGLE' || question.type === 'MULTIPLE') {
        if (!question.options || question.options.length < 2) {
          return NextResponse.json(
            { error: `${question.type} choice questions must have at least 2 options` },
            { status: 400 }
          );
        }
        
        const correctOptions = question.options.filter(opt => opt.isCorrect);
        if (question.type === 'SINGLE' && correctOptions.length !== 1) {
          return NextResponse.json(
            { error: 'Single choice questions must have exactly one correct option' },
            { status: 400 }
          );
        }
        
        if (question.type === 'MULTIPLE' && correctOptions.length === 0) {
          return NextResponse.json(
            { error: 'Multiple choice questions must have at least one correct option' },
            { status: 400 }
          );
        }
      }
    }

    // Update quiz using transaction to handle nested updates
    const updatedQuiz = await prisma.$transaction(async (tx) => {
      // First, delete all existing questions and their options (cascade will handle options)
      await tx.question.deleteMany({
        where: { quizId: id }
      });

      // Update the quiz and create new questions
      return await tx.quiz.update({
        where: { id },
        data: {
          title: validatedData.title,
          description: validatedData.description,
          questions: {
            create: validatedData.questions.map(question => ({
              text: question.text,
              type: question.type as QuestionType,
              orderIndex: question.orderIndex,
              // Numeric question fields
              minValue: question.minValue,
              maxValue: question.maxValue,
              decimalPlaces: question.decimalPlaces,
              unit: question.unit,
              correctAnswer: question.correctAnswer,
              tolerance: question.tolerance,
              // Sequence question fields
              correctSequence: question.correctSequence,
              // Rating question fields
              ratingMin: question.ratingMin,
              ratingMax: question.ratingMax,
              ratingLabels: question.ratingLabels,
              ratingType: question.ratingType,
              // Dropdown question fields
              placeholder: question.placeholder,
              allowSearch: question.allowSearch,
              showOptionNumbers: question.showOptionNumbers,
              options: question.options ? {
                create: question.options.map(option => ({
                  text: option.text,
                  isCorrect: option.isCorrect,
                  orderIndex: option.orderIndex,
                }))
              } : undefined,
            }))
          }
        },
        include: {
          questions: {
            include: {
              options: {
                orderBy: { orderIndex: 'asc' }
              }
            },
            orderBy: { orderIndex: 'asc' }
          }
        }
      });
    });

    return NextResponse.json(updatedQuiz);
  } catch (error) {
    console.error('Error updating quiz:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/quizzes/[id] - Delete a specific quiz
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Require authentication and get user ID
    const userId = await requireAuthentication();
    
    // Verify user owns this quiz
    const ownsQuiz = await userOwnsQuiz(userId, id);
    if (!ownsQuiz) {
      return NextResponse.json(
        { error: 'Quiz not found or access denied' },
        { status: 404 }
      );
    }

    // Delete the quiz (cascade will handle questions and options)
    await prisma.quiz.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Quiz deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
