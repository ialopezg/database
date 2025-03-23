import { MySQLDriver } from '../mysql.driver';
import { SchemaBuilder } from './schema.builder';

export class MysqlSchemaBuilder extends SchemaBuilder {
  constructor(private readonly driver: MySQLDriver) {
    super();
  }
}
