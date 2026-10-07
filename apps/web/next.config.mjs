const nextConfig = {
  agentRules: false,
  reactStrictMode: true,
  // OAuth codes and webhook verification tokens must never appear in local request logs.
  logging: { incomingRequests: { ignore: [/^\/api\/integrations\/strava(?:\/|\?|$)/] } },
  transpilePackages: ["@aperture/education", "@aperture/education-memory"],
};

export default nextConfig;
