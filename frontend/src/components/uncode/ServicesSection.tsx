export function ServicesSection() {
  return (
    <section className="flex flex-col lg:flex-row min-h-screen">
      <div className="lg:w-1/3 bg-white p-12 lg:p-16 flex flex-col justify-between">
        <div>
          <span className="inline-block text-xs uppercase tracking-widest bg-[#2c4437]/10 text-[#2c4437] rounded-full px-3 py-1">
            Strategic approach
          </span>
          <h2 className="text-3xl md:text-4xl font-normal text-[#303133] mt-4 leading-tight">
            Principled investing built on experience and innovation
          </h2>
          <p className="text-[#5b616b] mt-4 leading-relaxed text-sm">
            With over two decades of market expertise, we&apos;ve refined our
            investment philosophy to balance opportunity with risk.
          </p>
          <div className="mt-8 space-y-0">
            <div className="flex justify-between items-center py-4 border-b border-[#d6d7d9]">
              <div>
                <p className="font-medium text-[#303133]">Growth Strategy</p>
                <p className="text-sm text-[#5b616b] mt-0.5">Diversified allocation across established markets</p>
              </div>
              <p className="text-2xl font-medium text-[#303133] ml-4 shrink-0">$1M</p>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-[#d6d7d9]">
              <div>
                <p className="font-medium text-[#303133]">Premium Solution</p>
                <p className="text-sm text-[#5b616b] mt-0.5">Comprehensive portfolio with private market access</p>
              </div>
              <p className="text-2xl font-medium text-[#303133] ml-4 shrink-0">$5M</p>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <a
            href="#"
            className="inline-block w-full text-center bg-[#2c4437] text-white py-3 rounded-full text-sm font-medium hover:bg-[#1e3028] transition-colors"
          >
            What we do
          </a>
        </div>
      </div>

      <div
        className="lg:w-1/3 flex flex-col justify-end p-12 lg:p-16 min-h-[500px] lg:min-h-0 bg-[#1b1d1f]"
      >
        <span className="inline-block text-xs uppercase tracking-widest bg-white text-[#303133] rounded px-3 py-1 mb-4 self-start">
          Suite of investments
        </span>
        <h2 className="text-2xl font-normal text-white leading-snug">
          Leveraging technology to reveal untapped customer segments
        </h2>
        <p className="text-white/70 mt-3 text-sm leading-relaxed">
          Each strategy is designed with precision to optimize returns while
          adhering to disciplined management.
        </p>
      </div>

      <div className="lg:w-1/3 flex flex-col">
        <div className="flex-1 bg-[#f5f5f5] min-h-[300px] flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-6xl font-light text-[#d6d7d9]">IE</p>
            <p className="text-xs uppercase tracking-widest text-[#5b616b] mt-2">Investment Expertise</p>
          </div>
        </div>
        <div className="bg-white p-8 lg:p-10">
          <p className="text-xs uppercase tracking-widest text-[#5b616b] mb-3">
            Distinctive skills
          </p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#303133]">Investment Expertise</span>
                <span className="text-[#5b616b]">96%</span>
              </div>
              <div className="h-1 bg-[#d6d7d9] rounded-full overflow-hidden">
                <div className="h-full bg-[#303133] rounded-full" style={{ width: '96%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#303133]">Client Service</span>
                <span className="text-[#5b616b]">85%</span>
              </div>
              <div className="h-1 bg-[#d6d7d9] rounded-full overflow-hidden">
                <div className="h-full bg-[#303133] rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
          </div>
          <a
            href="#"
            className="inline-block w-full text-center border border-[#303133] text-[#303133] py-3 rounded-full text-sm font-medium mt-6 hover:bg-[#303133] hover:text-white transition-colors"
          >
            Team Members
          </a>
        </div>
      </div>
    </section>
  );
}
