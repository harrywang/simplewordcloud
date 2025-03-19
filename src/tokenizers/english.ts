import natural from 'natural';

/**
 * English text tokenizer using the Natural library
 */
export class EnglishTokenizer {
  private tokenizer: natural.WordTokenizer;
  private stopwords: Set<string>;

  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    // Common English stopwords
    this.stopwords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'if', 'because', 'as', 'what',
      'which', 'this', 'that', 'these', 'those', 'then', 'just', 'so', 'than',
      'such', 'both', 'through', 'about', 'for', 'is', 'of', 'while', 'during',
      'to', 'from', 'in', 'on', 'at', 'by', 'with', 'without', 'not', 'no',
      'be', 'am', 'are', 'was', 'were', 'being', 'been', 'have', 'has', 'had',
      'having', 'do', 'does', 'did', 'doing', 'would', 'should', 'could', 'can',
      'will', 'shall', 'may', 'might', 'must', 'i', 'you', 'he', 'she', 'it',
      'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his',
      'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs'
    ]);
  }

  /**
   * Tokenize English text into words and count their frequencies
   * @param text The input English text
   * @returns A map of words to their frequencies
   */
  tokenize(text: string): Map<string, number> {
    // Convert to lowercase
    const lowercaseText = text.toLowerCase();
    
    // Tokenize the text
    const tokens = this.tokenizer.tokenize(lowercaseText) || [];
    
    // Filter out stopwords and count frequencies
    const wordCounts = new Map<string, number>();
    
    for (const token of tokens) {
      // Skip stopwords and single characters
      if (this.stopwords.has(token) || token.length <= 1) {
        continue;
      }
      
      // Count word frequencies
      if (wordCounts.has(token)) {
        wordCounts.set(token, wordCounts.get(token)! + 1);
      } else {
        wordCounts.set(token, 1);
      }
    }
    
    return wordCounts;
  }
}
