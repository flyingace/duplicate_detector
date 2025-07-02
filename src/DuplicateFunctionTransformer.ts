/**
 * Duplicate Function Transformer
 * 
 * Finds and transforms duplicate functions into a user-friendly format.
 */

import { FunctionInfo } from './FunctionFinder';

// Interface for duplicate function information
export interface DuplicateFunction {
  name: string;
  occurrences: {
    filePath: string;
    lineNumber: number;
  }[];
}

/**
 * Normalizes function content by removing whitespace, formatting differences, and parameter names
 * @param content - Function content to normalize
 * @returns Normalized function content
 */
function normalizeContent(content: string): string {
  // Extract the function signature (everything before the opening brace)
  const openBraceIndex = content.indexOf('{');
  if (openBraceIndex === -1) return content.replace(/\s+/g, '');

  const signature = content.substring(0, openBraceIndex + 1);
  const body = content.substring(openBraceIndex + 1);

  // Normalize the signature by replacing parameter names
  let normalizedSignature = signature;
  const paramRegex = /\(([^)]*)\)/g;
  let paramMatch;

  while ((paramMatch = paramRegex.exec(normalizedSignature)) !== null) {
    const params = paramMatch[1];
    if (params.trim()) {
      // Replace parameter names with placeholders
      const normalizedParams = params.split(',')
        .map((param, index) => `param${index}`)
        .join(',');

      // Replace the original parameters with normalized ones
      normalizedSignature = normalizedSignature.substring(0, paramMatch.index + 1) + 
                  normalizedParams + 
                  normalizedSignature.substring(paramMatch.index + paramMatch[0].length - 1);
    }
  }

  // For the body, we'll use a simplified approach:
  // 1. Remove all variable names in return statements
  // 2. Keep only operators and structural elements
  let normalizedBody = body;

  // Replace return statements with a simplified form
  // For example, "return a + b;" becomes "return+;"
  normalizedBody = normalizedBody.replace(/return\s+[^;]+;/g, (match) => {
    // Keep only operators and remove identifiers
    return match.replace(/[a-zA-Z0-9_$]+/g, '').replace(/\s+/g, '');
  });

  // Combine the normalized signature and body
  const normalized = normalizedSignature + normalizedBody;

  // Remove all whitespace
  return normalized.replace(/\s+/g, '');
}

/**
 * Finds duplicate functions across files
 * @param functions - Array of function information
 * @returns Array of duplicate function information
 */
export function findDuplicateFunctions(allFunctions: FunctionInfo[]): DuplicateFunction[] {
  const functionMap = new Map<string, FunctionInfo[]>();

  // Group functions by normalized content
  allFunctions.forEach(func => {
    const key = normalizeContent(func.content);
    if (!functionMap.has(key)) {
      functionMap.set(key, []);
    }
    functionMap.get(key)!.push(func);
  });

  // Filter for duplicates
  const duplicates: DuplicateFunction[] = [];

  functionMap.forEach((functions) => {
    if (functions.length > 1) {
      duplicates.push({
        name: functions[0].name,
        occurrences: functions.map((func) => ({
          filePath: func.filePath,
          lineNumber: func.lineNumber
        }))
      });
    }
  });

  return duplicates;
}
