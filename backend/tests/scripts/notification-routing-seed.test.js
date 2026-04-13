import { describe, expect, it, vi } from "vitest";

import { ensureNotificationRoutingSeedDefaults } from "../../scripts/notification-routing-seed";

describe("ensureNotificationRoutingSeedDefaults", () => {
  it("creates a missing routing without overwriting user-managed settings", async () => {
    const findOne = vi
      .fn()
      .mockResolvedValueOnce({
        id: 10,
        key: "contact_submission",
        customEmails: ["owner@netas.com.tr"],
        enabled: false,
      })
      .mockResolvedValueOnce(null);
    const create = vi.fn().mockResolvedValue({ id: 11, key: "event_registration" });
    const update = vi.fn();
    const result = {
      notificationRoutings: { created: 0, updated: 0 },
    };
    const strapi = {
      db: {
        query: vi.fn().mockReturnValue({
          findOne,
          create,
          update,
        }),
      },
    };

    await ensureNotificationRoutingSeedDefaults(
      strapi,
      [
        {
          key: "contact_submission",
          label: "Iletisim Formu Bildirimi",
          enabled: true,
          customEmails: ["demo.notifications@netas-academy.local"],
        },
        {
          key: "event_registration",
          label: "Etkinlik Kayit Bildirimi",
          enabled: true,
          customEmails: ["demo.events@netas-academy.local"],
        },
      ],
      result,
    );

    expect(update).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      data: {
        key: "event_registration",
        label: "Etkinlik Kayit Bildirimi",
        enabled: true,
        customEmails: ["demo.events@netas-academy.local"],
      },
    });
    expect(result).toEqual({
      notificationRoutings: { created: 1, updated: 0 },
    });
  });
});
