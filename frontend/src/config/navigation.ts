export const siteRoutes = [
  { href: "/", label: "Ana Sayfa", routeKey: "ana-sayfa" },
  { href: "/#hakkimizda", label: "Hakkımızda", routeKey: "hakkimizda" },
  { href: "/etkinlikler", label: "Etkinlikler", routeKey: "etkinlikler" },
  { href: "/egitimler", label: "Eğitim Kataloğu", routeKey: "egitimler" },
  { href: "/egitmenler", label: "Eğitmenler", routeKey: "egitmenler" },
  { href: "/cozum-ortagi", label: "Çözüm Ortağı", routeKey: "cozum-ortagi" },
  { href: "/blog-yazilari", label: "Blog", routeKey: "blog-yazilari" },
  { href: "/haberler", label: "Haberler", routeKey: "haberler" },
  { href: "/iletisim", label: "İletişim", routeKey: "iletisim" },
] as const;

export const headerNavigationItems = siteRoutes.filter(
  (item) => item.href !== "/" && item.href !== "/#hakkimizda"
);

export const footerSitePlanItems = siteRoutes;
