import type { Metadata } from "next";
import { Kantumruy_Pro } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const kantumruyPro = Kantumruy_Pro({
  subsets: ["khmer", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kantumruy-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "មីនុយ - តម្លៃតាមប្រភេទតុ",
  description: "មើលតម្លៃមីនុយដែលរៀបចំតាមប្រភេទតុ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="km" className={kantumruyPro.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


