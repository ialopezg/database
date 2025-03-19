import { expect } from 'chai';

import { greet } from '../greet';

describe('greet function', () => {
  it('should return a greeting message for a given name', () => {
    const result = greet('Alice');
    expect(result).to.equal('👋🏻 Hello, Alice!');
  });

  it('should return a greeting message for a different name', () => {
    const result = greet('Bob');
    expect(result).to.equal('👋🏻 Hello, Bob!');
  });

  it('should handle an empty string as a name', () => {
    const result = greet('');
    expect(result).to.equal('👋🏻 Hello, !');
  });

  it('should handle a name with spaces', () => {
    const result = greet('John Doe');
    expect(result).to.equal('👋🏻 Hello, John Doe!');
  });

  it('should handle names with special characters', () => {
    const result = greet('!@#$%^&*()');
    expect(result).to.equal('👋🏻 Hello, !@#$%^&*()!');
  });

  it('should handle very long names', () => {
    const longName = 'A'.repeat(1000); // A very long name
    const result = greet(longName);
    expect(result).to.equal(`👋🏻 Hello, ${longName}!`);
  });
});
