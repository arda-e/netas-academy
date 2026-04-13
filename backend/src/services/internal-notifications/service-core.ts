import { buildInternalNotificationEmail } from "./templates";
import { coerceCustomRecipientEmails, normalizeRecipientEmails } from "./recipient-utils";
import type { InternalNotificationEmail, InternalNotificationEnvelope } from "./types";

type RoutingRoleUser = {
  email?: string | null;
};

type RoutingRoleUsersCollection = {
  data?: RoutingRoleUser[] | null;
  results?: RoutingRoleUser[] | null;
};

type RoutingAdminRole = {
  users?: RoutingRoleUser[] | RoutingRoleUsersCollection | null;
};

type ResolvedRoleUsers = {
  users: RoutingRoleUser[];
  isValid: boolean;
};

export type NotificationRoutingRecord = {
  key: InternalNotificationEnvelope["key"];
  label: string;
  enabled: boolean;
  customEmails?: unknown;
  adminRoles?: RoutingAdminRole[] | null;
};

type SendEmailInput = InternalNotificationEmail & {
  to: string[];
};

export type DeliverInternalNotificationResult<K extends InternalNotificationEnvelope["key"]> =
  | {
      status: "sent";
      key: K;
      recipients: string[];
    }
  | {
      status: "skipped";
      key: K;
      reason: "routing_not_found" | "disabled" | "no_recipients";
    }
  | {
      status: "send_failed";
      key: K;
      recipients: string[];
    }
  | {
      status: "invalid_routing_data";
      key: K;
    };

type DeliverInternalNotificationDependencies<K extends InternalNotificationEnvelope["key"]> = {
  envelope: InternalNotificationEnvelope<K>;
  loadRoutingByKey: (key: K) => Promise<NotificationRoutingRecord | null>;
  sendEmail: (email: SendEmailInput) => Promise<void>;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
};

const getRoleUsers = (users: RoutingAdminRole["users"]): ResolvedRoleUsers => {
  if (Array.isArray(users)) {
    return {
      users,
      isValid: true,
    };
  }

  if (!users) {
    return {
      users: [],
      isValid: true,
    };
  }

  if (Array.isArray(users.data)) {
    return {
      users: users.data,
      isValid: true,
    };
  }

  if (Array.isArray(users.results)) {
    return {
      users: users.results,
      isValid: true,
    };
  }

  return {
    users: [],
    isValid: false,
  };
};

const getRoleRecipientEmails = (routing: NotificationRoutingRecord) => {
  const resolvedUsers = (routing.adminRoles ?? []).map((role) => getRoleUsers(role.users));

  return {
    recipients: resolvedUsers.flatMap(({ users }) =>
      users.flatMap((user) => (typeof user.email === "string" ? [user.email] : [])),
    ),
    hasInvalidRoleUsers: resolvedUsers.some(({ isValid }) => !isValid),
  };
};

export const deliverInternalNotification = async <K extends InternalNotificationEnvelope["key"]>({
  envelope,
  loadRoutingByKey,
  sendEmail,
  warn,
  error,
}: DeliverInternalNotificationDependencies<K>) => {
  const routing = await loadRoutingByKey(envelope.key);

  if (!routing) {
    warn("Internal notification routing not found", { key: envelope.key });
    return {
      status: "skipped",
      key: envelope.key,
      reason: "routing_not_found",
    } satisfies DeliverInternalNotificationResult<K>;
  }

  if (!routing.enabled) {
    return {
      status: "skipped",
      key: envelope.key,
      reason: "disabled",
    } satisfies DeliverInternalNotificationResult<K>;
  }

  const { recipients: roleRecipients, hasInvalidRoleUsers } = getRoleRecipientEmails(routing);

  if (hasInvalidRoleUsers) {
    error("Internal notification routing data is malformed", {
      key: envelope.key,
      label: routing.label,
    });

    return {
      status: "invalid_routing_data",
      key: envelope.key,
    } satisfies DeliverInternalNotificationResult<K>;
  }

  const recipients = normalizeRecipientEmails([
    ...coerceCustomRecipientEmails(routing.customEmails),
    ...roleRecipients,
  ]);

  if (recipients.length === 0) {
    warn("No recipients resolved for internal notification routing", {
      key: envelope.key,
      label: routing.label,
    });
    return {
      status: "skipped",
      key: envelope.key,
      reason: "no_recipients",
    } satisfies DeliverInternalNotificationResult<K>;
  }

  const email = buildInternalNotificationEmail(envelope);

  try {
    await sendEmail({
      to: recipients,
      subject: email.subject,
      text: email.text,
    });

    return {
      status: "sent",
      key: envelope.key,
      recipients,
    } satisfies DeliverInternalNotificationResult<K>;
  } catch (sendError) {
    error("Internal notification delivery failed", {
      key: envelope.key,
      label: routing.label,
      recipients,
      error: sendError,
    });

    return {
      status: "send_failed",
      key: envelope.key,
      recipients,
    } satisfies DeliverInternalNotificationResult<K>;
  }
};
