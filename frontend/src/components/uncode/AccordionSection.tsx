'use client';

import { useState } from "react";

interface AccordionItem {
  q: string;
  a: string;
}

interface AccordionSectionProps {
  heading: string;
  items: AccordionItem[];
  className?: string;
}

export function AccordionSection({ heading, items, className }: AccordionSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className={`bg-white py-24 px-4 sm:px-6 lg:px-10 xl:px-12 ${className ?? ''}`}>
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
        <div className="lg:w-5/12">
          <h2 className="text-3xl md:text-4xl font-normal text-[#303133] leading-snug">
            {heading}
          </h2>
        </div>
        <div className="lg:w-7/12">
          <div className="divide-y divide-[#d6d7d9]">
            {items.map((item, i) => (
              <div key={i}>
                <button
                  className="w-full flex justify-between items-center py-5 text-left cursor-pointer bg-transparent border-0 p-0"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  type="button"
                >
                  <span className="text-base font-normal text-[#303133] pr-4">{item.q}</span>
                  <span className="text-[#303133] text-xl shrink-0 leading-none">
                    {openIndex === i ? '−' : '+'}
                  </span>
                </button>
                {openIndex === i && (
                  <p className="text-sm text-[#5b616b] leading-relaxed pb-5">
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
