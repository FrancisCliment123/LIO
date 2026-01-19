const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../assets/frames/Gemini_Generated_Image_i4ov5vi4ov5vi4ov (1).svg');
const outputPath = path.join(__dirname, '../components/gemini-svg-content.ts');

try {
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  
  // Escape backticks and template literal syntax
  const escaped = svgContent
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\${/g, '\\${');
  
  const tsContent = `// Auto-generated file - do not edit manually
// Generated from: ${path.basename(svgPath)}

export const GEMINI_SVG_CONTENT = \`${escaped}\`;
`;
  
  fs.writeFileSync(outputPath, tsContent, 'utf8');
  console.log('SVG content embedded successfully!');
} catch (error) {
  console.error('Error embedding SVG:', error);
  process.exit(1);
}
