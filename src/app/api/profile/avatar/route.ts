import { NextRequest, NextResponse } from "next/server";

import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<{
      secure_url: string;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "tresor-budget/avatars",
          resource_type: "image",
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error("Upload failed"));
          }
          resolve({ secure_url: result.secure_url });
        },
      );

      stream.end(buffer);
    });

    const user = await User.findByIdAndUpdate(
      payload.userId,
      { avatarUrl: uploadResult.secure_url },
      { new: true },
    );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ avatarUrl: user.avatarUrl });
  } catch (error) {
    console.error("Avatar upload error", error);
    return NextResponse.json(
      { message: "Failed to upload profile picture" },
      { status: 500 },
    );
  }
}
