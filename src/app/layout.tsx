import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CineCircle - Friend Movie & TV Recommendations",
  description: "Private, UX-first movie recommendation platform for friend circles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[var(--canvas)] text-[var(--text-primary)] min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
