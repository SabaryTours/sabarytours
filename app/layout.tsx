import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Quicksand } from "next/font/google";
import "./globals.css";
import AuthHashHandler from "./components/AuthHashHandler";
import ConditionalHeader from "./components/ConditionalHeader";
import LayoutWrapper from "./components/LayoutWrapper";
import AnnouncementModal from "./components/AnnouncementModal";
import { Toaster } from "react-hot-toast";
import GoogleTranslate from "./components/GoogleTranslate";
import SplashScreen from "./components/SplashScreen";
import GoogleAnalytics from "./components/GoogleAnalytics";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sabarytours.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Sabary Tours - Experience Ghana The Sabary Way",
  description: "Discover the beauty, culture, and adventure that Ghana has to offer with Sabary Tours. Expertly crafted tours creating memories that last a lifetime.",
  keywords: ["Ghana tours", "Travel Ghana", "Accra tours", "Sabary Tours", "West Africa travel", "Ghana vacations"],
  authors: [{ name: "Sabary Tours" }],
  openGraph: {
    title: "Sabary Tours - Experience Ghana The Sabary Way",
    description: "Discover the beauty, culture, and adventure that Ghana has to offer. Expertly crafted tours creating memories that last a lifetime.",
    url: "https://sabarytours.com",
    siteName: "Sabary Tours",
    images: [
      {
        url: "/assets/logo.svg",
        width: 800,
        height: 600,
        alt: "Sabary Tours Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/assets/logo.svg" },
    ],
    shortcut: ["/assets/logo.svg"],
    apple: [
      { url: "/assets/logo.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={quicksand.variable}>
      <body className={`${quicksand.className} font-sans antialiased`}>
        <GoogleAnalytics />
        <GoogleTranslate />
        <Suspense fallback={null}>
          <AuthHashHandler />
        </Suspense>
        <LayoutWrapper>
          <ConditionalHeader />
          <SplashScreen>
            {children}
          </SplashScreen>
        </LayoutWrapper>
        <AnnouncementModal />
        <Toaster position="top-right" containerClassName="print:!hidden" />
      </body>
    </html>
  );
}
