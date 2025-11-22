import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Budget } from "@/models/Budget";
import { Expense } from "@/models/Expense";
import { User } from "@/models/User";

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_API_KEY,
});

const HF_MODEL_ID = "meta-llama/Llama-3.3-70B-Instruct:groq";

export async function POST(request: NextRequest) {
  const { prompt } = await request.json();

  try {
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid prompt" },
        { status: 400 },
      );
    }

    if (!process.env.HF_API_KEY) {
      return NextResponse.json(
        { error: "HF_API_KEY is not configured on the server" },
        { status: 500 },
      );
    }

    // Try to personalize using the authenticated user's data
    let systemContext = "";
    try {
      await connectDB();

      const token = getTokenFromRequest(request);
      if (token) {
        const payload = verifyToken(token);

        const user = await User.findById(payload.userId).lean();
        const budgets = await Budget.find({ user: payload.userId }).sort({ createdAt: -1 }).lean();
        const expenses = await Expense.find({ user: payload.userId }).sort({ occurredAt: -1 }).lean();

        if (user) {
          type BudgetLike = { income: number; savingsPercentage?: number; status?: string };
          type ExpenseLike = {
            name: string;
            amount: number;
            category: string;
            occurredAt: Date | string;
          };

          const typedBudgets = budgets as unknown as BudgetLike[];
          const typedExpenses = expenses as unknown as ExpenseLike[];

          const totalIncome = typedBudgets.reduce(
            (sum, budget) => sum + budget.income,
            0,
          );
          const totalExpenses = typedExpenses.reduce(
            (sum, expense) => sum + expense.amount,
            0,
          );
          const totalSaved = typedBudgets.reduce((sum, budget) => {
            return sum + (budget.income * (budget.savingsPercentage ?? 0)) / 100;
          }, 0);

          const recentExpenses = typedExpenses.slice(0, 5).map((expense) => ({
            name: expense.name,
            amount: expense.amount,
            category: expense.category,
            date: expense.occurredAt,
          }));

          const activeBudgets = typedBudgets.filter(
            (budget) => budget.status === "active",
          ).length;

          const userName = (user as any)?.name ?? "unknown";
          const userCurrency = (user as any)?.currency?.toUpperCase?.() ?? "RWF";
          const userMemberSince = (user as any)?.memberSince
            ? new Date((user as any).memberSince).toISOString().slice(0, 10)
            : "unknown";

          systemContext = `You are Tresor Budget AI. You are helping a single user based on their real financial data from the app.\n\nUser profile:\n- Name: ${userName}\n- Currency: ${userCurrency}\n- Member since: ${userMemberSince}\n\nAggregated stats:\n- Total income: ${totalIncome}\n- Total expenses: ${totalExpenses}\n- Total saved (from budgets): ${totalSaved}\n- Active budgets: ${activeBudgets}\n\nRecent expenses (up to 5):\n${recentExpenses
            .map(
              (e) =>
                `- ${e.name}: ${e.amount} in category ${e.category} on ${new Date(
                  e.date,
                ).toISOString().slice(0, 10)}`,
            )
            .join("\\n")}\n\nPrimary role: Give concrete, personalized financial advice using these numbers.\nIf the user asks about something completely unrelated to personal finance (like general knowledge or fun facts), you may still answer briefly and clearly, then gently relate it back to money or budgeting when possible.`;
        }
      }
    } catch (contextError) {
      console.error("AI context error", contextError);
      // Fall back to generic behavior if personalization fails
      systemContext =
        "You are Tresor Budget AI, a financial assistant. The user's financial data could not be loaded, so answer in a general but practical way.";
    }

    // Build messages for chat completions API
    const messages: Array<{ role: "system" | "user"; content: string }> = [];

    if (systemContext) {
      messages.push({ role: "system", content: systemContext });
    }

    messages.push({ role: "user", content: prompt });

    const chatCompletion = await client.chat.completions.create({
      model: HF_MODEL_ID,
      messages,
      max_tokens: 512,
      temperature: 0.7,
    });

    const aiMessage = chatCompletion.choices?.[0]?.message?.content;

    if (!aiMessage) {
      return NextResponse.json(
        { error: "No response from AI model" },
        { status: 502 },
      );
    }

    return NextResponse.json({ content: aiMessage });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
