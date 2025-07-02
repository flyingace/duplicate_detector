/**
 * DefaultIgnorePatterns
 *
 * Contains the default ignore patterns used when no .ignore file is present
 * in the project root. These patterns cover common directories and files
 * that should typically be excluded from duplicate function detection.
 */

/**
 * Default ignore patterns as an array of strings
 */
export const DEFAULT_IGNORE_PATTERNS: string[] = [
  // Dependency directories
  'node_modules/',
  '.pnpm-store/',
  '.yarn/',
  '.npm/',

  // Build output directories
  'dist/',
  'build/',
  'out/',
  '.next/',
  '.nuxt/',
  '.output/',

  // Test directories and files
  'coverage/',
  '.nyc_output/',
  'test-results/',
  '*.test.ts',
  '*.test.js',
  '*.test.tsx',
  '*.test.jsx',
  '*.spec.ts',
  '*.spec.js',
  '*.spec.tsx',
  '*.spec.jsx',
  '__tests__/',
  '__mocks__/',

  // Generated and compiled files
  '*.generated.ts',
  '*.generated.js',
  '*.d.ts',
  '*.min.js',
  '*.min.css',
  '*.bundle.js',

  // Third-party libraries
  'vendor/',
  'lib/',
  'libs/',
  'public/lib/',
  'assets/vendor/',

  // Configuration files (often auto-generated or third-party)
  '*.config.js',
  '*.config.ts',
  'webpack.config.*',
  'vite.config.*',
  'rollup.config.*',
  'babel.config.*',
  'jest.config.*',
  'tailwind.config.*',

  // Documentation
  'docs/',
  'documentation/',
  '*.md',
  '*.mdx',

  // Development and IDE files
  '.vscode/',
  '.idea/',
  '*.log',
  '*.tmp',
  '.DS_Store',
  'Thumbs.db',

  // Environment and cache
  '.env*',
  '.cache/',
  '.temp/',
  '.tmp/',

  // Specific common files to ignore
  'setup.js',
  'setup.ts',
  'polyfills.js',
  'polyfills.ts',
  'index.html'
];

/**
 * Converts the default ignore patterns array to a formatted string
 * suitable for writing to a .ignore file
 * @returns Formatted ignore content as a string
 */
export function getDefaultIgnoreContent(): string {
  const header = '# Default ignore patterns for Duplicate Detector\n\n';

  const sections = [
    {
      title: '# Dependency directories',
      patterns: DEFAULT_IGNORE_PATTERNS.slice(0, 4)
    },
    {
      title: '# Build output directories',
      patterns: DEFAULT_IGNORE_PATTERNS.slice(4, 10)
    },
    {
      title: '# Test directories and files',
      patterns: DEFAULT_IGNORE_PATTERNS.slice(10, 22)
    },
    {
      title: '# Generated and compiled files',
      patterns: DEFAULT_IGNORE_PATTERNS.slice(22, 28)
    },
    {
      title: '# Third-party libraries',
      patterns: DEFAULT_IGNORE_PATTERNS.slice(28, 33)
    },
    {
      title: '# Configuration files (often auto-generated or third-party)',
      patterns: DEFAULT_IGNORE_PATTERNS.slice(33, 41)
    },
    {
      title: '# Documentation',
      patterns: DEFAULT_IGNORE_PATTERNS.slice(41, 45)
    },
    {
      title: '# Development and IDE files',
      patterns: DEFAULT_IGNORE_PATTERNS.slice(45, 51)
    },
    {
      title: '# Environment and cache',
      patterns: DEFAULT_IGNORE_PATTERNS.slice(51, 55)
    },
    {
      title: '# Specific common files to ignore',
      patterns: DEFAULT_IGNORE_PATTERNS.slice(55)
    }
  ];

  const content = sections.map(section => {
    return section.title + '\n' + section.patterns.join('\n');
  }).join('\n\n');

  return header + content;
}

/**
 * Gets the raw patterns as a simple string (one pattern per line)
 * @returns Simple pattern list as string
 */
export function getDefaultIgnorePatternsAsString(): string {
  return DEFAULT_IGNORE_PATTERNS.join('\n');
}
