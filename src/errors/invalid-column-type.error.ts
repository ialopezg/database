// src/errors/invalid-column-type-error.ts

import { BaseError } from './base.error';

/**
 * Thrown when an invalid column type is encountered.
 */
export class InvalidColumnTypeError extends BaseError {
  /**
   * Creates an instance of InvalidColumnTypeError.
   *
   * @param {string} columnName - The name of the column with the invalid type.
   * @param {string} type - The invalid type encountered for the column.
   */
  constructor(columnName: string, type: string) {
    super(`Invalid column type for '${columnName}': '${type}' is not a supported type.`);
  }
}
