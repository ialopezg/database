import { ColumnOptions } from '../options';
import { ColumnType } from '../options/column-type.enum';
import { PropertyMetadata } from './property.metadata';

/**
 * Represents metadata for a database column.
 */
export class ColumnMetadata extends PropertyMetadata {
  private static readonly typeMap = new Map<string, ColumnType>([
    ['number', ColumnType.INTEGER],
    ['boolean', ColumnType.BOOLEAN],
    ['string', ColumnType.VARCHAR],
    ['text', ColumnType.TEXT],
    ['json', ColumnType.JSON],
    ['integer', ColumnType.INTEGER],
    ['float', ColumnType.FLOAT],
    ['date', ColumnType.DATE],
    ['timestamp', ColumnType.TIMESTAMP],
  ]);

  private readonly _name: string;
  private readonly _type: ColumnType;
  private readonly _length: number | undefined;
  private readonly _isPrimary: boolean;
  private readonly _isAutoIncrement: boolean;
  private readonly _isUnique: boolean;
  private readonly _isNullable: boolean;
  private readonly _isCreateDate: boolean;
  private readonly _isUpdateDate: boolean;
  private readonly _columnDefinition: string;
  private readonly _comment: string;
  private readonly _oldColumnName: string;

  /**
   * Constructs a `ColumnMetadata` object.
   *
   * @param target - The target class where this property is defined.
   * @param propertyName - The name of the property (column).
   * @param isPrimary - Whether the column is a primary key.
   * @param isCreateDate - Whether the column stores creation timestamps.
   * @param isUpdateDate - Whether the column stores update timestamps.
   * @param options - Column-specific options.
   * @throws Error if column options are invalid.
   */
  constructor(
    target: Function,
    propertyName: string,
    isPrimary = false,
    isCreateDate = false,
    isUpdateDate = false,
    options: ColumnOptions
  ) {
    super(target, propertyName);

    this._name = options.name || propertyName;
    this._type = this.resolveColumnType(options.type);
    this._length = options.length ?? this.getDefaultLength(this._type);
    this._isPrimary = isPrimary;
    this._isAutoIncrement = options.isAutoIncrement ?? false;
    this._isUnique = options.isUnique ?? false;
    this._isNullable = options.isNullable ?? false;
    this._isCreateDate = isCreateDate;
    this._isUpdateDate = isUpdateDate;
    this._columnDefinition = options.columnDefinition ?? '';
    this._comment = options.comment ?? '';
    this._oldColumnName = options.oldColumnName ?? '';

    this.validateColumnOptions();
  }

  /** @returns The column name. */
  get name(): string {
    return this._name;
  }

  /** @returns The column type. */
  get type(): ColumnType {
    return this._type;
  }

  /** @returns The column length, if applicable. */
  get length(): number | undefined {
    return this._length;
  }

  /** @returns Whether this column is a primary key. */
  get isPrimary(): boolean {
    return this._isPrimary;
  }

  /** @returns Whether this column auto-increments. */
  get isAutoIncrement(): boolean {
    return this._isAutoIncrement;
  }

  /** @returns Whether this column enforces uniqueness. */
  get isUnique(): boolean {
    return this._isUnique;
  }

  /** @returns Whether this column allows null values. */
  get isNullable(): boolean {
    return this._isNullable;
  }

  /** @returns Whether this column tracks creation timestamps. */
  get isCreateDate(): boolean {
    return this._isCreateDate;
  }

  /** @returns Whether this column tracks update timestamps. */
  get isUpdateDate(): boolean {
    return this._isUpdateDate;
  }

  /** @returns The raw SQL column definition, if provided. */
  get columnDefinition(): string {
    return this._columnDefinition;
  }

  /** @returns The column's comment, if any. */
  get comment(): string {
    return this._comment;
  }

  /** @returns The previous column name before renaming, if applicable. */
  get oldColumnName(): string {
    return this._oldColumnName;
  }

  /**
   * Resolves the appropriate column type from the provided type.
   *
   * @param type - The type provided in `ColumnOptions`.
   * @returns The resolved `ColumnType`.
   * @throws Error if the type is unsupported.
   */
  private resolveColumnType(type?: Function | string): ColumnType {
    if (!type) {
      return ColumnType.VARCHAR;
    }

    if (typeof type === 'function') {
      const typeName = type.name.toLowerCase();
      return ColumnMetadata.typeMap.get(typeName) ?? ColumnType.VARCHAR;
    }

    const resolvedType = ColumnMetadata.typeMap.get(type.toLowerCase());
    if (resolvedType) {
      return resolvedType;
    }

    throw new Error(`Unsupported column type: '${type}'. Column name: ${this._name}`);
  }

  /**
   * Determines the default length for certain column types.
   *
   * @param type - The column type.
   * @returns The default length for the column type.
   */
  private getDefaultLength(type: ColumnType): number | undefined {
    const defaultLengths: { [key: string]: number | undefined } = {
      [ColumnType.VARCHAR]: 255,
      [ColumnType.INTEGER]: 11,
      [ColumnType.FLOAT]: 10,
      [ColumnType.TEXT]: undefined,
      [ColumnType.JSON]: undefined,
      [ColumnType.BOOLEAN]: 1,
      [ColumnType.DATE]: undefined,
      [ColumnType.TIMESTAMP]: undefined,
    };

    return defaultLengths[type];
  }

  /**
   * Validates the column options and ensures consistency.
   * @throws Error if validation fails.
   */
  private validateColumnOptions(): void {
    if (this._length !== undefined && this._length <= 0) {
      throw new Error(`Invalid length for column '${this._name}': Must be a positive number.`);
    }
    if (this._isPrimary && this._isNullable) {
      throw new Error(`Column '${this._name}' cannot be both PRIMARY and NULLABLE.`);
    }
  }
}
