/**
 * Build script to convert README.md to HTML for the Docs page
 * Run with: node scripts/generate-docs.js
 * 
 * Uses app's Table component styling for consistent dark mode support
 */

const fs = require('fs');
const path = require('path');

// Simple markdown to HTML converter with dark mode support
function markdownToHtml(markdown) {
  let html = markdown;
  
  // Extract code blocks first to protect them
  const codeBlocks = [];
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const index = codeBlocks.length;
    codeBlocks.push({ lang, code: code.trim() });
    return `__CODE_BLOCK_${index}__`;
  });
  
  // Extract inline code
  const inlineCodes = [];
  html = html.replace(/`([^`]+)`/g, (match, code) => {
    const index = inlineCodes.length;
    inlineCodes.push(code);
    return `__INLINE_CODE_${index}__`;
  });
  
  // Headers - all with dark mode support
  html = html.replace(/^######\s+(.+)$/gm, '<h6 class="text-sm font-semibold mt-4 mb-2 text-gray-900 dark:text-white">$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5 class="text-base font-semibold mt-4 mb-2 text-gray-900 dark:text-white">$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4 class="text-lg font-semibold mt-5 mb-2 text-gray-900 dark:text-white">$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3 class="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-white">$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1 class="flex-1 extra-expanded w-full leading-[1] text-[clamp(2rem,2.5vw,2rem)] mt-0 font-light text-gray-600 dark:text-gray-300 truncate">$1</h1>');
  
  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="my-8 border-gray-200 dark:border-gray-700" />');
  
  // Bold and italic - with dark mode
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white"><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em class="text-gray-700 dark:text-gray-300">$1</em>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Tables - using app's Table component styling
  // First, collect all tables
  const tables = [];
  html = html.replace(/(\|.+\|\n)+/g, (match) => {
    const lines = match.trim().split('\n');
    if (lines.length < 2) return match;
    
    // Check if second line is separator (contains dashes)
    if (!lines[1].includes('---')) return match;
    
    const headerCells = lines[0].split('|').filter(c => c.trim()).map(c => c.trim());
    const bodyRows = lines.slice(2).map(line => 
      line.split('|').filter(c => c.trim()).map(c => c.trim())
    );
    
    const index = tables.length;
    tables.push({ headerCells, bodyRows });
    return `__TABLE_${index}__`;
  });
  
  // Unordered lists - with dark mode
  html = html.replace(/^(\s*)[-*]\s+(.+)$/gm, (match, indent, content) => {
    const level = Math.floor(indent.length / 2);
    const marginClass = level > 0 ? `ml-${level * 4}` : '';
    return `<li class="list-disc list-inside ${marginClass} text-gray-700 dark:text-gray-300">${content}</li>`;
  });
  
  // Ordered lists - with dark mode
  html = html.replace(/^(\s*)\d+\.\s+(.+)$/gm, (match, indent, content) => {
    const level = Math.floor(indent.length / 2);
    const marginClass = level > 0 ? `ml-${level * 4}` : '';
    return `<li class="list-decimal list-inside ${marginClass} text-gray-700 dark:text-gray-300">${content}</li>`;
  });
  
  // Wrap consecutive list items
  html = html.replace(/(<li[^>]*>[\s\S]*?<\/li>\n?)+/g, (match) => {
    if (match.includes('list-disc')) {
      return `<ul class="space-y-1 my-2">${match}</ul>`;
    } else if (match.includes('list-decimal')) {
      return `<ol class="space-y-1 my-2">${match}</ol>`;
    }
    return match;
  });
  
  // Paragraphs - wrap text that's not already wrapped, with dark mode
  html = html.split('\n\n').map(block => {
    block = block.trim();
    if (!block) return '';
    if (block.startsWith('<')) return block;
    if (block.startsWith('__CODE_BLOCK_')) return block;
    if (block.startsWith('__TABLE_')) return block;
    return `<p class="text-gray-700 dark:text-gray-300 my-3">${block}</p>`;
  }).join('\n\n');
  
  // Restore tables with proper dark mode styling (matching app's Table component)
  tables.forEach((table, index) => {
    const headerHtml = table.headerCells.map(cell => 
      `<th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50">${cell}</th>`
    ).join('');
    
    const bodyHtml = table.bodyRows.map(row => 
      `<tr class="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">${
        row.map(cell => 
          `<td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${cell}</td>`
        ).join('')
      }</tr>`
    ).join('');
    
    const tableHtml = `
      <div class="overflow-x-auto my-4 border border-gray-200 dark:border-gray-700 rounded-md">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>${headerHtml}</tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700/50">
            ${bodyHtml}
          </tbody>
        </table>
      </div>`;
    
    html = html.replace(`__TABLE_${index}__`, tableHtml);
  });
  
  // Restore code blocks with Prism.js language classes
  codeBlocks.forEach((block, index) => {
    // Map common language aliases
    const langMap = {
      'ts': 'typescript',
      'js': 'javascript',
      'sh': 'bash',
      'shell': 'bash',
      'yml': 'yaml',
      '': 'plaintext'
    };
    const lang = langMap[block.lang] || block.lang || 'plaintext';
    const langClass = `language-${lang}`;
    
    const escapedCode = block.code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    html = html.replace(
      `__CODE_BLOCK_${index}__`,
      `<pre class="${langClass}"><code class="${langClass}">${escapedCode}</code></pre>`
    );
  });
  
  // Restore inline code
  inlineCodes.forEach((code, index) => {
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    html = html.replace(
      `__INLINE_CODE_${index}__`,
      `<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">${escapedCode}</code>`
    );
  });
  
  // Clean up extra newlines
  html = html.replace(/\n{3,}/g, '\n\n');
  
  return html;
}

// Main execution
const readmePath = path.join(__dirname, '..', 'README.md');
const outputPath = path.join(__dirname, '..', 'src', 'renderer', 'src', 'generated', 'readme-content.ts');

// Ensure output directory exists
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read README.md
const markdown = fs.readFileSync(readmePath, 'utf-8');

// Convert to HTML
const html = markdownToHtml(markdown);

// Generate TypeScript file
const tsContent = `// Auto-generated from README.md - DO NOT EDIT MANUALLY
// Generated at: ${new Date().toISOString()}

export const readmeHtml = \`${html.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`;
`;

// Write output
fs.writeFileSync(outputPath, tsContent);

console.log('✅ Generated readme-content.ts from README.md');
