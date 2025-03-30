import {
  InvalidColumnLengthError,
  InvalidColumnOptionsError,
  InvalidColumnTypeError,
} from '../../errors';
import { NamingStrategy } from '../../strategies';
import { ColumnOptions, ColumnType } from '../options';
import { PropertyMetadata } from './property.metadata';

/**
 * Represents metadata for a database column.
 */
export class ColumnMetadata extends PropertyMetadata {
  private static readonly typeMap = new Map<string, ColumnType>([
    ['number', ColumnType.INT],
    ['integer', ColumnType.INT],
    ['boolean', ColumnType.BOOLEAN],
    ['string', ColumnType.VARCHAR],
    ['char', ColumnType.CHAR],
    ['text', ColumnType.TEXT],
    ['json', ColumnType.JSON],
    ['integer', ColumnType.INT],
    ['float', ColumnType.FLOAT],
    ['date', ColumnType.DATE],
    ['timestamp', ColumnType.TIMESTAMP],
    ['uuid', ColumnType.UUID],
    ['varchar', ColumnType.VARCHAR],
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
  private readonly _default: any;
  namingStrategy?: NamingStrategy;

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

    this._name = this.normalizeColumnName(options.name || propertyName);
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
    this._default = options.default;

    this.validateColumnOptions();
  }

  /** @returns The column name, modified by the naming strategy if available. */
  get name(): string {
    if (this.namingStrategy) {
      return this.namingStrategy.columnName(this._name);
    }
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

  /** @returns The default value for the column, if provided. */
  get default(): any {
    return this._default;
  }

  /**
   * Normalizes and validates the column name.
   *
   * - Trims leading/trailing whitespace
   * - Ensures the name starts with a letter or underscore
   * - Ensures it contains only alphanumeric characters or underscores
   *
   * @param name - The column name to normalize and validate.
   * @returns The normalized column name.
   * @throws InvalidColumnOptionsError if the name is invalid.
   */
  private normalizeColumnName(name: string): string {
    const trimmed = name.trim();

    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmed)) {
      throw new InvalidColumnOptionsError(
        `Invalid column name: "${name}". Column names must start with a letter or underscore and contain only alphanumeric characters or underscores.`
      );
    }

    return trimmed;
  }

  /**
   * Resolves the appropriate column type from the provided type.
   *
   * @param {Function | string} type Optional. The column types to resolve.
   * It can be a class constructor (e.g., `String`, `Number`) or a string (e.g., `"varchar"`, `"uuid"`).
   * If omitted, default to `VARCHAR`.
   * @returns {ColumnType} The resolved column type.
   * @throws {InvalidColumnTypeError} If the type is unsupported or unrecognized.
   */
  private resolveColumnType(type?: Function | string): ColumnType {
    if (!type) {
      return ColumnType.VARCHAR;
    }

    // ✅ Allow direct ColumnType enums (e.g., ColumnType.VARCHAR === 'VARCHAR')
    if (typeof type === 'string' && Object.values(ColumnType).includes(type as ColumnType)) {
      return type as ColumnType;
    }

    if (typeof type === 'function') {
      const typeName = type.name.toLowerCase();
      return ColumnMetadata.typeMap.get(typeName) ?? ColumnType.VARCHAR;
    }

    const normalizedType = type.trim().toLowerCase();

    if (ColumnMetadata.typeMap.has(normalizedType)) {
      return ColumnMetadata.typeMap.get(normalizedType)!;
    }

    throw new InvalidColumnTypeError(type, this._name);
  }

  /**
   * Infers the default length for a given column type.
   *
   * @param {ColumnType} type - The column type to evaluate.
   * @returns {number | undefined} The default length, or `undefined` if not applicable.
   */
  private getDefaultLength(type: ColumnType): number | undefined {
    switch (type) {
      case ColumnType.VARCHAR:
        return 255;
      case ColumnType.CHAR:
        return 1;
      case ColumnType.INT:
        return 11;
      case ColumnType.FLOAT:
        return 10;
      case ColumnType.BOOLEAN:
        return 1;
      case ColumnType.TEXT:
      case ColumnType.JSON:
      case ColumnType.DATE:
      case ColumnType.TIMESTAMP:
        return undefined;
      default:
        return undefined;
    }
  }

  /**
   * Validates the column options and ensures consistency.
   *
   * - Ensures required length exists for specific types (e.g., VARCHAR, CHAR)
   * - Ensures no invalid combinations (e.g., PRIMARY + NULLABLE)
   * - Future-proof: placeholder for precision/scale validation
   *
   * @throws {InvalidColumnLengthError} If the length is invalid.
   * @throws {InvalidColumnOptionsError} If a conflicting or unsupported option is set.
   */
  private validateColumnOptions(): void {
    const typesRequiringLength: ColumnType[] = [ColumnType.VARCHAR, ColumnType.CHAR];

    if (typesRequiringLength.includes(this._type) && !this._length) {
      throw new InvalidColumnLengthError(this._name, this._length ?? 0);
    }

    if (this._length !== undefined && this._length <= 0) {
      throw new InvalidColumnLengthError(this._name, this._length);
    }

    if (this._isPrimary && this._isNullable) {
      throw new InvalidColumnOptionsError(
        `Column '${this._name}' cannot be both PRIMARY and NULLABLE.`
      );
    }

    // Future: precision/scale checks for DECIMAL
  }
}
