import type { Metadata } from "next";
import "./global.css";
import Script from "next/script";

const BASE_URL = "https://silsilahsimangunsong.site";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Silsilah Simangunsong — Tarombo & Pohon Silsilah Marga Batak Toba",
    template: "%s | Silsilah Simangunsong",
  },
  description:
    "Platform digital pelestarian silsilah dan tarombo marga Simangunsong. Temukan hubungan kekerabatan, jelajahi pohon silsilah interaktif, dan cari anggota keluarga Simangunsong dari seluruh Indonesia.",
  keywords: [
    "Simangunsong",
    "Silsilah Simangunsong",
    "Tarombo Simangunsong",
    "Marga Simangunsong",
    "Keluarga Simangunsong",
    "Batak Toba",
    "Tarombo Batak",
    "Pohon Silsilah Batak",
    "Silsilah Batak Toba",
    "Marga Batak Toba",
    "Asal-usul Simangunsong",
    "Keturunan Simangunsong",
    "Silsilah Online",
    "Tarombo Online",
    "Genealogi Batak",
  ],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: BASE_URL,
    siteName: "Silsilah Simangunsong",
    title: "Silsilah Simangunsong — Tarombo & Pohon Silsilah Marga Batak Toba",
    description:
      "Platform digital pelestarian silsilah dan tarombo marga Simangunsong. Jelajahi pohon silsilah interaktif dan temukan kerabat Simangunsong di seluruh dunia.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Silsilah Simangunsong — Tarombo Batak Toba",
    description:
      "Jelajahi pohon silsilah interaktif dan temukan kerabat marga Simangunsong Batak Toba.",
  },
  alternates: {
    canonical: BASE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      "url": BASE_URL,
      "name": "Silsilah Simangunsong",
      "description":
        "Platform digital pelestarian silsilah dan tarombo marga Simangunsong Batak Toba, Sumatera Utara, Indonesia",
      "inLanguage": "id",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${BASE_URL}/cari?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "WebPage",
      "@id": `${BASE_URL}/#webpage`,
      "url": BASE_URL,
      "name": "Silsilah Simangunsong — Tarombo & Pohon Silsilah Marga Batak Toba",
      "isPartOf": { "@id": `${BASE_URL}/#website` },
      "description":
        "Halaman utama Silsilah Simangunsong — platform digital pelestarian tarombo dan silsilah marga Simangunsong Batak Toba.",
      "inLanguage": "id",
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Beranda", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Pohon Silsilah", "item": `${BASE_URL}/tarombo` },
          { "@type": "ListItem", "position": 3, "name": "Cari Anggota", "item": `${BASE_URL}/cari` },
        ],
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${BASE_URL}/#faq`,
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Apa itu Marga Simangunsong?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Simangunsong adalah salah satu marga (clan) dalam kebudayaan Batak Toba dari Sumatera Utara, Indonesia. Marga diwariskan secara patrilineal dari ayah kepada semua anaknya dan menjadi identitas utama dalam struktur sosial, adat istiadat, dan hubungan kekerabatan masyarakat Batak Toba.",
          },
        },
        {
          "@type": "Question",
          "name": "Apa itu Tarombo dalam Budaya Batak Toba?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Tarombo adalah sistem pencatatan silsilah patrilineal marga Batak yang mencatat hubungan kekerabatan antar generasi. Tarombo menentukan partuturan (sistem sapaan kekerabatan), peran dalam adat, dan kedudukan dalam struktur sosial Dalihan Na Tolu.",
          },
        },
        {
          "@type": "Question",
          "name": "Bagaimana cara menelusuri silsilah Simangunsong?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Gunakan fitur Pohon Silsilah untuk melihat visualisasi tarombo secara interaktif, atau fitur Pencarian untuk menemukan anggota keluarga berdasarkan nama. Setiap profil anggota menampilkan data orang tua, pasangan, dan anak-anaknya.",
          },
        },
        {
          "@type": "Question",
          "name": "Siapa saja yang bisa melihat data silsilah Simangunsong?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Seluruh data pohon silsilah dan profil anggota keluarga Simangunsong dapat dilihat oleh siapapun secara publik tanpa perlu login. Untuk menambahkan atau mengubah data, diperlukan akses administrator.",
          },
        },
        {
          "@type": "Question",
          "name": "Bagaimana cara menambahkan anggota baru ke silsilah?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Penambahan data anggota baru dilakukan oleh administrator melalui halaman Dashboard. Jika ingin mendaftarkan anggota keluarga atau memperbaiki data, silakan hubungi pengelola melalui WhatsApp agar verifikasi dapat dilakukan terlebih dahulu.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-M95DDGMV0G"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-M95DDGMV0G');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}