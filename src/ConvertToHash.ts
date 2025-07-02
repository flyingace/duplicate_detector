import crypto from 'crypto';

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

function convertSignatureToHash(normalizedSignature: string) {
  return crypto.createHash('sha256')
    .update(normalizedSignature)
    .digest('hex');
}

const hashGroups = new Map();

// Group by hash instead of full string comparison
function addFunctionToHashGroup(functionHash: string, lineNumber: string, name: string, path: string) {
  if (!hashGroups.has(functionHash)) {
    hashGroups.set(functionHash, [{lineNumber, name, path}]);
  }
  hashGroups.get(functionHash).push({lineNumber, name, path});
}

// get the function information extracted by FunctionFinder.ts
// normalize the value of `content` (the function declaration) from that information
// take the normalized function signature and convert it to a hash
// add the hash plus the remaining function information to a Map
/*
for (const func of allFunctions) {
  const hash = hashFunction(createNormalizedSignature(func));
  if (!hashGroups.has(hash)) {
    hashGroups.set(hash, []);
  }
  hashGroups.get(hash).push(func);
}
 */
