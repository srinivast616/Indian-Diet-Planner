import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Indian Diet Planner",
  description: "Personalised Indian meal plans powered by AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FFF8F0]">{children}</body>
    </html>
  );
}
