import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { comparePassword, createToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, password } = LoginSchema.parse(body);

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const isValid = comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const token = createToken(user);

    return NextResponse.json({
      token,
      user: {
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
      },
    });
  } catch (error) {
    console.error("Login error", error);
    return NextResponse.json(
      { message: "Unable to login" },
      { status: 500 },
    );
  }
}

