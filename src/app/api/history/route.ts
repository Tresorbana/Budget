import { NextRequest, NextResponse } from "next/server";

import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Budget } from "@/models/Budget";
import { Expense } from "@/models/Expense";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const payload = verifyToken(token);

    const [budgets, expenses] = await Promise.all([
      Budget.find({ user: payload.userId }).sort({ createdAt: -1 }).lean(),
      Expense.find({ user: payload.userId }).sort({ occurredAt: -1 }).lean(),
    ]);

    const budgetsTyped = budgets as any[];
    const expensesTyped = expenses as any[];

    const history = [
      ...budgetsTyped.map((budget) => ({
        id: String(budget._id),
        type: "budget" as const,
        name: budget.name,
        amount: budget.income,
        savings: (budget.income * budget.savingsPercentage) / 100,
        expenses: budget.expenses.reduce((sum: number, e: any) => sum + e.amount, 0),
        date: budget.createdAt,
        month: new Date(budget.createdAt).toLocaleString("default", {
          month: "long",
        }),
        status: budget.status,
      })),
      ...expensesTyped.map((expense) => ({
        id: String(expense._id),
        type: "expense" as const,
        name: expense.name,
        amount: expense.amount,
        category: expense.category,
        date: expense.occurredAt,
        month: new Date(expense.occurredAt).toLocaleString("default", {
          month: "long",
        }),
      })),
    ].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    return NextResponse.json({
      history,
      totals: {
        budgets: budgetsTyped.length,
        expenses: expensesTyped.length,
        totalAmount: expensesTyped.reduce((sum: number, e: any) => sum + e.amount, 0),
      },
    });
  } catch (error) {
    console.error("History GET error", error);
    return NextResponse.json(
      { message: "Unable to fetch history" },
      { status: 500 },
    );
  }
}

