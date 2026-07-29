import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { ScrollAnimator } from "@/components/layout/ScrollAnimator";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "UGM CUP 2026",
  description: "Rallyverse — Power in every motion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/*
          Scroll-reveal targets start invisible, so without JS they would never
          come back — this puts them straight on screen instead. Written as raw
          HTML because React would otherwise hoist the <style> out of the
          <noscript> and into the head, where it applies to everyone.
        */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<style>[data-aos]{opacity:1!important;transform:none!important;filter:none!important}</style>`,
          }}
        />
        <ScrollAnimator />
        {children}
      </body>
    </html>
  );
}
