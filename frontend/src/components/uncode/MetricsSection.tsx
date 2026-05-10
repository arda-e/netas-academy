export function MetricsSection() {
  return (
    <div className="flex flex-col">
      <section className="flex flex-col lg:flex-row">
        <div className="lg:w-1/2 bg-[#f5f5f5] min-h-[400px] lg:min-h-0 flex items-center justify-center p-16">
          <p className="text-[8rem] font-light text-[#d6d7d9] leading-none select-none">84+</p>
        </div>
        <div className="lg:w-1/2 bg-[#1b1d1f] py-16 px-8 md:px-16 flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl font-normal text-white leading-snug mb-12">
            Performance and comprehensive metrics
          </h2>
          <div className="space-y-10">
            <div className="flex items-start gap-6">
              <p className="text-6xl md:text-7xl font-normal text-white leading-none shrink-0">
                84<span className="text-4xl">+</span>
              </p>
              <p className="text-sm text-white/60 leading-relaxed mt-2">
                Our comprehensive market analysis reveals a robust and expanding reach across
                multiple demographic segments, demonstrating significant strategic penetration
                and market influence.
              </p>
            </div>
            <div className="flex items-start gap-6">
              <p className="text-6xl md:text-7xl font-normal text-white leading-none shrink-0">
                <span className="text-4xl">$</span>5<span className="text-4xl">B</span>
              </p>
              <p className="text-sm text-white/60 leading-relaxed mt-2">
                Our strategic financial approach encompasses a substantial investment portfolio,
                highlighting our commitment to robust capital allocation and comprehensive
                market engagement.
              </p>
            </div>
          </div>
          <a
            href="#"
            className="mt-10 text-sm font-medium text-white underline underline-offset-4 hover:text-white/70 transition-colors self-start"
          >
            Investment Strategy
          </a>
        </div>
      </section>

      <section className="bg-white py-24 px-8 md:px-16 text-center">
        <h2 className="text-4xl md:text-6xl font-normal text-[#303133] leading-tight max-w-3xl mx-auto">
          Let&apos;s grow together
        </h2>
        <div className="flex flex-col items-center mt-8">
          <span className="text-[#303133]/60 text-3xl mb-6">&ldquo;</span>
          <p className="text-xl md:text-2xl font-normal text-[#303133] max-w-2xl leading-snug">
            Our partnership reflects unwavering dedication to precision and excellence,
            embodying the core values.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[#2c4437]/20 flex items-center justify-center">
              <span className="text-xl text-[#2c4437] font-medium">EC</span>
            </div>
            <p className="text-sm text-[#5b616b]">Enterprise Client</p>
          </div>
        </div>
      </section>
    </div>
  );
}
