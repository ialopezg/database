// tslint:disable
import { expect } from 'chai';
import { QueryBuilder } from '../../../driver';

describe('QueryBuilder', () => {
  describe('select', () => {
    it('should set columns when passed', () => {
      const query = new QueryBuilder().select('id').from('users');
      const result = query.getQuery();
      expect(result).to.equal('SELECT id FROM users');
    });

    it('should default to * when no columns are specified', () => {
      const query = new QueryBuilder().from('users');
      const result = query.getQuery();
      expect(result).to.equal('SELECT * FROM users');
    });
  });

  describe('from', () => {
    it('should set the table name', () => {
      const query = new QueryBuilder().select('id').from('users');
      const result = query.getQuery();
      expect(result).to.equal('SELECT id FROM users');
    });

    it('should set the table alias', () => {
      const query = new QueryBuilder().select('id').from('users', 'u');
      const result = query.getQuery();
      expect(result).to.equal('SELECT id FROM users u');
    });

    it('should throw an error if no from() is called', () => {
      const query = new QueryBuilder().select('id');
      expect(() => query.getQuery()).to.throw('Table name must be specified using from()');
    });
  });

  describe('where conditions', () => {
    it('should add a simple where condition', () => {
      const query = new QueryBuilder().select('id').from('users').where('id = 1');
      const result = query.getQuery();
      expect(result).to.equal('SELECT id FROM users WHERE id = 1');
    });

    it('should add an andWhere condition', () => {
      const query = new QueryBuilder().select('id').from('users').where('id = 1').andWhere('name = "John"');
      const result = query.getQuery();
      expect(result).to.equal('SELECT id FROM users WHERE id = 1 AND name = "John"');
    });

    it('should add an orWhere condition', () => {
      const query = new QueryBuilder().select('id').from('users').where('id = 1').orWhere('name = "John"');
      const result = query.getQuery();
      expect(result).to.equal('SELECT id FROM users WHERE id = 1 OR name = "John"');
    });
  });
});
