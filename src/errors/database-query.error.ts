import { BaseError } from './base.error';

/**
 * Represents an error that occurs during a database query.
 */
export class DatabaseQueryError extends BaseError {
  /**
   * Constructs a new database query error with a custom message and an optional cause.
   *
   * @param message - The error message.
   * @param cause - The original error or cause of the error (optional).
   */
  constructor(message: string, cause?: Error) {
    super(message, cause); // Pass message and cause to the BaseError constructor
  }
}
