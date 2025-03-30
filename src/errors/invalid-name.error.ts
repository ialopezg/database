import { BaseError } from './base.error';

/**
 * Thrown when a table, column, or constraint name is invalid.
 * Used to enforce safety when interacting with the database schema.
 */
export class InvalidNameError extends BaseError {
  constructor(kind: string) {
    super(`${kind} must not be empty or invalid.`);
  }
}
