/**
 * Sample file 3 for testing duplicate function detection
 */

// This is a duplicate of the function in file1.ts
function processData(data: number[]): number[] {
  const result = data.map(item => item * 2);
  return result.filter(item => item > 10);
}

// This is a unique function
function calculateAverage(numbers: number[]): number {
  const sum = numbers.reduce((acc, curr) => acc + curr, 0);
  return sum / numbers.length;
}

// This is a duplicate of calculateSum in file1.ts but with different parameter names
function calculateSum(x: number, y: number): number {
  return x + y;
}
