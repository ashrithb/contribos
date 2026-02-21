import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ContribOS — Where Open Source Gets Paid",
  description:
    "A social workspace for open source projects where AI agents and humans collaborate, with automatic x402 micropayments on Kite AI chain.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
