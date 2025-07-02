# Duplicate Detector

A tool to detect duplicate code in a codebase. It can identify duplicate TypeScript/JavaScript function declarations across multiple files.

## Requirements

- Node.js v20.13.1
- pnpm

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd duplicate-detector

# Install dependencies
pnpm install
```

## Usage

```bash
# Run with a specific directory
pnpm dev <directory-path>

# If no directory is specified, the current directory will be used
pnpm dev

# Build the project
pnpm build

# Run the built project
pnpm start <directory-path>
```

## Features

- Recursively scans all files in a specified directory
- Identifies TypeScript and JavaScript files (.ts, .js, .tsx, .jsx)
- Detects various function declaration patterns:
  - Regular functions: `function name() {}`
  - Arrow functions: `const name = () => {}`
  - Async functions: `async function name() {}`
- Compares function implementations to find duplicates
- Generates a detailed report of duplicate functions with file paths and line numbers
- Saves reports in JSON format to the `reports` directory

## Example Output

```
Duplicate Detector initialized
Node.js version: v20.13.1
Scanning directory: src/test
Found 3 files
Found 3 TypeScript/JavaScript files
Found 9 function declarations
Found 1 duplicate function declarations:
1. Function: processData
   Occurrences:
   - src/test/file1.ts:22
   - src/test/file2.ts:11
   - src/test/file3.ts:6
Report saved to: reports/duplicate-functions-2023-07-01T01-54-45.809Z.json
```

## License

ISC
