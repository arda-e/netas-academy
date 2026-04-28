"use client";

import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEventRegistrationForm } from "@/hooks/use-event-registration-form";
import type { StrapiEventType } from "@/lib/strapi";

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
  const {
    values,
    isSubmitting,
    errorMessage,
    successMessage,
    handleChange,
    handleSubmit,
    requiresKvkkConsent,
  } = useEventRegistrationForm({ eventDocumentId, eventTitle, eventType });

  return (
    <form className="space-y-6 md:space-y-8" onSubmit={handleSubmit}>
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

      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <div className={fieldWrapperClassName}>
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

        <div className={fieldWrapperClassName}>
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

        <div className={fieldWrapperClassName}>
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

        <div className={fieldWrapperClassName}>
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

        <div className={`${fieldWrapperClassName} md:col-span-2`}>
          <label htmlFor="tckn" className={labelClassName}>
            TCKN*
          </label>
          <Input
            id="tckn"
            name="tckn"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={11}
            value={values.tckn}
            onChange={handleChange}
            className={fieldClassName}
            required
            placeholder="11 haneli kimlik numarası"
          />
        </div>
      </div>

      <div className={fieldWrapperClassName}>
        <label htmlFor="notes" className={labelClassName}>
          Ek Notlar
        </label>
        <Textarea
          id="notes"
          name="notes"
          value={values.notes}
          onChange={handleChange}
          className="min-h-[9rem] rounded-sm border-border/80 bg-card/68 px-4 py-4 text-base focus-visible:border-ring md:px-5 md:text-base"
          placeholder="Katılım beklentiniz, kurumunuz veya iletmek istediginiz notlar..."
        />
      </div>

      {requiresKvkkConsent ? (
        <label className="rounded-sm border border-border/70 bg-card/55 p-4 text-sm leading-7 text-foreground/78 md:p-5 md:text-base">
          <span className="flex items-start gap-3 md:gap-4">
            <input
              id="kvkkConsent"
              name="kvkkConsent"
              type="checkbox"
              checked={values.kvkkConsent}
              onChange={handleChange}
              className="mt-1 size-5 shrink-0 rounded-sm border-2 border-gray-300 text-primary focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 md:size-6"
            />
            <span className="space-y-1">
              <span className="block font-medium text-foreground">
                Bu eğitim programına katılımım sebebiyle işlenecek olan kişisel verilerime ilişkin detaylı bilgilerin yer aldığı{" "}
                <Link href="/kvkk" className="font-semibold text-primary transition-colors hover:text-primary/80">
                  6698 Sayılı Kişisel Verileri Koruma Kanunu Uyarınca Eğitim Programı Aydınlatma Metni&apos;ni
                </Link>{" "}
                okudum ve anladım.
              </span>
            </span>
          </span>
        </label>
      ) : null}

      <div className="flex flex-col gap-4 sm:items-start md:flex-row md:items-center md:justify-between">
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
          Kaydınız tamamlandığında durum bilgisi bu form üzerinde gösterilir. Gerekli durumlarda sizinle
          paylaştığınız iletişim bilgileri üzerinden iletişime geçilebilir.
        </p>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-sm px-7 text-base font-semibold sm:w-auto md:h-14 md:text-lg"
        >
          {isSubmitting ? "Kayit Gonderiliyor..." : "Kaydi Tamamla"}
        </Button>
      </div>
    </form>
  );
}
