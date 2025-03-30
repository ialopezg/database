import { createHash } from 'crypto';

import { InvalidNameError } from '../../errors';
import { ColumnMetadata } from './column.metadata';
import { TableMetadata } from './table.metadata';

/**
 * Represents metadata for a foreign key relationship between tables.
 */
export class ForeignKeyMetadata {
  /**
   * Constructs a `ForeignKeyMetadata` object.
   *
   * @param table - The table where the foreign key is defined.
   * @param columns - The columns in the foreign key.
   * @param referencedTable - The referenced table.
   * @param referencedColumns - The referenced columns.
   * @param customName - Optional custom FK name.
   * @param onDelete - Optional ON DELETE action (stored only, not used yet).
   * @param onUpdate - Optional ON UPDATE action (stored only, not used yet).
   * @throws Error if validation fails.
   */
  constructor(
    public readonly table: TableMetadata,
    public readonly columns: ColumnMetadata[],
    public readonly referencedTable: TableMetadata,
    public readonly referencedColumns: ColumnMetadata[],
    public readonly customName?: string,
    public readonly onDelete?: string,
    public readonly onUpdate?: string,
  ) {
    if (!table?.name) {
      throw new InvalidNameError('Table name');
    }

    if (!referencedTable?.name) {
      throw new InvalidNameError('Referenced table name');
    }

    if (!columns || columns.length === 0) {
      throw new Error('Foreign key must have at least one column.');
    }

    if (!referencedColumns || referencedColumns.length === 0) {
      throw new Error('Related foreign key must have at least one column.');
    }

    if (columns.length !== referencedColumns.length) {
      throw new Error(
        `Foreign key column count mismatch: ${columns.length} vs ${referencedColumns.length} (table: ${table.name}, referenced: ${referencedTable.name})`,
      );
    }
  }

  /**
   * Gets the name for the foreign key.
   * If a custom name is provided, it is returned.
   * Otherwise, a unique name is generated using a hash.
   */
  get name(): string {
    if (this.customName) return this.customName;

    const tableKey = `${this.table.name}_${this.columnNames.join('_')}`;
    const relatedTableKey = `${this.referencedTable.name}_${this.referencedColumnNames.join('_')}`;
    const combinedKey = `${tableKey}_${relatedTableKey}`;

    const hash = createHash('sha256');
    hash.update(combinedKey);
    const hashedKey = hash.digest('hex').slice(0, 8);

    return `fk_${hashedKey}`;
  }

  /**
   * Gets the names of the foreign key's local columns.
   */
  get columnNames(): string[] {
    return this.columns.map((col) => col.name);
  }

  /**
   * Gets the names of the referenced columns in the foreign key relationship.
   */
  get referencedColumnNames(): string[] {
    return this.referencedColumns.map((col) => col.name);
  }
}
