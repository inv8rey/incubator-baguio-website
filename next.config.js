/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  async redirects() {
    return [
      // /events was folded into /calendar. This used to be a client-side
      // window.location.replace, which crawlers see as a thin page rather
      // than a move — a real 308 passes the ranking signal on and works
      // without JS.
      // Destination carries the trailing slash to match `trailingSlash: true`,
      // otherwise every hit takes an extra /calendar -> /calendar/ hop.
      { source: "/events", destination: "/calendar/", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Clickjacking: nothing here is meant to be framed, and the admin
          // panel and dashboard both sit behind a session.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Send the origin but not the path to third parties — the site
          // commits to the Data Privacy Act (RA 10173) in its own footer.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          // Vercel serves HTTPS only; this stops a downgrade on repeat visits.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
