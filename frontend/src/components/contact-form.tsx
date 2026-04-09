"use client";

import Link from "next/link";

import { useContactForm } from "@/hooks/use-contact-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const fieldClassName =
  "h-12 rounded-sm border-border/80 bg-card/68 px-4 text-base focus-visible:border-ring md:h-14 md:px-5 md:text-base";

const labelClassName =
  "text-lg font-semibold tracking-tight text-foreground md:text-xl";

export function ContactForm() {
  const { values, isSubmitting, handleChange, handleSubmit } = useContactForm();

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
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
          />
        </div>

        <div className="space-y-3">
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
          />
        </div>

        <div className="space-y-3">
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
          />
        </div>

        <div className="space-y-3">
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
          />
        </div>
      </div>

      <div className="space-y-3">
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

      <div className="space-y-3">
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
        />
      </div>

      <div className="space-y-3">
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
        />
      </div>

      <div className="max-w-5xl text-base leading-8 text-muted-foreground md:text-lg">
        Kişisel verileriniz sizinle iletişime geçmek amacıyla alınmaktadır.
        Kişisel verilerinizin işlenmesi ile ilgili Aydınlatma Metnine{" "}
        <Link href="#" className="text-primary transition-colors hover:text-primary/80">
          buradan
        </Link>{" "}
        erişebilirsiniz
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-12 rounded-sm px-7 text-base font-semibold md:h-14 md:text-lg"
      >
        {isSubmitting ? "Gönderiliyor..." : "Gönder"}
      </Button>
    </form>
  );
}
