import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const strapiUrl = process.env.STRAPI_URL ?? "http://127.0.0.1:1337";

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
  turbopack: {
    root: __dirname,
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
