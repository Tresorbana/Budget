import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Budget } from "@/models/Budget";

const ExpenseSchema = z.object({
  name: z.string(),
  amount: z.number().min(0),
  category: z.string(),
});

const UpdateSchema = z.object({
  name: z.string().optional(),
  income: z.number().min(0).optional(),
  savingsPercentage: z.number().min(0).max(100).optional(),
  expenses: z.array(ExpenseSchema).optional(),
  unexpectedIncome: z.number().min(0).optional(),
  unexpectedExpenses: z.number().min(0).optional(),
  status: z.enum(["active", "completed"]).optional(),
});

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") || req.nextUrl.pathname.split("/").pop();
    if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });

    const budget = await Budget.findOne({ _id: id, user: payload.userId }).lean();
    if (!budget) return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json(budget);
  } catch (error) {
    console.error("Budget GET error", error);
    return NextResponse.json({ message: "Unable to fetch budget" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") || req.nextUrl.pathname.split("/").pop();
    if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });

    const body = await req.json();
    const data = UpdateSchema.parse(body);

    const existing = await Budget.findOne({ _id: id, user: payload.userId });
    if (!existing) return NextResponse.json({ message: "Not found" }, { status: 404 });

    // Merge updates
    if (data.name !== undefined) existing.name = data.name;
    if (data.income !== undefined) existing.income = data.income;
    if (data.savingsPercentage !== undefined) existing.savingsPercentage = data.savingsPercentage;
    if (data.expenses !== undefined) existing.expenses = data.expenses;
    if (data.unexpectedIncome !== undefined) existing.unexpectedIncome = data.unexpectedIncome;
    if (data.unexpectedExpenses !== undefined) existing.unexpectedExpenses = data.unexpectedExpenses;
    if (data.status !== undefined) existing.status = data.status;

    // Recompute debt
    const totalExpenses = (existing.expenses || []).reduce((s: number, e: any) => s + (e.amount || 0), 0);
    const unexpectedIncome = existing.unexpectedIncome || 0;
    const unexpectedExpenses = existing.unexpectedExpenses || 0;
    const savingsAmount = (existing.income * (existing.savingsPercentage || 0)) / 100;
    const net = existing.income - savingsAmount - totalExpenses + unexpectedIncome - unexpectedExpenses;
    existing.debt = net < 0 ? Math.abs(net) : 0;

    await existing.save();

    return NextResponse.json(existing);
  } catch (error) {
    console.error("Budget PUT error", error);
    return NextResponse.json({ message: "Unable to update budget" }, { status: 500 });
  }
}
