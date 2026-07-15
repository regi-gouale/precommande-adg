import type { Metadata } from "next";
import { EB_Garamond, Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  icons: {
    icon: [{ url: "/logo-editheos.png", type: "image/png" }],
    shortcut: ["/logo-editheos.png"],
    apple: [{ url: "/logo-editheos.png", type: "image/png" }],
  },
};

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700", "800"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable,
        ebGaramond.variable,
      )}
    >
      <head>
        <script
          defer
          src="https://analytics.gouale.com/recorder.js"
          data-website-id="a90ec6d4-cbd1-4ec1-a9c4-d8255bce9a31"
          data-domains="network.editheos.fr"
        />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
