import { EnglishTokenizer } from './english';
import { ChineseTokenizer } from './chinese';

export { EnglishTokenizer, ChineseTokenizer };

/**
 * Supported languages for tokenization
 */
export type Language = 'english' | 'chinese';

/**
 * Get the appropriate tokenizer for the specified language
 * @param language The language to tokenize
 * @returns A tokenizer instance for the specified language
 */
export function getTokenizer(language: Language) {
  switch (language) {
    case 'english':
      return new EnglishTokenizer();
    case 'chinese':
      return new ChineseTokenizer();
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
}
