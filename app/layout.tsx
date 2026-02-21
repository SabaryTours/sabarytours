import type { Metadata } from "next";
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
