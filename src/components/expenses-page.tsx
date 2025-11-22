'use client';

import { startTransition, useCallback, useEffect, useState } from "react";
import { Plus, Filter, TrendingDown, AlertTriangle } from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { useCurrency } from "@/hooks/useCurrency";
import { apiFetch } from "@/lib/api-client";

import { CurrencyInput } from "./currency-input";
import { ExpenseItem } from "./expense-item";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface Expense {
  _id: string;
  name: string;
  amount: number;
  category: string;
  occurredAt: string;
}

interface BudgetSummary {
  _id: string;
  income: number;
  savingsPercentage: number;
  expenses: { amount: number }[];
  status: string;
}

export function ExpensesPage() {
  const { token } = useAuth();
  const { formatCurrency } = useCurrency();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    name: "",
    amount: "",
    category: "other",
  });
  const [filterCategory, setFilterCategory] = useState("all");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgetLimit, setBudgetLimit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { id: "all", label: "All Categories" },
    { id: "food", label: "Food" },
    { id: "transport", label: "Transport" },
    { id: "bills", label: "Bills" },
    { id: "shopping", label: "Shopping" },
    { id: "entertainment", label: "Entertainment" },
    { id: "healthcare", label: "Healthcare" },
    { id: "emergency", label: "Emergency" },
    { id: "other", label: "Other" },
  ];

  const fetchExpenses = useCallback(async () => {
    if (!token) return;
    const data = await apiFetch<Expense[]>("/api/expenses", {}, token);
    startTransition(() => setExpenses(data));
  }, [token]);

  const fetchBudget = useCallback(async () => {
    if (!token) return;
    const budgets = await apiFetch<BudgetSummary[]>("/api/budgets", {}, token);
    const active =
      budgets.find((budget) => budget.status === "active") ?? budgets[0];
    if (active) {
      const savingsAmount =
        (active.income * (active.savingsPercentage ?? 0)) / 100;
      startTransition(() => setBudgetLimit(active.income - savingsAmount));
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    startTransition(() => {
      setLoading(true);
      setError(null);
    });
    Promise.all([fetchExpenses(), fetchBudget()])
      .catch((err) => startTransition(() => setError(err.message)))
      .finally(() => startTransition(() => setLoading(false)));
  }, [token, fetchExpenses, fetchBudget]);

  const handleAddExpense = async () => {
    if (!newExpense.name || !newExpense.amount || !token) return;
    try {
      const created = await apiFetch<Expense>(
        "/api/expenses",
        {
          method: "POST",
          body: JSON.stringify({
            name: newExpense.name,
            amount: parseInt(newExpense.amount, 10),
            category: newExpense.category,
          }),
        },
        token,
      );
      startTransition(() => {
        setExpenses((prev) => [created, ...prev]);
        setNewExpense({ name: "", amount: "", category: "other" });
        setShowAddForm(false);
      });
    } catch (err) {
      startTransition(() => setError((err as Error).message));
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!token) return;
    await apiFetch(
      `/api/expenses?id=${id}`,
      {
        method: "DELETE",
      },
      token,
    );
    startTransition(() =>
      setExpenses((prev) => prev.filter((e) => e._id !== id)),
    );
  };

  const handleEditExpense = async (
    id: string,
    data: { name: string; amount: number; category: string },
  ) => {
    if (!token) return;
    try {
      const updated = await apiFetch<Expense>(
        `/api/expenses?id=${id}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        },
        token,
      );
      startTransition(() =>
        setExpenses((prev) =>
          prev.map((e) => (e._id === id ? updated : e)),
        ),
      );
    } catch (err) {
      startTransition(() => setError((err as Error).message));
    }
  };

  const filteredExpenses =
    filterCategory === "all"
      ? expenses
      : expenses.filter((e) => e.category === filterCategory);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const currentBudget = budgetLimit || 1;
  const remainingBudget = currentBudget - totalExpenses;
  const spentPercentage = (totalExpenses / currentBudget) * 100;

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2">Expenses</h1>
        <p className="text-muted-foreground">Track and manage your spending</p>
      </div>

      {/* Budget Overview */}
      <Card className="p-4 md:p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-muted-foreground mb-2">Total Spent This Month</p>
            <h2 className="text-destructive">
              {formatCurrency(totalExpenses)}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground mb-2">Remaining Budget</p>
            <h3
              className={
                remainingBudget >= 0 ? "text-primary" : "text-destructive"
              }
            >
              {formatCurrency(Math.abs(remainingBudget))}
            </h3>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Budget Progress</span>
            <span>{spentPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                spentPercentage > 100
                  ? "bg-destructive"
                  : spentPercentage > 80
                  ? "bg-accent"
                  : "bg-primary"
              }`}
              style={{ width: `${Math.min(spentPercentage, 100)}%` }}
            />
          </div>
        </div>

        {spentPercentage > 80 && (
          <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p>
              {spentPercentage > 100
                ? "You've exceeded your budget! Consider reducing expenses."
                : "You're approaching your budget limit. Spend carefully."}
            </p>
          </div>
        )}
      </Card>

      {/* Add Expense Button */}
      <Button
        onClick={() => setShowAddForm(!showAddForm)}
        className="w-full md:w-auto mb-6"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Unexpected Expense
      </Button>

      {/* Add Expense Form */}
      {showAddForm && (
        <Card className="p-4 md:p-6 mb-6">
          <h3 className="mb-4">Add New Expense</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expenseName">
                Expense Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="expenseName"
                type="text"
                placeholder="e.g., Coffee, Taxi"
                value={newExpense.name}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, name: e.target.value })
                }
                className="bg-input-background"
              />
            </div>

            <CurrencyInput
              label="Amount"
              value={newExpense.amount}
              onChange={(value) =>
                setNewExpense({ ...newExpense, amount: value })
              }
              placeholder="0"
              required
            />

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={newExpense.category}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, category: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-border bg-input-background"
              >
                {categories.slice(1).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddExpense}
                disabled={!newExpense.name || !newExpense.amount}
                className="flex-1"
              >
                Add Expense
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <h4>Filter by Category</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Badge
              key={cat.id}
              variant={filterCategory === cat.id ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilterCategory(cat.id)}
            >
              {cat.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Expenses List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h3>Recent Expenses</h3>
          <Badge variant="secondary">
            {filteredExpenses.length}{" "}
            {filteredExpenses.length === 1 ? "expense" : "expenses"}
          </Badge>
        </div>

        {filteredExpenses.length === 0 ? (
          <Card className="p-8 text-center">
            <TrendingDown className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h4 className="mb-2">No expenses found</h4>
            <p className="text-muted-foreground">
              {filterCategory === "all"
                ? "Start tracking your expenses by adding one above"
                : "No expenses in this category yet"}
            </p>
          </Card>
        ) : (
          filteredExpenses.map((expense) => (
            <ExpenseItem
              key={expense._id}
              id={expense._id}
              name={expense.name}
              amount={expense.amount}
              category={expense.category}
              date={new Date(expense.occurredAt).toLocaleString()}
              onDelete={() => handleDeleteExpense(expense._id)}
              onEdit={handleEditExpense}
            />
          ))
        )}
      </div>

      {loading && (
        <p className="text-center text-sm text-muted-foreground">
          Loading expenses...
        </p>
      )}
      {error && (
        <p className="text-center text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
