import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CV Manager",
  description: "Manage and export your CV with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased overflow-x-hidden">
      <body className="min-h-full flex w-full">{children}</body>
    </html>
  );
}
