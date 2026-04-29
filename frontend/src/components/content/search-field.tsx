"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

type SearchFieldProps = {
  initialValue?: string;
  /** Reserved for future use — when true, hides any non-search filter UI.
   *  Currently the component is search-only by design. */
  searchOnly?: boolean;
};

export function SearchField({
  initialValue = "",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  searchOnly = true,
}: SearchFieldProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialValue);
  const [open, setOpen] = useState(Boolean(initialValue.trim()));
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setValue(initialValue);
    setOpen(Boolean(initialValue.trim()));
  }, [initialValue]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

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
        open ? "lg:w-[420px]" : "lg:w-10"
      }`}
    >
      <button
        type="button"
        aria-label="Ara"
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
            updateSearchParam(nextSearch);
          }}
          onBlur={() => {
            if (!value.trim()) {
              setOpen(false);
            }
          }}
          placeholder="Ara..."
          className="h-9 w-full bg-transparent py-2 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>
    </div>
  );
}
