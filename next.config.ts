import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/kalkulacky",
        destination: "/navratnost-pronajmu",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
