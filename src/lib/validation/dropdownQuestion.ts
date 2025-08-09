import { z } from 'zod';

/**
 * Validation schema for dropdown question creation
 */
export const DropdownQuestionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  type: z.literal('DROPDOWN'),
  orderIndex: z.number().int().min(0),
  options: z.array(z.object({
    text: z.string().min(1, 'Option text is required'),
    isCorrect: z.boolean(),
    orderIndex: z.number().int().min(0)
  })).min(2, 'Dropdown questions must have at least 2 options')
    .refine(
      (options) => options.filter(opt => opt.isCorrect).length === 1,
      'Dropdown questions must have exactly one correct option'
    ),
  // Dropdown-specific fields
  placeholder: z.string().optional().default('Select an option...'),
  allowSearch: z.boolean().optional().default(false),
  showOptionNumbers: z.boolean().optional().default(false)
});

/**
 * Validation schema for dropdown question answers
 */
export const DropdownAnswerSchema = z.object({
  type: z.literal('DROPDOWN'),
  selectedOption: z.string().min(1, 'Please select an option')
});

/**
 * Type definitions
 */
export type DropdownQuestion = z.infer<typeof DropdownQuestionSchema>;
export type DropdownAnswer = z.infer<typeof DropdownAnswerSchema>;

/**
 * Dropdown configuration options
 */
export const DROPDOWN_CONFIGS = {
  basic: {
    name: 'Basic Dropdown',
    description: 'Simple dropdown selection',
    placeholder: 'Select an option...',
    allowSearch: false,
    showOptionNumbers: false,
    icon: '📋'
  },
  searchable: {
    name: 'Searchable Dropdown',
    description: 'Dropdown with search functionality',
    placeholder: 'Search and select...',
    allowSearch: true,
    showOptionNumbers: false,
    icon: '🔍'
  },
  numbered: {
    name: 'Numbered Options',
    description: 'Dropdown with numbered options',
    placeholder: 'Select an option...',
    allowSearch: false,
    showOptionNumbers: true,
    icon: '🔢'
  },
  advanced: {
    name: 'Advanced Dropdown',
    description: 'Searchable with numbered options',
    placeholder: 'Search and select...',
    allowSearch: true,
    showOptionNumbers: true,
    icon: '⚙️'
  }
} as const;

export type DropdownConfig = keyof typeof DROPDOWN_CONFIGS;

/**
 * Helper function to validate dropdown answer format
 */
export function validateDropdownAnswer(answer: unknown): {
  isValid: boolean;
  error?: string;
} {
  try {
    if (!answer || typeof answer !== 'object') {
      return {
        isValid: false,
        error: 'Answer must be an object'
      };
    }

    const answerObj = answer as Record<string, unknown>;
    
    if (answerObj.type !== 'DROPDOWN') {
      return {
        isValid: false,
        error: 'Answer type must be DROPDOWN'
      };
    }

    if (!answerObj.selectedOption || typeof answerObj.selectedOption !== 'string') {
      return {
        isValid: false,
        error: 'Selected option is required and must be a string'
      };
    }

    if (answerObj.selectedOption.trim().length === 0) {
      return {
        isValid: false,
        error: 'Please select a valid option'
      };
    }
    
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: 'Invalid answer format'
    };
  }
}

/**
 * Helper function to get dropdown configuration
 */
export function getDropdownConfig(configType: DropdownConfig) {
  return DROPDOWN_CONFIGS[configType];
}

/**
 * Helper function to format dropdown options for display
 */
export function formatDropdownOptions(
  options: Array<{ text: string; orderIndex: number }>,
  showNumbers: boolean = false
): Array<{ text: string; value: string; displayText: string }> {
  const sortedOptions = [...options].sort((a, b) => a.orderIndex - b.orderIndex);
  
  return sortedOptions.map((option, index) => ({
    text: option.text,
    value: option.text,
    displayText: showNumbers ? `${index + 1}. ${option.text}` : option.text
  }));
}
