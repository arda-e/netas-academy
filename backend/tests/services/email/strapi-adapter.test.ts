import { describe, it, expect, vi } from 'vitest';
import { createStrapiEmailSender } from '../../../src/services/email/strapi-adapter';

function makeStrapiMock() {
  const send = vi.fn().mockResolvedValue(undefined);
  const strapi = {
    plugin: vi.fn(() => ({
      service: vi.fn(() => ({ send })),
    })),
    log: {
      info: vi.fn(),
    },
  };
  return { strapi, send };
}

describe('createStrapiEmailSender', () => {
  it('forwards all fields to strapi email send on happy path', async () => {
    const { strapi, send } = makeStrapiMock();
    const sender = createStrapiEmailSender(strapi as never);

    await sender.send({ to: 'a@example.com', subject: 'S', html: '<p>H</p>' });

    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith({ to: 'a@example.com', subject: 'S', html: '<p>H</p>' });
  });

  it('forwards text field and does not inject html', async () => {
    const { strapi, send } = makeStrapiMock();
    const sender = createStrapiEmailSender(strapi as never);

    await sender.send({ to: 'b@example.com', subject: 'S', text: 'plain body' });

    expect(send).toHaveBeenCalledWith({ to: 'b@example.com', subject: 'S', text: 'plain body' });
  });

  it('propagates errors from the underlying send without swallowing them', async () => {
    const { strapi, send } = makeStrapiMock();
    send.mockRejectedValue(new Error('SMTP fail'));
    const sender = createStrapiEmailSender(strapi as never);

    await expect(sender.send({ to: 'c@example.com', subject: 'S', html: '<p/>' })).rejects.toThrow('SMTP fail');
  });
});
