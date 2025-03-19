import * as jieba from 'jieba-wasm';

/**
 * Chinese text tokenizer using the jieba-wasm library
 */
export class ChineseTokenizer {
  private stopwords: Set<string>;
  
  constructor() {
    // jieba-wasm doesn't need explicit initialization in newer versions
    
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
   * @param text The input Chinese text
   * @returns A map of words to their frequencies
   */
  tokenize(text: string): Map<string, number> {
    // Cut the text into words
    const tokens = jieba.cut(text);
    
    // Filter out stopwords and count frequencies
    const wordCounts = new Map<string, number>();
    
    for (const token of tokens) {
      // Skip stopwords, single characters, and numbers
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
