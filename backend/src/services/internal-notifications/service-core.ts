import { buildInternalNotificationEmail } from "./templates";
import { coerceCustomRecipientEmails, normalizeRecipientEmails } from "./recipient-utils";
import type { InternalNotificationEmail, InternalNotificationEnvelope } from "./types";

export type NotificationRoutingRecord = {
  key: InternalNotificationEnvelope["key"];
  label: string;
  enabled: boolean;
  customEmails?: unknown;
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
    };

type DeliverInternalNotificationDependencies<K extends InternalNotificationEnvelope["key"]> = {
  envelope: InternalNotificationEnvelope<K>;
  loadRoutingByKey: (key: K) => Promise<NotificationRoutingRecord | null>;
  sendEmail: (email: SendEmailInput) => Promise<void>;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
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

  const recipients = normalizeRecipientEmails(
    coerceCustomRecipientEmails(routing.customEmails),
  );

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
    const errMsg = sendError instanceof Error ? sendError.message : String(sendError);
    const errStack = sendError instanceof Error ? sendError.stack : undefined;
    error("Internal notification SMTP send failed", {
      key: envelope.key,
      label: routing.label,
      recipients,
      errMessage: errMsg,
      errStack,
    });

    return {
      status: "send_failed",
      key: envelope.key,
      recipients,
    } satisfies DeliverInternalNotificationResult<K>;
  }
};
