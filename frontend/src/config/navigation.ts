export const siteRoutes = [
  { href: "/", routeKey: "home" },
  { href: "/#hakkimizda", routeKey: "about" },
  { href: "/etkinlikler", routeKey: "events" },
  { href: "/egitimler", routeKey: "courses" },
  { href: "/egitmenler", routeKey: "teachers" },
  { href: "/cozum-ortagi", routeKey: "solution_partner" },
  { href: "/blog-yazilari", routeKey: "blog" },
  { href: "/haberler", routeKey: "news" },
  { href: "/iletisim", routeKey: "contact" },
] as const;

export const headerNavigationItems = siteRoutes.filter(
  (item) => item.href !== "/" && item.href !== "/#hakkimizda"
);

export const footerSitePlanItems = siteRoutes;
