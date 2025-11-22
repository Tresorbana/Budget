import { NextRequest, NextResponse } from "next/server";

import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Budget } from "@/models/Budget";
import { Expense } from "@/models/Expense";
import { NotificationModel } from "@/models/Notification";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const payload = verifyToken(token);

    const [user, budgets, expenses, notifications] = await Promise.all([
      User.findById(payload.userId).lean(),
      Budget.find({ user: payload.userId }).sort({ createdAt: -1 }).lean(),
      Expense.find({ user: payload.userId }).sort({ occurredAt: -1 }).lean(),
      NotificationModel.find({ user: payload.userId, read: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const budgetsTyped = budgets as any[];
    const expensesTyped = expenses as any[];

    const totalIncome = budgetsTyped.reduce((sum: number, budget: any) => sum + budget.income, 0);
    const totalExpenses = expensesTyped.reduce(
      (sum: number, expense: any) => sum + expense.amount,
      0,
    );
    const totalSavings = budgets.reduce((sum, budget) => {
      return sum + (budget.income * budget.savingsPercentage) / 100;
    }, 0);

    const monthlyChart = budgetsTyped.slice(0, 6).map((budget) => ({
      month: new Date(budget.createdAt).toLocaleString("default", {
        month: "short",
      }),
      income: budget.income,
      expenses: budget.expenses.reduce((s: number, e: any) => s + e.amount, 0),
      savings:
        (budget.income * budget.savingsPercentage) / 100 -
        budget.expenses.reduce((s: number, e: any) => s + e.amount, 0),
    }));

    const recentExpenses = expensesTyped.slice(0, 5).map((expense) => ({
      id: String(expense._id),
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
      date: expense.occurredAt,
    }));

    const activeBudgets = budgetsTyped.filter(
      (budget) => budget.status === "active",
    ).length;
    const expensesTracked = expensesTyped.length;
    const totalSaved = budgetsTyped.reduce((sum: number, budget: any) => {
      return sum + (budget.income * (budget.savingsPercentage ?? 0)) / 100;
    }, 0);
    const userTyped = user as any;
    const daysActive = userTyped?.memberSince
      ? Math.max(
          1,
          Math.ceil(
            (Date.now() - new Date(userTyped.memberSince).getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : 0;

    return NextResponse.json({
      totals: {
        income: totalIncome,
        expenses: totalExpenses,
        savings: totalSavings,
        balance: totalIncome - totalExpenses - totalSavings,
      },
      monthlyChart,
      recentExpenses,
      notifications,
      stats: {
        activeBudgets,
        expensesTracked,
        totalSaved,
        daysActive,
      },
    });
  } catch (error) {
    console.error("Overview GET error", error);
    return NextResponse.json(
      { message: "Unable to fetch overview" },
      { status: 500 },
    );
  }
}

