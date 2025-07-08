import fs from 'fs';
import path from 'path';
import { convertToMarkdown } from './index';

// Mock duplicate functions data
const mockDuplicates = [
  {
    name: 'getRequestHeaders',
    occurrences: [
      { filePath: 'file1.ts', lineNumber: 10 },
      { filePath: 'file2.ts', lineNumber: 20 },
      { filePath: 'file3.ts', lineNumber: 30 }
    ]
  },
  {
    name: 'getRequestHeaders',
    occurrences: [
      { filePath: 'file4.ts', lineNumber: 40 },
      { filePath: 'file5.ts', lineNumber: 50 }
    ]
  },
  {
    name: 'uniqueFunction',
    occurrences: [
      { filePath: 'file6.ts', lineNumber: 60 },
      { filePath: 'file7.ts', lineNumber: 70 }
    ]
  }
];

// Generate markdown report
const markdown = convertToMarkdown(mockDuplicates);

// Create reports directory if it doesn't exist
const reportsDir = path.join(process.cwd(), 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir);
}

// Write report to file
const timestamp = new Date().toISOString().replace(/:/g, '-');
const reportPath = path.join(reportsDir, `test-asterisk-${timestamp}.md`);
fs.writeFileSync(reportPath, markdown);

console.log(`Test report saved to: ${reportPath}`);
