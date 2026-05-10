export function ESGSection() {
  return (
    <section className="bg-white">
      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-1/2 py-24 px-8 md:px-16 flex flex-col justify-center">
          <h3 className="text-3xl md:text-4xl font-normal text-[#303133] leading-snug">
            Social and environmental responsibility
          </h3>
          <div className="mt-6 text-[#5b616b] text-base leading-relaxed space-y-4">
            <p>
              Our comprehensive approach integrates environmental stewardship,
              social impact, and ethical governance into every aspect of our
              operations. Through targeted initiatives, we strive to reduce our
              carbon footprint, support local communities, promote diversity and
              inclusion, and create meaningful change that transcends traditional
              business boundaries.
            </p>
            <p>
              At the core of our mission lies a profound commitment to
              sustainable and ethical business practices. We recognize that true
              success extends beyond financial metrics, encompassing our
              responsibility to the planet, our communities, and future generations.
            </p>
          </div>
          <a
            href="#"
            className="mt-8 text-sm font-medium text-[#2c4437] underline underline-offset-4 hover:text-[#1e3028] transition-colors self-start"
          >
            Our Commitment
          </a>
        </div>
        <div className="lg:w-1/2 min-h-[500px] bg-[#2c4437]/10 flex items-center justify-center">
          <div className="text-center px-8">
            <p className="text-5xl font-light text-[#2c4437]/30 leading-none">ESG</p>
            <p className="text-xs uppercase tracking-widest text-[#2c4437]/50 mt-3">Environmental · Social · Governance</p>
          </div>
        </div>
      </div>
    </section>
  );
}
