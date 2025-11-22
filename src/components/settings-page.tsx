'use client';

import { useEffect, useState } from "react";
import {
  Bell,
  Globe,
  DollarSign,
  Smartphone,
  Mail,
  Shield,
  HelpCircle,
  FileText,
  LogOut,
} from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { useTranslation } from "@/i18n/useTranslation";

import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";

interface SettingsPageProps {
  onNavigate: (page: string) => void;
}

export function SettingsPage({ onNavigate }: SettingsPageProps) {
  const { preferences, updatePreferences, logout } = useAuth();
  const { t } = useTranslation();
  const [settings, setSettings] = useState<{
    pushNotifications: boolean;
    emailNotifications: boolean;
    budgetAlerts: boolean;
    savingsReminders: boolean;
    expenseAlerts: boolean;
    currency: "rwf" | "usd" | "eur";
    language: "en" | "fr" | "rw";
  }>({
    pushNotifications: true,
    emailNotifications: true,
    budgetAlerts: true,
    savingsReminders: true,
    expenseAlerts: true,
    currency: "rwf",
    language: "en",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (preferences) {
      setSettings((prev) => ({
        ...prev,
        ...preferences.notifications,
        currency: preferences.currency,
        language: preferences.language || "en",
      }));
    }
  }, [preferences]);

  const persist = async (next: typeof settings) => {
    if (!preferences) return;
    setSaving(true);
    try {
      await updatePreferences({
        currency: next.currency,
        theme: "dark",
        language: next.language,
        notifications: {
          pushNotifications: next.pushNotifications,
          emailNotifications: next.emailNotifications,
          budgetAlerts: next.budgetAlerts,
          savingsReminders: next.savingsReminders,
          expenseAlerts: next.expenseAlerts,
        },
      });
    } catch (err) {
      console.error("Failed to save preferences:", err);
    } finally {
      setSaving(false);
    }
  };

  const toggleSetting = async (key: keyof typeof settings) => {
    const nextState = { ...settings, [key]: !settings[key] };
    setSettings(nextState);
    await persist(nextState);
  };

  const settingsSections = [
    {
      title: "Notifications",
      icon: Bell,
      items: [
        {
          key: "pushNotifications" as const,
          label: "Push Notifications",
          description: "Receive notifications on your device",
          icon: Smartphone,
        },
        {
          key: "emailNotifications" as const,
          label: "Email Notifications",
          description: "Receive updates via email",
          icon: Mail,
        },
        {
          key: "budgetAlerts" as const,
          label: "Budget Alerts",
          description: "Get notified when approaching budget limits",
          icon: Bell,
        },
        {
          key: "savingsReminders" as const,
          label: "Savings Reminders",
          description: "Monthly reminders to review savings goals",
          icon: Bell,
        },
        {
          key: "expenseAlerts" as const,
          label: "Expense Alerts",
          description: "Alerts for unusual spending patterns",
          icon: Bell,
        },
      ],
    },
  ];

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 text-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t('settings')}</h1>
        <p className="text-[#9fbca0]">Manage your preferences and account settings</p>
      </div>

      <div className="space-y-6">
        {settingsSections.map((section) => {
          const SectionIcon = section.icon;
          return (
            <Card key={section.title} className="border-[#2c3f2d] bg-[#131d14] p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#2f7f33]/15 flex items-center justify-center">
                  <SectionIcon className="w-5 h-5 text-[#2f7f33]" />
                </div>
                <h3 className="text-xl font-semibold">{section.title}</h3>
              </div>

              <div className="space-y-4">
                {section.items.map((item, index) => {
                  const ItemIcon = item.icon;
                  return (
                    <div key={item.key}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <ItemIcon className="w-5 h-5 text-[#9fbca0] mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <Label htmlFor={item.key} className="cursor-pointer text-white">
                              {item.label}
                            </Label>
                            <p className="text-[#9fbca0] mt-1 text-sm">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          id={item.key}
                          checked={settings[item.key]}
                          onCheckedChange={() => toggleSetting(item.key)}
                          disabled={saving}
                        />
                      </div>
                      {index < section.items.length - 1 && (
                        <Separator className="mt-4 bg-[#2c3f2d]" />
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}

        <Card className="border-[#2c3f2d] bg-[#131d14] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#2f7f33]/15 flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#2f7f33]" />
            </div>
            <h3 className="text-xl font-semibold">Preferences</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-[#9fbca0] mt-3 flex-shrink-0" />
              <div className="flex-1">
                <Label htmlFor="currency" className="mb-2 block text-white">
                  Currency
                </Label>
                <select
                  id="currency"
                  className="w-full px-3 py-2 rounded-lg border border-[#2c3f2d] bg-[#0f160f] text-white focus:outline-none focus:ring-2 focus:ring-[#2f7f33]"
                  value={settings.currency}
                  onChange={async (e) => {
                    const next = { ...settings, currency: e.target.value as typeof settings.currency };
                    setSettings(next);
                    await persist(next);
                  }}
                  disabled={saving}
                >
                  <option value="rwf" className="bg-[#0f160f]">Rwandan Franc (RWF)</option>
                  <option value="usd" className="bg-[#0f160f]">US Dollar (USD)</option>
                  <option value="eur" className="bg-[#0f160f]">Euro (EUR)</option>
                </select>
              </div>
            </div>

            <Separator className="bg-[#2c3f2d]" />

            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-[#9fbca0] mt-3 flex-shrink-0" />
              <div className="flex-1">
                <Label htmlFor="language" className="mb-2 block text-white">
                  Language
                </Label>
                <select
                  id="language"
                  className="w-full px-3 py-2 rounded-lg border border-[#2c3f2d] bg-[#0f160f] text-white focus:outline-none focus:ring-2 focus:ring-[#2f7f33]"
                  value={settings.language}
                  onChange={async (e) => {
                    const next = { ...settings, language: e.target.value as typeof settings.language };
                    setSettings(next);
                    await persist(next);
                  }}
                  disabled={saving}
                >
                  <option value="en" className="bg-[#0f160f]">English</option>
                  <option value="fr" className="bg-[#0f160f]">Français</option>
                  <option value="rw" className="bg-[#0f160f]">Kinyarwanda</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-[#2c3f2d] bg-[#131d14] p-6">
          <h3 className="text-xl font-semibold mb-6">Support & About</h3>

          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start border-[#2c3f2d] bg-transparent text-white hover:bg-[#1d281d]">
              <HelpCircle className="w-5 h-5 mr-3" />
              Help Center
            </Button>
            <Button variant="outline" className="w-full justify-start border-[#2c3f2d] bg-transparent text-white hover:bg-[#1d281d]">
              <FileText className="w-5 h-5 mr-3" />
              Terms & Privacy Policy
            </Button>
            <Button variant="outline" className="w-full justify-start border-[#2c3f2d] bg-transparent text-white hover:bg-[#1d281d]">
              <Shield className="w-5 h-5 mr-3" />
              About Tresor Budget
            </Button>
          </div>

          <Separator className="my-6 bg-[#2c3f2d]" />

          <div className="text-center text-[#9fbca0]">
            <p>Version 1.0.0</p>
            <p className="mt-1">© 2024 Tresor Budget</p>
          </div>
        </Card>

        <Button
          variant="outline"
          className="w-full text-red-400 border-red-400/30 hover:bg-red-400/10"
          onClick={() => {
            logout();
            onNavigate("login");
          }}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
