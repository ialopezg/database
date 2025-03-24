export class BaseError extends Error {
  public cause?: Error;

  /**
   * Constructs a new error with a custom message and an optional cause.
   *
   * @param message - The error message.
   * @param cause - The original error or cause of the error (optional).
   */
  constructor(message: string, cause?: Error) {
    super(message);

    this.name = this.constructor.name;
    this.cause = cause;

    // Capture the stack trace (for V8 engines like Chrome and Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Provides a string representation of the error, including the cause if available.
   * @returns The error message with cause information.
   */
  toString(): string {
    const causeMessage = this.cause ? ` Caused by: ${this.cause.message}` : '';
    return `${this.name}: ${this.message}${causeMessage}`;
  }
}
