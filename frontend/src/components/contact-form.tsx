"use client";

import Link from "next/link";

import { useContactForm } from "@/hooks/use-contact-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const fieldClassName =
  "h-12 rounded-sm border-border/80 bg-card/68 px-4 text-base focus-visible:border-ring md:h-14 md:px-5 md:text-base";

const labelClassName =
  "text-md font-medium text-foreground";

const fieldWrapperClassName = "space-y-2 md:space-y-3";

export function ContactForm() {
  const {
    values,
    isSubmitting,
    errorMessage,
    successMessage,
    handleChange,
    handleSubmit,
  } = useContactForm();

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
          <label
            htmlFor="firstName"
            className={labelClassName}
          >
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
          <label
            htmlFor="lastName"
            className={labelClassName}
          >
            Soyadınız*
          </label>
          <Input
            id="lastName"
            name="lastName"
            value={values.lastName}
            onChange={handleChange}
            className={fieldClassName}
            required
          />
        </div>

        <div className={fieldWrapperClassName}>
          <label
            htmlFor="email"
            className={labelClassName}
          >
            E-Postanız*
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
          <label
            htmlFor="phone"
            className={labelClassName}
          >
            Telefon Numaranız*
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={values.phone}
            onChange={handleChange}
            className={fieldClassName}
            required
          />
        </div>
      </div>

      <div className={fieldWrapperClassName}>
        <label
          htmlFor="company"
          className={labelClassName}
        >
          Çalıştığınız Şirket
        </label>
        <Input
          id="company"
          name="company"
          value={values.company}
          onChange={handleChange}
          className={fieldClassName}
        />
      </div>

      <div className={fieldWrapperClassName}>
        <label
          htmlFor="subject"
          className={labelClassName}
        >
          Konu*
        </label>
        <Input
          id="subject"
          name="subject"
          value={values.subject}
          onChange={handleChange}
          className={fieldClassName}
          required
        />
      </div>

      <div className={fieldWrapperClassName}>
        <label
          htmlFor="message"
          className={labelClassName}
        >
          Mesajınız*
        </label>
        <Textarea
          id="message"
          name="message"
          value={values.message}
          onChange={handleChange}
          className="min-h-[12rem] rounded-sm border-border/80 bg-card/68 px-4 py-4 text-base focus-visible:border-ring md:min-h-[14rem] md:px-5 md:text-base"
          required
        />
      </div>

      <div className="flex flex-col gap-4 sm:items-start md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
          Kişisel verileriniz sizinle iletişime geçmek amacıyla alınmaktadır. Kişisel
          verilerinizin işlenmesi ile ilgili Aydınlatma Metnine{" "}
          <Link href="/kvkk" className="text-primary transition-colors hover:text-primary/80">
            buradan
          </Link>{" "}
          erişebilirsiniz.
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-md px-7 text-base font-semibold sm:w-auto md:text-lg"
        >
          {isSubmitting ? "Gönderiliyor..." : "Gönder"}
        </Button>
      </div>
    </form>
  );
}
