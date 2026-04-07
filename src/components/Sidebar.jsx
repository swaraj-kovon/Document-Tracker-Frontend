import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, FileText, PlusCircle, ShieldCheck, LogOut, Files, Settings } from "lucide-react";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/documents", icon: Files, label: "My Documents" },
    { to: "/documents/new", icon: PlusCircle, label: "New Document" },
  ];

  if (user?.role === "admin") {
    navItems.push({ to: "/admin", icon: ShieldCheck, label: "Admin Panel" });
  }
  navItems.push({ to: "/settings", icon: Settings, label: "Settings" });

  const isActive = (path) =>
    path === "/documents/new"
      ? location.pathname === path
      : path === "/documents"
      ? location.pathname === path
      : location.pathname === path || (path !== "/dashboard" && location.pathname.startsWith(path));

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-[#1B2A4A] flex flex-col z-20 shadow-xl">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10 flex-shrink-0">
        <img
          src="https://customer-assets.emergentagent.com/job_kovon-secure-docs/artifacts/v93clta3_Kovon%20Logo-01.png"
          alt="Kovon"
          className="h-10 w-auto brightness-0 invert object-contain"
          data-testid="sidebar-logo"
        />
        <p className="text-white/40 text-xs mt-2 font-medium uppercase tracking-widest">Document Registry</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive(to)
                ? "bg-white/15 text-white border-l-[3px] border-blue-400 pl-3.5"
                : "text-white/65 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon size={17} strokeWidth={isActive(to) ? 2 : 1.5} />
            {label}
          </Link>
        ))}
      </nav>

      {/* User Info + Logout */}
      <div className="p-4 border-t border-white/10 flex-shrink-0">
        <div className="px-3 py-2 mb-2">
          <p className="text-white text-sm font-semibold truncate">{user?.name || "User"}</p>
          <p className="text-white/45 text-xs truncate mt-0.5">{user?.email}</p>
          <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
            user?.role === "admin"
              ? "bg-blue-500/25 text-blue-300"
              : "bg-white/10 text-white/55"
          }`}>
            {user?.role === "admin" ? "Admin" : "User"}
          </span>
        </div>
        <button
          onClick={handleLogout}
          data-testid="logout-button"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-white/10 hover:text-white text-sm transition-all duration-200"
        >
          <LogOut size={16} strokeWidth={1.5} />
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
