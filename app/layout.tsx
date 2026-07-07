import type { Metadata } from "next";
import "./globals.css";
import Interactive from "./Interactive";
import AuthProvider from "./AuthProvider";
import AuthNav from "./AuthNav";
import PageLoader from "./PageLoader";
import PostHogProvider from "./PostHogProvider";
import { SITE_URL } from "./seo";

const TITLE = "Incubator Baguio | Baguio’s Startup & Innovation Ecosystem Platform";
const DESCRIPTION =
  "Incubator Baguio brings together entrepreneurs, researchers, students, government, businesses, and academic institutions to transform ideas into solutions that create economic, social, and technological impact.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s" },
  description: DESCRIPTION,
  keywords: [
    "Incubator Baguio",
    "Baguio startup incubator",
    "Baguio innovation ecosystem",
    "Technology Business Incubator Baguio",
    "Baguio TBI",
    "Cordillera startups",
    "Baguio City innovation",
    "innovation challenges Baguio",
  ],
  applicationName: "Incubator Baguio",
  icons: {
    icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/assets/ib-icon.png`,
    apple: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/assets/ib-icon.png`,
  },
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: SITE_URL,
    siteName: "Incubator Baguio",
    title: TITLE,
    description: DESCRIPTION,
    // Points directly at the trailing-slash URL (next.config.js sets
    // trailingSlash: true) so social crawlers that don't follow redirects
    // still fetch the image on the first request.
    images: [{ url: "/api/og/", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/api/og/"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  // Google Search Console ownership verification (Settings → Ownership
  // verification → HTML tag method). Set GOOGLE_SITE_VERIFICATION in Vercel
  // env vars with the content value Search Console gives you — no code
  // change needed after that.
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PageLoader />
        <PostHogProvider>
          <AuthProvider>
            {children}
            <Interactive />
            <AuthNav />
          </AuthProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
