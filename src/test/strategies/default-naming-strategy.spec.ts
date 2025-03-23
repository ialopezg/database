import { DefaultNamingStrategy } from '../../strategies';

describe('DefaultNamingStrategy', () => {
  let namingStrategy: DefaultNamingStrategy;

  beforeEach(() => {
    namingStrategy = new DefaultNamingStrategy();
  });

  describe('tableName', () => {
    it('should return the same class name', () => {
      expect(namingStrategy.tableName('User')).toBe('User');
      expect(namingStrategy.tableName('OrderDetail')).toBe('OrderDetail');
    });
  });

  describe('columnName', () => {
    it('should return the same property name', () => {
      expect(namingStrategy.columnName('firstName')).toBe('firstName');
      expect(namingStrategy.columnName('userAge')).toBe('userAge');
    });
  });

  describe('relationName', () => {
    it('should return the same relation property name', () => {
      expect(namingStrategy.relationName('userOrders')).toBe('userOrders');
      expect(namingStrategy.relationName('profile')).toBe('profile');
    });
  });
});
