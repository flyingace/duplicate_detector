/**
 * Sample file 1 for testing duplicate function detection
 */

// Regular function declaration
function calculateSum(a: number, b: number): number {
  return a + b;
}

// Arrow function
const multiply = (a: number, b: number): number => {
  return a * b;
};

// Async function
async function fetchData(url: string): Promise<any> {
  const response = await fetch(url);
  return response.json();
}

// This function will be a duplicate
function processData(data: number[]): number[] {const result = data.map(item => item * 2);
  return result.filter(item => item > 10);
}

// This is a different implementation of fetchData
async function fetchData(id: number): Promise<any> {
  const response = await fetch(`https://api.example.com/data/${id}`);
  return response.json();
}
