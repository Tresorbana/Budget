import {
  Bot,
  History,
  Home,
  LogOut,
  Settings,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";

import { Button } from "./ui/button";
import { cn } from "./ui/utils";

interface DesktopSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const AVATAR_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDjhhvYk77kuNyLfnfhnzuX97tjpXZ60WCGIxvQgmetgw_D2Aj7lXn2JAXkF1_lsdjcxZrWaBR8lfMlsPYHxeVZNjmxfNkZVuL81hlKG0uiO96671ZRUg8fOToFHhk4vIVg85SeO1KiP8mwobswqxM0Mnwswe-mBVjj1oYmfOzdieqOU_5TaZx4MJQ_AlHMhJqMxlXcU5yg4ZzzQaIDKhFMEmWQe1mUTdUNNF7QTxv7dxqm-YoetAZzR-GXnbYiJg0jH1qeCI-Uk4E";

export function DesktopSidebar({
  currentPage,
  onNavigate,
}: DesktopSidebarProps) {
  const mainNavItems = [
    { id: "home", icon: Home, label: "Dashboard" },
    { id: "budget", icon: Wallet, label: "Budget" },
    { id: "expenses", icon: TrendingUp, label: "Expenses" },
    { id: "ai", icon: Bot, label: "AI Assistant" },
    { id: "history", icon: History, label: "History" },
  ];

  const secondaryNavItems = [
    { id: "ai", icon: Bot, label: "AI Copilot" },
    { id: "history", icon: History, label: "Archive" },
    { id: "profile", icon: User, label: "Profile" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="sticky top-0 hidden min-h-screen w-full max-w-xs flex-shrink-0 bg-transparent lg:flex">
      <div className="mx-4 my-6 flex w-full flex-col rounded-3xl bg-[#151e15] p-5 text-white shadow-[0px_18px_60px_rgba(10,12,10,0.9)] ring-1 ring-[#2c3f2d]">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#1d281d] p-4">
          <div className="flex items-center gap-3">
            <div
              className="size-12 rounded-full border border-[#2f7f33]/40 bg-cover bg-center"
              style={{ backgroundImage: `url(${AVATAR_URL})` }}
              aria-label="Tresor Budget avatar"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#2f7f33]">
                Tresor Budget
              </p>
              <h2 className="text-lg font-semibold leading-tight">
                Tresor Budget
              </h2>
              <p className="text-sm text-[#9fbca0]">finance@tresor.dev</p>
            </div>
          </div>
          <button
            className="hidden size-10 items-center justify-center rounded-full bg-[#2c3f2d] text-white/80 transition-colors hover:bg-[#3b5740] xl:flex"
            onClick={() => onNavigate("settings")}
            aria-label="Open settings"
          >
            <Settings className="size-5" />
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <p className="px-3 text-xs uppercase tracking-[0.35em] text-[#4f6551]">
            Overview
          </p>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "group flex items-center gap-3 rounded-full px-4 py-2 text-sm font-semibold transition-all",
                  isActive
                    ? "bg-[#2c3f2d] text-white shadow-[0_0_0_1px_rgba(47,127,51,0.4)]"
                    : "text-white/70 hover:bg-[#2c3f2d]/70 hover:text-white",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all",
                    isActive ? "border-[#2f7f33]" : "",
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <p className="px-3 text-xs uppercase tracking-[0.35em] text-[#4f6551]">
            Workspace
          </p>
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "group flex items-center gap-3 rounded-full px-4 py-2 text-sm font-semibold transition-all",
                  isActive
                    ? "bg-[#223025] text-white shadow-[0_0_0_1px_rgba(47,127,51,0.25)]"
                    : "text-white/65 hover:bg-[#202b21] hover:text-white",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border border-white/5 bg-white/5 transition-all",
                    isActive ? "border-[#2f7f33]" : "",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 space-y-3 rounded-2xl bg-gradient-to-br from-[#203221] to-[#162317] p-5">
          <p className="text-xs uppercase tracking-[0.35em] text-[#5b7c5d]">
            Quick Action
          </p>
          <Button
            className="h-12 w-full rounded-full bg-[#2f7f33] text-sm font-bold tracking-[0.08em] text-white shadow-[0_10px_40px_rgba(15,65,18,0.8)] transition-colors hover:bg-[#2f7f33]/90"
            onClick={() => onNavigate("expenses")}
          >
            Add New Entry
          </Button>
          <Button
            variant="ghost"
            className="h-11 w-full justify-between rounded-2xl border border-white/5 bg-transparent px-4 text-sm text-white/70 hover:bg-white/5"
            onClick={() => onNavigate("budget")}
          >
            Plan Upcoming Budget
            <TrendingUp className="size-4 text-[#0bda3c]" />
          </Button>
          <button
            className="flex w-full items-center gap-3 rounded-2xl bg-[#1a251a] px-4 py-3 text-left text-sm text-white/80 ring-1 ring-inset ring-white/5"
            onClick={() => onNavigate("ai")}
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-[#0bda3c]/20 text-[#0bda3c]">
              <Bot className="size-5" />
            </span>
            Tap Tresor AI for advice
          </button>
        </div>

        <Button
          variant="ghost"
          className="mt-6 justify-start gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-400/10"
          onClick={() => onNavigate("login")}
        >
          <LogOut className="size-5" />
          Log out
        </Button>
      </div>
    </aside>
  );
}
