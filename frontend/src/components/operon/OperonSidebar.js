"use client";

import React, { useEffect, useRef } from "react";
import OperonLogo from "../ui/OperonLogo";
import { useTheme } from "../../context/ThemeContext";
import {
  LayoutDashboard,
  Activity,
  ShieldAlert,
  Database,
  Wrench,
  Shield,
  Settings,
  LogOut,
  BookOpen,
  X,
  ChevronRight,
  UserCircle,
} from "lucide-react";

const NAV_ITEMS = [
  {
    section: "Operations",
    items: [
      { id: "dashboard", label: "Agents", icon: LayoutDashboard, color: "text-cyan-500 dark:text-cyan-400" },
      { id: "runs",      label: "Live Runs",  icon: Activity,        color: "text-emerald-500 dark:text-emerald-400" },
      { id: "approvals", label: "Approvals",  icon: ShieldAlert,     color: "text-amber-500 dark:text-amber-400", badge: true },
    ],
  },
  {
    section: "Data & Knowledge",
    items: [
      { id: "datasources",  label: "Data Sources",    icon: Database,  color: "text-blue-500 dark:text-blue-400" },
      { id: "knowledge",    label: "Knowledge Bases", icon: BookOpen,  color: "text-violet-500 dark:text-violet-400" },
      { id: "tools_mcp",   label: "Tools & MCP",     icon: Wrench,    color: "text-rose-500 dark:text-rose-400" },
    ],
  },
  {
    section: "Administration",
    items: [
      { id: "admin_console", label: "Admin Console",  icon: Shield,   color: "text-purple-500 dark:text-purple-400" },
      { id: "settings",      label: "Settings",       icon: Settings, color: "text-slate-500 dark:text-gray-400" },
    ],
  },
];

function NavItem({ item, isActive, onClick, pendingCount }) {
  const Icon = item.icon;
  return (
    <button
      onClick={() => onClick(item.id)}
      className={`
        w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-[15px] font-medium
        transition-all duration-150 group relative
        ${isActive
          ? "bg-cyan-50 dark:bg-slate-800/80 text-cyan-700 dark:text-gray-100 font-semibold shadow-xs"
          : "text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-gray-100 hover:bg-slate-100 dark:hover:bg-slate-800/50"
        }
      `}
    >
      <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-cyan-600 dark:text-cyan-400" : item.color}`} />
      <span className="flex-1 text-left">{item.label}</span>
      {item.badge && pendingCount > 0 && (
        <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">
          {pendingCount}
        </span>
      )}
      {isActive && <ChevronRight className="w-4 h-4 text-cyan-600 dark:text-gray-400 ml-auto" />}
    </button>
  );
}

export default function OperonSidebar({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  pendingApprovalsCount,
  user,
  activeWorkspace,
  onLogout,
  isMobile,
}) {
  const { theme } = useTheme();
  const sidebarRef = useRef(null);

  // Close on outside click (mobile overlay)
  useEffect(() => {
    if (!isMobile || !isOpen) return;
    const handler = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isMobile, isOpen, onClose]);

  // Lock body scroll on mobile when open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobile, isOpen]);

  const sidebarContent = (
    <aside
      ref={sidebarRef}
      className={`
        flex flex-col h-full w-64 shrink-0
        bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl
        border-r border-slate-200 dark:border-slate-800/60
        transition-colors duration-200
        ${isMobile
          ? `fixed top-0 right-0 h-full z-50 shadow-2xl
             ${isOpen ? "translate-x-0" : "translate-x-full"}`
          : "sticky top-0 h-screen"
        }
      `}
    >
      {/* Logo + Close (mobile) */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-200 dark:border-slate-800/60 shrink-0">
        <OperonLogo size={28} variant={theme === "dark" ? "light" : "dark"} />
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 tracking-wider">
            Enterprise
          </span>
          {isMobile && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        {NAV_ITEMS.map((section) => (
          <div key={section.section}>
            <p className="text-xs font-semibold uppercase text-slate-500 dark:text-gray-400 tracking-wider px-3 mb-2.5">
              {section.section}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={activeTab === item.id}
                  onClick={(id) => { onTabChange(id); isMobile && onClose(); }}
                  pendingCount={pendingApprovalsCount}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User info & Sign out at the bottom */}
      {user && (
        <div className="px-3 py-4 border-t border-slate-200 dark:border-slate-800/60 shrink-0 space-y-2.5">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shrink-0">
              <UserCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-gray-200 truncate">
                {user.full_name || user.email}
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-400 capitalize">
                {activeWorkspace?.role || "owner"}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl
                       bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400
                       hover:bg-red-500/20 hover:text-red-700 dark:hover:text-red-300
                       text-sm font-semibold transition"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );

  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300
            ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          onClick={onClose}
        />
        {sidebarContent}
      </>
    );
  }

  return sidebarContent;
}
