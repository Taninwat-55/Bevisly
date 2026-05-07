import { Link, useLocation } from "react-router-dom";

export interface BottomNavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
  featured?: boolean;
}

interface MobileBottomNavProps {
  links: BottomNavItem[];
}

export default function MobileBottomNav({ links }: MobileBottomNavProps) {
  const location = useLocation();

  // Show a maximum of 5 items to prevent crowding
  const displayLinks = links.slice(0, 5);

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 bg-[var(--color-surface)]/95 backdrop-blur-xl border-t border-[var(--color-border)] z-40 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.2)]">
      <div className="flex items-center justify-around h-16">
        {displayLinks.map((link) => {
          const Icon = link.icon;
          // Simple active check. Can be enhanced for nested routes if needed.
          const isActive = location.pathname === link.path || (link.path !== "/candidate" && link.path !== "/employer" && location.pathname.startsWith(link.path));
          
          if (link.featured) {
            return (
              <Link
                key={link.path}
                to={link.path}
                className="relative -top-4 flex flex-col items-center justify-center w-full h-full group active:scale-95 transition-all"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] text-white flex items-center justify-center shadow-lg shadow-brand-primary/30 group-hover:scale-105 transition-transform">
                  <Icon size={24} strokeWidth={2.5} className="drop-shadow-sm" />
                </div>
                <span className={`mt-1 text-[10px] text-center w-full truncate px-1 transition-all text-[var(--color-brand-primary)] font-bold drop-shadow-sm`}>
                  {link.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all active:scale-95 pt-2 ${
                isActive 
                  ? "text-[var(--color-brand-primary)]" 
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              <div className="relative">
                <Icon 
                  size={22} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={isActive ? "drop-shadow-sm" : ""} 
                />
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 flex items-center justify-center text-[9px] font-bold bg-red-500 text-white rounded-full shadow-sm ring-2 ring-[var(--color-surface)]">
                    {link.badge > 9 ? "9+" : link.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] text-center w-full truncate px-1 transition-all ${isActive ? "font-bold" : "font-medium"}`}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
