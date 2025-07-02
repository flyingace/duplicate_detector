/**
 * IgnoreHandler
 *
 * Handles reading and parsing the .ignore file to determine which files and directories
 * should be excluded from duplicate detection scanning.
 */

import fs from 'fs';
import path from 'path';
import { getDefaultIgnoreContent } from "./DefaultIgnorePatterns";

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
   * Gets the default ignore patterns when no .ignore file is present
   * @returns Default ignore content as a string
   */
  private getDefaultIgnorePatterns(): string {
    return getDefaultIgnoreContent();
  }

  /**
   * Loads and parses the .ignore file from the project root, or uses defaults
   */
  private loadIgnoreFile(): void {
    const ignorePath = path.join(this.projectRoot, '.ignore');

    if (!fs.existsSync(ignorePath)) {
      // No .ignore file found, use default patterns
      console.log('No .ignore file found, using default ignore patterns');
      this.parseIgnoreContent(this.getDefaultIgnorePatterns());
      console.log(`Loaded default ignore patterns: ${this.ignorePatterns.length} patterns`);
      return;
    }

    try {
      const ignoreContent = fs.readFileSync(ignorePath, 'utf-8');
      this.parseIgnoreContent(ignoreContent);
      console.log(`Loaded .ignore file with ${this.ignorePatterns.length} patterns`);
    } catch (error) {
      console.warn(`Warning: Could not read .ignore file, using default patterns: ${error}`);
      this.parseIgnoreContent(this.getDefaultIgnorePatterns());
      console.log(`Loaded default ignore patterns: ${this.ignorePatterns.length} patterns`);
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
   * Creates a sample .ignore file in the project root with default patterns
   * This can be called if users want to customize their ignore patterns
   * @returns true if file was created successfully, false otherwise
   */
  public createSampleIgnoreFile(): boolean {
    const ignorePath = path.join(this.projectRoot, '.ignore');

    if (fs.existsSync(ignorePath)) {
      console.log('.ignore file already exists, not overwriting');
      return false;
    }

    try {
      fs.writeFileSync(ignorePath, this.getDefaultIgnorePatterns());
      console.log(`Created sample .ignore file at: ${ignorePath}`);
      return true;
    } catch (error) {
      console.error(`Error creating .ignore file: ${error}`);
      return false;
    }
  }

  /**
   * Gets the list of loaded ignore patterns
   * @returns Array of ignore patterns
   */
  public getIgnorePatterns(): string[] {
    return [...this.ignorePatterns];
  }

  /**
   * Indicates whether default patterns are being used (no .ignore file found)
   * @returns true if using default patterns, false if using custom .ignore file
   */
  public isUsingDefaults(): boolean {
    const ignorePath = path.join(this.projectRoot, '.ignore');
    return !fs.existsSync(ignorePath);
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
