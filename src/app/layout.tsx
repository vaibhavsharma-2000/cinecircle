import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Bebas_Neue, DM_Sans, Montserrat } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", display: "swap" });
const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas", display: "swap" });

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "CineCircle - Friend Movie & TV Recommendations",
  description: "Private, UX-first movie recommendation platform for friend circles.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CineCircle",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${dmSans.variable} ${montserrat.variable} ${bebas.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem("cinecircle_theme");
                  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                  const dark = stored ? stored === "dark" : prefersDark;
                  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
                } catch (e) {
                  document.documentElement.setAttribute("data-theme", "light");
                }
              })();
            `,
          }}
        />
      </head>
      <body className="bg-[var(--bg)] text-[var(--text)] min-h-screen font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
