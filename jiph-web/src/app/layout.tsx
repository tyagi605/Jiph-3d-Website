import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Footer, Header, MobileBar } from "@/components/SiteChrome";
import "./globals.css";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.jiph.in"),
  title: { default: "JIPH Furniture — Built for institutions", template: "%s | JIPH Furniture" },
  description: "JIPH Furniture designs, manufactures and installs lecture-hall seating, classroom desks, library, hostel, lab and cafeteria furniture for schools, colleges and universities across India. Since 1996.",
  openGraph: { type: "website", siteName: "JIPH Furniture", locale: "en_IN" },
};

export const viewport: Viewport = { themeColor: "#F7F6F3" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${mono.variable}`}>
      <body>
        <a href="#main" className="skip">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <MobileBar />
      </body>
    </html>
  );
}
