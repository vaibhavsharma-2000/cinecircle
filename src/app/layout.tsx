import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem("cinecircle_theme");
                  if (stored === "dark") {
                    document.documentElement.setAttribute("data-theme", "dark");
                  } else {
                    document.documentElement.setAttribute("data-theme", "light");
                  }
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
