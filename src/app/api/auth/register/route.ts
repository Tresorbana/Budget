import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { hashPassword, createToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  location: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, email, password, phone, location } =
      RegisterSchema.parse(body);

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { message: "Account already exists" },
        { status: 400 },
      );
    }

    const hashed = hashPassword(password);
    const user = await User.create({
      name,
      email,
      password: hashed,
      phone: phone ?? "+250 788 123 456",
      location: location ?? "",
      memberSince: new Date(),
    });

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
    console.error("Register error", error);
    return NextResponse.json(
      { message: "Unable to register" },
      { status: 500 },
    );
  }
}

