import { TableMetadata } from '../../../builders/metadata';
import { Constructor } from '../../../types';
import { InvalidTargetError } from '../../../errors';
import { NamingStrategy } from '../../../strategies';

class SampleEntity {}
class AbstractEntity {}

describe('TableMetadata', () => {
  it('should store and return the target class', () => {
    const metadata = new TableMetadata(SampleEntity);
    expect(metadata.target).toBe(SampleEntity);
  });

  it('should throw InvalidTargetError if target is not a constructor', () => {
    expect(() => new TableMetadata(undefined as unknown as Constructor)).toThrow(InvalidTargetError);
    expect(() => new TableMetadata(123 as unknown as Constructor)).toThrow(InvalidTargetError);
    expect(() => new TableMetadata({} as unknown as Constructor)).toThrow(InvalidTargetError);
  });

  it('should default isAbstract to false if not provided', () => {
    const metadata = new TableMetadata(SampleEntity);
    expect(metadata.isAbstract).toBe(false);
  });

  it('should return true for isAbstract if explicitly set', () => {
    const metadata = new TableMetadata(AbstractEntity, true);
    expect(metadata.isAbstract).toBe(true);
  });

  it('should return class name as table name if no namingStrategy is set', () => {
    const metadata = new TableMetadata(SampleEntity);
    expect(metadata.name).toBe('SampleEntity');
  });

  it('should use namingStrategy to resolve the table name', () => {
    const metadata = new TableMetadata(SampleEntity);
    const mockStrategy: NamingStrategy = {} as NamingStrategy;
    metadata.namingStrategy = mockStrategy;
    metadata.namingStrategy.tableName = jest.fn().mockReturnValue('custom_table_name');

    expect(metadata.name).toBe('custom_table_name');
    expect(mockStrategy.tableName).toHaveBeenCalledWith('SampleEntity');
  });
});
