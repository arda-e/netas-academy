const defaultColumns = [
  "Strategic diversification asset classes enables optimal portfolio construction risk parameters",
  "Continuous investment cycle integrates analysis, due diligence, and performance monitoring",
  "Research and documentation underpin all investment decisions and accountability for our clients",
];

export function IntroSection() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-10 xl:px-12">
        <h2 className="text-[#303133] text-3xl md:text-5xl font-normal leading-tight max-w-[75%] mb-16">
          Strategic diversification and rigorous analysis drive our performance. We identify opportunities across 15 sectors globally while maintaining comprehensive risk.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3">
          {defaultColumns.map((text, index) => (
            <div
              key={index}
              className="py-6 border-t border-[#d6d7d9] md:py-0 md:border-t-0 md:border-l md:px-8 first:border-l-0 first:pl-0"
            >
              <p className="text-[#5b616b] text-sm font-normal leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
