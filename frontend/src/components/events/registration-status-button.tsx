"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { NewsletterSubscriptionForm } from "@/components/newsletter-subscription-form";
import { buildIntentLeadUrl } from "@/lib/lead-intents";

type RegistrationStatus = {
  isOpen: boolean;
  startsAt: string;
  keepRegistrationsOpen: boolean;
};

type Props = {
  documentId: string;
  slug: string;
  registerCta: string;
  contactCta: string;
  registrationClosedNotice: string;
};

export function RegistrationStatusButton({
  documentId,
  slug,
  registerCta,
  contactCta,
  registrationClosedNotice,
}: Props) {
  const [status, setStatus] = useState<RegistrationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/events/${documentId}/registration-status`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.data) setStatus(json.data);
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [documentId]);

  if (loading) {
    return (
      <div className="mt-6 h-10 animate-pulse rounded-sm bg-foreground/8" aria-hidden />
    );
  }

  if (status?.isOpen) {
    return (
      <>
        <Button asChild className="mt-6 w-full rounded-sm" data-testid="page.event-detail.register-cta">
          <Link href={`/etkinlikler/${slug}/kayit`}>{registerCta}</Link>
        </Button>
        <Button asChild variant="outline" className="mt-3 w-full rounded-sm" data-testid="page.event-detail.contact-cta">
          <Link href={buildIntentLeadUrl("general_contact")}>{contactCta}</Link>
        </Button>
      </>
    );
  }

  return (
    <div className="mt-6 space-y-4" data-testid="page.event-detail.registration-closed.notice">
      <p className="text-sm font-medium text-foreground/72">{registrationClosedNotice}</p>
      <div data-testid="page.event-detail.registration-closed.newsletter">
        <NewsletterSubscriptionForm source="event_closed_registration" />
      </div>
    </div>
  );
}
