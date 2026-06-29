import type { CSSProperties } from "react";

export type HeroGradientVariant =
  | "home"
  | "courses"
  | "events"
  | "blog"
  | "news"
  | "teachers"
  | "contact"
  | "legal";

type HeroGradientBackgroundProps = {
  variant?: HeroGradientVariant;
  testId?: string;
};

const heroGradientColors: Record<
  HeroGradientVariant,
  {
    primary: string;
    secondary: string;
  }
> = {
  home: {
    primary: "rgb(0% 61.18% 65.1%)",
    secondary: "rgb(5.88% 29.8% 50.59%)",
  },
  courses: {
    primary: "rgb(100% 59.38% 45.22%)",
    secondary: "rgb(98.32% 30.98% 53.97%)",
  },
  events: {
    primary: "rgb(0% 61.18% 65.1%)",
    secondary: "rgb(43.14% 36.86% 96.86%)",
  },
  blog: {
    primary: "rgb(57.65% 38.43% 100%)",
    secondary: "rgb(100% 48.63% 70.98%)",
  },
  news: {
    primary: "rgb(15.69% 45.49% 85.49%)",
    secondary: "rgb(0% 72.94% 66.67%)",
  },
  teachers: {
    primary: "rgb(15.29% 66.27% 48.63%)",
    secondary: "rgb(100% 68.24% 30.98%)",
  },
  contact: {
    primary: "rgb(100% 59.38% 45.22%)",
    secondary: "rgb(98.32% 30.98% 53.97%)",
  },
  legal: {
    primary: "rgb(30.59% 39.61% 92.55%)",
    secondary: "rgb(0% 61.18% 65.1%)",
  },
};

const noiseSvg =
  "url(\"data:image/svg+xml,%3Csvg\\ xmlns='http://www.w3.org/2000/svg'\\ width='256'\\ height='256'%3E%3Cfilter\\ id='noise'\\ color-interpolation-filters='sRGB'%3E%3CfeTurbulence\\ type='fractalNoise'\\ baseFrequency='0.65'\\ numOctaves='3'\\ seed='1'\\ stitchTiles='stitch'/%3E%3CfeColorMatrix\\ type='saturate'\\ values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncR\\ type='linear'\\ slope='0.75'\\ intercept='0.125'/%3E%3CfeFuncG\\ type='linear'\\ slope='0.75'\\ intercept='0.125'/%3E%3CfeFuncB\\ type='linear'\\ slope='0.75'\\ intercept='0.125'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect\\ width='100%25'\\ height='100%25'\\ filter='url(%23noise)'\\ opacity='1'/%3E%3C/svg%3E\")";

export function HeroGradientBackground({
  variant = "home",
  testId,
}: HeroGradientBackgroundProps) {
  const { primary, secondary } = heroGradientColors[variant];
  const style = {
    background: `${noiseSvg} 0 0 / 260px,radial-gradient(73.99% 70.00% at 14.10% 85.15%,${primary} 0%,${primary} 32%,transparent 100%),radial-gradient(77.06% 106.18% at 9.87% 8.00%,${primary} 0%,${primary} 35%,transparent 100%),radial-gradient(58.49% 72.45% at 112.24% 63.11%,${primary} 0%,${primary} 26%,transparent 100%),radial-gradient(76.91% 84.78% at 82.14% 7.26%,${secondary} 0%,${secondary} 35%,transparent 100%),linear-gradient(23.51deg,${primary} 0%,61.8%,transparent 100%)`,
    backgroundBlendMode:
      "soft-light,hard-light,hard-light,hard-light,hard-light,normal",
    filter: "saturate(125%) blur(32px)",
    transform: "scale(1.11)",
  } satisfies CSSProperties;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0"
      data-testid={testId}
      style={style}
    />
  );
}
