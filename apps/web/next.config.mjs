const nextConfig = {
  agentRules: false,
  reactStrictMode: true,
  // OAuth codes and webhook verification tokens must never appear in local request logs.
  logging: { incomingRequests: { ignore: [/^\/api\/integrations\/strava(?:\/|\?|$)/, /^\/auth\/callback(?:\/|\?|$)/, /^\/api\/recovery(?:\/|\?|$)/] } },
  transpilePackages: ["@aperture/education", "@aperture/education-memory"],
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ] }];
  },
};

export default nextConfig;
