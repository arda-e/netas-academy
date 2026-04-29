"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type NewsletterSubscriptionFormProps = {
  source?: string;
};

type FormState = "idle" | "loading" | "success" | "error";

export function NewsletterSubscriptionForm({
  source,
}: NewsletterSubscriptionFormProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setState("loading");
    setErrorMessage("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://127.0.0.1:1337"}/api/newsletter-subscriptions/subscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, source: source ?? null }),
        }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          body?.error?.message ?? "Abonelik sırasında bir hata oluştu."
        );
      }

      setState("success");
      setEmail("");
    } catch (err) {
      setState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu."
      );
    }
  }

  return (
    <div className="space-y-4">
      {state === "success" ? (
        <p className="text-sm text-green-600 font-medium">
          Aboneliğiniz başarıyla alındı. Teşekkür ederiz!
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <Input
            type="email"
            placeholder="E-posta adresiniz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={state === "loading"}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={state === "loading"}
            className="shrink-0"
          >
            {state === "loading" ? "Gönderiliyor..." : "Abone Ol"}
          </Button>
        </form>
      )}
      {state === "error" ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}
    </div>
  );
}
