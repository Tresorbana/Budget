'use client';

import { startTransition, useEffect, useRef, useState } from "react";
import { Calendar, Camera, Edit2, Mail, MapPin, Phone, Shield, User } from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { useCurrency } from "@/hooks/useCurrency";
import { apiFetch } from "@/lib/api-client";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface ProfileStats {
  activeBudgets: number;
  totalSaved: number;
  expensesTracked: number;
  daysActive: number;
}

export function ProfilePage() {
  const { user, token, refreshUser } = useAuth();
  const { formatCurrency } = useCurrency();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!token) return;
    startTransition(() => setLoading(true));
    apiFetch<{ stats: ProfileStats }>("/api/overview", {}, token)
      .then((data) => startTransition(() => setStats(data.stats)))
      .finally(() => startTransition(() => setLoading(false)));
  }, [token]);

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!event.target.files?.[0] || !token) return;

    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadError(null);
      startTransition(() => setUploading(true));
      await apiFetch<{ avatarUrl: string }>(
        "/api/profile/avatar",
        {
          method: "POST",
          body: formData,
        },
        token,
      );
      await refreshUser();
    } catch (error) {
      if (error instanceof Error) {
        setUploadError(error.message);
      } else {
        setUploadError("Failed to upload profile picture.");
      }
    } finally {
      startTransition(() => setUploading(false));
      event.target.value = "";
    }
  };

  const memberSince = new Date(user.memberSince).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6 p-4 pb-24 text-white md:p-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-[#9fbca0]">Manage your personal information</p>
      </div>

      <Card className="border-[#2c3f2d] bg-[#131d14] p-6 text-white">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="relative">
            <div className="flex size-28 items-center justify-center rounded-full bg-[#2f7f33]/15 md:size-36 overflow-hidden">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={`${user.name}'s avatar`}
                  className="size-full object-cover"
                />
              ) : (
                <User className="size-12 text-[#2f7f33]" />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <Button
              size="icon"
              variant="outline"
              className="absolute -bottom-2 -right-2 rounded-full border-[#2c3f2d] bg-[#0f160f]"
              onClick={handleAvatarClick}
              disabled={uploading}
            >
              <Camera className="size-4" />
            </Button>
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <div className="flex flex-col items-center gap-2 md:flex-row">
              <h2 className="text-2xl font-semibold">{user.name}</h2>
              <Badge variant="secondary" className="bg-[#2f7f33]/15 text-[#0bda3c]">
                Premium Member
              </Badge>
            </div>
            <p className="text-[#9fbca0]">Member since {memberSince}</p>
            <div className="flex flex-wrap justify-center gap-3 md:justify-start">
              <Button className="gap-2">
                <Edit2 className="size-4" />
                Edit Profile
              </Button>
              <Button variant="outline" className="gap-2 text-white/80">
                <Shield className="size-4" />
                Security
              </Button>
            </div>
          </div>
        </div>
        {uploading && (
          <p className="mt-2 text-xs text-[#9fbca0]">
            Uploading profile picture...
          </p>
        )}
        {uploadError && (
          <p className="mt-1 text-xs text-red-400">{uploadError}</p>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Active Budgets", value: stats?.activeBudgets ?? 0 },
          { label: "Total Saved", value: formatCurrency(stats?.totalSaved ?? 0) },
          { label: "Expenses Tracked", value: stats?.expensesTracked ?? 0 },
          { label: "Days Active", value: stats?.daysActive ?? 0 },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="border-[#2c3f2d] bg-[#131d14] p-4 text-center"
          >
            <p className="text-sm text-[#9fbca0]">{stat.label}</p>
            <p className="text-2xl font-semibold text-white">{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card className="border-[#2c3f2d] bg-[#131d14] p-6 text-white">
        <h3 className="text-xl font-semibold mb-6">Personal Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[#9fbca0] flex items-center gap-2 text-xs uppercase tracking-[0.35em]">
              <User className="size-4" />
              Full Name
            </p>
            <p className="mt-1 text-lg font-medium">{user.name}</p>
          </div>
          <div>
            <p className="text-[#9fbca0] flex items-center gap-2 text-xs uppercase tracking-[0.35em]">
              <Mail className="size-4" />
              Email
            </p>
            <p className="mt-1 text-lg font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-[#9fbca0] flex items-center gap-2 text-xs uppercase tracking-[0.35em]">
              <Phone className="size-4" />
              Phone
            </p>
            <p className="mt-1 text-lg font-medium">{user.phone}</p>
          </div>
          <div>
            <p className="text-[#9fbca0] flex items-center gap-2 text-xs uppercase tracking-[0.35em]">
              <MapPin className="size-4" />
              Location
            </p>
            <p className="mt-1 text-lg font-medium">{user.location}</p>
          </div>
          <div>
            <p className="text-[#9fbca0] flex items-center gap-2 text-xs uppercase tracking-[0.35em]">
              <Calendar className="size-4" />
              Member Since
            </p>
            <p className="mt-1 text-lg font-medium">{memberSince}</p>
          </div>
        </div>
      </Card>

      {loading && (
        <p className="text-center text-sm text-[#9fbca0]">
          Syncing profile insights...
        </p>
      )}
    </div>
  );
}
