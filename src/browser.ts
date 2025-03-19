import { WordCloudOptions } from './wordcloud';
import { getSimplifiedTokenizer } from './browser-tokenizers';
import cloud from 'd3-cloud';
import * as d3 from 'd3';

/**
 * Browser-friendly word cloud options
 */
interface BrowserWordCloudOptions {
  width?: number;
  height?: number;
  fontFamily?: string;
  maxWords?: number;
  colors?: readonly string[];
  padding?: number;
  minFontSize?: number;
  maxFontSize?: number;
  rotationAngles?: number[];
  rotationProbability?: number;
}

/**
 * Default options for the browser word cloud
 */
const DEFAULT_OPTIONS: Required<BrowserWordCloudOptions> = {
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
 * Generate a word cloud in the browser
 */
function generateWordCloud(
  text: string,
  language: 'english' | 'chinese',
  container: HTMLElement,
  options: BrowserWordCloudOptions = {}
): SVGElement {
  // Merge options with defaults
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options } as Required<BrowserWordCloudOptions>;
  
  // Get the appropriate tokenizer
  const tokenizer = getSimplifiedTokenizer(language);
  
  // Tokenize the text and get word frequencies
  const wordCounts = tokenizer.tokenize(text);
  
  // Convert to array and sort by frequency
  const words = Array.from(wordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, mergedOptions.maxWords)
    .map(([text, size]) => {
      // Scale the font size based on frequency
      const counts = Array.from(wordCounts.values());
      const minCount = Math.min(...counts);
      const maxCount = Math.max(...counts);
      
      // Linear scaling between min and max font size
      const scaledSize = minCount === maxCount
        ? mergedOptions.maxFontSize
        : mergedOptions.minFontSize + 
          (size - minCount) / (maxCount - minCount) * 
          (mergedOptions.maxFontSize - mergedOptions.minFontSize);
      
      // Determine if word should be rotated
      const rotate = Math.random() > mergedOptions.rotationProbability
        ? 0
        : mergedOptions.rotationAngles[Math.floor(Math.random() * mergedOptions.rotationAngles.length)];
      
      return {
        text,
        size: scaledSize,
        rotate
      };
    });
  
  // Create SVG element
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', mergedOptions.width.toString());
  svg.setAttribute('height', mergedOptions.height.toString());
  svg.setAttribute('class', 'wordcloud');
  
  // Generate the layout using d3-cloud
  const layout = cloud()
    .size([mergedOptions.width, mergedOptions.height])
    .words(words)
    .padding(mergedOptions.padding)
    .rotate((d) => (d as any).rotate)
    .font(mergedOptions.fontFamily)
    .fontSize((d) => (d as any).size)
    .on('end', (words) => {
      // Draw the word cloud
      const colorScale = d3.scaleOrdinal(mergedOptions.colors);
      
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${mergedOptions.width / 2},${mergedOptions.height / 2})`);
      
      words.forEach((d, i) => {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('transform', `translate(${d.x},${d.y}) rotate(${d.rotate})`);
        text.setAttribute('font-size', `${d.size}px`);
        text.setAttribute('font-family', mergedOptions.fontFamily);
        text.setAttribute('fill', colorScale(i.toString()));
        text.textContent = d.text || '';
        g.appendChild(text);
      });
      
      svg.appendChild(g);
    });
  
  layout.start();
  
  // Clear container and append SVG
  container.innerHTML = '';
  container.appendChild(svg);
  
  return svg;
}

// Create the SimpleWordCloud object
const SimpleWordCloud = {
  generateWordCloud
};

// Export as default for webpack
export default SimpleWordCloud;

// Also attach to window for direct browser usage
if (typeof window !== 'undefined') {
  (window as any).SimpleWordCloud = SimpleWordCloud;
}
