import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

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
    <html lang="km">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


