import { ColumnMetadata, ForeignKeyMetadata, TableMetadata } from '../../../builders/metadata';
import { InvalidNameError } from '../../../errors';

describe('ForeignKeyMetadata', () => {
  class Dummy {}
  class Referenced {}

  const dummyTable = new TableMetadata(Dummy);
  const referencedTable = new TableMetadata(Referenced);

  const columnA = { name: 'user_id', type: 'int' } as unknown as ColumnMetadata;
  const refColumnA = { name: 'id', type: 'int' } as unknown as ColumnMetadata;

  describe('Construction & Validation', () => {
    it('should create a valid foreign key metadata object', () => {
      const fk = new ForeignKeyMetadata(dummyTable, [columnA], referencedTable, [refColumnA]);

      expect(fk.table).toBe(dummyTable);
      expect(fk.referencedTable).toBe(referencedTable);
      expect(fk.columns).toEqual([columnA]);
      expect(fk.referencedColumns).toEqual([refColumnA]);
      expect(fk.name).toMatch(/^fk_[a-f0-9]{8}$/);
    });

    it('should return custom name if provided', () => {
      const fk = new ForeignKeyMetadata(dummyTable, [columnA], referencedTable, [refColumnA], 'custom_fk_name');
      expect(fk.name).toBe('custom_fk_name');
    });

    it('should throw InvalidNameError when table has no valid name', () => {
      const table = { name: '' } as TableMetadata;

      expect(() => {
        new ForeignKeyMetadata(table, [columnA], referencedTable, [refColumnA]);
      }).toThrow(InvalidNameError);
    });

    it('should throw InvalidNameError when referenced table has no valid name', () => {
      const refTable = { name: '' } as TableMetadata;

      expect(() => {
        new ForeignKeyMetadata(dummyTable, [columnA], refTable, [refColumnA]);
      }).toThrow(InvalidNameError);
    });

    it('should throw if no foreign key columns are provided', () => {
      expect(() => {
        new ForeignKeyMetadata(dummyTable, [], referencedTable, [refColumnA]);
      }).toThrow('Foreign key must have at least one column.');
    });

    it('should throw if no referenced columns are provided', () => {
      expect(() => {
        new ForeignKeyMetadata(dummyTable, [columnA], referencedTable, []);
      }).toThrow('Related foreign key must have at least one column.');
    });

    it('should throw if columns and referencedColumns lengths do not match', () => {
      const anotherRef = { name: 'another_id', type: 'int' } as unknown as ColumnMetadata;

      expect(() => {
        new ForeignKeyMetadata(dummyTable, [columnA], referencedTable, [refColumnA, anotherRef]);
      }).toThrow('Foreign key column count mismatch: 1 vs 2 (table: Dummy, referenced: Referenced)');
    });
  });

  describe('Optional Settings', () => {
    it('should include optional onDelete and onUpdate actions', () => {
      const fk = new ForeignKeyMetadata(dummyTable, [columnA], referencedTable, [refColumnA], undefined, 'CASCADE', 'SET NULL');

      expect(fk.onDelete).toBe('CASCADE');
      expect(fk.onUpdate).toBe('SET NULL');
    });
  });
});
