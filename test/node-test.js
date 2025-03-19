const fs = require('fs');
const path = require('path');
const d3 = require('d3');
const cloud = require('d3-cloud');
const { createCanvas } = require('canvas');
const { getTokenizer } = require('../dist/tokenizers');

// Sample texts from the demo HTML file
const englishText = `
Ground Control to Major Tom
Ground Control to Major Tom
Take your protein pills and put your helmet on
Ground Control to Major Tom
Commencing countdown, engines on
Check ignition and may God's love be with you
Ten, Nine, Eight, Seven, Six, Five, Four, Three, Two, One, Lift off
This is Ground Control to Major Tom
You've really made the grade
And the papers want to know whose shirts you wear
Now it's time to leave the capsule if you dare
This is Major Tom to Ground Control
I'm stepping through the door
And I'm floating in a most peculiar way
And the stars look very different today
For here
Am I sitting in a tin can
Far above the world
Planet Earth is blue
And there's nothing I can do
Though I'm past one hundred thousand miles
I'm feeling very still
And I think my spaceship knows which way to go
Tell my wife I love her very much she knows
Ground Control to Major Tom
Your circuit's dead, there's something wrong
Can you hear me, Major Tom?
Can you hear me, Major Tom?
Can you hear me, Major Tom?
Can you...
Here am I floating round my tin can
Far above the Moon
Planet Earth is blue
And there's nothing I can do`;

const chineseText = `
我的寂寞和我的泪
我的表现是无所谓
若要坚强需要受罪
若要后悔需要忏悔
最好闭上你的嘴

噓 对 这样才算可爱
尽管别人会感到奇怪
这不公道 我不能接受

处处寻找 寻找安慰
对我说来那太珍贵
人海茫茫不会后退
黑色梦中我去安睡

梦中没有错与对
梦中有安也有危
梦的时代我在胡说
梦醒时刻才会解脱`;

// Get the current directory path
const testDir = __dirname;

// Word cloud options (matching the demo HTML file)
const options = {
  width: 800,
  height: 550,
  maxWords: 100,
  fontFamily: 'Arial, sans-serif',
  rotationAngles: [0, 0, 90], // More words at 0 degrees, some at 90 degrees
  rotationProbability: 0.2,   // Lower probability of rotation
  colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'], // d3 category10 colors
  padding: 3,
  minFontSize: 10,
  maxFontSize: 60
};

// Function to generate a word cloud SVG
function generateWordCloud(text, language, options) {
  return new Promise((resolve) => {
    // Get the appropriate tokenizer for the language
    const tokenizer = getTokenizer(language);
    
    // Tokenize the text and get word frequencies
    const wordCounts = tokenizer.tokenize(text);
    
    // Convert to array and sort by frequency
    const words = Array.from(wordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, options.maxWords);
    
    // Calculate font sizes
    const counts = words.map(([_, count]) => count);
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);
    const fontSizeScale = d3.scaleLinear()
      .domain([minCount, maxCount])
      .range([options.minFontSize, options.maxFontSize]);
    
    // Create word cloud layout
    const layout = cloud()
      .size([options.width, options.height])
      .words(words.map(([text, count]) => ({
        text,
        size: fontSizeScale(count),
        value: count
      })))
      .padding(options.padding)
      .rotate(() => {
        // Apply rotation based on probability
        if (Math.random() < options.rotationProbability) {
          const angles = options.rotationAngles || [0];
          return angles[Math.floor(Math.random() * angles.length)];
        }
        return 0;
      })
      .font(options.fontFamily)
      .fontSize(d => d.size)
      .canvas(() => createCanvas(options.width, options.height))
      .on('end', (words) => {
        // Create SVG
        const svg = `<svg width="${options.width}" height="${options.height}" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(${options.width / 2},${options.height / 2})">
            ${words.map((d, i) => {
              const color = options.colors[i % options.colors.length];
              return `<text 
                text-anchor="middle" 
                transform="translate(${d.x},${d.y}) rotate(${d.rotate})" 
                font-size="${d.size}px" 
                font-family="${options.fontFamily}" 
                fill="${color}">${d.text}</text>`;
            }).join('')}
          </g>
        </svg>`;
        
        resolve(svg);
      });
    
    // Start layout calculation
    layout.start();
  });
}

// Generate English word cloud
async function main() {
  try {
    console.log('Generating English word cloud...');
    const englishSvg = await generateWordCloud(englishText, 'english', options);
    const englishOutputPath = path.join(testDir, 'english-wordcloud.svg');
    fs.writeFileSync(englishOutputPath, englishSvg);
    console.log(`English word cloud saved to ${englishOutputPath}`);
    
    console.log('Generating Chinese word cloud...');
    const chineseSvg = await generateWordCloud(chineseText, 'chinese', options);
    const chineseOutputPath = path.join(testDir, 'chinese-wordcloud.svg');
    fs.writeFileSync(chineseOutputPath, chineseSvg);
    console.log(`Chinese word cloud saved to ${chineseOutputPath}`);
    
    console.log('Done!');
  } catch (error) {
    console.error('Error generating word clouds:', error);
  }
}

main();
