import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { NotificationSettings } from "@/lib/types";

const PreferencesSchema = z.object({
  currency: z.enum(["rwf", "usd", "eur"]),
  theme: z.enum(["dark"]).default("dark"),
  language: z.enum(["en", "fr", "rw"]).optional(),
  notifications: z.object({
    pushNotifications: z.boolean(),
    emailNotifications: z.boolean(),
    budgetAlerts: z.boolean(),
    savingsReminders: z.boolean(),
    expenseAlerts: z.boolean(),
  }),
});

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const payload = verifyToken(token);
    const user = (await User.findById(payload.userId).lean()) as {
      currency?: string;
      theme?: string;
      language?: string;
      notifications?: NotificationSettings;
    } | null;
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({
      currency: user.currency || "rwf",
      theme: user.theme || "dark",
      language: user.language || "en",
      notifications: user.notifications || {},
    });
  } catch (error) {
    console.error("Preferences GET error", error);
    return NextResponse.json(
      { message: "Unable to fetch preferences" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const payload = verifyToken(token);

    const body = await req.json();
    const data = PreferencesSchema.parse(body);

    const user = (await User.findByIdAndUpdate(
      payload.userId,
      {
        $set: {
          currency: data.currency,
          theme: data.theme || "dark",
          language: data.language || "en",
          notifications: data.notifications,
        },
      },
      { new: true },
    ).lean()) as {
      currency?: string;
      theme?: string;
      language?: string;
      notifications?: NotificationSettings;
    } | null;

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      currency: user.currency || "rwf",
      theme: user.theme || "dark",
      language: user.language || "en",
      notifications: user.notifications || {},
    });
  } catch (error) {
    console.error("Preferences PUT error", error);
    return NextResponse.json(
      { message: "Unable to update preferences" },
      { status: 500 },
    );
  }
}

