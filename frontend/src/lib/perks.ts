import {
  Wifi, Clock, TrendingUp, Heart, BookOpen, Home,
  Umbrella, Users, Smile, Coffee, Laptop, Shield,
  Baby, Dumbbell,
} from "lucide-react";

export const PERKS_LIST = [
  { id: "remote",          label: "Remote work",            icon: Wifi },
  { id: "flexible_hours",  label: "Flexible hours",         icon: Clock },
  { id: "equity",          label: "Equity / stock options", icon: TrendingUp },
  { id: "health_insurance",label: "Health insurance",       icon: Heart },
  { id: "dev_budget",      label: "Dev & learning budget",  icon: BookOpen },
  { id: "home_office",     label: "Home office stipend",    icon: Home },
  { id: "unlimited_pto",   label: "Unlimited PTO",          icon: Umbrella },
  { id: "parental_leave",  label: "Parental leave",         icon: Baby },
  { id: "team_events",     label: "Team events",            icon: Users },
  { id: "mental_health",   label: "Mental health support",  icon: Smile },
  { id: "pension",         label: "Pension plan",           icon: Shield },
  { id: "gym",             label: "Gym membership",         icon: Dumbbell },
  { id: "snacks",          label: "Free snacks & coffee",   icon: Coffee },
  { id: "new_gear",        label: "New tech gear",          icon: Laptop },
];
