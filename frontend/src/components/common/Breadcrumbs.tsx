import { Link, useLocation } from "react-router-dom";

export default function Breadcrumbs() {
  const location = useLocation();

  // Break the current path into segments
  const pathnames = location.pathname.split("/").filter((x) => x);

  const isEmployer = location.pathname.includes("/employer");
  const accent = isEmployer
    ? "var(--color-employer-dark)"
    : location.pathname.includes("/candidate")
    ? "var(--color-candidate-dark)"
    : "var(--color-text)";

  return (
    <nav className="text-sm text-[var(--color-text-muted)] mb-4">
      <ol className="flex flex-wrap items-center space-x-1">
        <li>
          <Link
            to="/"
            className="hover:text-[var(--color-text)] transition-colors"
          >
            Home
          </Link>
        </li>

        {pathnames.map((segment, index) => {
          const to = "/" + pathnames.slice(0, index + 1).join("/");
          const isLast = index === pathnames.length - 1;

          // Clean label (e.g., "employer" → "Employer", "job" → "Job")
          const label = decodeURIComponent(segment)
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());

          return (
            <li key={to} className="flex items-center space-x-1">
              <span className="text-[var(--color-border)]">/</span>
              {isLast ? (
                <span style={{ color: accent }}>{label}</span>
              ) : (
                <Link
                  to={to}
                  className="hover:text-[var(--color-text)] transition-colors"
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
