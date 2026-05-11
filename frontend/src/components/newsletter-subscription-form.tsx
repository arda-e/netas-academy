"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type NewsletterSubscriptionFormProps = {
  source?: string;
};

type FormState = "idle" | "loading" | "success" | "error";

export function NewsletterSubscriptionForm({
  source,
}: NewsletterSubscriptionFormProps) {
  const t = useTranslations('newsletter');
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setState("loading");
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/newsletter-subscriptions/subscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, source: source ?? null }),
        }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          body?.error?.message ?? t('error.generic')
        );
      }

      setState("success");
      setEmail("");
    } catch (err) {
      setState("error");
      setErrorMessage(
          err instanceof Error ? err.message : t('error.unexpected')
      );
    }
  }

  return (
    <div className="space-y-4">
      {state === "success" ? (
        <p className="text-sm text-green-600 font-medium" data-testid="newsletter.success">
          {t('success')}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row" data-testid="newsletter.form">
          <label htmlFor="newsletter-email" className="sr-only">
            {t('field.email.label')}
          </label>
          <Input
            id="newsletter-email"
            type="email"
            placeholder={t('field.email.placeholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={state === "loading"}
            className="flex-1"
            data-testid="newsletter.field.email"
          />
          <Button
            type="submit"
            disabled={state === "loading"}
            className="shrink-0"
            data-testid="newsletter.submit"
          >
            {state === "loading" ? t('submit.pending') : t('submit.idle')}
          </Button>
        </form>
      )}
      {state === "error" ? (
        <p className="text-sm text-red-600" data-testid="newsletter.error">{errorMessage}</p>
      ) : null}
    </div>
  );
}
