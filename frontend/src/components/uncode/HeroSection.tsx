'use client';

import { useState, useEffect } from 'react';

const slides = [
  {
    headline: 'Our expertise navigates market complexity',
    subtitle:
      'Methodical investment process balances risk management with opportunity identification, creating resilient portfolios designed to perform through market cycles.',
  },
  {
    headline: 'We transform complexity into opportunity',
    subtitle:
      'Our adaptive approach transforms challenges into opportunities, delivering sustainable value and exceptional results for our clients across diverse economic conditions.',
  },
  {
    headline: 'Experienced perspectives and opportunities',
    subtitle:
      'We work closely with investors to understand their objectives, crafting tailored solutions that address specific needs while maintaining our commitment to excellence.',
  },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="https://d3f86pfw66amx.cloudfront.net/uncode/wp-content/uploads/2025/03/abstract-waves.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 z-10 bg-black/50" style={{ mixBlendMode: 'multiply' }} />
      <div className="relative z-20 w-full max-w-7xl mx-auto px-8 md:px-16 pb-24">
        <div className="relative w-full min-h-[20rem]">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`flex flex-col lg:flex-row items-end transition-opacity duration-700 ease-in-out ${
                index === current
                  ? 'opacity-100 pointer-events-auto relative'
                  : 'opacity-0 pointer-events-none absolute inset-x-0'
              }`}
            >
              <div className="lg:w-2/3">
                <h1 className="text-5xl md:text-7xl font-normal text-white leading-tight">
                  {slide.headline}
                </h1>
              </div>
              <div className="lg:w-1/3 lg:pl-8 mt-6 lg:mt-0">
                <p className="text-base text-white/80 leading-relaxed max-w-sm">
                  {slide.subtitle}
                </p>
                <button className="mt-6 border border-white/50 px-6 py-2.5 rounded-full text-white bg-transparent hover:bg-white hover:text-black transition-colors duration-200 text-sm font-medium cursor-pointer">
                  Discover More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-10 left-8 md:left-16 z-20 flex gap-2.5">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`w-2.5 h-2.5 rounded-full border-0 p-0 cursor-pointer transition-colors duration-300 ${
              index === current ? 'bg-white' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
