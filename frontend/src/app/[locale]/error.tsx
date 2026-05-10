"use client";

import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {

  useEffect(() => {
    console.error("Global route error:", error);
  }, [error]);

  return (
    <main
      className="page-shell flex min-h-[calc(100vh-81px)] items-center justify-center px-6"
      data-testid="global-error"
    >
      <div className="panel-surface max-w-lg rounded-sm p-8 text-center sm:p-10">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Bir hata oluştu
        </h1>
        <p className="mt-4 text-sm leading-6 text-foreground/72 sm:text-base sm:leading-7">
          Sayfa yüklenirken beklenmeyen bir sorun oluştu. <br/> Lütfen tekrar deneyin.
        </p>
        {process.env.NODE_ENV === "development" ? (
          <p className="mt-3 break-all text-xs text-foreground/48">
            {error.message}
          </p>
        ) : null}
        <button
          type="button"
          onClick={reset}
          data-testid="global-error.retry-button"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#009ca6] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#00858e]"
        >
          Tekrar Dene
        </button>
      </div>
    </main>
  );
}
