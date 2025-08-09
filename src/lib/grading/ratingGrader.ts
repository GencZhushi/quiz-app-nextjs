import { validateRatingAnswer } from '@/lib/validation/ratingQuestion';

export interface RatingGradingResult {
  isCorrect: boolean;
  score: number; // 0-1 scale
  feedback: string;
  userRating: number;
  expectedRating?: number;
  ratingType: string;
  scale: { min: number; max: number };
}

/**
 * Grade a rating question answer
 * For rating questions, grading can be:
 * 1. Objective - comparing against an expected rating (with tolerance)
 * 2. Subjective - all ratings are considered valid (used for surveys/feedback)
 * 3. Range-based - acceptable range of ratings
 */
export function gradeRatingQuestion(
  userAnswer: unknown,
  ratingMin: number,
  ratingMax: number,
  ratingType: string = 'stars',
  expectedRating?: number,
  tolerance?: number,
  isSubjective: boolean = true
): RatingGradingResult {
  // Validate the answer format
  const validation = validateRatingAnswer(userAnswer, ratingMin, ratingMax);
  
  if (!validation.isValid) {
    return {
      isCorrect: false,
      score: 0,
      feedback: validation.error || 'Invalid rating format',
      userRating: 0,
      expectedRating,
      ratingType,
      scale: { min: ratingMin, max: ratingMax }
    };
  }

  const parsedAnswer = userAnswer as { rating: number };
  const userRating = parsedAnswer.rating;

  // For subjective rating questions (surveys, feedback), all valid ratings are correct
  if (isSubjective) {
    return {
      isCorrect: true,
      score: 1,
      feedback: generateSubjectiveFeedback(userRating, ratingType, ratingMin, ratingMax),
      userRating,
      expectedRating,
      ratingType,
      scale: { min: ratingMin, max: ratingMax }
    };
  }

  // For objective rating questions, compare against expected rating
  if (expectedRating !== undefined) {
    const actualTolerance = tolerance || 0;
    const isWithinTolerance = Math.abs(userRating - expectedRating) <= actualTolerance;
    
    if (isWithinTolerance) {
      return {
        isCorrect: true,
        score: 1,
        feedback: actualTolerance > 0 
          ? `Correct! Your rating of ${userRating} is within the acceptable range.`
          : `Perfect! You gave the exact expected rating of ${expectedRating}.`,
        userRating,
        expectedRating,
        ratingType,
        scale: { min: ratingMin, max: ratingMax }
      };
    } else {
      // Calculate partial credit based on how close the rating is
      const maxDistance = Math.max(
        Math.abs(ratingMax - expectedRating),
        Math.abs(ratingMin - expectedRating)
      );
      const actualDistance = Math.abs(userRating - expectedRating);
      const partialScore = Math.max(0, 1 - (actualDistance / maxDistance));
      
      return {
        isCorrect: false,
        score: partialScore,
        feedback: `Your rating of ${userRating} differs from the expected rating of ${expectedRating}. ${generatePartialCreditFeedback(partialScore)}`,
        userRating,
        expectedRating,
        ratingType,
        scale: { min: ratingMin, max: ratingMax }
      };
    }
  }

  // Fallback: treat as subjective if no expected rating provided
  return {
    isCorrect: true,
    score: 1,
    feedback: generateSubjectiveFeedback(userRating, ratingType, ratingMin, ratingMax),
    userRating,
    expectedRating,
    ratingType,
    scale: { min: ratingMin, max: ratingMax }
  };
}

/**
 * Generate feedback for subjective rating questions
 */
function generateSubjectiveFeedback(
  rating: number,
  ratingType: string,
  min: number,
  max: number
): string {
  const percentage = ((rating - min) / (max - min)) * 100;
  
  let intensityWord = '';
  if (percentage >= 80) intensityWord = 'very positive';
  else if (percentage >= 60) intensityWord = 'positive';
  else if (percentage >= 40) intensityWord = 'neutral';
  else if (percentage >= 20) intensityWord = 'somewhat negative';
  else intensityWord = 'negative';

  const typeSpecificFeedback = getTypeSpecificFeedback(ratingType, rating, min, max);
  
  return `Thank you for your ${intensityWord} rating of ${rating}${typeSpecificFeedback ? '. ' + typeSpecificFeedback : '.'} Your feedback has been recorded.`;
}

/**
 * Generate type-specific feedback
 */
function getTypeSpecificFeedback(ratingType: string, rating: number, min: number, max: number): string {
  switch (ratingType) {
    case 'stars':
      if (rating === max) return 'Excellent rating!';
      if (rating === min) return 'We appreciate your honest feedback';
      return '';
    
    case 'emoji':
      if (rating >= (max - min) * 0.8 + min) return 'Great to see you\'re happy!';
      if (rating <= (max - min) * 0.2 + min) return 'We\'ll work to improve your experience';
      return '';
    
    case 'likert':
      if (rating >= (max - min) * 0.8 + min) return 'Strong agreement noted';
      if (rating <= (max - min) * 0.2 + min) return 'Your disagreement is valuable feedback';
      return '';
    
    case 'numbers':
      const percentage = ((rating - min) / (max - min)) * 100;
      return `That's ${Math.round(percentage)}% on our scale`;
    
    default:
      return '';
  }
}

/**
 * Generate feedback for partial credit
 */
function generatePartialCreditFeedback(score: number): string {
  if (score >= 0.8) return 'You were quite close to the expected rating.';
  if (score >= 0.6) return 'You were moderately close to the expected rating.';
  if (score >= 0.4) return 'Your rating was somewhat different from what was expected.';
  if (score >= 0.2) return 'Your rating was quite different from the expected value.';
  return 'Your rating was significantly different from what was expected.';
}

/**
 * Calculate rating statistics for multiple responses (useful for surveys)
 */
export function calculateRatingStatistics(ratings: number[]): {
  average: number;
  median: number;
  mode: number[];
  distribution: Record<number, number>;
  total: number;
} {
  if (ratings.length === 0) {
    return {
      average: 0,
      median: 0,
      mode: [],
      distribution: {},
      total: 0
    };
  }

  // Calculate average
  const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;

  // Calculate median
  const sorted = [...ratings].sort((a, b) => a - b);
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];

  // Calculate distribution
  const distribution: Record<number, number> = {};
  ratings.forEach(rating => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });

  // Calculate mode
  const maxCount = Math.max(...Object.values(distribution));
  const mode = Object.keys(distribution)
    .filter(rating => distribution[Number(rating)] === maxCount)
    .map(Number);

  return {
    average: Math.round(average * 100) / 100,
    median,
    mode,
    distribution,
    total: ratings.length
  };
}

/**
 * Generate detailed feedback for rating questions with statistics
 */
export function generateDetailedRatingFeedback(
  result: RatingGradingResult,
  statistics?: ReturnType<typeof calculateRatingStatistics>
): string {
  let feedback = result.feedback;
  
  if (statistics && statistics.total > 1) {
    feedback += `\n\nOverall statistics: Average rating is ${statistics.average}, with ${statistics.total} total responses.`;
    
    if (statistics.mode.length === 1) {
      feedback += ` The most common rating is ${statistics.mode[0]}.`;
    }
  }
  
  return feedback;
}
