import { z } from 'zod';

export const NumericQuestionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  type: z.literal('NUMERIC'),
  orderIndex: z.number().int().min(0),
  correctAnswer: z.number().finite('Correct answer must be a valid number'),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  decimalPlaces: z.number().int().min(0).max(10).default(2),
  unit: z.string().optional(),
  tolerance: z.number().min(0).default(0),
}).refine(
  (data) => {
    if (data.minValue !== undefined && data.maxValue !== undefined) {
      return data.minValue <= data.maxValue;
    }
    return true;
  },
  {
    message: 'Minimum value must be less than or equal to maximum value',
    path: ['maxValue'],
  }
).refine(
  (data) => {
    if (data.minValue !== undefined) {
      return data.correctAnswer >= data.minValue;
    }
    return true;
  },
  {
    message: 'Correct answer must be within the specified range',
    path: ['correctAnswer'],
  }
).refine(
  (data) => {
    if (data.maxValue !== undefined) {
      return data.correctAnswer <= data.maxValue;
    }
    return true;
  },
  {
    message: 'Correct answer must be within the specified range',
    path: ['correctAnswer'],
  }
);

export type NumericQuestionData = z.infer<typeof NumericQuestionSchema>;

// Schema for grading numeric answers
export const NumericAnswerSchema = z.object({
  questionId: z.string(),
  answer: z.number().finite('Answer must be a valid number'),
});

export type NumericAnswerData = z.infer<typeof NumericAnswerSchema>;
