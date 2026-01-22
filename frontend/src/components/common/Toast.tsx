import { Toaster } from "react-hot-toast";

export const BevisToaster = () => (
  <Toaster
    position="top-right"
    gutter={10}
    toastOptions={{
      duration: 2800,
      style: {
        fontSize: "0.9rem",
        borderRadius: "0.75rem",
        padding: "10px 14px",
        border: "1px solid var(--color-border)",
        boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
        background: "var(--color-surface)",
        color: "var(--color-text)",
        backdropFilter: "blur(6px)",
      },
      success: {
        iconTheme: {
          primary: "var(--color-candidate)",
          secondary: "var(--color-surface)",
        },
        style: {
          background:
            "color-mix(in srgb, var(--color-candidate) 8%, var(--color-surface))",
          border: "1px solid color-mix(in srgb, var(--color-candidate) 25%, var(--color-border))",
          color: "var(--color-text)",
        },
      },
      error: {
        iconTheme: {
          primary: "var(--color-error)",
          secondary: "var(--color-surface)",
        },
        style: {
          background:
            "color-mix(in srgb, var(--color-error) 8%, var(--color-surface))",
          border: "1px solid color-mix(in srgb, var(--color-error) 25%, var(--color-border))",
          color: "var(--color-text)",
        },
      },
      loading: {
        iconTheme: {
          primary: "var(--color-employer-dark)",
          secondary: "var(--color-surface)",
        },
        style: {
          background:
            "color-mix(in srgb, var(--color-employer) 10%, var(--color-surface))",
          border: "1px solid color-mix(in srgb, var(--color-employer) 25%, var(--color-border))",
          color: "var(--color-text)",
        },
      },
    }}
  />
);