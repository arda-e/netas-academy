"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import type { LeadType } from "@/lib/lead-intents";
import { getLeadIntents } from "@/lib/lead-intents";
import { emitLeadCatalogClick } from "@/lib/analytics-events";

type LeadFormSuccessProps = {
  leadType: LeadType;
  onNewSubmission: () => void;
};

export function LeadFormSuccess({ leadType, onNewSubmission }: LeadFormSuccessProps) {
  const t = useTranslations("contact");
  const intent = getLeadIntents(t)[leadType];

  return (
    <div className="space-y-4" data-testid="contact-lead.success">
      <h2 className="text-xl font-semibold text-foreground">{t("success.title")}</h2>
      <p className="text-base text-muted-foreground">{intent.successMessage}</p>
      <div className="flex flex-wrap gap-2 pt-2">
        {intent.successCtaHref && intent.successCtaLabel ? (
          <Button
            variant="outline"
            asChild
            data-testid="contact-lead.success-cta"
          >
            <Link
              href={intent.successCtaHref}
              onClick={() => emitLeadCatalogClick(leadType)}
            >
              {intent.successCtaLabel}
            </Link>
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          onClick={onNewSubmission}
          data-testid="contact-lead.new-submission"
        >
          {t("new_submission")}
        </Button>
      </div>
    </div>
  );
}
