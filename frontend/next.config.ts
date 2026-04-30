import type { NextConfig } from "next";

const strapiUrl = process.env.STRAPI_URL ?? "http://127.0.0.1:1337";

const strapiImageOrigins = [
  process.env.STRAPI_PUBLIC_URL,
  process.env.NEXT_PUBLIC_STRAPI_URL,
  strapiUrl,
  "http://127.0.0.1:1337",
  "http://localhost:1337",
];

function getStrapiImageRemotePatterns() {
  const seen = new Set<string>();

  return strapiImageOrigins.flatMap((origin) => {
    if (!origin) {
      return [];
    }

    try {
      const url = new URL(origin);
      const key = `${url.protocol}//${url.hostname}:${url.port}`;

      if (seen.has(key)) {
        return [];
      }

      seen.add(key);

      return [
        {
          protocol: url.protocol.replace(":", "") as "http" | "https",
          hostname: url.hostname,
          port: url.port,
          pathname: "/uploads/**",
        },
      ];
    } catch {
      return [];
    }
  });
}

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: getStrapiImageRemotePatterns(),
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

export default nextConfig;
