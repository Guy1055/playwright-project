/**
 * SQL for the database tier, written against the migrations of the open-source Toolshop project
 * (sprint5/API/database/migrations). Not executed against the public demo, which has no DB access.
 * Selenium project keeps an identical copy so both suites check the same things.
 */
export const SQL = {
  userByEmail: 'SELECT id, first_name, email, password, role, enabled, failed_login_attempts FROM users WHERE email = ?',
  invoiceById: 'SELECT id, invoice_number, total, subtotal, status, user_id FROM invoices WHERE id = ?',
  invoiceItems: 'SELECT unit_price, quantity, product_id FROM invoice_items WHERE invoice_id = ?',
  cartItems: 'SELECT product_id, quantity FROM cart_items WHERE cart_id = ?',
  favorite: 'SELECT id FROM favorites WHERE user_id = ? AND product_id = ?',
  contactRequest: 'SELECT subject, message, status, user_id FROM contact_requests WHERE id = ?',
  brandById: 'SELECT id, name, slug FROM brands WHERE id = ?',

  // Data integrity: every query below should return no rows.
  productsWithoutRelations: `
    SELECT p.id FROM products p
    LEFT JOIN brands b ON b.id = p.brand_id
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN product_images i ON i.id = p.product_image_id
    WHERE b.id IS NULL OR c.id IS NULL OR i.id IS NULL`,
  orphanInvoiceItems: `
    SELECT ii.id FROM invoice_items ii
    LEFT JOIN invoices inv ON inv.id = ii.invoice_id
    WHERE inv.id IS NULL`,
  orphanCartItems: `
    SELECT ci.id FROM cart_items ci
    LEFT JOIN carts c ON c.id = ci.cart_id
    WHERE c.id IS NULL`,
  duplicateEmails: 'SELECT email FROM users GROUP BY email HAVING COUNT(*) > 1',
  duplicateBrandSlugs: 'SELECT slug FROM brands GROUP BY slug HAVING COUNT(*) > 1',
  duplicateCategorySlugs: 'SELECT slug FROM categories GROUP BY slug HAVING COUNT(*) > 1',
  duplicateFavorites: 'SELECT user_id, product_id FROM favorites GROUP BY user_id, product_id HAVING COUNT(*) > 1',
  negativePrices: 'SELECT id FROM products WHERE price < 0',
  negativeStock: 'SELECT id FROM products WHERE stock < 0',
  unknownRoles: "SELECT id FROM users WHERE role NOT IN ('user', 'admin')",
  categoriesWithMissingParent: `
    SELECT c.id FROM categories c
    LEFT JOIN categories p ON p.id = c.parent_id
    WHERE c.parent_id IS NOT NULL AND p.id IS NULL`,
} as const;
