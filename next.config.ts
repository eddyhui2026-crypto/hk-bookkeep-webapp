import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 開發模式左下角「N」浮標；production 本來就唔會出現 */
  devIndicators: false,
};

export default nextConfig;
