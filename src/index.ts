/**
 * Duplicate Detector
 *
 * A tool to detect duplicate code in a codebase.
 * Detects duplicate TypeScript/JavaScript function declarations across files using hash-based comparison.
 */

import fs from 'fs';
import path from 'path';
import { FunctionInfo, parseFile, isTsJsFile } from './FunctionFinder';
import { processFunctionForHashing, getDuplicateHashGroups, clearHashGroups } from './ConvertToHash';
import { IgnoreHandler } from './IgnoreHandler';

/**
 * Interface for duplicate function reporting
 */
export interface DuplicateFunction {
  name: string;
  occurrences: {
    filePath: string;
    lineNumber: number;
  }[];
}

/**
 * Reads all files from a directory recursively, respecting ignore patterns
 * @param dirPath - Path to the directory (project root)
 * @param ignoreHandler - Handler for ignore patterns
 * @param fileList - List to store file paths
 * @returns Array of file paths
 */
function readFilesRecursively(dirPath: string, ignoreHandler: IgnoreHandler, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);

    // Check if this path should be ignored
    if (ignoreHandler.shouldIgnore(filePath)) {
      return; // Skip this file/directory
    }

    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      readFilesRecursively(filePath, ignoreHandler, fileList);
    } else {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Filters for TypeScript and JavaScript files (.js, .jsx, .ts, .tsx)
 * @param filePaths - Array of file paths
 * @returns Array of TypeScript and JavaScript file paths
 */
function filterTsJsFiles(filePaths: string[]): string[] {
  return filePaths.filter(filePath => isTsJsFile(filePath));
}

/**
 * Parses all TypeScript/JavaScript files and processes functions for hash grouping
 * @param filePaths - Array of file paths
 * @returns Total number of functions processed
 */
function parseAndHashFunctions(filePaths: string[]): number {
  let totalFunctions = 0;

  filePaths.forEach(filePath => {
    const functions = parseFile(filePath);
    if (functions) {
      // Process each function for hash grouping
      functions.forEach(func => {
        processFunctionForHashing(func);
        totalFunctions++;
      });
    }
  });

  return totalFunctions;
}

/**
 * Generates a report of duplicate functions from hash groups
 * @param duplicates - Array of duplicate function information
 * @param projectRoot - The root directory of the project
 */
function generateReport(duplicates: DuplicateFunction[], projectRoot: string): void {
  if (duplicates.length === 0) {
    console.log('No duplicate functions found.');
    return;
  }

  console.log(`Found ${duplicates.length} duplicate function declarations:`);

  duplicates.forEach((duplicate, index) => {
    console.log(`${index + 1}. Function: ${duplicate.name}`);
    console.log('   Occurrences:');

    duplicate.occurrences.forEach(occurrence => {
      // Make file paths relative to project root for cleaner output
      const relativePath = path.relative(projectRoot, occurrence.filePath);
      console.log(`   - ${relativePath}:${occurrence.lineNumber}`);
    });

    console.log('');
  });

  // Create reports directory if it doesn't exist
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }

  // Write report to file
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const reportFilename = `duplicate-functions-${timestamp}.md`;
  const reportPath = path.join(reportsDir, reportFilename);

  // Convert absolute paths to relative paths in the report data
  const reportData = duplicates.map(duplicate => ({
    ...duplicate,
    occurrences: duplicate.occurrences.map(occurrence => ({
      ...occurrence,
      filePath: path.relative(projectRoot, occurrence.filePath)
    }))
  }));

  // Convert the report data to markdown format
  const markdownContent = convertToMarkdown(reportData, timestamp, reportFilename);

  fs.writeFileSync(reportPath, markdownContent);
  console.log(`Report saved to: ${reportPath}`);
}

/**
 * Converts duplicate function data to markdown format
 * @param duplicates - Array of duplicate function information
 * @param timestamp - ISO timestamp when the report was generated (optional)
 * @param reportFilename - Name of the report file (optional)
 * @returns Markdown formatted string
 */
export function convertToMarkdown(
  duplicates: DuplicateFunction[], 
  timestamp?: string, 
  reportFilename?: string
): string {
  if (duplicates.length === 0) {
    return '# Duplicate Functions Report\n\nNo duplicate functions found.';
  }

  let markdown = '# Duplicate Functions Report\n\n';

  // Add human-readable date and time
  if (timestamp) {
    // Parse the ISO timestamp format: 2025-07-08T03-36-25.232Z
    // First convert it back to standard ISO format by replacing hyphens with colons in the time part
    const isoTimestamp = timestamp.replace(/(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2}\.\d{3})Z/, '$1T$2:$3:$4Z');
    const date = new Date(isoTimestamp);
    markdown += `Report generated on: ${date.toLocaleString()}\n\n`;
  }

  // Add summary of what's included in the report
  markdown += `This report contains ${duplicates.length} duplicate function declarations found in the codebase.\n`;
  markdown += `Functions with the same name but different implementations are marked with an asterisk (*).\n\n`;

  markdown += '<style>\n  table { font-size: calc(1em + 2px); }\n</style>\n\n';
  markdown += '| Function Name | Occurrences |\n';
  markdown += '|:--|:-- |\n';

  // Count occurrences of each function name
  const functionNameCount: Record<string, number> = {};
  duplicates.forEach(duplicate => {
    functionNameCount[duplicate.name] = (functionNameCount[duplicate.name] || 0) + 1;
  });

  duplicates.forEach(duplicate => {
    const occurrencesList = duplicate.occurrences.map((occurrence, index) => {
      return `<li>${occurrence.filePath}, line ${occurrence.lineNumber}</li>`;
    }).join('');

    // Add an asterisk if this function name appears multiple times
    const nameWithAsterisk = functionNameCount[duplicate.name] > 1 
      ? `${duplicate.name}*` 
      : duplicate.name;

    markdown += `| **${nameWithAsterisk}** | <ol>${occurrencesList}</ol> |\n`;
  });

  // Add the report filename at the bottom
  if (reportFilename) {
    markdown += `\n\nReport file: ${reportFilename}`;
  }

  return markdown;
}

/**
 * Main function to detect duplicate functions in a project directory
 * @param projectRoot - Path to the project's root directory
 */
function detectDuplicateFunctions(projectRoot: string): void {
  console.log('Duplicate Detector initialized');
  console.log('Node.js version:', process.version);
  console.log(`Scanning project directory: ${projectRoot}`);

  // Initialize ignore handler
  const ignoreHandler = new IgnoreHandler(projectRoot);

  // Provide helpful information about ignore patterns
  if (ignoreHandler.isUsingDefaults()) {
    console.log('💡 Tip: Create a .ignore file in your project root to customize ignore patterns');
  }

  // Clear any existing hash groups from previous runs
  clearHashGroups();

  // Step 3: Scan all files in the project and locate TypeScript/JavaScript files
  const allFiles = readFilesRecursively(projectRoot, ignoreHandler);
  console.log(`Found ${allFiles.length} files (after applying ignore patterns)`);

  const tsJsFiles = filterTsJsFiles(allFiles);
  console.log(`Found ${tsJsFiles.length} TypeScript/JavaScript files`);

  // Step 4 & 5: Parse each file to locate functions and process them for hashing
  const totalFunctions = parseAndHashFunctions(tsJsFiles);
  console.log(`Found ${totalFunctions} function declarations`);

  // Step 6: Generate report from hash groups
  const duplicates = getDuplicateHashGroups();
  generateReport(duplicates, projectRoot);
}

function main(): void {
  // Get directory path and options from command line arguments
  const args = process.argv.slice(2);

  // Check for special commands
  if (args.includes('--create-ignore') || args.includes('-ci')) {
    const projectRoot = args.find(arg => !arg.startsWith('-')) || process.cwd();
    const ignoreHandler = new IgnoreHandler(projectRoot);
    ignoreHandler.createSampleIgnoreFile();
    return;
  }

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Duplicate Detector - Find duplicate functions in your codebase

Usage:
  pnpm dev [directory]                  # Scan directory for duplicates
  pnpm dev --create-ignore [directory]  # Create sample .ignore file
  pnpm dev --help                       # Show this help

Options:
  --create-ignore, -ci    Create a sample .ignore file with default patterns
  --help, -h              Show help information

Examples:
  pnpm dev                              # Scan current directory
  pnpm dev ./my-project                 # Scan specific directory
  pnpm dev --create-ignore ./my-project # Create .ignore file in project
`);
    return;
  }

  const projectRoot = args.find(arg => !arg.startsWith('-')) || process.cwd();

  // Ensure the provided path exists and is a directory
  if (!fs.existsSync(projectRoot)) {
    console.error(`Error: Directory "${projectRoot}" does not exist.`);
    process.exit(1);
  }

  const stat = fs.statSync(projectRoot);
  if (!stat.isDirectory()) {
    console.error(`Error: "${projectRoot}" is not a directory.`);
    process.exit(1);
  }

  detectDuplicateFunctions(projectRoot);
}

main();
