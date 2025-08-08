import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const OptionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean(),
  orderIndex: z.number().int().min(0),
});

const QuestionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Question text is required'),
  type: z.enum(['SINGLE', 'MULTIPLE', 'TEXT']),
  orderIndex: z.number().int().min(0),
  options: z.array(OptionSchema).optional(),
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
              type: question.type,
              orderIndex: question.orderIndex,
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
    // Check if quiz exists
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id }
    });

    if (!existingQuiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
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
