export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/login",
          "/admin",
          "/dashboard"
        ]
      },
    ],
    sitemap: "https://silsilahsimangunsong.site/sitemap.xml",
  };
}