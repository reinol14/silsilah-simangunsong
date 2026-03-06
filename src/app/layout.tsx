import type { Metadata } from "next";
import "./global.css";

export const metadata: Metadata = {
  title: "Silsilah Simangunsong",
  description: "Platform digital pelestarian silsilah dan tarombo marga Simangunsong",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}