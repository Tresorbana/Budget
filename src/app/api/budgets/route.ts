import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Budget } from "@/models/Budget";
import { User } from "@/models/User";

const ExpenseSchema = z.object({
  name: z.string(),
  amount: z.number().min(0),
  category: z.string(),
});

const BudgetSchema = z.object({
  name: z.string(),
  income: z.number().min(0),
  savingsPercentage: z.number().min(0).max(100),
  expenses: z.array(ExpenseSchema),
  unexpectedIncome: z.number().min(0).optional(),
  unexpectedExpenses: z.number().min(0).optional(),
  status: z.enum(["active", "completed"]).optional(),
});

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const payload = verifyToken(token);
    const budgets = await Budget.find({ user: payload.userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(budgets);
  } catch (error) {
    console.error("Budgets GET error", error);
    return NextResponse.json(
      { message: "Unable to fetch budgets" },
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
    const data = BudgetSchema.parse(body);

    // compute debt if net < 0
    const totalExpenses = (data.expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
    const unexpectedIncome = data.unexpectedIncome || 0;
    const unexpectedExpenses = data.unexpectedExpenses || 0;
    const savingsAmount = (data.income * (data.savingsPercentage || 0)) / 100;
    const net = data.income - savingsAmount - totalExpenses + unexpectedIncome - unexpectedExpenses;
    const debt = net < 0 ? Math.abs(net) : 0;

    const budget = await Budget.create({
      user: user._id,
      ...data,
      unexpectedIncome,
      unexpectedExpenses,
      debt,
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error("Budgets POST error", error);
    return NextResponse.json(
      { message: "Unable to create budget" },
      { status: 500 },
    );
  }
}

