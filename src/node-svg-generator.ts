import { Language, getTokenizer } from './tokenizers';

/**
 * Simple SVG generator for Node.js environment that doesn't rely on d3-cloud
 * This is a simplified version that arranges words in a grid layout
 */
export class NodeSVGGenerator {
  /**
   * Generate a simple word cloud SVG string for Node.js environment
   * @param text The input text
   * @param language The language of the text
   * @param width SVG width
   * @param height SVG height
   * @param maxWords Maximum number of words to include
   * @returns SVG string
   */
  static generateSVG(
    text: string, 
    language: Language, 
    width = 800, 
    height = 600, 
    maxWords = 100
  ): string {
    // Get the appropriate tokenizer for the language
    const tokenizer = getTokenizer(language);
    
    // Tokenize the text and get word frequencies
    const wordCounts = tokenizer.tokenize(text);
    
    // Convert to array and sort by frequency
    const words = Array.from(wordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxWords);
    
    // Calculate font sizes
    const counts = words.map(([_, count]) => count);
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);
    const minFontSize = 10;
    const maxFontSize = 60;
    
    // Start building SVG
    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Define a simple color palette
    const colors = [
      '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
      '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
    ];
    
    // Calculate grid layout
    const cols = Math.ceil(Math.sqrt(words.length));
    const rows = Math.ceil(words.length / cols);
    const cellWidth = width / cols;
    const cellHeight = height / rows;
    
    // Add words to SVG
    words.forEach(([word, count], index) => {
      // Calculate position in grid
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = col * cellWidth + cellWidth / 2;
      const y = row * cellHeight + cellHeight / 2;
      
      // Calculate font size based on frequency
      const fontSize = minCount === maxCount
        ? maxFontSize
        : minFontSize + (count - minCount) / (maxCount - minCount) * (maxFontSize - minFontSize);
      
      // Choose color
      const color = colors[index % colors.length];
      
      // Add text element
      svg += `<text x="${x}" y="${y}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" fill="${color}">${word}</text>`;
    });
    
    svg += '</svg>';
    return svg;
  }
}
