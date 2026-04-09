"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEventRegistrationForm } from "@/hooks/use-event-registration-form";

type EventRegistrationFormProps = {
  eventDocumentId: string;
  eventTitle: string;
};

const fieldClassName =
  "h-12 rounded-sm border-border/80 bg-card/68 px-4 text-base focus-visible:border-ring md:h-14 md:px-5 md:text-base";

const labelClassName =
  "text-lg font-semibold tracking-tight text-foreground md:text-xl";

export function EventRegistrationForm({
  eventDocumentId,
  eventTitle,
}: EventRegistrationFormProps) {
  const {
    values,
    isSubmitting,
    errorMessage,
    successMessage,
    handleChange,
    handleSubmit,
  } = useEventRegistrationForm({ eventDocumentId, eventTitle });

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      {successMessage ? (
        <div className="rounded-sm border border-emerald-400/30 bg-emerald-400/10 px-5 py-4 text-base text-emerald-100">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-5 py-4 text-base text-destructive">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <label htmlFor="firstName" className={labelClassName}>
            Adınız*
          </label>
          <Input
            id="firstName"
            name="firstName"
            value={values.firstName}
            onChange={handleChange}
            className={fieldClassName}
            required
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="lastName" className={labelClassName}>
            Soyadınız
          </label>
          <Input
            id="lastName"
            name="lastName"
            value={values.lastName}
            onChange={handleChange}
            className={fieldClassName}
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="email" className={labelClassName}>
            E-Posta*
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            className={fieldClassName}
            required
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="phone" className={labelClassName}>
            Telefon
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={values.phone}
            onChange={handleChange}
            className={fieldClassName}
          />
        </div>
      </div>

      <div className="space-y-3">
        <label htmlFor="notes" className={labelClassName}>
          Ek Notlar
        </label>
        <Textarea
          id="notes"
          name="notes"
          value={values.notes}
          onChange={handleChange}
          className="min-h-[10rem] rounded-sm border-border/80 bg-card/68 px-4 py-4 text-base focus-visible:border-ring md:px-5 md:text-base"
          placeholder="Katılım beklentiniz, kurumunuz veya iletmek istediginiz notlar..."
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="h-12 rounded-sm px-7 text-base font-semibold md:h-14 md:text-lg">
        {isSubmitting ? "Kayit Gonderiliyor..." : "Kaydi Tamamla"}
      </Button>
    </form>
  );
}
