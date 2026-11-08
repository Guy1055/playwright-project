/** Unique suffix so parallel tests on the shared demo never collide. */
export function uniqueId(): string {
  return `${Date.now()}${Math.floor(Math.random() * 100000)}`;
}

export interface UserPayload {
  first_name: string;
  last_name: string;
  dob: string;
  phone: string;
  email: string;
  password: string;
  address: {
    street: string;
    house_number: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
}

/** Fake but valid-format customer. Never real personal data. */
export function userPayload(overrides: Partial<UserPayload> = {}): UserPayload {
  const id = uniqueId();
  return {
    first_name: 'Test',
    last_name: 'User',
    dob: '1990-01-15',
    phone: '0612345678',
    email: `qa.${id}@example.com`,
    password: `Qa!${id}xZ`,
    address: {
      street: 'Test Street',
      house_number: '42',
      city: 'Amsterdam',
      state: 'Noord-Holland',
      country: 'NL',
      postal_code: '1011AB',
    },
    ...overrides,
  };
}

export const BILLING_ADDRESS = { country: 'NL', postcode: '1011AB', houseNumber: '42' };

/** Billing fields expected by POST /invoices. City and state must match the postcode lookup. */
export function billingPayload(cartId: string, city: string, state: string) {
  return {
    billing_street: 'Test Street',
    billing_house_number: BILLING_ADDRESS.houseNumber,
    billing_city: city,
    billing_state: state,
    billing_country: BILLING_ADDRESS.country,
    billing_postal_code: BILLING_ADDRESS.postcode,
    payment_method: 'cash-on-delivery',
    payment_details: {},
    cart_id: cartId,
  };
}

/** Contact form needs at least 50 characters in the UI; the API caps it at 250. */
export const CONTACT_MESSAGE =
  'This is an automated QA message for the public practice site, please ignore it.';

/** Parses "$14.15" / "14.15" into a number. */
export function parsePrice(text: string): number {
  return Number(text.replace(/[^0-9.]/g, ''));
}
