// src/errors/base-error.ts

/**
 * Base class for custom errors. Provides common functionality for all specific error types.
 */
export class BaseError extends Error {
  /**
   * Creates an instance of BaseError.
   *
   * @param {string} message - The error message.
   */
  constructor(message: string) {
    super(message);

    this.name = this.constructor.name; // Automatically sets the error name to the class name
    Error.captureStackTrace(this, this.constructor); // Captures the stack trace
  }
}
