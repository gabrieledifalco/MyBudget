import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "@/features/auth/AuthContext";

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/profilo", label: "Profilo" },
  { to: "/entrate", label: "Entrate" },
  { to: "/spese", label: "Spese" },
  { to: "/overview", label: "Overview" },
  { to: "/simulatore", label: "Simulatore" },
];

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-logo">MyBudget</span>
        {user && (
          <div className="app-header__user">
            <span>
              {user.firstName} {user.lastName}
            </span>
            <button type="button" className="btn btn--ghost" onClick={logout}>
              Esci
            </button>
          </div>
        )}
      </header>

      <main className="app-content">
        <Outlet />
      </main>

      <nav className="app-nav">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `app-nav__link${isActive ? " active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
