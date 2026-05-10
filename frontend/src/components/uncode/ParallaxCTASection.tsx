import { AccordionSection } from "@/components/uncode/AccordionSection";

const faqs = [
  {
    q: "How do you approach investment risk management?",
    a: "Our investment strategy is fundamentally built on thorough risk assessment and disciplined underwriting. We employ a multi-layered approach that begins with comprehensive due diligence, leveraging deep industry expertise and rigorous covenant analysis. Our team conducts extensive bottom-up research, examining each potential investment through multiple lenses – financial metrics, market conditions, operational capabilities, and potential value creation opportunities.",
  },
  {
    q: "What makes your investment approach unique?",
    a: "We distinguish ourselves through a flexible, value-oriented approach that spans both public and private markets. Our platform is designed to be opportunistic, allowing us to adapt quickly to changing market conditions. We're not constrained by a single investment strategy, but instead draw on a diverse set of credit strategies that enable us to identify and capitalize on unique investment opportunities across different market cycles.",
  },
  {
    q: "How do you generate consistent returns in markets?",
    a: "Consistency is achieved through our integrated platform and multi-strategy approach. We actively source deals through an extensive network of industry contacts, utilize deep sector specialization, and maintain operational capabilities that allow us to provide strategic guidance to portfolio companies.",
  },
  {
    q: "What types of investments do you focus on?",
    a: "Our investment strategy encompasses a wide range of credit-related opportunities, including senior loans, high-yield bonds, multi-asset credit, structured credit, direct lending, and opportunistic credit investments. We have a particular focus on sectors where we can leverage our deep industry knowledge and operational expertise to create value.",
  },
  {
    q: "How do you evaluate investment opportunities?",
    a: "Our evaluation process is comprehensive and multi-dimensional. We begin with extensive sourcing through our robust network, followed by in-depth fundamental analysis. Our team combines quantitative financial modeling with qualitative assessments of management teams, industry trends, and potential operational improvements.",
  },
];

export function ParallaxCTASection() {
  return (
    <div>
      <section className="w-full h-[400px] bg-gradient-to-br from-[#1b1d1f] via-[#2c4437] to-[#1b1d1f] flex items-center justify-center">
        <p className="text-white/20 text-xs uppercase tracking-[0.3em]">Horizon Enterprises</p>
      </section>

      <AccordionSection
        heading="Our essential perspectives on investing"
        items={faqs}
      />
    </div>
  );
}
