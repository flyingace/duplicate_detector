# Duplicate Detector

A powerful tool to detect duplicate code in a codebase using hash-based comparison. It identifies duplicate TypeScript/JavaScript function declarations across multiple files with high accuracy and performance.

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

### Basic Usage

```bash
# Scan the current directory
pnpm dev

# Scan a specific project directory
pnpm dev <directory-path>

# Examples:
pnpm dev ./my-react-app
pnpm dev ../backend-api
pnpm dev /Users/john/projects/my-app
```

### Advanced Usage

```bash
# Create a sample .ignore file with default patterns
pnpm dev --create-ignore <directory-path>

# Show help information
pnpm dev --help

# Build the project for production use
pnpm build

# Run the built project
pnpm start <directory-path>
```

### Command Line Options

- `--create-ignore`, `-ci`: Create a sample .ignore file with default patterns
- `--help`, `-h`: Show help information

## Features

### Core Functionality
- **Hash-based duplicate detection**: Uses SHA-256 hashing of normalized function signatures for accurate comparison
- **Recursive file scanning**: Scans all files in a directory and its subdirectories
- **Multi-language support**: Identifies TypeScript and JavaScript files (.ts, .js, .tsx, .jsx)
- **Comprehensive function detection**: Detects various function declaration patterns:
  - Regular functions: `function name() {}`
  - Arrow functions: `const name = () => {}`
  - Async functions: `async function name() {}`
  - Class methods: `methodName() {}`
  - Function expressions: `const name = function() {}`

### Smart Filtering
- **Automatic ignore patterns**: Uses sensible defaults when no .ignore file is present
- **Customizable ignore files**: Create `.ignore` files to exclude specific directories and files
- **Common exclusions**: Automatically ignores dependencies, build outputs, test files, and generated code

### Reporting
- **Detailed console output**: Shows function names, file paths, and line numbers
- **JSON reports**: Saves detailed reports in the `reports` directory with timestamps
- **Relative path display**: Shows clean, relative paths for better readability

## Ignore File Support

The Duplicate Detector supports `.ignore` files to exclude irrelevant code from analysis.

### Default Ignore Patterns

When no `.ignore` file is present, the tool automatically excludes:
- **Dependencies**: `node_modules/`, `.pnpm-store/`, `.yarn/`
- **Build outputs**: `dist/`, `build/`, `.next/`, `.nuxt/`
- **Test files**: `*.test.ts`, `*.spec.js`, `__tests__/`, `coverage/`
- **Generated files**: `*.generated.ts`, `*.d.ts`, `*.min.js`
- **Config files**: `webpack.config.*`, `vite.config.*`, etc.
- **Documentation**: `docs/`, `*.md`, `*.mdx`

### Creating Custom Ignore Files

```bash
# Create a sample .ignore file to customize
pnpm dev --create-ignore ./my-project

# Edit the .ignore file to add your own patterns
# Then run the detector
pnpm dev ./my-project
```

Example `.ignore` file:
```
# Custom ignore patterns
legacy/
third-party/
*.backup.js
temp-files/
```

## Example Output

```
Duplicate Detector initialized
Node.js version: v20.13.1
Scanning project directory: ./my-react-app
Loaded .ignore file with 23 patterns
Found 127 files (after applying ignore patterns)
Found 89 TypeScript/JavaScript files
Found 342 function declarations
Found 2 duplicate function declarations:

1. Function: validateEmail
   Occurrences:
   - src/utils/validation.ts:15
   - src/components/LoginForm.tsx:8
   - src/pages/signup.tsx:22

2. Function: formatCurrency
   Occurrences:
   - src/utils/formatting.ts:45
   - src/components/PriceDisplay.tsx:12

Report saved to: reports/duplicate-functions-2025-07-02T10-30-15.123Z.json
```

## How It Works

1. **Project Scanning**: Recursively scans the specified directory
2. **File Filtering**: Identifies TypeScript/JavaScript files while respecting ignore patterns
3. **Function Extraction**: Uses TypeScript's AST parser to locate all function declarations
4. **Normalization**: Removes comments, whitespace, and formatting differences
5. **Hash Generation**: Creates SHA-256 hashes of normalized function signatures
6. **Duplicate Detection**: Groups functions by hash to identify duplicates
7. **Report Generation**: Outputs results to console and saves detailed JSON reports

## Workflow Integration

The Duplicate Detector is designed to integrate easily into development workflows:

```bash
# Add to package.json scripts
"scripts": {
  "check-duplicates": "duplicate-detector .",
  "check-duplicates:ci": "duplicate-detector . && echo 'No duplicates found'"
}

# Use in CI/CD pipelines
pnpm check-duplicates
```

## Performance

- **Fast scanning**: Hash-based comparison is much faster than string comparison
- **Memory efficient**: Processes files incrementally without loading entire codebase
- **Scalable**: Handles large codebases with thousands of files efficiently

## License

ISC
