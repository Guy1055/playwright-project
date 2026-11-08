import { test, expect } from '../fixtures/test';
import { ContactPage } from '../pages/ContactPage';
import { CONTACT_MESSAGE } from '../support/testData';

const guest = { firstName: 'Test', lastName: 'User', email: 'qa.contact@example.com' };

test.describe('Contact form', () => {
  for (const subject of ['customer-service', 'webmaster', 'return', 'payments', 'warranty', 'status-of-order']) {
    test(`CON-01: a guest can send a "${subject}" message`, async ({ page }) => {
      const contact = new ContactPage(page);
      await contact.goto();
      await contact.fill({ ...guest, subject, message: CONTACT_MESSAGE });

      await contact.submit.click();

      await expect(contact.confirmation).toBeVisible();
    });
  }

  test('CON-02: an empty form shows every required message', async ({ page }) => {
    const contact = new ContactPage(page);
    await contact.goto();

    await contact.submit.click();

    await expect(contact.error('first-name')).toContainText('First name is required');
    await expect(contact.error('last-name')).toContainText('Last name is required');
    await expect(contact.error('email')).toContainText('Email is required');
    await expect(contact.error('subject')).toContainText('Subject is required');
    await expect(contact.error('message')).toContainText('Message is required');
  });

  test('CON-03: a message under 50 characters is rejected', async ({ page }) => {
    const contact = new ContactPage(page);
    await contact.goto();
    await contact.fill({ ...guest, subject: 'webmaster', message: 'Too short.' });

    await contact.submit.click();

    await expect(contact.error('message')).toContainText('minimal 50');
    await expect(contact.confirmation).toBeHidden();
  });

  test('CON-04: an invalid email is rejected', async ({ page }) => {
    const contact = new ContactPage(page);
    await contact.goto();
    await contact.fill({ ...guest, email: 'not-an-email', subject: 'webmaster', message: CONTACT_MESSAGE });

    await contact.submit.click();

    await expect(contact.error('email')).toBeVisible();
    await expect(contact.confirmation).toBeHidden();
  });

  for (const { name, file } of [
    { name: 'a file of the wrong type', file: { name: 'report.pdf', mimeType: 'application/pdf', buffer: Buffer.from('x') } },
    { name: 'a non-empty text file', file: { name: 'note.txt', mimeType: 'text/plain', buffer: Buffer.from('x') } },
  ]) {
    test(`CON-05: ${name} is rejected as an attachment`, async ({ page }) => {
      const contact = new ContactPage(page);
      await contact.goto();

      await contact.attachment.setInputFiles(file);
      await contact.submit.click();

      await expect(contact.error('attachment')).toBeVisible();
    });
  }

  test('CON-06: an empty text attachment is accepted', async ({ page }) => {
    const contact = new ContactPage(page);
    await contact.goto();
    await contact.fill({ ...guest, subject: 'webmaster', message: CONTACT_MESSAGE });
    await contact.attachment.setInputFiles({ name: 'empty.txt', mimeType: 'text/plain', buffer: Buffer.alloc(0) });

    await contact.submit.click();

    await expect(contact.confirmation).toBeVisible();
  });

  test('CON-07: a logged-in customer does not retype name and email', async ({ customerPage }) => {
    const contact = new ContactPage(customerPage);
    await contact.goto();
    await expect(contact.submit).toBeVisible();

    await expect(contact.firstName).toBeHidden();
    await expect(contact.email).toBeHidden();
    await contact.fill({ subject: 'customer-service', message: CONTACT_MESSAGE });
    await contact.submit.click();

    await expect(contact.confirmation).toBeVisible();
  });
});
