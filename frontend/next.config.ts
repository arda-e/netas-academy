import type { NextConfig } from "next";

const strapiUrl = process.env.STRAPI_URL ?? "http://127.0.0.1:1337";
const mediaPublicUrl =
  process.env.MEDIA_PUBLIC_URL ??
  "https://netas-academy-media-540713960950-eu-central-1.s3.eu-central-1.amazonaws.com";

const strapiImageOrigins = [
  mediaPublicUrl,
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
    remotePatterns: [
      ...getStrapiImageRemotePatterns(),
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "d3f86pfw66amx.cloudfront.net",
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

export default nextConfig;
