import { validateSequenceAnswer } from '@/lib/validation/sequenceQuestion';

export interface SequenceGradingResult {
  isCorrect: boolean;
  score: number; // 0-1 scale
  feedback: string;
  partialCredit?: number; // For partial scoring
  correctSequence: string[];
  userSequence: string[];
}

/**
 * Grade a sequence question answer
 * @param userAnswer - The student's sequence answer
 * @param correctSequence - Array of option IDs in correct order
 * @param allowPartialCredit - Whether to award partial credit for partially correct sequences
 * @returns Grading result with score and feedback
 */
export function gradeSequenceQuestion(
  userAnswer: unknown,
  correctSequence: string[],
  allowPartialCredit: boolean = true
): SequenceGradingResult {
  // Validate the answer format
  const validation = validateSequenceAnswer(userAnswer, correctSequence);
  
  if (!validation.isValid) {
    return {
      isCorrect: false,
      score: 0,
      feedback: validation.error || 'Invalid answer format',
      correctSequence,
      userSequence: []
    };
  }

  const parsedAnswer = userAnswer as { sequence: string[] };
  const userSequence = parsedAnswer.sequence;

  // Check for exact match
  const isExactMatch = arraysEqual(userSequence, correctSequence);
  
  if (isExactMatch) {
    return {
      isCorrect: true,
      score: 1,
      feedback: 'Perfect! You got the sequence exactly right.',
      correctSequence,
      userSequence
    };
  }

  // Calculate partial credit if enabled
  if (allowPartialCredit) {
    const partialScore = calculatePartialCredit(userSequence, correctSequence);
    
    if (partialScore > 0) {
      return {
        isCorrect: false,
        score: partialScore,
        feedback: `Partially correct. You got ${Math.round(partialScore * 100)}% of the sequence right.`,
        partialCredit: partialScore,
        correctSequence,
        userSequence
      };
    }
  }

  return {
    isCorrect: false,
    score: 0,
    feedback: 'Incorrect sequence. Try to think about the logical order of events or steps.',
    correctSequence,
    userSequence
  };
}

/**
 * Check if two arrays are equal (same elements in same order)
 */
function arraysEqual(arr1: string[], arr2: string[]): boolean {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((item, index) => item === arr2[index]);
}

/**
 * Calculate partial credit based on various scoring methods
 * Uses the best score from multiple approaches
 */
function calculatePartialCredit(userSequence: string[], correctSequence: string[]): number {
  const scores = [
    calculatePositionalScore(userSequence, correctSequence),
    calculateLongestCommonSubsequenceScore(userSequence, correctSequence),
    calculateAdjacentPairsScore(userSequence, correctSequence)
  ];
  
  // Return the highest score (most generous scoring)
  return Math.max(...scores);
}

/**
 * Score based on how many items are in the correct position
 */
function calculatePositionalScore(userSequence: string[], correctSequence: string[]): number {
  let correctPositions = 0;
  const minLength = Math.min(userSequence.length, correctSequence.length);
  
  for (let i = 0; i < minLength; i++) {
    if (userSequence[i] === correctSequence[i]) {
      correctPositions++;
    }
  }
  
  return correctPositions / correctSequence.length;
}

/**
 * Score based on longest common subsequence (preserves relative order)
 */
function calculateLongestCommonSubsequenceScore(userSequence: string[], correctSequence: string[]): number {
  const lcsLength = longestCommonSubsequence(userSequence, correctSequence);
  return lcsLength / correctSequence.length;
}

/**
 * Score based on correct adjacent pairs (good for sequences where order matters)
 */
function calculateAdjacentPairsScore(userSequence: string[], correctSequence: string[]): number {
  if (correctSequence.length < 2) return 0;
  
  const correctPairs = new Set<string>();
  for (let i = 0; i < correctSequence.length - 1; i++) {
    correctPairs.add(`${correctSequence[i]}-${correctSequence[i + 1]}`);
  }
  
  let matchingPairs = 0;
  for (let i = 0; i < userSequence.length - 1; i++) {
    const pair = `${userSequence[i]}-${userSequence[i + 1]}`;
    if (correctPairs.has(pair)) {
      matchingPairs++;
    }
  }
  
  return matchingPairs / (correctSequence.length - 1);
}

/**
 * Calculate longest common subsequence length using dynamic programming
 */
function longestCommonSubsequence(seq1: string[], seq2: string[]): number {
  const m = seq1.length;
  const n = seq2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (seq1[i - 1] === seq2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  return dp[m][n];
}

/**
 * Generate detailed feedback for sequence questions
 */
export function generateSequenceFeedback(
  result: SequenceGradingResult,
  itemLabels?: Record<string, string>
): string {
  const { isCorrect, score, userSequence, correctSequence } = result;
  
  if (isCorrect) {
    return 'Excellent! You arranged all items in the correct sequence.';
  }
  
  const getLabel = (id: string) => itemLabels?.[id] || `Item ${id}`;
  
  if (score === 0) {
    return `The correct sequence is: ${correctSequence.map(getLabel).join(' → ')}`;
  }
  
  // Provide specific feedback for partial credit
  const correctPositions = userSequence.filter((item, index) => 
    item === correctSequence[index]
  ).length;
  
  if (correctPositions > 0) {
    return `You got ${correctPositions} out of ${correctSequence.length} items in the right position. The correct sequence is: ${correctSequence.map(getLabel).join(' → ')}`;
  }
  
  return `Your sequence: ${userSequence.map(getLabel).join(' → ')}. Correct sequence: ${correctSequence.map(getLabel).join(' → ')}`;
}
