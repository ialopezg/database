// src/errors/invalid-column-options-error.ts

import { BaseError } from './base.error';

/**
 * Thrown when any column option is invalid, such as an invalid combination of column constraints.
 */
export class InvalidColumnOptionsError extends BaseError {
  /**
   * Creates an instance of InvalidColumnOptionsError.
   *
   * @param {string} message - The error message describing the invalid column options.
   */
  constructor(message: string) {
    super(`Invalid column options: ${message}`);
  }
}
