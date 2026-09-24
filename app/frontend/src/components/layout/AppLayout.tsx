import {
  BarChart2,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Lightbulb,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/features/auth/AuthContext";

const NAV = [
  { to: "/dashboard", label: "Dashboard",      icon: LayoutDashboard },
  { to: "/entrate",   label: "Entrate",         icon: TrendingUp },
  { to: "/uscite",    label: "Uscite",           icon: CreditCard },
  { to: "/overview",  label: "Analisi",          icon: Lightbulb },
  { to: "/simulatore",label: "Simulatore",       icon: BarChart2 },
  { to: "/profilo",   label: "Profilo",          icon: User },
];

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":  "Dashboard",
  "/entrate":    "Entrate",
  "/uscite":     "Uscite",
  "/overview":   "Analisi finanziaria",
  "/simulatore": "Simulatore",
  "/profilo":    "Profilo",
};

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "??";

  const pageTitle = PAGE_TITLES[location.pathname] ?? "MyBudget";

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="app-sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo__icon">
            <Wallet size={17} />
          </div>
          <span className="sidebar-logo__text">
            My<span>Budget</span>
          </span>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-nav__label">Menu</span>
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user__avatar">{initials}</div>
            <div className="sidebar-user__info">
              <div className="sidebar-user__name">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="sidebar-user__email">{user?.email}</div>
            </div>
            <button
              type="button"
              className="sidebar-logout"
              onClick={logout}
              title="Esci"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="app-main">
        <header className="app-topbar">
          <span className="app-topbar__title">{pageTitle}</span>
          <button
            type="button"
            className="topbar-profile-btn"
            onClick={() => navigate("/profilo")}
            title="Il mio profilo"
          >
            <div className="topbar-profile-btn__avatar">{initials}</div>
            <span className="topbar-profile-btn__name">
              {user?.firstName} {user?.lastName}
            </span>
          </button>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>

      {/* ── Bottom nav (mobile) ── */}
      <nav className="app-bottomnav">
        <div className="app-bottomnav__inner">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `bottomnav-link${isActive ? " active" : ""}`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
