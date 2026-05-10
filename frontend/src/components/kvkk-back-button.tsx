"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

export function KvkkBackButton() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleBack() {
    const returnTo = searchParams.get("returnTo");
    if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
      router.push(returnTo);
      return;
    }

    try {
      const referrer = document.referrer;
      if (referrer && new URL(referrer).origin === window.location.origin) {
        router.back();
        return;
      }
    } catch {
      /* fall through to fallback */
    }
    router.push("/iletisim");
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleBack}
      className="h-10 rounded-sm px-5 text-sm font-medium"
      data-testid="kvkk.back-button"
    >
      Geri Dön
    </Button>
  );
}
