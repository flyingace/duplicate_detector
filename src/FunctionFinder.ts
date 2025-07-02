/**
 * FunctionFinder
 * 
 * A module to parse a single TypeScript or JavaScript file and locate function declarations.
 * Supports .ts, .tsx, .js, and .jsx file extensions.
 */

import fs from 'fs';
import path from 'path';
import * as ts from 'typescript';

// Interface for function information
export interface FunctionInfo {
  name: string;
  content: string;
  filePath: string;
  lineNumber: number;
}

/**
 * Checks if a file is a TypeScript or JavaScript file
 * @param filePath - Path to the file
 * @returns Boolean indicating if the file is a TypeScript or JavaScript file
 */
export function isTsJsFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return ext === '.ts' || ext === '.js' || ext === '.tsx' || ext === '.jsx';
}

/**
 * Extracts function declarations from a file using TypeScript's AST
 * @param filePath - Path to the file
 * @returns Array of function information
 */
export function extractFunctions(filePath: string): FunctionInfo[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const functions: FunctionInfo[] = [];

  // Create a source file
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  // Helper function to get line number from position
  const getLineNumber = (pos: number): number => {
    const lineStarts = sourceFile.getLineStarts();
    let lineNumber = 0;

    for (let i = 0; i < lineStarts.length; i++) {
      if (pos < lineStarts[i]) {
        lineNumber = i;
        break;
      }
    }

    return lineNumber > 0 ? lineNumber : 1;
  };

  // Helper function to get the text of a node
  const getNodeText = (node: ts.Node): string => {
    return node.getText(sourceFile);
  };

  // Visit each node in the AST
  function visit(node: ts.Node) {
    let functionName: string | undefined;
    let functionNode: ts.Node | undefined;

    // Function Declaration (function name() {})
    if (ts.isFunctionDeclaration(node) && node.name) {
      functionName = node.name.text;
      functionNode = node;
    }
    // Variable Declaration with Arrow Function or Function Expression
    // (const name = () => {} or const name = function() {})
    else if (ts.isVariableStatement(node)) {
      const declaration = node.declarationList.declarations[0];

      if (declaration && 
          declaration.initializer && 
          (ts.isArrowFunction(declaration.initializer) || 
           ts.isFunctionExpression(declaration.initializer)) && 
          ts.isIdentifier(declaration.name)) {
        functionName = declaration.name.text;
        functionNode = node;
      }
    }
    // Method Declaration in a class (methodName() {})
    else if (ts.isMethodDeclaration(node) && node.name && ts.isIdentifier(node.name)) {
      functionName = node.name.text;
      functionNode = node;
    }

    // If we found a function, add it to our list
    if (functionName && functionNode) {
      const startPos = functionNode.getStart(sourceFile);
      const lineNumber = getLineNumber(startPos);
      const functionContent = getNodeText(functionNode);

      functions.push({
        name: functionName,
        content: functionContent,
        filePath,
        lineNumber
      });
    }

    // Continue traversing the AST
    ts.forEachChild(node, visit);
  }

  // Start the traversal
  visit(sourceFile);

  return functions;
}

/**
 * Parses a file and extracts function declarations
 * @param filePath - Path to the file
 * @returns Array of function information or null if the file is not a TypeScript or JavaScript file
 */
export function parseFile(filePath: string): FunctionInfo[] | null {
  if (!isTsJsFile(filePath)) {
    return null;
  }

  try {
    return extractFunctions(filePath);
  } catch (error) {
    console.error(`Error parsing file ${filePath}:`, error);
    return [];
  }
}
