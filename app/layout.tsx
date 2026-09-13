import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HCM — Church Management",
  description: "Church management system for members, visitors, check-in and programmes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
