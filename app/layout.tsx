import type { Metadata } from "next";
import "./globals.css";
import Interactive from "./Interactive";
import AuthProvider from "./AuthProvider";
import AuthNav from "./AuthNav";
import { SITE_URL } from "./seo";

const TITLE = "Incubator Baguio — Official Technology Business Incubator of the City of Baguio";
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
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Interactive />
          <AuthNav />
        </AuthProvider>
      </body>
    </html>
  );
}
