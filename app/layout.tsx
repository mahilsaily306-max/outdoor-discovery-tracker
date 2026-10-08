import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#07120c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://verda.app"),
  title: "VERDA — AI That Gets Out of Your Way",
  description:
    "An open-AI outdoor companion that creates personalized missions and helps you spend less time on your screen.",
  applicationName: "VERDA",
  keywords: [
    "VERDA",
    "Hacktoberfest",
    "Touch Grass",
    "Open-source AI",
    "Ollama",
    "Open-weight models",
    "Outdoor companion",
    "Screen-away mode",
    "Mindful exploration",
    "PWA",
  ],
  authors: [{ name: "VERDA Contributors" }],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "VERDA — AI That Gets Out of Your Way",
    description:
      "An open-AI outdoor companion that creates personalized missions and helps you spend less time on your screen.",
    url: "https://verda.app",
    siteName: "VERDA",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        alt: "VERDA — AI that gets out of your way",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "VERDA — AI That Gets Out of Your Way",
    description:
      "An open-AI outdoor companion that creates personalized missions and helps you spend less time on your screen.",
    images: ["/icon.svg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VERDA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#07120c] text-[#f0fdf4] selection:bg-emerald-500/30 selection:text-emerald-200">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
