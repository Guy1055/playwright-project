import { type Page, type Locator } from '@playwright/test';

export class InvoicesPage {
  readonly title: Locator;
  readonly rows: Locator;
  readonly invoiceNumber: Locator;
  readonly total: Locator;
  readonly paymentMethod: Locator;
  readonly download: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('page-title');
    this.rows = page.locator('tbody tr');
    this.invoiceNumber = page.getByTestId('invoice-number');
    this.total = page.getByTestId('total');
    this.paymentMethod = page.getByTestId('payment-method');
    this.download = page.getByTestId('download-invoice');
  }

  async goto() {
    await this.page.goto('/account/invoices');
  }

  async openDetails(invoiceId: string) {
    await this.page.goto(`/account/invoices/${invoiceId}`);
  }
}
