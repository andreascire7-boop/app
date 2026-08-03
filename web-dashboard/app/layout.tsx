import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "S&C Intelligence — Dashboard Coach",
  description: "Vista coach: atleti collegati, ordinati per rischio (F11).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
