import { DropdownAnswer, validateDropdownAnswer } from '@/lib/validation/dropdownQuestion';

/**
 * Interface for dropdown question data used in grading
 */
interface DropdownQuestionData {
  text: string;
  options: Array<{
    text: string;
    isCorrect: boolean;
    orderIndex: number;
  }>;
  placeholder?: string;
  allowSearch?: boolean;
  showOptionNumbers?: boolean;
}

/**
 * Interface for dropdown grading result
 */
export interface DropdownGradingResult {
  score: number;
  maxScore: number;
  isCorrect: boolean;
  feedback: string;
  selectedOption: string;
  correctOption: string;
  partialCredit: boolean;
  gradingDetails: {
    answerType: 'correct' | 'incorrect';
    matchType: 'exact' | 'none';
    caseSensitive: boolean;
  };
}

/**
 * Grade a dropdown question answer
 */
export function gradeDropdownQuestion(
  question: DropdownQuestionData,
  answer: unknown,
  options: {
    caseSensitive?: boolean;
    allowPartialCredit?: boolean;
    maxScore?: number;
  } = {}
): DropdownGradingResult {
  const {
    caseSensitive = false,
    allowPartialCredit = false,
    maxScore = 1
  } = options;

  // Validate answer format
  const validation = validateDropdownAnswer(answer);
  if (!validation.isValid) {
    return {
      score: 0,
      maxScore,
      isCorrect: false,
      feedback: `Invalid answer format: ${validation.error}`,
      selectedOption: '',
      correctOption: getCorrectOption(question),
      partialCredit: false,
      gradingDetails: {
        answerType: 'incorrect',
        matchType: 'none',
        caseSensitive
      }
    };
  }

  const dropdownAnswer = answer as DropdownAnswer;
  const selectedOption = dropdownAnswer.selectedOption.trim();
  const correctOption = getCorrectOption(question);

  // Check for exact match
  const isExactMatch = caseSensitive 
    ? selectedOption === correctOption
    : selectedOption.toLowerCase() === correctOption.toLowerCase();

  if (isExactMatch) {
    return {
      score: maxScore,
      maxScore,
      isCorrect: true,
      feedback: generateFeedback('correct', selectedOption, correctOption, question),
      selectedOption,
      correctOption,
      partialCredit: false,
      gradingDetails: {
        answerType: 'correct',
        matchType: 'exact',
        caseSensitive
      }
    };
  }

  // Check for partial credit (if enabled)
  if (allowPartialCredit) {
    const similarity = calculateStringSimilarity(selectedOption, correctOption, caseSensitive);
    if (similarity > 0.8) { // 80% similarity threshold
      const partialScore = Math.round(maxScore * similarity * 100) / 100;
      return {
        score: partialScore,
        maxScore,
        isCorrect: false,
        feedback: generateFeedback('partial', selectedOption, correctOption, question, similarity),
        selectedOption,
        correctOption,
        partialCredit: true,
        gradingDetails: {
          answerType: 'incorrect',
          matchType: 'none',
          caseSensitive
        }
      };
    }
  }

  // Incorrect answer
  return {
    score: 0,
    maxScore,
    isCorrect: false,
    feedback: generateFeedback('incorrect', selectedOption, correctOption, question),
    selectedOption,
    correctOption,
    partialCredit: false,
    gradingDetails: {
      answerType: 'incorrect',
      matchType: 'none',
      caseSensitive
    }
  };
}

/**
 * Get the correct option from question data
 */
function getCorrectOption(question: DropdownQuestionData): string {
  const correctOption = question.options.find(opt => opt.isCorrect);
  return correctOption?.text || '';
}

/**
 * Calculate string similarity for partial credit
 */
function calculateStringSimilarity(str1: string, str2: string, caseSensitive: boolean): number {
  const s1 = caseSensitive ? str1 : str1.toLowerCase();
  const s2 = caseSensitive ? str2 : str2.toLowerCase();
  
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;
  
  // Use Levenshtein distance for similarity calculation
  const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
  
  for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  const maxLength = Math.max(s1.length, s2.length);
  return (maxLength - matrix[s2.length][s1.length]) / maxLength;
}

/**
 * Generate feedback based on answer correctness
 */
function generateFeedback(
  type: 'correct' | 'incorrect' | 'partial',
  selectedOption: string,
  correctOption: string,
  question: DropdownQuestionData,
  similarity?: number
): string {
  switch (type) {
    case 'correct':
      return `Excellent! You correctly selected "${selectedOption}". This demonstrates good understanding of the concept.`;
    
    case 'partial':
      const percentage = similarity ? Math.round(similarity * 100) : 0;
      return `Your selection "${selectedOption}" is close to the correct answer "${correctOption}" (${percentage}% match). Review the options more carefully.`;
    
    case 'incorrect':
      const totalOptions = question.options.length;
      const encouragement = totalOptions > 5 
        ? 'With many options available, take time to read each one carefully.'
        : 'Consider reviewing the question and available options.';
      
      return `Your selection "${selectedOption}" is not correct. The correct answer is "${correctOption}". ${encouragement}`;
    
    default:
      return 'Unable to process your answer. Please try again.';
  }
}

/**
 * Generate detailed statistics for dropdown question performance
 */
export function generateDropdownStatistics(
  results: DropdownGradingResult[]
): {
  totalAttempts: number;
  correctAnswers: number;
  incorrectAnswers: number;
  partialCreditAnswers: number;
  averageScore: number;
  accuracyRate: number;
  commonIncorrectAnswers: Array<{ option: string; count: number }>;
} {
  const totalAttempts = results.length;
  const correctAnswers = results.filter(r => r.isCorrect).length;
  const partialCreditAnswers = results.filter(r => r.partialCredit).length;
  const incorrectAnswers = totalAttempts - correctAnswers - partialCreditAnswers;
  
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const maxPossibleScore = results.reduce((sum, r) => sum + r.maxScore, 0);
  
  const averageScore = totalAttempts > 0 ? totalScore / totalAttempts : 0;
  const accuracyRate = totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0;
  
  // Count common incorrect answers
  const incorrectOptions: Record<string, number> = {};
  results.forEach(result => {
    if (!result.isCorrect && result.selectedOption) {
      incorrectOptions[result.selectedOption] = (incorrectOptions[result.selectedOption] || 0) + 1;
    }
  });
  
  const commonIncorrectAnswers = Object.entries(incorrectOptions)
    .map(([option, count]) => ({ option, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 most common incorrect answers
  
  return {
    totalAttempts,
    correctAnswers,
    incorrectAnswers,
    partialCreditAnswers,
    averageScore: Math.round(averageScore * 100) / 100,
    accuracyRate: Math.round(accuracyRate * 100) / 100,
    commonIncorrectAnswers
  };
}
