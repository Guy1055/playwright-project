import { type Page, type Locator } from '@playwright/test';

export class MessagesPage {
  readonly title: Locator;
  readonly rows: Locator;
  readonly replyBox: Locator;
  readonly replySubmit: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('page-title');
    this.rows = page.locator('tbody tr');
    this.replyBox = page.getByTestId('message');
    this.replySubmit = page.getByTestId('reply-submit');
  }

  async goto() {
    await this.page.goto('/account/messages');
  }

  /** Waits for the message text: submitting a reply before it renders throws in the app. */
  async openDetails(messageId: string, messageText: string) {
    await this.page.goto(`/account/messages/${messageId}`);
    await this.page.getByText(messageText).first().waitFor();
  }
}
