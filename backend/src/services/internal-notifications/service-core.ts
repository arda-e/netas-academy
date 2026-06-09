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
  console.log(`[internal-notifications] delivering key=${envelope.key}`);

  const routing = await loadRoutingByKey(envelope.key);
  console.log(`[internal-notifications] routing loaded:`, routing
    ? { key: routing.key, enabled: routing.enabled, customEmails: routing.customEmails }
    : null
  );

  if (!routing) {
    warn("Internal notification routing not found", { key: envelope.key });
    return {
      status: "skipped",
      key: envelope.key,
      reason: "routing_not_found",
    } satisfies DeliverInternalNotificationResult<K>;
  }

  if (!routing.enabled) {
    console.log(`[internal-notifications] routing disabled for key=${envelope.key}`);
    return {
      status: "skipped",
      key: envelope.key,
      reason: "disabled",
    } satisfies DeliverInternalNotificationResult<K>;
  }

  const recipients = normalizeRecipientEmails(
    coerceCustomRecipientEmails(routing.customEmails),
  );
  console.log(`[internal-notifications] resolved recipients:`, recipients);

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
  console.log(`[internal-notifications] sending email subject="${email.subject}" to=${recipients.join(", ")}`);

  try {
    await sendEmail({
      to: recipients,
      subject: email.subject,
      text: email.text,
    });

    console.log(`[internal-notifications] email sent OK to=${recipients.join(", ")}`);
    return {
      status: "sent",
      key: envelope.key,
      recipients,
    } satisfies DeliverInternalNotificationResult<K>;
  } catch (sendError) {
    const errMsg = sendError instanceof Error ? sendError.message : String(sendError);
    const errStack = sendError instanceof Error ? sendError.stack : undefined;
    console.error(`[internal-notifications] SMTP send failed: ${errMsg}`, errStack);
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
