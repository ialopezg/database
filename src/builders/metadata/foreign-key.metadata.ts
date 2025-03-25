import { createHash } from 'crypto';

import { ColumnMetadata } from './column.metadata';
import { TableMetadata } from './table.metadata';

/**
 * Represents metadata for a foreign key relationship between tables.
 */
export class ForeignKeyMetadata {
  private readonly _table: TableMetadata;
  private readonly _columns: ColumnMetadata[];
  private readonly _relatedTable: TableMetadata;
  private readonly _relatedColumns: ColumnMetadata[];

  /**
   * Constructs a `ForeignKeyMetadata` object.
   *
   * @param table - The table where the foreign key is defined.
   * @param columns - The columns in the foreign key.
   * @param relatedTable - The table that the foreign key references.
   * @param relatedColumns - The columns in the related table.
   * @throws Error if validation fails.
   */
  constructor(
    table: TableMetadata,
    columns: ColumnMetadata[],
    relatedTable: TableMetadata,
    relatedColumns: ColumnMetadata[]
  ) {
    // Validate that table and relatedTable are not null or undefined.
    if (!table || !table.name) {
      throw new Error('Table metadata must have a valid name.');
    }
    if (!relatedTable || !relatedTable.name) {
      throw new Error('Related table metadata must have a valid name.');
    }

    // Validate columns and related columns arrays are not empty.
    if (!columns || columns.length === 0) {
      throw new Error('Foreign key must have at least one column.');
    }
    if (!relatedColumns || relatedColumns.length === 0) {
      throw new Error('Related foreign key must have at least one column.');
    }

    // Ensure that the number of columns matches the number of related columns.
    if (columns.length !== relatedColumns.length) {
      throw new Error(
        'The number of columns in the foreign key must match the number of related columns.'
      );
    }

    this._table = table;
    this._columns = columns;
    this._relatedTable = relatedTable;
    this._relatedColumns = relatedColumns;
  }

  /**
   * Generates the name for the foreign key.
   *
   * The name is constructed by hashing a combination of the table and column names, and the related table and columns.
   *
   * @returns A unique name for the foreign key, prefixed with 'fk_'.
   */
  get name(): string {
    const tableKey = `${this._table.name}_${this.columnNames.join('_')}`;
    const relatedTableKey = `${this._relatedTable.name}_${this.relatedColumnNames.join('_')}`;

    // Combine the table and column names
    const combinedKey = `${tableKey}_${relatedTableKey}`;

    // Generate a hash for uniqueness
    const hash = createHash('sha256');
    hash.update(combinedKey);
    const hashedKey = hash.digest('hex').slice(0, 8); // First 8 characters

    return `fk_${hashedKey}`;
  }

  /**
   * Gets the table associated with the foreign key.
   *
   * @returns The table associated with the foreign key.
   */
  get table(): TableMetadata {
    return this._table;
  }

  /**
   * Gets the columns in the foreign key.
   *
   * @returns An array of column metadata objects.
   */
  get columns(): ColumnMetadata[] {
    return this._columns;
  }

  /**
   * Gets the column names in the foreign key.
   *
   * @returns An array of column names.
   */
  get columnNames(): string[] {
    return (this._columns ?? []).map((column) => column.name);
  }

  /**
   * Gets the related table in the foreign key relationship.
   *
   * @returns The related table metadata.
   */
  get relatedTable(): TableMetadata {
    return this._relatedTable;
  }

  /**
   * Gets the related columns in the foreign key relationship.
   *
   * @returns An array of related column metadata objects.
   */
  get relatedColumns(): ColumnMetadata[] {
    return this._relatedColumns;
  }

  /**
   * Gets the names of the related columns in the foreign key relationship.
   *
   * @returns An array of related column names.
   */
  get relatedColumnNames(): string[] {
    return (this._relatedColumns ?? []).map((column) => column.name);
  }
}
