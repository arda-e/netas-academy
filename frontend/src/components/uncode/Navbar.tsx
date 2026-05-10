'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const navLinks = [
  { label: 'About', href: '#' },
  { label: 'Services', href: '#' },
  { label: 'Portfolio', href: '#' },
  { label: 'Blog', href: '#' },
  { label: 'Contact', href: '#' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={[
        'sticky top-0 z-50 w-full h-[72px] flex items-center transition-[background-color,box-shadow] duration-300',
        scrolled
          ? 'bg-[#323231] shadow-[0_1px_0_rgba(255,255,255,0.06)]'
          : 'bg-transparent',
      ].join(' ')}
    >
      <div className="w-full max-w-[1280px] mx-auto px-6 flex items-center justify-between gap-8">
        <Link
          href="#"
          className="text-xl font-bold text-white tracking-tight shrink-0 no-underline"
        >
          Horizon
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="relative text-[0.9375rem] font-medium text-white/88 no-underline transition-colors duration-150 hover:text-white after:absolute after:left-0 after:-bottom-0.5 after:h-[1.5px] after:w-0 after:bg-white after:transition-[width] after:duration-200 hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          href="#"
          className="hidden md:inline-flex items-center justify-center shrink-0 text-sm font-semibold text-white bg-transparent border border-white/70 rounded px-5 py-2 no-underline transition-[background-color,color,border-color] duration-200 hover:bg-white hover:text-[#323231] hover:border-white"
        >
          Get Started
        </Link>

        <button
          type="button"
          className="md:hidden flex items-center justify-center bg-transparent border-0 text-white text-2xl leading-none cursor-pointer p-1"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {mobileOpen && (
        <div className="absolute top-[72px] left-0 right-0 bg-[#323231] border-t border-white/8 px-6 pt-3 pb-5 flex flex-col gap-1 shadow-[0_8px_24px_rgba(0,0,0,0.3)] md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block px-4 py-3 text-[0.9375rem] font-medium text-white/82 no-underline rounded transition-[background-color,color] duration-150 hover:bg-white/8 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="#"
            className="block mt-2 px-4 py-3 text-[0.9375rem] font-semibold text-white no-underline border border-white/50 rounded text-center transition-[background-color,color] duration-200 hover:bg-white hover:text-[#323231]"
            onClick={() => setMobileOpen(false)}
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}
