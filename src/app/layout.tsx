import type { Metadata } from "next";
import "./global.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Silsilah Simangunsong",
  description: "Platform digital pelestarian silsilah dan tarombo marga Simangunsong",
  keywords: ["Simangunsong", "Silsilah Simangunsong", "Keluarga Simangunsong", "Tarombo Simangunsong", "Pelestarian Silsilah", "Platform Digital Silsilah"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-XXXXXXXXXX');
        `}
      </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}