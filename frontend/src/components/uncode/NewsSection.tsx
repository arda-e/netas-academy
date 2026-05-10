const articles = [
  { date: '25.03.2025', title: 'Emerging from lockdown with a plan for business relationships' },
  { date: '22.03.2025', title: 'A good time to check the warmth of key business relationships' },
  { date: '20.03.2025', title: 'Avoid making predictions for 2025, just be ready for anything' },
  { date: '18.03.2024', title: "Don't let the rhythm of lockdown dictate your business" },
  { date: '07.03.2024', title: 'Great creative work will always need great account management' },
  { date: '03.03.2024', title: "In today's workplace, the importance of finding someone to talk" },
  { date: '02.03.2024', title: 'We need trust in the workplace more than I can ever remember' },
];

export function NewsSection() {
  return (
    <section className="bg-white border-t border-[#d6d7d9] py-24 px-8 md:px-16">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex justify-between items-start mb-12">
          <div>
            <span className="inline-block bg-[#2c4437] text-white text-xs uppercase tracking-widest rounded-full px-3 py-1">
              News
            </span>
            <h2 className="text-4xl font-normal text-[#303133] mt-2">
              Latest press releases
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center rounded-full border border-[#d6d7d9] text-[#303133] hover:bg-[#1b1d1f] hover:text-white hover:border-[#1b1d1f] transition"
              aria-label="Previous"
            >
              ←
            </button>
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center rounded-full border border-[#d6d7d9] text-[#303133] hover:bg-[#1b1d1f] hover:text-white hover:border-[#1b1d1f] transition"
              aria-label="Next"
            >
              →
            </button>
          </div>
        </div>

        <ul className="divide-y divide-[#d6d7d9]">
          {articles.map((article) => (
            <li key={article.date + article.title}>
              <a
                href="#"
                className="group flex items-start py-5 px-2 -mx-2 rounded hover:bg-[#f5f5f5] transition no-underline"
              >
                <span className="text-sm text-[#5b616b] w-28 shrink-0 pt-0.5">{article.date}</span>
                <span className="flex-1 text-[#303133] text-base group-hover:text-[#2c4437] transition-colors">
                  {article.title}
                </span>
                <span className="text-[#5b616b] ml-4 group-hover:translate-x-1 transition-transform inline-block">→</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
