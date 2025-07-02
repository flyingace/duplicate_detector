/**
 * IgnoreHandler
 * 
 * Handles reading and parsing the .ignore file to determine which files and directories
 * should be excluded from duplicate detection scanning.
 */

import fs from 'fs';
import path from 'path';

/**
 * Class to handle ignore patterns similar to .gitignore
 */
export class IgnoreHandler {
  private ignorePatterns: string[] = [];
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.loadIgnoreFile();
  }

  /**
   * Loads and parses the .ignore file from the project root
   */
  private loadIgnoreFile(): void {
    const ignorePath = path.join(this.projectRoot, '.ignore');
    
    if (!fs.existsSync(ignorePath)) {
      // No .ignore file found, continue without ignore patterns
      return;
    }

    try {
      const ignoreContent = fs.readFileSync(ignorePath, 'utf-8');
      this.parseIgnoreContent(ignoreContent);
      console.log(`Loaded .ignore file with ${this.ignorePatterns.length} patterns`);
    } catch (error) {
      console.warn(`Warning: Could not read .ignore file: ${error}`);
    }
  }

  /**
   * Parses the content of the .ignore file
   * @param content - The content of the .ignore file
   */
  private parseIgnoreContent(content: string): void {
    const lines = content.split('\n');
    
    this.ignorePatterns = lines
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('#')) // Remove comments and empty lines
      .map(pattern => {
        // Normalize patterns
        if (pattern.endsWith('/')) {
          // Directory pattern - remove trailing slash for consistency
          return pattern.slice(0, -1);
        }
        return pattern;
      });
  }

  /**
   * Checks if a file path should be ignored based on the ignore patterns
   * @param filePath - The file path to check (can be absolute or relative)
   * @returns true if the file should be ignored, false otherwise
   */
  public shouldIgnore(filePath: string): boolean {
    // Convert to relative path from project root
    const relativePath = path.relative(this.projectRoot, filePath);
    
    // Split the path into segments for matching
    const pathSegments = relativePath.split(path.sep);
    const fullPath = relativePath.replace(/\\/g, '/'); // Normalize path separators
    
    for (const pattern of this.ignorePatterns) {
      if (this.matchesPattern(pattern, fullPath, pathSegments)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Checks if a path matches an ignore pattern
   * @param pattern - The ignore pattern
   * @param fullPath - The full relative path
   * @param pathSegments - The path split into segments
   * @returns true if the pattern matches
   */
  private matchesPattern(pattern: string, fullPath: string, pathSegments: string[]): boolean {
    // Normalize pattern separators
    const normalizedPattern = pattern.replace(/\\/g, '/');
    
    // Exact match
    if (fullPath === normalizedPattern) {
      return true;
    }
    
    // Directory match - check if any path segment matches the pattern
    if (!normalizedPattern.includes('/')) {
      // Simple pattern like "node_modules" should match any directory or file with that name
      return pathSegments.some(segment => segment === normalizedPattern);
    }
    
    // Path-based matching
    if (normalizedPattern.includes('/')) {
      // Check if the full path starts with the pattern
      if (fullPath.startsWith(normalizedPattern + '/') || fullPath === normalizedPattern) {
        return true;
      }
    }
    
    // Wildcard matching for file extensions
    if (normalizedPattern.startsWith('*')) {
      const extension = normalizedPattern.substring(1); // Remove the *
      return fullPath.endsWith(extension);
    }
    
    // Pattern matching for files ending with specific patterns
    if (normalizedPattern.includes('*')) {
      const regex = new RegExp(normalizedPattern.replace(/\*/g, '.*'));
      return regex.test(fullPath);
    }
    
    return false;
  }

  /**
   * Gets the list of loaded ignore patterns
   * @returns Array of ignore patterns
   */
  public getIgnorePatterns(): string[] {
    return [...this.ignorePatterns];
  }

  /**
   * Filters a list of file paths, removing those that should be ignored
   * @param filePaths - Array of file paths to filter
   * @returns Array of file paths that should not be ignored
   */
  public filterIgnoredPaths(filePaths: string[]): string[] {
    return filePaths.filter(filePath => !this.shouldIgnore(filePath));
  }
}