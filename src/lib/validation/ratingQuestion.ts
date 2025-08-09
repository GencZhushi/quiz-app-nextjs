import { z } from 'zod';

// Validation schema for rating question creation
export const RatingQuestionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  type: z.literal('RATING'),
  orderIndex: z.number().int().min(0),
  ratingMin: z.number().int().min(1).max(10).default(1),
  ratingMax: z.number().int().min(2).max(10).default(5),
  ratingLabels: z.array(z.string()).optional(), // Custom labels for each rating point
  ratingType: z.enum(['stars', 'numbers', 'emoji', 'likert']).default('stars'),
}).refine((data) => data.ratingMax > data.ratingMin, {
  message: "Maximum rating must be greater than minimum rating",
  path: ["ratingMax"]
});

// Validation schema for rating question answers (student responses)
export const RatingAnswerSchema = z.object({
  questionId: z.string(),
  type: z.literal('RATING'),
  rating: z.number().int().min(1).max(10),
});

// Type definitions
export type RatingQuestionData = z.infer<typeof RatingQuestionSchema>;
export type RatingAnswerData = z.infer<typeof RatingAnswerSchema>;

// Rating type configurations
export const RATING_TYPES = {
  stars: {
    name: 'Stars',
    description: 'Star rating (★★★★★)',
    icon: '★',
    defaultMin: 1,
    defaultMax: 5,
    maxScale: 10
  },
  numbers: {
    name: 'Numbers',
    description: 'Numeric scale (1-10)',
    icon: '1-10',
    defaultMin: 1,
    defaultMax: 10,
    maxScale: 10
  },
  emoji: {
    name: 'Emoji',
    description: 'Emoji scale (😞😐😊)',
    icon: '😊',
    defaultMin: 1,
    defaultMax: 5,
    maxScale: 7
  },
  likert: {
    name: 'Likert Scale',
    description: 'Agreement scale (Strongly Disagree to Strongly Agree)',
    icon: 'Agree',
    defaultMin: 1,
    defaultMax: 5,
    maxScale: 7
  }
} as const;

// Default labels for different rating types
export const DEFAULT_RATING_LABELS = {
  stars: {
    1: ['Poor'],
    2: ['Poor', 'Fair'],
    3: ['Poor', 'Fair', 'Good'],
    4: ['Poor', 'Fair', 'Good', 'Excellent'],
    5: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
    6: ['Very Poor', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
    7: ['Very Poor', 'Poor', 'Below Average', 'Average', 'Above Average', 'Very Good', 'Excellent']
  },
  numbers: {
    5: ['1 - Very Low', '2 - Low', '3 - Medium', '4 - High', '5 - Very High'],
    7: ['1 - Very Low', '2 - Low', '3 - Below Average', '4 - Average', '5 - Above Average', '6 - High', '7 - Very High'],
    10: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
  },
  emoji: {
    3: ['😞 Sad', '😐 Neutral', '😊 Happy'],
    5: ['😞 Very Sad', '😟 Sad', '😐 Neutral', '😊 Happy', '😍 Very Happy'],
    7: ['😭 Terrible', '😞 Very Sad', '😟 Sad', '😐 Neutral', '😊 Happy', '😍 Very Happy', '🤩 Amazing']
  },
  likert: {
    3: ['Disagree', 'Neutral', 'Agree'],
    5: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    7: ['Strongly Disagree', 'Disagree', 'Somewhat Disagree', 'Neutral', 'Somewhat Agree', 'Agree', 'Strongly Agree']
  }
} as const;

// Helper function to validate rating answer
export function validateRatingAnswer(
  answer: unknown,
  ratingMin: number,
  ratingMax: number
): { isValid: boolean; error?: string } {
  try {
    const parsed = RatingAnswerSchema.parse(answer);
    
    // Check if rating is within the specified range
    if (parsed.rating < ratingMin || parsed.rating > ratingMax) {
      return {
        isValid: false,
        error: `Rating must be between ${ratingMin} and ${ratingMax}`
      };
    }
    
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: 'Invalid rating format'
    };
  }
}

// Helper function to get default labels for a rating configuration
export type RatingType = keyof typeof RATING_TYPES;
export function getDefaultLabels(
  ratingType: RatingType,
  scale: number
): string[] {
  const typeLabels = DEFAULT_RATING_LABELS[ratingType];
  if (!typeLabels) return [];
  
  // Find the closest scale or use the exact match
  const availableScales = Object.keys(typeLabels).map(Number).sort((a, b) => a - b);
  const closestScale = availableScales.find(s => s >= scale) || availableScales[availableScales.length - 1];
  
  const labels = typeLabels[closestScale as keyof typeof typeLabels] || [];
  
  // Adjust labels to match the requested scale
  if (labels.length === scale) {
    return [...labels]; // Convert readonly array to mutable array
  } else if (labels.length > scale) {
    // Take evenly distributed labels
    const step = labels.length / scale;
    return Array.from({ length: scale }, (_, i) => labels[Math.floor(i * step)]);
  } else {
    // Pad with generic labels - return as any[] to avoid strict type checking
    const result: string[] = [...labels];
    while (result.length < scale) {
      result.push(`Option ${result.length + 1}`);
    }
    return result as string[];
  }
}
