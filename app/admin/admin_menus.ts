import {
  Tags,
  ClipboardList,
  Utensils,
  CalendarCheck,
  UserPen,
  Home,
} from "lucide-react";

export const items = [
  {
    title: "Home",
    url: "/admin/home",
    icon: Home,
  },

  {
    title: "Categories",
    url: "/admin/categories",
    icon: Tags,
  },

  {
    title: "Catering Plans",
    url: "/admin/catering-plans",
    icon: ClipboardList,
  },

  {
    title: "Meals",
    url: "/admin/meals",
    icon: Utensils,
  },

  {
    title: "Order Subscriptions",
    url: "/admin/subscriptions",
    icon: CalendarCheck,
  },

  {
    title: "Profile",
    url: "/admin/profile",
    icon: UserPen,
  },
];