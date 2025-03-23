import { Driver } from '../driver';
import { SchemaBuilder } from './schema.builder';

/**
 * PostgresSQL-specific implementation of the SchemaBuilder for handling schema DDL operations.
 * This class implements methods to create and modify PostgreSQL database schemas.
 */
export class PostgresSchemaBuilder extends SchemaBuilder {
  constructor(private readonly driver: Driver) {
    super();
  }
}
