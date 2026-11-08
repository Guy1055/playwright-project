import { type Page, type Locator } from '@playwright/test';

export class AdminMessagePage {
  readonly status: Locator;
  readonly replyBox: Locator;
  readonly replySubmit: Locator;

  constructor(private readonly page: Page) {
    this.status = page.getByTestId('status');
    this.replyBox = page.getByTestId('message');
    this.replySubmit = page.getByTestId('reply-submit');
  }

  /** Waits for the message text: acting before it renders throws in the app. */
  async goto(id: string, messageText: string) {
    await this.page.goto(`/admin/messages/${id}`);
    await this.page.getByText(messageText).first().waitFor();
  }
}
