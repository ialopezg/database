import { QueryBuilder } from '../../../../driver';

describe('QueryBuilder', () => {
  let queryBuilder: QueryBuilder;

  beforeEach(() => {
    queryBuilder = new QueryBuilder();
  });

  describe('setParameter', () => {
    it('should set a parameter with valid name and value', () => {
      const param = { name: ':id', value: 1 };
      queryBuilder.setParameter(param);

      expect(queryBuilder['parameters'].get(param.name)).toBe(param.value.toString());
    });

    it('should set a parameter with name not prepended with `:` and value', () => {
      const param = { name: 'id', value: 1 };
      queryBuilder.setParameter(param);

      expect(queryBuilder['parameters'].get(param.name)).toBe(param.value.toString());
    });

    it('should throw an error if parameter name does not follow naming conventions', () => {
      const invalidParam = { name: ':123id', value: 1 };

      // Test for an invalid parameter name (starts with a number)
      expect(() => queryBuilder.setParameter(invalidParam)).toThrow(
        "Invalid parameter name ':123id'. Use alphanumeric characters and underscores."
      );
    });
  });

  describe('setParameters', () => {
    it('should set an array of parameters with valid name and value', () => {
      const param = { name: ':id', value: 1 };
      queryBuilder.setParameters([param]);

      expect(queryBuilder['parameters'].get(param.name)).toBe(param.value.toString());
    });
  })
});
