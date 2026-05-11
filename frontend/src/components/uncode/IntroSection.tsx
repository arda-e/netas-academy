type IntroSectionProps = {
  title?: string;
  body?: string;
  columns?: string[];
  className?: string;
  contentClassName?: string;
};

const defaultTitle =
  "Strategic diversification and rigorous analysis drive our performance. We identify opportunities across 15 sectors globally while maintaining comprehensive risk.";

const defaultColumns = [
  "Strategic diversification asset classes enables optimal portfolio construction risk parameters",
  "Continuous investment cycle integrates analysis, due diligence, and performance monitoring",
  "Research and documentation underpin all investment decisions and accountability for our clients",
];

export function IntroSection({
  title,
  body,
  columns = defaultColumns,
  className,
  contentClassName,
}: IntroSectionProps) {
  const resolvedTitle = title ?? (body ? undefined : defaultTitle);

  return (
    <section className={`${className}`}>
      <div className={`page-section py-20 ${contentClassName ?? ""}`}>
        <div className="">
          {resolvedTitle && (
            <h2 className="text-balance text-3xl font-normal text-[#303133] md:text-4xl leading-14">
              {resolvedTitle}
            </h2>
          )}
          {body && (
            <p className={resolvedTitle ? "mt-6 max-w-3xl text-[15px] leading-7 text-foreground/72 sm:text-lg sm:leading-8" : "max-w-3xl text-[15px] leading-7 text-foreground/72 sm:text-lg sm:leading-8"}>
              {body}
            </p>
          )}
        </div>

        {columns.length > 0 && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3">
            {columns.map((text, index) => (
              <div
                key={index}
                className="py-6 border-t border-[#d6d7d9] md:py-0 md:border-t-0 md:border-l md:px-8 first:border-l-0 first:pl-0"
              >
                <p className="text-sm font-normal leading-relaxed text-[#5b616b]">
                  {text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
