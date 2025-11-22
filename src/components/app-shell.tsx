'use client';

import { startTransition, useEffect, useState } from "react";

import { useAuth } from "@/context/auth-context";

import { AIPage } from "./ai-page";
import { AuthPage } from "./auth-page";
import { BudgetPage } from "./budget-page";
import { DesktopSidebar } from "./desktop-sidebar";
import { ExpensesPage } from "./expenses-page";
import { HistoryPage } from "./history-page";
import { HomePage } from "./home-page";
import { MobileNav } from "./mobile-nav";
import { Onboarding } from "./onboarding";
import { ProfilePage } from "./profile-page";
import { SettingsPage } from "./settings-page";

type AppState = "onboarding" | "auth" | "app";
type Page =
  | "home"
  | "budget"
  | "expenses"
  | "ai"
  | "profile"
  | "settings"
  | "history"
  | "login";

export default function AppShell() {
  const { user, loading, logout } = useAuth();
  const [appState, setAppState] = useState<AppState>("onboarding");
  const [currentPage, setCurrentPage] = useState<Page>("home");

  useEffect(() => {
    const hasSeen = localStorage.getItem("hasSeenOnboarding");
    if (hasSeen === "true") {
      startTransition(() => setAppState(user ? "app" : "auth"));
    }
  }, [user]);

  const handleOnboardingComplete = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setAppState(user ? "app" : "auth");
  };

  const handleNavigate = (page: string) => {
    if (page === "login") {
      logout();
      setAppState("auth");
    } else {
      setCurrentPage(page as Page);
    }
  };

  // Render Onboarding
  if (appState === "onboarding") {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (appState === "auth") {
    return <AuthPage onSuccess={() => setAppState("app")} />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p>Loading your space...</p>
      </div>
    );
  }

  const pageRenderer: Record<Page, React.ReactElement | null> = {
    home: <HomePage onNavigate={handleNavigate} />,
    budget: <BudgetPage onNavigate={handleNavigate} />,
    expenses: <ExpensesPage />,
    ai: <AIPage />,
    profile: <ProfilePage />,
    settings: <SettingsPage onNavigate={handleNavigate} />,
    history: <HistoryPage />,
    login: null,
  };

  // Render Main App with stitched visual language
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c120d] via-[#101b12] to-[#0c120d] text-foreground">
      <div className="relative flex min-h-screen w-full flex-col lg:flex-row">
        {/* Desktop Sidebar */}
        <DesktopSidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[rgba(21,30,21,0.85)] px-3 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8 backdrop-blur">
          <div className="mx-auto w-full max-w-6xl">
            {pageRenderer[currentPage]}
          </div>
        </main>

        {/* Mobile Navigation */}
        <MobileNav currentPage={currentPage} onNavigate={handleNavigate} />
      </div>
    </div>
  );
}
