import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  // Source service worker (Serwist) → compiled output served at /sw.js
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  // Disable the service worker in development to avoid stale caches while iterating.
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // This app lives in a subfolder of the mobile repo; pin the tracing root so
  // Next doesn't guess the wrong workspace from multiple lockfiles.
  outputFileTracingRoot: __dirname,
};

export default withSerwist(nextConfig);
