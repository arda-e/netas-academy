"use client";

import { useEffect, useRef } from "react";

type IyzicoCheckoutFormProps = {
  checkoutFormContent: string;
  providerPageUrl?: string | null;
};

function toInlineCheckoutFormContent(checkoutFormContent: string) {
  return checkoutFormContent.replace(
    /(<div\b[^>]*\bid=["']iyzipay-checkout-form["'][^>]*\bclass=["'][^"']*)\bpopup\b([^"']*["'][^>]*>)/i,
    "$1responsive$2",
  );
}

export function IyzicoCheckoutForm({ checkoutFormContent, providerPageUrl }: IyzicoCheckoutFormProps) {
  const checkoutContainerRef = useRef<HTMLDivElement | null>(null);
  const hasCheckoutFormContent = checkoutFormContent.trim().length > 0;

  useEffect(() => {
    const container = checkoutContainerRef.current;

    if (!container || !hasCheckoutFormContent) {
      return;
    }

    container.innerHTML = toInlineCheckoutFormContent(checkoutFormContent);

    const scripts = Array.from(container.querySelectorAll("script"));
    for (const script of scripts) {
      const executableScript = document.createElement("script");

      for (const attribute of Array.from(script.attributes)) {
        executableScript.setAttribute(attribute.name, attribute.value);
      }

      executableScript.text = script.text;
      script.replaceWith(executableScript);
    }

    return () => {
      container.innerHTML = "";
    };
  }, [checkoutFormContent, hasCheckoutFormContent]);

  if (!hasCheckoutFormContent && providerPageUrl) {
    return (
      <div className="space-y-5" data-testid="payment.iyzico-checkout-form">
        <div
          className="overflow-hidden rounded-sm border border-border/70 bg-white text-foreground shadow-sm"
          data-testid="payment.checkout-iframe-card"
        >
          <iframe
            title="iyzico checkout form"
            src={providerPageUrl}
            className="h-[920px] w-full border-0"
            data-testid="payment.checkout-iframe"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5" data-testid="payment.iyzico-checkout-form">
      <div
        ref={checkoutContainerRef}
        className="rounded-sm border border-border/70 bg-white p-4 text-foreground"
        data-testid="payment.checkout-content"
      />
    </div>
  );
}
