import type { Metadata, Viewport } from "next";
// import { Quicksand } from "next/font/google";
import "./globals.css";
import ConditionalHeader from "./components/ConditionalHeader";
import LayoutWrapper from "./components/LayoutWrapper";
import TawkToChat from "./components/TawkToChat";
import AnnouncementModal from "./components/AnnouncementModal";
import { Toaster } from "react-hot-toast";
import GoogleTranslate from "./components/GoogleTranslate";

// Remove next/font/google to prevent build-time fetch errors
// const quicksand = Quicksand({
//   variable: "--font-quicksand",
//   subsets: ["latin"],
//   weight: ["300", "400", "500", "600", "700"],
// });

export const metadata: Metadata = {
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <script src="https://js.paystack.co/v2/inline.js" async></script>
        <style dangerouslySetInnerHTML={{__html: `
          :root {
            --font-quicksand: 'Quicksand', sans-serif;
          }
        `}} />
      </head>
      <body
        className={`font-sans antialiased`}
      >
        <GoogleTranslate />
        <LayoutWrapper>
          <ConditionalHeader />
        {children}
        </LayoutWrapper>
        <TawkToChat />
        <AnnouncementModal />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
