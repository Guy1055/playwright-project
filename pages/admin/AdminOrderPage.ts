import { type Page, type Locator } from '@playwright/test';

export class AdminOrderPage {
  readonly invoiceNumber: Locator;
  readonly status: Locator;
  readonly updateStatus: Locator;
  readonly success: Locator;

  constructor(private readonly page: Page) {
    this.invoiceNumber = page.getByTestId('invoice-number');
    this.status = page.getByTestId('order-status');
    this.updateStatus = page.getByTestId('update-status-submit');
    this.success = page.locator('.alert-success');
  }

  async goto(id: string) {
    await this.page.goto(`/admin/orders/edit/${id}`);
  }
}
