import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import createBundleAnalyzer from "@next/bundle-analyzer";

const strapiUrl = process.env.STRAPI_URL ?? "http://127.0.0.1:1337";
const strapiAdminUrl = process.env.NEXT_PUBLIC_API_URL ?? strapiUrl;

function getOrigin(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${strapiUrl}/uploads/:path*`,
      },
    ];
  },
  async headers() {
    const strapiOrigin = getOrigin(strapiAdminUrl);

    return [
      {
        source: "/((?!api|_next|_vercel|.*\\..*).*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors 'self' ${strapiOrigin};`,
          },
        ],
      },
    ];
  },
  turbopack: {
    root: __dirname,
  },
};

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const withNextIntl = createNextIntlPlugin();
export default withBundleAnalyzer(withNextIntl(nextConfig));
