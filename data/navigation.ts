export interface NavLink {
  label: string;
  href: string;
  children?: NavLink[];
}

export const mainNav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "New Arrivals", href: "/new-arrivals" },
  {
    label: "Collections",
    href: "/collections",
    children: [
      { label: "Winter Collection 2026", href: "/collections#winter-2026" },
      { label: "Essentials", href: "/collections#essentials" },
      { label: "Occasion", href: "/collections#occasion" },
      { label: "Women's Fashion", href: "/category/womens-fashion" },
      { label: "Men's Fashion", href: "/category/mens-fashion" },
      { label: "Traditional Wear", href: "/category/traditional-wear" },
    ],
  },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const footerNav = [
  {
    title: "Shop",
    links: [
      { label: "New Arrivals", href: "/new-arrivals" },
      { label: "Women's", href: "/category/womens-fashion" },
      { label: "Men's", href: "/category/mens-fashion" },
      { label: "Collections", href: "/collections" },
      { label: "Best Sellers", href: "/shop?sort=best-selling" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Our Story", href: "/about#our-story" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Shipping", href: "/shipping" },
      { label: "Returns", href: "/returns" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
    ],
  },
] as const;
