/**
 * Grading logic for numeric questions
 */

export interface NumericQuestion {
  id: string;
  correctAnswer: number;
  tolerance: number;
  decimalPlaces: number;
  unit?: string;
}

export interface NumericGradingResult {
  isCorrect: boolean;
  score: number; // 0 or 1 for numeric questions
  feedback: string;
  userAnswer: number;
  correctAnswer: number;
}

/**
 * Grade a numeric question answer
 * @param userAnswer - The user's numeric answer
 * @param question - The question data with correct answer and tolerance
 * @returns Grading result with score and feedback
 */
export function gradeNumericQuestion(
  userAnswer: number,
  question: NumericQuestion
): NumericGradingResult {
  const { correctAnswer, tolerance, decimalPlaces, unit } = question;
  
  // Check if the answer is within tolerance
  const difference = Math.abs(userAnswer - correctAnswer);
  const isCorrect = difference <= tolerance;
  
  // Round answers for display based on decimal places
  const roundedUserAnswer = Number(userAnswer.toFixed(decimalPlaces));
  const roundedCorrectAnswer = Number(correctAnswer.toFixed(decimalPlaces));
  
  // Generate feedback
  let feedback: string;
  if (isCorrect) {
    if (difference === 0) {
      feedback = `Correct! The exact answer is ${roundedCorrectAnswer}${unit ? ` ${unit}` : ''}.`;
    } else {
      feedback = `Correct! Your answer ${roundedUserAnswer}${unit ? ` ${unit}` : ''} is within the acceptable range of ${roundedCorrectAnswer}${unit ? ` ${unit}` : ''} ± ${tolerance}.`;
    }
  } else {
    feedback = `Incorrect. Your answer was ${roundedUserAnswer}${unit ? ` ${unit}` : ''}. The correct answer is ${roundedCorrectAnswer}${unit ? ` ${unit}` : ''}`;
    if (tolerance > 0) {
      feedback += ` (± ${tolerance})`;
    }
    feedback += '.';
  }
  
  return {
    isCorrect,
    score: isCorrect ? 1 : 0,
    feedback,
    userAnswer: roundedUserAnswer,
    correctAnswer: roundedCorrectAnswer,
  };
}

/**
 * Validate numeric input
 * @param input - Raw input string
 * @param minValue - Optional minimum value
 * @param maxValue - Optional maximum value
 * @returns Validation result
 */
export function validateNumericInput(
  input: string,
  minValue?: number,
  maxValue?: number
): { isValid: boolean; value?: number; error?: string } {
  // Check if input is empty
  if (!input.trim()) {
    return { isValid: false, error: 'Please enter a number' };
  }
  
  // Try to parse the number
  const value = parseFloat(input);
  
  // Check if it's a valid number
  if (isNaN(value) || !isFinite(value)) {
    return { isValid: false, error: 'Please enter a valid number' };
  }
  
  // Check minimum value
  if (minValue !== undefined && value < minValue) {
    return { 
      isValid: false, 
      error: `Value must be at least ${minValue}` 
    };
  }
  
  // Check maximum value
  if (maxValue !== undefined && value > maxValue) {
    return { 
      isValid: false, 
      error: `Value must be at most ${maxValue}` 
    };
  }
  
  return { isValid: true, value };
}
