export type NavItem = {
  label: string;
  href: string;
  icon: string;
};

export const primaryNav: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: "home" },
  { label: "Subjects", href: "/subjects", icon: "menu_book" },
  { label: "AI Mentor", href: "/mentor", icon: "smart_toy" },
  { label: "Progress", href: "/progress", icon: "monitoring" },
  { label: "Planner", href: "/planner", icon: "calendar_month" },
  { label: "Bookmarks", href: "/bookmarks", icon: "bookmark" },
  { label: "Profile", href: "/account/settings", icon: "person" },
];

export const mobileTabNav: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: "home" },
  { label: "Subjects", href: "/subjects", icon: "menu_book" },
  { label: "AI Mentor", href: "/mentor", icon: "smart_toy" },
  { label: "Progress", href: "/progress", icon: "monitoring" },
  { label: "Profile", href: "/account/settings", icon: "person" },
];
