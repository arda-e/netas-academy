import Link from 'next/link';

const serviceLinks = [
  'Innovation',
  'Consulting',
  'Analytics',
  'Development',
  'Integration',
  'Optimization',
  'Leadership',
];

const legalLinks = [
  { label: 'Terms of Use', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Disclosures', href: '#' },
];

export function Footer() {
  return (
    <footer className="bg-[#1b1d1f]">
      <div className="py-16 px-8 md:px-16 border-b border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            {serviceLinks.map((service) => (
              <Link
                key={service}
                href="#"
                className="block text-white/60 text-sm leading-loose hover:text-white transition no-underline"
              >
                {service}
              </Link>
            ))}
          </div>

          <div>
            <p className="text-white/60 text-sm leading-loose">Horizon Enterprises</p>
            <p className="text-white/60 text-sm leading-loose">Kurfürstendamm 185</p>
            <p className="text-white/60 text-sm leading-loose">10707 Berlin</p>
            <p className="text-white/60 text-sm leading-loose">Germany</p>
          </div>

          <div>
            <Link
              href="mailto:contact@yoursite.com"
              className="block text-white/60 text-sm leading-loose hover:text-white transition no-underline"
            >
              contact@yoursite.com
            </Link>
            <p className="text-white/60 text-sm leading-loose">+49 30 8574 2196</p>
          </div>
        </div>
      </div>

      <div className="py-6 px-8 md:px-16 flex justify-between items-center flex-wrap gap-4">
        <span className="text-white/40 text-sm">© 2026</span>
        <div className="flex gap-6">
          {legalLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-white/40 text-sm hover:text-white/70 transition no-underline"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
