/**
 * Duplicate Detector
 * 
 * A tool to detect duplicate code in a codebase.
 * Detects duplicate TypeScript/JavaScript function declarations across files.
 */

import fs from 'fs';
import path from 'path';
import { FunctionInfo, parseFile, isTsJsFile } from './FunctionFinder';
import { DuplicateFunction, findDuplicateFunctions } from './DuplicateFunctionTransformer';

/**
 * Reads all files from a directory recursively
 * @param dirPath - Path to the directory
 * @param fileList - List to store file paths
 * @returns Array of file paths
 */
function readFilesRecursively(dirPath: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      readFilesRecursively(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Filters for TypeScript and JavaScript files
 * @param filePaths - Array of file paths
 * @returns Array of TypeScript and JavaScript file paths
 */
function filterTsJsFiles(filePaths: string[]): string[] {
  return filePaths.filter(filePath => isTsJsFile(filePath));
}

/**
 * Parses multiple files and extracts function declarations
 * @param filePaths - Array of file paths
 * @returns Array of function information from all files
 */
function parseFiles(filePaths: string[]): FunctionInfo[] {
  const allFunctions: FunctionInfo[] = [];

  filePaths.forEach(filePath => {
    const functions = parseFile(filePath);
    if (functions) {
      allFunctions.push(...functions);
    }
  });

  return allFunctions;
}

/**
 * Generates a report of duplicate functions
 * @param duplicates - Array of duplicate function information
 */
function generateReport(duplicates: DuplicateFunction[]): void {
  if (duplicates.length === 0) {
    console.log('No duplicate functions found.');
    return;
  }

  console.log(`Found ${duplicates.length} duplicate function declarations:\n`);

  duplicates.forEach((duplicate, index) => {
    console.log(`${index + 1}. Function: ${duplicate.name}`);
    console.log('   Occurrences:');

    duplicate.occurrences.forEach(occurrence => {
      console.log(`   - ${occurrence.filePath}:${occurrence.lineNumber}`);
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

  fs.writeFileSync(reportPath, JSON.stringify(duplicates, null, 2));
  console.log(`Report saved to: ${reportPath}`);
}

/**
 * Main function to detect duplicate functions in a directory
 * @param dirPath - Path to the directory to scan
 */
function detectDuplicateFunctions(dirPath: string): void {
  console.log(`Scanning directory: ${dirPath}`);

  // Read all files
  const allFiles = readFilesRecursively(dirPath);
  console.log(`Found ${allFiles.length} files`);

  // Filter for TypeScript and JavaScript files
  const tsJsFiles = filterTsJsFiles(allFiles);
  console.log(`Found ${tsJsFiles.length} TypeScript/JavaScript files`);

  // Parse files and extract functions
  const allFunctions = parseFiles(tsJsFiles);
  console.log(`Found ${allFunctions.length} function declarations`);

  // Find duplicate functions
  const duplicates = findDuplicateFunctions(allFunctions);

  // Generate report
  generateReport(duplicates);
}

function main(): void {
  console.log('Duplicate Detector initialized');
  console.log('Node.js version:', process.version);

  // Get directory path from command line arguments
  const args = process.argv.slice(2);
  const dirPath = args[0] || process.cwd();

  detectDuplicateFunctions(dirPath);
}

main();
