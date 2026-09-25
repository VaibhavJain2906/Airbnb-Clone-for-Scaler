import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import React, { Suspense } from "react";
import { ToastProvider } from "../context/ToastContext";
import { UserProvider } from "../context/UserContext";
import { Navbar } from "../components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Airbnb | Vacation Rentals, Cabins, Beach Houses & More",
  description:
    "Find the perfect place to stay at an amazing price in 191 countries. Belong anywhere with Airbnb.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-white text-zinc-900 antialiased flex flex-col`}>
        <ToastProvider>
          <UserProvider>
            <Suspense fallback={<header className="h-20 border-b border-zinc-100 bg-white" />}>
              <Navbar />
            </Suspense>
            <main className="flex-1">{children}</main>
            <footer className="border-t border-zinc-200 bg-zinc-50 py-6 mt-16 text-center text-xs text-zinc-500">
              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>© 2026 Airbnb Clone, Inc. · Built for SDE Fullstack Assessment</div>
                <div className="flex items-center gap-6">
                  <span>English (US)</span>
                  <span>$ USD</span>
                  <span>Support & Resources</span>
                </div>
              </div>
            </footer>
          </UserProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
