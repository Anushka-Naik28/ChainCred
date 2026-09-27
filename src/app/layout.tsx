import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/context/Web3Context";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { NetworkBanner } from "@/components/NetworkBanner";

export const metadata: Metadata = {
  title: "ChainCred — Decentralized Academic Credential Network",
  description:
    "Verifiable, tamper-evident academic credential issuance and verification platform built on Ethereum smart contracts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased text-gray-100 flex flex-col min-h-screen">
        <Web3Provider>
          <NetworkBanner />
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Web3Provider>
      </body>
    </html>
  );
}
