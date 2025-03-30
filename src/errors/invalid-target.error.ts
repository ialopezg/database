/**
 * Error thrown when an invalid target constructor is passed to metadata.
 */
export class InvalidTargetError extends Error {
  constructor(context: string, target: unknown) {
    super(
      `Invalid target provided to ${context}. Expected a class constructor but received: ${typeof target}`,
    );
  }
}
