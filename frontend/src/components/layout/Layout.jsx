import { Link, useLocation } from "react-router-dom";

export function Layout({ children }) {
  const { pathname } = useLocation();
  const nav = [
    { to: "/", label: "Analyzer" },
    { to: "/history", label: "Applications" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 border-b border-ink-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="font-display text-lg font-semibold tracking-tight text-ink-900">
            JD<span className="text-accent">Analyzer</span>
          </Link>
          <nav className="flex gap-1 rounded-full bg-ink-100/80 p-1">
            {nav.map(({ to, label }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-white text-ink-900 shadow-sm"
                      : "text-ink-600 hover:text-ink-900"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
      <footer className="border-t border-ink-200 bg-white py-4 text-center text-xs text-ink-500">
        Add <code className="rounded bg-ink-100 px-1">GROQ_API_KEY</code> in backend{" "}
        <code className="rounded bg-ink-100 px-1">.env</code> for full AI output.
      </footer>
    </div>
  );
}
