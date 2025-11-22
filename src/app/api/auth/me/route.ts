import { NextRequest, NextResponse } from "next/server";

import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload.userId);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      location: user.location,
      avatarUrl: user.avatarUrl,
      memberSince: user.memberSince,
      currency: user.currency,
      theme: user.theme,
      language: user.language,
      notifications: user.notifications,
    });
  } catch (error) {
    console.error("Me endpoint error", error);
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 },
    );
  }
}

