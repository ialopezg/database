// src/errors/invalid-column-length-error.ts

import { BaseError } from './base.error';

/**
 * Thrown when a column length is invalid.
 */
export class InvalidColumnLengthError extends BaseError {
  /**
   * Creates an instance of InvalidColumnLengthError.
   *
   * @param {string} columnName - The name of the column with the invalid length.
   * @param {number} length - The invalid length provided for the column.
   */
  constructor(columnName: string, length: number) {
    super(
      `Invalid length for column '${columnName}': Length must be a positive number. Provided length: ${length}.`
    );
  }
}
