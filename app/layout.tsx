import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Incubator Baguio — Official Technology Business Incubator of the City of Baguio",
  description:
    "Incubator Baguio brings together entrepreneurs, researchers, students, government, businesses, and academic institutions to transform ideas into solutions that create economic, social, and technological impact.",
  icons: {
    icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/assets/ib-icon.png`,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
