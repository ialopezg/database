import { ColumnMetadata, ForeignKeyMetadata, TableMetadata } from '../../../builders/metadata';

class MockTable {
  static table = 'users'; // Static property for table name
  constructor() {}
}

class MockRelatedTable {
  static table = 'orders'; // Static property for related table name
  constructor() {}
}

describe('ForeignKeyMetadata', () => {
  let tableMetadata: TableMetadata;
  let relatedTableMetadata: TableMetadata;
  let columns: ColumnMetadata[];
  let relatedColumns: ColumnMetadata[];

  beforeEach(() => {
    tableMetadata = new TableMetadata(MockTable);
    relatedTableMetadata = new TableMetadata(MockRelatedTable);

    columns = [
      new ColumnMetadata(MockTable, 'user_id', false, false, false, {}),
      new ColumnMetadata(MockTable, 'order_id', false, false, false, {})
    ];

    relatedColumns = [
      new ColumnMetadata(MockRelatedTable, 'id', false, false, false, {}),
      new ColumnMetadata(MockRelatedTable, 'id', false, false, false, {})
    ];
  });

  it('should construct ForeignKeyMetadata correctly', () => {
    const fkMetadata = new ForeignKeyMetadata(tableMetadata, columns, relatedTableMetadata, relatedColumns);

    expect(fkMetadata).toBeInstanceOf(ForeignKeyMetadata);
    expect(fkMetadata.table).toEqual(tableMetadata);
    expect(fkMetadata.columns).toEqual(columns);
    expect(fkMetadata.relatedTable).toEqual(relatedTableMetadata);
    expect(fkMetadata.relatedColumns).toEqual(relatedColumns);
  });

  it('should throw error when table has no valid name', () => {
    const invalidTableMetadata = new TableMetadata(() => {});
    expect(() => new ForeignKeyMetadata(invalidTableMetadata, columns, relatedTableMetadata, relatedColumns))
      .toThrow("Table metadata must have a valid name.");
  });

  it('should throw error when relatedTable has no valid name', () => {
    const invalidRelatedTableMetadata = new TableMetadata(() => {});
    expect(() => new ForeignKeyMetadata(tableMetadata, columns, invalidRelatedTableMetadata, relatedColumns))
      .toThrow("Related table metadata must have a valid name.");
  });

  it('should throw error if columns are empty', () => {
    expect(() => new ForeignKeyMetadata(tableMetadata, [], relatedTableMetadata, relatedColumns))
      .toThrow("Foreign key must have at least one column.");
  });

  it('should throw error if relatedColumns are empty', () => {
    expect(() => new ForeignKeyMetadata(tableMetadata, columns, relatedTableMetadata, []))
      .toThrow("Related foreign key must have at least one column.");
  });

  it('should throw error if columns and relatedColumns length do not match', () => {
    const differentLengthRelatedColumns = [new ColumnMetadata(MockRelatedTable, 'id', false, false, false, {})];
    expect(() => new ForeignKeyMetadata(tableMetadata, columns, relatedTableMetadata, differentLengthRelatedColumns))
      .toThrow("The number of columns in the foreign key must match the number of related columns.");
  });

  it('should generate a unique foreign key name', () => {
    const fkMetadata = new ForeignKeyMetadata(tableMetadata, columns, relatedTableMetadata, relatedColumns);
    const name = fkMetadata.name;
    expect(name.startsWith('fk_')).toBe(true);
    expect(name.length).toBeGreaterThan(3); // ensuring the hash is included
  });
});
