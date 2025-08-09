import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { QuestionType } from '@prisma/client';
import { z } from 'zod';
import { requireAuthentication } from '@/lib/auth';

const OptionSchema = z.object({
  text: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean(),
  orderIndex: z.number().int().min(0),
});

const QuestionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  type: z.enum(['SINGLE', 'MULTIPLE', 'TEXT', 'NUMERIC', 'SEQUENCE']),
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
  correctSequence: z.array(z.string()).optional(),
});

const QuizSchema = z.object({
  title: z.string().min(1, 'Quiz title is required'),
  description: z.string().optional(),
  questions: z.array(QuestionSchema).min(1, 'At least one question is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Require authentication and get user ID
    const userId = await requireAuthentication();
    
    const body = await request.json();
    
    // Validate the request body
    const validatedData = QuizSchema.parse(body);
    
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

      // Additional validation for sequence questions
      if (question.type === 'SEQUENCE') {
        if (!question.options || question.options.length < 2) {
          return NextResponse.json(
            { error: 'Sequence questions must have at least 2 items to order' },
            { status: 400 }
          );
        }

        if (!question.correctSequence || question.correctSequence.length !== question.options.length) {
          return NextResponse.json(
            { error: 'Sequence questions must have a correct sequence matching all options' },
            { status: 400 }
          );
        }

        // Validate that all option IDs in correctSequence exist in options
        const optionIds = new Set(question.options.map(opt => opt.text)); // Using text as ID for validation
        const sequenceIds = new Set(question.correctSequence);
        
        if (optionIds.size !== sequenceIds.size) {
          return NextResponse.json(
            { error: 'Sequence question correct sequence must match all option IDs' },
            { status: 400 }
          );
        }
      }

      // Additional validation for numeric questions
      if (question.type === 'NUMERIC') {
        if (question.correctAnswer === undefined) {
          return NextResponse.json(
            { error: 'Numeric questions must have a correct answer' },
            { status: 400 }
          );
        }
        
        if (question.minValue !== undefined && question.maxValue !== undefined) {
          if (question.minValue > question.maxValue) {
            return NextResponse.json(
              { error: 'Minimum value must be less than or equal to maximum value' },
              { status: 400 }
            );
          }
          
          if (question.correctAnswer < question.minValue || question.correctAnswer > question.maxValue) {
            return NextResponse.json(
              { error: 'Correct answer must be within the specified range' },
              { status: 400 }
            );
          }
        }
      }
    }

    // Create quiz with nested questions and options in a transaction
    const quiz = await prisma.quiz.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        user: { connect: { id: userId } }, // Associate quiz with authenticated user via relation connect
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
            correctSequence: question.correctSequence ? JSON.stringify(question.correctSequence) : null,
            // Options for choice questions
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
            options: true
          },
          orderBy: {
            orderIndex: 'asc'
          }
        }
      }
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error('Error creating quiz:', error);
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
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

export async function GET() {
  try {
    // Require authentication and get user ID
    const userId = await requireAuthentication();
    
    // Get quizzes for the authenticated user only
    const quizzes = await prisma.quiz.findMany({
      where: {
        user: { is: { id: userId } }
      },
      include: {
        questions: {
          include: {
            options: true
          },
          orderBy: {
            orderIndex: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    
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
