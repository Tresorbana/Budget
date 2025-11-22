'use client';

import { useState } from "react";
import {
  Bot,
  History,
  Home,
  Menu,
  Settings,
  TrendingUp,
  User,
  Wallet,
  X,
} from "lucide-react";

import { useAuth } from "@/context/auth-context";

import { cn } from "./ui/utils";

interface MobileNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function MobileNav({ currentPage, onNavigate }: MobileNavProps) {
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = [
    { id: "home", icon: Home, label: "Home" },
    { id: "budget", icon: Wallet, label: "Budgets" },
    { id: "expenses", icon: TrendingUp, label: "Expenses" },
    { id: "ai", icon: Bot, label: "AI" },
  ];

  const menuItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "history", label: "History", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleNavigate = (page: string) => {
    setMenuOpen(false);
    onNavigate(page);
  };

  return (
    <>
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden">
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-[#131d14] p-6 text-white shadow-[0_-20px_60px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#9fbca0]">
                  Quick Menu
                </p>
                <h3 className="text-xl font-semibold">Workspace</h3>
              </div>
              <button
                className="rounded-full border border-white/10 p-2"
                onClick={() => setMenuOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-[#101910] px-4 py-3 text-left text-sm"
                  >
                    <span className="rounded-xl bg-[#2f7f33]/10 p-2 text-[#0bda3c]">
                      <Icon className="size-4" />
                    </span>
                    {item.label}
                  </button>
                );
              })}
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                  onNavigate("login");
                }}
                className="w-full rounded-2xl border border-red-500/30 px-4 py-3 text-left text-sm text-red-400"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <nav
        className={cn(
          "fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 transition-all md:hidden",
          menuOpen && "opacity-0 pointer-events-none",
        )}
      >
        <div className="flex w-full max-w-md items-center justify-between rounded-full border border-white/10 bg-[rgba(18,26,18,0.9)] px-2 py-2 shadow-[0_25px_45px_rgba(5,8,5,0.6)] backdrop-blur">
          {tabs.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-semibold transition-all",
                  isActive
                    ? "bg-[#2f7f33]/20 text-[#0bda3c]"
                    : "text-white/60 hover:text-white",
                )}
              >
                <Icon className={cn("size-5", isActive ? "text-[#0bda3c]" : "text-white/70")} />
                {item.label}
              </button>
            );
          })}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-semibold text-white/80"
          >
            <span className="rounded-full bg-white/10 p-2">
              <Menu className="size-5" />
            </span>
            Menu
          </button>
        </div>
      </nav>
    </>
  );
}
