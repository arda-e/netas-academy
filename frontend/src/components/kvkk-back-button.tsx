"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function KvkkBackButton() {
  const router = useRouter();

  function handleBack() {
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
