"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface SidebarUser {
  username: string;
  role: { name: string; displayName: string };
}

interface MenuItem {
  href: string;
  title: string;
  icon: ReactNode;
  allowedRoles: string[];
  section: "workspace" | "setup";
  badge?: string;
  badgeVariant?: "default" | "new";
}

const I = {
  orders: (
    <svg viewBox="0 0 24 24">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  chef: (
    <svg viewBox="0 0 24 24">
      <path d="M6 14h12v6a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z" />
      <path d="M6 14a4 4 0 1 1 1.5-7.7A4 4 0 0 1 12 4a4 4 0 0 1 4.5 2.3A4 4 0 1 1 18 14" />
    </svg>
  ),
  delivery: (
    <svg viewBox="0 0 24 24">
      <rect x="1" y="7" width="13" height="10" />
      <polygon points="14 10 19 10 22 13 22 17 14 17 14 10" />
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="19" r="2" />
    </svg>
  ),
  sales: (
    <svg viewBox="0 0 24 24">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  ),
  setup: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  shop: (
    <svg viewBox="0 0 24 24">
      <path d="M3 9l2-5h14l2 5" />
      <path d="M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9" />
      <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
      <line x1="10" y1="21" x2="10" y2="14" />
      <line x1="14" y1="21" x2="14" y2="14" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24">
      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

const MENU_ITEMS: MenuItem[] = [
  { href: "/admin/orders", title: "លក់", icon: I.orders, allowedRoles: ["admin", "order"], section: "workspace" },
  { href: "/admin/chef", title: "ចម្អិន", icon: I.chef, allowedRoles: ["admin", "chef"], section: "workspace" },
  { href: "/admin/delivery", title: "ដឹក", icon: I.delivery, allowedRoles: ["admin", "waiter", "order"], section: "workspace" },
  { href: "/admin/sales", title: "ការលក់", icon: I.sales, allowedRoles: ["admin"], section: "workspace" },
  { href: "/admin/setup", title: "ការកំណត់", icon: I.setup, allowedRoles: ["admin"], section: "setup" },
  { href: "/admin/users", title: "អ្នកប្រើប្រាស់", icon: I.users, allowedRoles: ["admin"], section: "setup" },
  { href: "/admin/shop-info", title: "ហាង", icon: I.shop, allowedRoles: ["admin"], section: "setup" },
];

interface SidebarProps {
  user: SidebarUser | null;
  onLogout: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Sidebar({
  user,
  onLogout,
  mobileMenuOpen,
  setMobileMenuOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const userRole = user?.role.name;

  const visibleItems = MENU_ITEMS.filter((item) =>
    item.allowedRoles.includes(userRole || "")
  );
  const workspaceItems = visibleItems.filter((i) => i.section === "workspace");
  const setupItems = visibleItems.filter((i) => i.section === "setup");

  useEffect(() => {
    const current = MENU_ITEMS.find(
      (item) => item.href !== "/admin" && pathname.startsWith(item.href)
    );
    document.title = current ? `${current.title} | Menu System` : "Menu System";
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/admin" && pathname === "/admin") return true;
    if (href !== "/admin" && pathname.startsWith(href)) return true;
    return false;
  };

  const renderNavItem = (item: MenuItem) => (
    <Link
      key={item.href}
      href={item.href}
      onClick={() => setMobileMenuOpen(false)}
      className={`nav-item ${isActive(item.href) ? "nav-item-active" : ""}`}
    >
      <span className="nav-icon">{item.icon}</span>
      <span className="flex-1 truncate">{item.title}</span>
      {item.badge && (
        <span className={`nav-badge ${item.badgeVariant === "new" ? "nav-badge-new" : ""}`}>
          {item.badge}
        </span>
      )}
    </Link>
  );

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-2.5 px-3 pt-2 pb-5">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-sm font-bold text-white">M</span>
        </div>
        <div className="min-w-0">
          <div className="font-bold text-slate-900 text-sm leading-tight">Menu System</div>
          <div className="text-[11px] text-slate-500">Admin Panel</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto flex flex-col gap-1">
        {workspaceItems.length > 0 && (
          <>
            <div className="side-sec">Workspace</div>
            {workspaceItems.map(renderNavItem)}
          </>
        )}
        {setupItems.length > 0 && (
          <>
            <div className="side-sec">Setup</div>
            {setupItems.map(renderNavItem)}
          </>
        )}
      </nav>

      {user && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">{user.username}</div>
              <div className="text-[11px] text-slate-500 truncate">{user.role.displayName}</div>
            </div>
            <button
              onClick={onLogout}
              title="ចេញ"
              className="w-8 h-8 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors"
            >
              <span className="nav-icon">{I.logout}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <style jsx global>{`
        .side-sec {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #adb5bd;
          padding: 14px 12px 4px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 9px 12px;
          border-radius: 8px;
          font-size: 14px;
          color: #495057;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.12s, color 0.12s;
        }
        .nav-item:hover {
          background: #f4f6fb;
          color: #212529;
        }
        .nav-item-active {
          background: hsl(var(--primary) / 0.1);
          color: hsl(var(--primary));
          font-weight: 600;
        }
        .nav-item-active:hover {
          background: hsl(var(--primary) / 0.12);
          color: hsl(var(--primary));
        }
        .nav-icon {
          display: inline-flex;
          flex-shrink: 0;
        }
        .nav-icon svg {
          width: 18px;
          height: 18px;
          stroke: currentColor;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          fill: none;
        }
        .nav-badge {
          margin-left: auto;
          background: #ff6700;
          color: #fff;
          font-size: 10px;
          padding: 2px 7px;
          border-radius: 999px;
          font-weight: 700;
        }
        .nav-badge.nav-badge-new {
          background: hsl(var(--primary));
          letter-spacing: 0.05em;
        }
      `}</style>

      <aside className="hidden lg:flex w-60 bg-white flex-col flex-shrink-0 border-r border-slate-200 px-3 py-4">
        <SidebarContent />
      </aside>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white flex flex-col z-40 px-3 py-4 shadow-xl transform transition-transform duration-300 lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute top-3 right-3 z-50">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <span className="nav-icon">{I.close}</span>
          </button>
        </div>
        <SidebarContent />
      </aside>
    </>
  );
}
