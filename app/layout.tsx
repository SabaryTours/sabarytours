import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import ConditionalHeader from "./components/ConditionalHeader";
import LayoutWrapper from "./components/LayoutWrapper";
import TawkToChat from "./components/TawkToChat";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

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
      <body
        className={`${quicksand.variable} font-sans antialiased`}
      >
        <LayoutWrapper>
          <ConditionalHeader />
        {children}
        </LayoutWrapper>
        <TawkToChat />
      </body>
    </html>
  );
}
