"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

type SearchFieldProps = {
  initialValue?: string;
  expandedWidthClassName?: string;
};

export function SearchField({
  initialValue = "",
  expandedWidthClassName = "lg:w-[420px]",
}: SearchFieldProps) {
  const t = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialValue);
  const [open, setOpen] = useState(Boolean(initialValue.trim()));
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(initialValue);
    setOpen(Boolean(initialValue.trim()));
  }, [initialValue]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const updateSearchParam = (nextSearch: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = nextSearch.trim();

    if (trimmed) {
      params.set("search", trimmed);
    } else {
      params.delete("search");
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <div
      className={`flex items-center overflow-hidden border border-border/70 bg-white/70 transition-all duration-200 ease-out ${
        open ? "w-full rounded-sm" : "w-10 rounded-full"
      } ${open ? "" : "cursor-pointer"} lg:flex-none lg:transition-[width] lg:duration-200 ${
        open ? expandedWidthClassName : "lg:w-10"
      }`}
    >
      <button
        type="button"
        aria-label={t("search.aria_label")}
        data-testid="search-field.toggle"
        onClick={() => setOpen(true)}
        className={`inline-flex h-9 shrink-0 items-center justify-center text-gray-800 transition-all duration-200 hover:bg-[#009ca6]/10 hover:text-[#009ca6] ${
          open ? "pointer-events-none w-0 opacity-0" : "w-10 cursor-pointer opacity-100"
        }`}
      >
        <Search className="size-4" />
      </button>

      <div className={`relative flex-1 ${open ? "block" : "hidden"}`}>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-800" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            const nextSearch = e.target.value;
            setValue(nextSearch);

            if (debounceRef.current) {
              clearTimeout(debounceRef.current);
            }

            debounceRef.current = setTimeout(() => {
              updateSearchParam(nextSearch);
            }, 300);
          }}
          onBlur={() => {
            if (!value.trim()) {
              setOpen(false);
            }
          }}
          placeholder={t("search.placeholder")}
          data-testid="search-field.input"
          className="h-9 w-full bg-transparent py-2 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>
    </div>
  );
}
