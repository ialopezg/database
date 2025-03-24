import { BaseError } from './base.error';

/**
 * Custom error class for invalid table name.
 */
export class InvalidTableNameError extends BaseError {
  constructor(message: string) {
    super(message);
  }
}
