import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Expense } from "@/models/Expense";
import { User } from "@/models/User";

const ExpenseSchema = z.object({
  name: z.string(),
  amount: z.number().min(0),
  category: z.string(),
  occurredAt: z.string().datetime().optional(),
});

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const payload = verifyToken(token);

    const expenses = await Expense.find({ user: payload.userId })
      .sort({ occurredAt: -1 })
      .lean();

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Expenses GET error", error);
    return NextResponse.json(
      { message: "Unable to fetch expenses" },
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
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = ExpenseSchema.parse(body);

    const expense = await Expense.create({
      user: user._id,
      ...data,
      occurredAt: data.occurredAt ? new Date(data.occurredAt) : new Date(),
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("Expenses POST error", error);
    return NextResponse.json(
      { message: "Unable to add expense" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
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

    const expense = await Expense.findOneAndDelete({
      _id: id,
      user: payload.userId,
    });

    if (!expense) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Expenses DELETE error", error);
    return NextResponse.json(
      { message: "Unable to delete expense" },
      { status: 500 },
    );
  }
}

