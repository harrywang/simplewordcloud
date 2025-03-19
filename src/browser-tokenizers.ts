/**
 * Simple tokenizers for browser usage
 * These are simplified versions that don't rely on Node.js dependencies
 */

/**
 * Simple English tokenizer for browser usage
 */
export class SimplifiedEnglishTokenizer {
  private stopwords: Set<string>;

  constructor() {
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
    
    // Simple tokenization by splitting on non-word characters
    const tokens = lowercaseText.split(/[^\w']+/).filter(Boolean);
    
    // Filter out stopwords and count frequencies
    const wordCounts = new Map<string, number>();
    
    for (const token of tokens) {
      // Skip stopwords and single characters
      if (this.stopwords.has(token) || token.length <= 1 || /^\d+$/.test(token)) {
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

/**
 * Simple Chinese tokenizer for browser usage
 * This is a very basic implementation that splits by characters
 * and combines common character pairs
 */
export class SimplifiedChineseTokenizer {
  private stopwords: Set<string>;
  
  constructor() {
    // Common Chinese stopwords
    this.stopwords = new Set([
      '的', '了', '和', '是', '就', '都', '而', '及', '與', '著',
      '或', '一個', '沒有', '我們', '你們', '他們', '她們', '自己',
      '之', '與', '在', '也', '因', '此', '但', '並', '個', '其',
      '已', '無', '小', '大', '中', '上', '下', '不', '為', '以',
      '於', '對', '她', '他', '你', '我', '們', '的', '可以', '這',
      '那', '到', '由', '這個', '那個', '從', '最', '所', '它'
    ]);
  }

  /**
   * Tokenize Chinese text into words and count their frequencies
   * This is a simplified approach that works in the browser
   * @param text The input Chinese text
   * @returns A map of words to their frequencies
   */
  tokenize(text: string): Map<string, number> {
    // Simple character-based segmentation for Chinese
    // This is not as good as jieba but works in the browser without dependencies
    const tokens: string[] = [];
    
    // First pass: extract all characters
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      // Skip non-Chinese characters, punctuation, and whitespace
      if (/[\u4e00-\u9fa5]/.test(char)) {
        tokens.push(char);
        
        // Try to combine with next character if possible
        if (i < text.length - 1 && /[\u4e00-\u9fa5]/.test(text[i+1])) {
          tokens.push(char + text[i+1]);
        }
      }
    }
    
    // Filter out stopwords and count frequencies
    const wordCounts = new Map<string, number>();
    
    for (const token of tokens) {
      // Skip stopwords
      if (this.stopwords.has(token)) {
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

/**
 * Get a simplified tokenizer for browser usage
 */
export function getSimplifiedTokenizer(language: 'english' | 'chinese') {
  switch (language) {
    case 'english':
      return new SimplifiedEnglishTokenizer();
    case 'chinese':
      return new SimplifiedChineseTokenizer();
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
}
