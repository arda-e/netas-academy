"use client";

import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { IyzicoCheckoutForm } from "@/components/payments/iyzico-checkout-form";
import { PaymentStatusPanel } from "@/components/payments/payment-status-panel";
import { Link, usePathname } from "@/i18n/navigation";
import { useEventRegistrationForm } from "@/hooks/use-event-registration-form";
import type { StrapiEventType } from "@/lib/strapi-types";

type EventRegistrationFormProps = {
  eventDocumentId: string;
  eventTitle: string;
  eventType: StrapiEventType;
};

const fieldClassName =
  "h-11 rounded-sm border-border/80 bg-card/68 px-4 text-base focus-visible:border-ring md:h-12 md:px-5 md:text-base";

const labelClassName =
  "text-lg font-semibold tracking-tight text-foreground md:text-xl";

const fieldWrapperClassName = "space-y-2 md:space-y-3";

export function EventRegistrationForm({
  eventDocumentId,
  eventTitle,
  eventType,
}: EventRegistrationFormProps) {
  const t = useTranslations('event_reg');
  const pathname = usePathname();
  const {
    values,
    fieldErrors,
    isSubmitting,
    isRetryingPayment,
    errorMessage,
    successMessage,
    payment,
    handleChange,
    handleFieldBlur,
    handleKvkkConsentChange,
    handleSubmit,
    handleRetryPayment,
    requiresKvkkConsent,
    requiresTckn,
  } = useEventRegistrationForm({ eventDocumentId, eventTitle, eventType });

  if (successMessage) {
    return (
      <div className="rounded-sm border border-border/70 bg-card/55 px-5 py-4 text-base text-foreground" data-testid="event-registration.success">
        {successMessage}
      </div>
    );
  }

  if (payment?.presentation?.kind === "iyzico_checkout_form") {
    return (
      <div className="space-y-5" data-testid="event-registration.payment">
        <PaymentStatusPanel title={t("payment.heading")} body={t("payment.body")} />
        {errorMessage ? (
          <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-5 py-4 text-base text-destructive" data-testid="event-registration.error">
            {errorMessage}
          </div>
        ) : null}
        <IyzicoCheckoutForm checkoutFormContent={payment.presentation.checkoutFormContent} />
      </div>
    );
  }

  if (payment?.status === "payment_unavailable") {
    return (
      <PaymentStatusPanel
        title={t("payment.retry_heading")}
        body={errorMessage ?? t("payment.error_unavailable")}
        actionLabel={t("payment.retry")}
        isRetrying={isRetryingPayment}
        onRetry={handleRetryPayment}
      />
    );
  }

  return (
    <form className="space-y-6 md:space-y-8" onSubmit={handleSubmit} data-testid="event-registration.form">
      {errorMessage ? (
        <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-5 py-4 text-base text-destructive" data-testid="event-registration.error">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <div className={fieldWrapperClassName}>
          <label htmlFor="firstName" className={labelClassName}>
            {t('field.first_name.label')}
          </label>
          <Input
            id="firstName"
            name="firstName"
            value={values.firstName}
            onChange={handleChange}
            onBlur={handleFieldBlur}
            className={fieldClassName}
            required
            aria-invalid={Boolean(fieldErrors.firstName)}
            aria-describedby={fieldErrors.firstName ? "event-registration-error-first-name" : undefined}
            data-testid="event-registration.field.first-name"
          />
          {fieldErrors.firstName ? (
            <p id="event-registration-error-first-name" className="text-sm text-destructive" data-testid="event-registration.error.first-name">
              {fieldErrors.firstName}
            </p>
          ) : null}
        </div>

        <div className={fieldWrapperClassName}>
          <label htmlFor="lastName" className={labelClassName}>
            {t('field.last_name.label')}
          </label>
          <Input
            id="lastName"
            name="lastName"
            value={values.lastName}
            onChange={handleChange}
            onBlur={handleFieldBlur}
            className={fieldClassName}
            required
            maxLength={20}
            aria-invalid={Boolean(fieldErrors.lastName)}
            aria-describedby={fieldErrors.lastName ? "event-registration-error-last-name" : undefined}
            data-testid="event-registration.field.last-name"
          />
          {fieldErrors.lastName ? (
            <p id="event-registration-error-last-name" className="text-sm text-destructive" data-testid="event-registration.error.last-name">
              {fieldErrors.lastName}
            </p>
          ) : null}
        </div>

        <div className={fieldWrapperClassName}>
          <label htmlFor="email" className={labelClassName}>
            {t('field.email.label')}
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            className={fieldClassName}
            required
            data-testid="event-registration.field.email"
          />
        </div>

        <div className={fieldWrapperClassName}>
          <label htmlFor="phone" className={labelClassName}>
            {t('field.phone.label')}
          </label>
          <Input
            id="phone"
            name="phone"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={values.phone}
            onChange={handleChange}
            onBlur={handleFieldBlur}
            className={fieldClassName}
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={fieldErrors.phone ? "event-registration-error-phone" : undefined}
            data-testid="event-registration.field.phone"
          />
          {fieldErrors.phone ? (
            <p id="event-registration-error-phone" className="text-sm text-destructive" data-testid="event-registration.error.phone">
              {fieldErrors.phone}
            </p>
          ) : null}
        </div>

        {requiresTckn ? (
          <div className={`${fieldWrapperClassName} md:col-span-2`}>
            <label htmlFor="tckn" className={labelClassName}>
              {t('field.tckn.label')}
            </label>
            <Input
              id="tckn"
              name="tckn"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              maxLength={11}
              value={values.tckn}
              onChange={handleChange}
              onBlur={handleFieldBlur}
              className={fieldClassName}
              required
              aria-invalid={Boolean(fieldErrors.tckn)}
              aria-describedby={fieldErrors.tckn ? "event-registration-error-tckn" : undefined}
              placeholder={t('field.tckn.placeholder')}
              data-testid="event-registration.field.tckn"
            />
            {fieldErrors.tckn ? (
              <p id="event-registration-error-tckn" className="text-sm text-destructive" data-testid="event-registration.error.tckn">
                {fieldErrors.tckn}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className={fieldWrapperClassName}>
        <label htmlFor="notes" className={labelClassName}>
          {t('field.notes.label')}
        </label>
        <Textarea
          id="notes"
          name="notes"
          value={values.notes}
          onChange={handleChange}
          className="min-h-[9rem] rounded-sm border-border/80 bg-card/68 px-4 py-4 text-base focus-visible:border-ring md:px-5 md:text-base"
          placeholder={t('field.notes.placeholder')}
          data-testid="event-registration.field.notes"
        />
      </div>

      {requiresKvkkConsent ? (
        <div className="rounded-sm border border-border/70 bg-card/55 p-4 md:p-5">
          <Checkbox
            name="kvkkConsent"
            size="md"
            isSelected={values.kvkkConsent}
            onChange={handleKvkkConsentChange}
            data-testid="event-registration.field.kvkk-consent"
            label={
              <>
                {t('kvkk.law_reference')}{" "}
                <Link
                  href={{ pathname: "/kvkk", query: { returnTo: pathname } }}
                  className="font-semibold text-primary transition-colors hover:text-primary/80"
                  data-testid="event-registration.link.kvkk-disclosure"
                  onClick={(event) => event.stopPropagation()}
                >
                  {t('kvkk.link')}
                </Link>{" "}
                {t('kvkk.suffix')}
              </>
            }
            className="md:gap-4"
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:items-start md:flex-row md:items-center md:justify-between">
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
          {t('footer_note')}
        </p>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-sm px-7 text-base font-semibold sm:w-auto md:h-14 md:text-lg"
          data-testid="event-registration.submit"
        >
          {isSubmitting ? t('submit.pending') : t('submit.idle')}
        </Button>
      </div>
    </form>
  );
}
