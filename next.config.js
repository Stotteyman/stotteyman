/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  // No `output: 'export'`.
  // The private HQ needs middleware and server-side session checks, which a static
  // export cannot provide — the only alternative would be shipping privileged logic
  // to the browser. Public pages are still prerendered per-route, so the public site
  // keeps its static performance.
  images: {
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

module.exports = nextConfig;
