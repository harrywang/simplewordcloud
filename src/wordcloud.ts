import * as d3 from 'd3';
import cloud from 'd3-cloud';
import { Language, getTokenizer } from './tokenizers';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

/**
 * Word cloud configuration options
 */
export interface WordCloudOptions {
  /** Width of the word cloud in pixels */
  width?: number;
  /** Height of the word cloud in pixels */
  height?: number;
  /** Font family to use for the words */
  fontFamily?: string;
  /** Maximum number of words to include in the cloud */
  maxWords?: number;
  /** Color scheme to use for the words */
  colors?: readonly string[];
  /** Padding between words in pixels */
  padding?: number;
  /** Minimum font size for words */
  minFontSize?: number;
  /** Maximum font size for words */
  maxFontSize?: number;
  /** Rotation angles for words (in degrees) */
  rotationAngles?: number[];
  /** Probability of word rotation */
  rotationProbability?: number;
}

/**
 * Default options for the word cloud
 */
const DEFAULT_OPTIONS: WordCloudOptions = {
  width: 800,
  height: 600,
  fontFamily: 'Arial, sans-serif',
  maxWords: 100,
  colors: [...d3.schemeCategory10],
  padding: 5,
  minFontSize: 10,
  maxFontSize: 60,
  rotationAngles: [0, 90],
  rotationProbability: 0.3
};

/**
 * Word cloud generator for English and Chinese text
 */
export class WordCloud {
  private options: Required<WordCloudOptions>;

  /**
   * Create a new word cloud generator
   * @param options Configuration options for the word cloud
   */
  constructor(options: WordCloudOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options } as Required<WordCloudOptions>;
  }

  /**
   * Generate a word cloud from text
   * @param text The input text
   * @param language The language of the text ('english' or 'chinese')
   * @returns An SVG element containing the word cloud (in browser) or SVG string (in Node.js)
   */
  generate(text: string, language: Language): SVGElement | string {
    // Get the appropriate tokenizer for the language
    const tokenizer = getTokenizer(language);
    
    // Tokenize the text and get word frequencies
    const wordCounts = tokenizer.tokenize(text);
    
    // Convert to array and sort by frequency
    const words = Array.from(wordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.options.maxWords)
      .map(([text, size]) => ({
        text,
        size: this.scaleFontSize(size, wordCounts),
        rotate: this.getRotation()
      }));
    
    if (isBrowser) {
      // Browser environment - create DOM elements
      // Create SVG element
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', this.options.width.toString());
      svg.setAttribute('height', this.options.height.toString());
      svg.setAttribute('class', 'wordcloud');
      
      // Generate the layout using d3-cloud
      const layout = cloud()
        .size([this.options.width, this.options.height])
        .words(words)
        .padding(this.options.padding)
        .rotate((d) => (d as any).rotate)
        .font(this.options.fontFamily)
        .fontSize((d) => (d as any).size)
        .on('end', (words) => this.draw(words, svg));
      
      layout.start();
      
      return svg;
    } else {
      // Node.js environment - return SVG string
      return this.generateSVGString(words);
    }
  }

  /**
   * Generate a word cloud and return it as an SVG string
   * @param text The input text
   * @param language The language of the text ('english' or 'chinese')
   * @returns A string containing the SVG markup
   */
  generateSVG(text: string, language: Language): string {
    const result = this.generate(text, language);
    if (typeof result === 'string') {
      return result; // Already a string in Node.js environment
    } else {
      return result.outerHTML; // Convert SVG element to string in browser
    }
  }
  
  /**
   * Generate SVG string directly (for Node.js environment)
   * @param words The words to include in the cloud
   * @returns SVG markup as a string
   */
  private generateSVGString(words: cloud.Word[]): string {
    // Run the layout synchronously
    const layout = cloud()
      .size([this.options.width, this.options.height])
      .words(words)
      .padding(this.options.padding)
      .rotate((d) => (d as any).rotate)
      .font(this.options.fontFamily)
      .fontSize((d) => (d as any).size);
    
    // Force the layout to run synchronously
    layout.start();
    const processedWords = layout.words();
    
    // Generate SVG string manually
    const colorScale = d3.scaleOrdinal(this.options.colors);
    
    let svgString = `<svg width="${this.options.width}" height="${this.options.height}" class="wordcloud">`;
    svgString += `<g transform="translate(${this.options.width / 2},${this.options.height / 2})">`;
    
    processedWords.forEach((d, i) => {
      const color = colorScale(i.toString());
      const text = d.text || '';
      svgString += `<text text-anchor="middle" transform="translate(${d.x},${d.y}) rotate(${d.rotate})" font-size="${d.size}px" font-family="${this.options.fontFamily}" fill="${color}">${text}</text>`;
    });
    
    svgString += '</g></svg>';
    return svgString;
  }

  /**
   * Scale the font size based on word frequency
   * @param count The word count
   * @param wordCounts Map of all word counts
   * @returns The scaled font size
   */
  private scaleFontSize(count: number, wordCounts: Map<string, number>): number {
    const counts = Array.from(wordCounts.values());
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);
    
    // Linear scaling between min and max font size
    if (minCount === maxCount) {
      return this.options.maxFontSize;
    }
    
    return this.options.minFontSize + 
      (count - minCount) / (maxCount - minCount) * 
      (this.options.maxFontSize - this.options.minFontSize);
  }

  /**
   * Get a random rotation angle for a word
   * @returns The rotation angle in degrees
   */
  private getRotation(): number {
    if (Math.random() > this.options.rotationProbability) {
      return 0;
    }
    
    const angles = this.options.rotationAngles;
    return angles[Math.floor(Math.random() * angles.length)];
  }

  /**
   * Draw the word cloud on the SVG element (browser only)
   * @param words The words to draw
   * @param svg The SVG element to draw on
   */
  private draw(words: cloud.Word[], svg: SVGElement): void {
    if (!isBrowser) return; // Safety check
    
    const colorScale = d3.scaleOrdinal(this.options.colors);
    
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${this.options.width / 2},${this.options.height / 2})`);
    
    words.forEach((d, i) => {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('transform', `translate(${d.x},${d.y}) rotate(${d.rotate})`);
      text.setAttribute('font-size', `${d.size}px`);
      text.setAttribute('font-family', this.options.fontFamily);
      text.setAttribute('fill', colorScale(i.toString()));
      text.textContent = d.text || '';
      g.appendChild(text);
    });
    
    svg.appendChild(g);
  }
}
