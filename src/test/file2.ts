/**
 * Sample file 2 for testing duplicate function detection
 */

// This is a unique function
function calculateDifference(a: number, b: number): number {
  return a - b;
}

// This is a duplicate of the function in file1.ts
function processData(data: number[]): number[] {
  const result = data.map(item => item * 2);
  return result.filter(item => item > 10);
}

// Another unique function with a different implementation
const multiply = (a: number, b: number): number => {
  let result = 0;
  for (let i = 0; i < b; i++) {
    result += a;
  }
  return result;
};
