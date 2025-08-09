import { z } from 'zod';

// Validation schema for sequence question creation
export const SequenceQuestionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  type: z.literal('SEQUENCE'),
  orderIndex: z.number().int().min(0),
  options: z.array(z.object({
    text: z.string().min(1, 'Option text is required'),
    isCorrect: z.boolean().default(false), // Not used for sequence, but kept for consistency
    orderIndex: z.number().int().min(0),
  })).min(2, 'Sequence questions must have at least 2 items to order'),
  correctSequence: z.array(z.string()).min(2, 'Correct sequence must have at least 2 items'),
});

// Validation schema for sequence question answers (student responses)
export const SequenceAnswerSchema = z.object({
  questionId: z.string(),
  type: z.literal('SEQUENCE'),
  sequence: z.array(z.string()).min(1, 'Answer sequence cannot be empty'),
});

// Type definitions
export type SequenceQuestionData = z.infer<typeof SequenceQuestionSchema>;
export type SequenceAnswerData = z.infer<typeof SequenceAnswerSchema>;

// Helper function to validate sequence answer format
export function validateSequenceAnswer(
  answer: unknown,
  correctSequence: string[]
): { isValid: boolean; error?: string } {
  try {
    const parsed = SequenceAnswerSchema.parse(answer);
    
    // Check if the answer sequence has the same length as correct sequence
    if (parsed.sequence.length !== correctSequence.length) {
      return {
        isValid: false,
        error: `Answer must contain exactly ${correctSequence.length} items`
      };
    }
    
    // Check if all items in the answer exist in the correct sequence
    const correctSet = new Set(correctSequence);
    const answerSet = new Set(parsed.sequence);
    
    if (correctSet.size !== answerSet.size) {
      return {
        isValid: false,
        error: 'Answer contains duplicate or missing items'
      };
    }
    
    for (const item of parsed.sequence) {
      if (!correctSet.has(item)) {
        return {
          isValid: false,
          error: 'Answer contains invalid items'
        };
      }
    }
    
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid answer format'
    };
  }
}
