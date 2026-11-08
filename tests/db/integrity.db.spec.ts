import { test, expect } from '../../fixtures/test';
import { SQL } from '../../db/queries';

/** Placeholder tier: skipped unless DB_URL points at a self-hosted Toolshop. */
test.describe('Database: integrity', { tag: '@db' }, () => {
  const checks = [
    { id: 'DB-10', name: 'every product has a brand, category and image', sql: SQL.productsWithoutRelations },
    { id: 'DB-11', name: 'no invoice line is orphaned', sql: SQL.orphanInvoiceItems },
    { id: 'DB-12', name: 'no cart item is orphaned', sql: SQL.orphanCartItems },
    { id: 'DB-13', name: 'emails are unique', sql: SQL.duplicateEmails },
    { id: 'DB-14', name: 'brand slugs are unique', sql: SQL.duplicateBrandSlugs },
    { id: 'DB-15', name: 'category slugs are unique', sql: SQL.duplicateCategorySlugs },
    { id: 'DB-16', name: 'a user cannot favorite a product twice', sql: SQL.duplicateFavorites },
    { id: 'DB-17', name: 'prices are never negative', sql: SQL.negativePrices },
    { id: 'DB-18', name: 'stock is never negative', sql: SQL.negativeStock },
    { id: 'DB-19', name: 'roles are limited to user and admin', sql: SQL.unknownRoles },
    { id: 'DB-20', name: 'category parents exist', sql: SQL.categoriesWithMissingParent },
  ];

  for (const { id, name, sql } of checks) {
    test(`${id}: ${name}`, async ({ db }) => {
      expect(await db.query(sql)).toEqual([]);
    });
  }
});
