import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { NotificationModel } from "@/models/Notification";

const NotificationSchema = z.object({
  title: z.string(),
  message: z.string(),
  type: z.enum(["info", "warning", "success"]).optional().default("info"),
});

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const payload = verifyToken(token);

    const notifications = await NotificationModel.find({ user: payload.userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Notifications GET error", error);
    return NextResponse.json(
      { message: "Unable to fetch notifications" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const payload = verifyToken(token);

    const body = await req.json();
    const data = NotificationSchema.parse(body);

    const notification = await NotificationModel.create({
      user: payload.userId,
      ...data,
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Notifications POST error", error);
    return NextResponse.json(
      { message: "Unable to create notification" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const payload = verifyToken(token);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ message: "Missing id" }, { status: 400 });
    }

    await NotificationModel.updateOne(
      { _id: id, user: payload.userId },
      { $set: { read: true } },
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notifications PATCH error", error);
    return NextResponse.json(
      { message: "Unable to update notification" },
      { status: 500 },
    );
  }
}

