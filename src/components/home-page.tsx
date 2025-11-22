'use client';

import { startTransition, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  PiggyBank,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAuth } from "@/context/auth-context";
import { useCurrency } from "@/hooks/useCurrency";
import { apiFetch } from "@/lib/api-client";

import { StatCard } from "./stat-card";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

interface OverviewResponse {
  totals: {
    income: number;
    expenses: number;
    savings: number;
    balance: number;
  };
  monthlyChart: {
    month: string;
    income: number;
    expenses: number;
    savings: number;
  }[];
  recentExpenses: {
    id: string;
    name: string;
    amount: number;
    category: string;
    date: string;
  }[];
  notifications: {
    _id: string;
    title: string;
    message: string;
    type: string;
  }[];
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { token } = useAuth();
  const { formatCurrency } = useCurrency();
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    startTransition(() => {
      setLoading(true);
      setError(null);
    });
    apiFetch<OverviewResponse>("/api/overview", {}, token)
      .then((data) => startTransition(() => setOverview(data)))
      .catch((err) =>
        startTransition(() => setError(err.message ?? "Unable to load data")),
      )
      .finally(() => startTransition(() => setLoading(false)));
  }, [token]);

  const expensesByCategory = useMemo(() => {
    if (!overview) return [];
    const categoryMap: Record<string, number> = {};
    overview.recentExpenses.forEach((expense) => {
      categoryMap[expense.category] =
        (categoryMap[expense.category] ?? 0) + expense.amount;
    });
    const palette = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"];
    return Object.entries(categoryMap).map(([name, value], index) => ({
      name,
      value,
      color: palette[index % palette.length],
    }));
  }, [overview]);

  const totalCategory = expensesByCategory.reduce(
    (sum, entry) => sum + entry.value,
    0,
  );

  return (
    <div className="space-y-8 pb-28 text-white">
      <div className="rounded-3xl border border-[#2c3f2d] bg-gradient-to-br from-[#182318] via-[#131d14] to-[#0f160f] p-6 shadow-[0_30px_80px_rgba(6,9,6,0.6)]">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-[#5f7a61]">
              Monthly overview
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-white">
              Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-base text-[#9fbca0]">
              Track every franc from one unified dashboard. Add income,
              record expenses, and let Tresor AI warn you when trends shift.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => onNavigate("expenses")}
              className="h-12 rounded-full bg-[#2f7f33] px-6 text-sm font-bold tracking-[0.06em] text-white hover:bg-[#2f7f33]/90"
            >
              <Plus className="mr-2 size-4" />
              Add Expense
            </Button>
            <Button
              onClick={() => onNavigate("budget")}
              variant="outline"
              className="h-12 rounded-full border-[#2c3f2d] bg-transparent px-6 text-sm font-semibold text-white hover:bg-white/5"
            >
              <Wallet className="mr-2 size-4" />
              New Budget
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Income"
          value={formatCurrency(overview?.totals.income ?? 0)}
          icon={Wallet}
          variant="primary"
          trend={{ value: "8%", isPositive: true }}
          onTrendChange={(val) => console.log("Income trend:", val)}
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(overview?.totals.expenses ?? 0)}
          icon={TrendingDown}
          trend={{ value: "5%", isPositive: false }}
          onTrendChange={(val) => console.log("Expenses trend:", val)}
        />
        <StatCard
          title="Total Savings"
          value={formatCurrency(overview?.totals.savings ?? 0)}
          icon={PiggyBank}
          variant="accent"
          trend={{ value: "12%", isPositive: true }}
          onTrendChange={(val) => console.log("Savings trend:", val)}
        />
        <StatCard
          title="Net Balance"
          value={formatCurrency(overview?.totals.balance ?? 0)}
          icon={TrendingUp}
          trend={{ value: "10%", isPositive: true }}
          onTrendChange={(val) => console.log("Balance trend:", val)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2 border-[#2c3f2d] bg-[#131d14] p-6 text-white">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#526652]">
                Trends
              </p>
              <h3 className="text-2xl font-semibold">Income vs expenses</h3>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview?.monthlyChart ?? []}>
                <CartesianGrid strokeDasharray="4 4" stroke="#233323" />
                <XAxis dataKey="month" stroke="#5f7a61" />
                <YAxis stroke="#5f7a61" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f160f",
                    borderRadius: "0.75rem",
                    border: "1px solid #2c3f2d",
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="income" fill="#2f7f33" name="Income" radius={6} />
                <Bar
                  dataKey="expenses"
                  fill="#ffc93c"
                  name="Expenses"
                  radius={6}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-[#2c3f2d] bg-[#131d14] p-6 text-white">
          <h3 className="text-2xl font-semibold">AI insights</h3>
          <p className="mt-2 text-sm text-[#9fbca0]">
            Tresor AI spots spikes and savings opportunities instantly.
          </p>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-[#1d281d] p-4 text-sm leading-relaxed text-[#c8ebce]">
              {overview?.totals.expenses &&
              overview?.totals.expenses > overview?.totals.income
                ? "Spending outpaces income this month. Freeze nice-to-haves until the curve softens."
                : "You’re keeping a healthy buffer. Consider rerouting 5% to savings or investments."}
            </div>
            {overview?.notifications?.map((note) => (
              <div
                key={note._id}
                className="rounded-2xl border border-[#2c3f2d] bg-[#101910] p-4 text-sm"
              >
                <p className="font-semibold">{note.title}</p>
                <p className="text-[#9fbca0]">{note.message}</p>
              </div>
            ))}
          </div>
          <Button
            className="mt-6 w-full rounded-2xl bg-[#2f7f33] text-sm font-semibold hover:bg-[#2f7f33]/90"
            onClick={() => onNavigate("ai")}
          >
            Open Tresor AI
          </Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="border-[#2c3f2d] bg-[#131d14] p-6 text-white">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-2xl font-semibold">Expenses by category</h3>
            <span className="text-sm text-[#9fbca0]">This month</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={expensesByCategory}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={100}
                paddingAngle={4}
                stroke="#0f160f"
                dataKey="value"
              >
                {expensesByCategory.map((entry, index) => (
                  <Cell key={`slice-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-[#9fbca0]">
            {expensesByCategory.map((category) => (
              <div
                key={category.name}
                className="flex items-center justify-between rounded-xl bg-[#1a241b] px-3 py-2"
              >
                <span>{category.name}</span>
                <span className="font-semibold text-white">
                  {totalCategory
                    ? Math.round((category.value / totalCategory) * 100)
                    : 0}
                  %
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-[#2c3f2d] bg-[#131d14] p-6 text-white">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-2xl font-semibold">Savings trend</h3>
            <span className="text-sm text-[#9fbca0]">Last 6 months</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overview?.monthlyChart ?? []}>
                <CartesianGrid strokeDasharray="4 4" stroke="#233323" />
                <XAxis dataKey="month" stroke="#5f7a61" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f160f",
                    borderRadius: "0.75rem",
                    border: "1px solid #2c3f2d",
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <YAxis 
                  stroke="#5f7a61"
                  domain={[(dataMin: number) => Math.max(0, dataMin * 0.9), (dataMax: number) => dataMax * 1.1]}
                  tickFormatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="savings"
                  stroke="#0bda3c"
                  strokeWidth={3}
                  dot={{ fill: "#0bda3c", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Savings"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="border-[#2c3f2d] bg-[#131d14] p-6 text-white">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#526652]">
              Activity
            </p>
            <h3 className="text-2xl font-semibold">Recent transactions</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-sm text-[#0bda3c] hover:bg-[#0bda3c]/10"
            onClick={() => onNavigate("history")}
          >
            View archive
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
        <div className="space-y-3">
          {overview?.recentExpenses?.map((transaction) => (
            <div
              key={transaction.id}
              className="grid grid-cols-3 items-center gap-4 rounded-2xl border border-[#1f2a20] bg-[#101910] p-4 text-sm sm:grid-cols-4"
            >
              <div className="col-span-2 flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full bg-[#fa5238]/20 text-[#fa5238]">
                  <TrendingDown className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-white">
                    {transaction.name}
                  </p>
                  <p className="text-[#9fbca0]">
                    {new Date(transaction.date).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="hidden text-[#9fbca0] sm:block">
                {transaction.category}
              </p>
              <p className="text-right text-sm font-semibold text-[#fa5238]">
                - {formatCurrency(transaction.amount)}
              </p>
            </div>
          ))}
        </div>

        {loading && (
          <p className="mt-4 text-center text-sm text-[#9fbca0]">
            Syncing your workspace...
          </p>
        )}
        {error && (
          <p className="mt-4 text-center text-sm text-destructive">{error}</p>
        )}
      </Card>
    </div>
  );
}
