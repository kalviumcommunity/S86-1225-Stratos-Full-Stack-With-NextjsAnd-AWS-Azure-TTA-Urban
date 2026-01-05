/**
 * Math utility functions for demonstration purposes
 * These functions showcase basic unit testing principles
 */

/**
 * Add two numbers
 * @param a First number
 * @param b Second number
 * @returns Sum of a and b
 */
export const add = (a: number, b: number): number => {
  return a + b;
};

/**
 * Subtract two numbers
 * @param a First number
 * @param b Second number
 * @returns Difference of a and b
 */
export const subtract = (a: number, b: number): number => {
  return a - b;
};

/**
 * Multiply two numbers
 * @param a First number
 * @param b Second number
 * @returns Product of a and b
 */
export const multiply = (a: number, b: number): number => {
  return a * b;
};

/**
 * Divide two numbers
 * @param a Dividend
 * @param b Divisor
 * @returns Quotient of a divided by b
 * @throws Error if divisor is zero
 */
export const divide = (a: number, b: number): number => {
  if (b === 0) {
    throw new Error("Cannot divide by zero");
  }
  return a / b;
};

/**
 * Calculate the average of an array of numbers
 * @param numbers Array of numbers
 * @returns Average value
 * @throws Error if array is empty
 */
export const average = (numbers: number[]): number => {
  if (numbers.length === 0) {
    throw new Error("Cannot calculate average of empty array");
  }
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
};
