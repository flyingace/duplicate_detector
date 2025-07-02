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
interface DuplicateFunction {
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
  const reportPath = path.join(reportsDir, `duplicate-functions-${timestamp}.json`);

  // Convert absolute paths to relative paths in the JSON report
  const reportData = duplicates.map(duplicate => ({
    ...duplicate,
    occurrences: duplicate.occurrences.map(occurrence => ({
      ...occurrence,
      filePath: path.relative(projectRoot, occurrence.filePath)
    }))
  }));

  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`Report saved to: ${reportPath}`);
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
