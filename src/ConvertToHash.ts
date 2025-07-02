import crypto from 'crypto';
import { FunctionInfo } from './FunctionFinder';

/**
 * Normalizes a function signature by removing formatting and comments
 * @param functionDeclaration - The function declaration to normalize
 * @returns The normalized function signature as a string
 */
export function normalizeFunctionSignature(functionDeclaration: string): string {
  // Remove single-line comments
  let normalized = functionDeclaration.replace(/\/\/.*$/gm, '');

  // Remove multi-line comments
  normalized = normalized.replace(/\/\*[\s\S]*?\*\//g, '');

  // Remove all whitespace (spaces, tabs, newlines)
  normalized = normalized.replace(/\s+/g, '');

  return normalized;
}

/**
 * Converts a normalized signature to a SHA-256 hash
 * @param normalizedSignature - The normalized function signature
 * @returns The SHA-256 hash of the signature
 */
function convertSignatureToHash(normalizedSignature: string): string {
  return crypto.createHash('sha256')
    .update(normalizedSignature)
    .digest('hex');
}

// Map to store hash groups: hash -> array of function occurrences
export const hashGroups = new Map<string, Array<{
  lineNumber: number;
  name: string;
  path: string;
}>>();

/**
 * Adds function information to the hash group based on its normalized signature hash
 * @param functionHash - The hash of the normalized function signature
 * @param lineNumber - The line number where the function appears
 * @param name - The name of the function
 * @param path - The file path where the function is located
 */
function addFunctionToHashGroup(functionHash: string, lineNumber: number, name: string, path: string): void {
  if (!hashGroups.has(functionHash)) {
    hashGroups.set(functionHash, []);
  }
  hashGroups.get(functionHash)!.push({ lineNumber, name, path });
}

/**
 * Processes a function and adds it to the appropriate hash group
 * @param func - The function information extracted by FunctionFinder
 */
export function processFunctionForHashing(func: FunctionInfo): void {
  // Normalize the function content
  const normalizedSignature = normalizeFunctionSignature(func.content);

  // Convert to hash
  const functionHash = convertSignatureToHash(normalizedSignature);

  // Add to hash group
  addFunctionToHashGroup(functionHash, func.lineNumber, func.name, func.filePath);
}

/**
 * Clears all hash groups (useful for testing or restarting the process)
 */
export function clearHashGroups(): void {
  hashGroups.clear();
}

/**
 * Gets all hash groups that contain duplicates (more than one occurrence)
 * @returns Array of duplicate function groups
 */
export function getDuplicateHashGroups(): Array<{
  name: string;
  occurrences: Array<{
    filePath: string;
    lineNumber: number;
  }>;
}> {
  const duplicates: Array<{
    name: string;
    occurrences: Array<{
      filePath: string;
      lineNumber: number;
    }>;
  }> = [];

  hashGroups.forEach((functions) => {
    if (functions.length > 1) {
      // Use the name from the first occurrence
      duplicates.push({
        name: functions[0].name,
        occurrences: functions.map((func) => ({
          filePath: func.path,
          lineNumber: func.lineNumber
        }))
      });
    }
  });

  return duplicates;
}
