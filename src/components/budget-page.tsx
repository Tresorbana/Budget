'use client';

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, CheckCircle, AlertCircle } from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { useTranslation } from "@/i18n/useTranslation";
import { useCurrency } from "@/hooks/useCurrency";
import { apiFetch } from "@/lib/api-client";

import { CurrencyInput } from "./currency-input";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";

interface ExpenseItem {
  id: string;
  name: string;
  amount: string;
  category: string;
}

interface Budget {
  _id: string;
  name: string;
  income: number;
  expenses: { name: string; amount: number; category: string }[];
  savingsPercentage: number;
  unexpectedIncome?: number;
  unexpectedExpenses?: number;
  debt?: number;
  status: "active" | "completed";
  createdAt: string;
}

interface BudgetPageProps {
  onNavigate: (page: string) => void;
}

export function BudgetPage({ onNavigate }: BudgetPageProps) {
  const { token } = useAuth();
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const [step, setStep] = useState(0);
  const [budgetName, setBudgetName] = useState("");
  const [income, setIncome] = useState("");
  const [unexpectedIncome, setUnexpectedIncome] = useState("");
  const [unexpectedExpenses, setUnexpectedExpenses] = useState("");
  const [savingsPercentage, setSavingsPercentage] = useState("20");
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [newExpense, setNewExpense] = useState({
    name: "",
    amount: "",
    category: "other",
  });
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    "Food",
    "Transport",
    "Bills",
    "Shopping",
    "Entertainment",
    "Healthcare",
    "Education",
    "Other",
  ];

  useEffect(() => {
    if (!token) return;
    apiFetch<Budget[]>("/api/budgets", {}, token)
      .then(setBudgets)
      .catch((err) => setError(err.message));
  }, [token]);

  const addExpense = () => {
    if (newExpense.name && newExpense.amount) {
      setExpenses((prev) => [
        ...prev,
        { ...newExpense, id: Date.now().toString() },
      ]);
      setNewExpense({ name: "", amount: "", category: "other" });
    }
  };

  const removeExpense = (id: string) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
  };

  const calculateTotals = () => {
    const totalIncome = parseInt(income || "0", 10);
    const savingsAmount = (totalIncome * parseInt(savingsPercentage || "0", 10)) / 100;
    const totalExpenses = expenses.reduce(
      (sum, e) => sum + parseInt(e.amount || "0", 10),
      0,
    );
    const uiUnexpectedIncome = parseInt(unexpectedIncome || "0", 10);
    const uiUnexpectedExpenses = parseInt(unexpectedExpenses || "0", 10);
    const netBalance = totalIncome - savingsAmount - totalExpenses + uiUnexpectedIncome - uiUnexpectedExpenses;
    return { totalIncome, savingsAmount, totalExpenses, netBalance };
  };

  const { totalIncome, savingsAmount, totalExpenses, netBalance } = calculateTotals();
  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleSaveBudget = async () => {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: budgetName,
        income: parseInt(income, 10),
        savingsPercentage: parseInt(savingsPercentage, 10),
        expenses: expenses.map((expense) => ({
          name: expense.name,
          amount: parseInt(expense.amount, 10),
          category: expense.category,
        })),
        unexpectedIncome: parseInt(unexpectedIncome || "0", 10),
        unexpectedExpenses: parseInt(unexpectedExpenses || "0", 10),
      };
      if (editingId) {
        const updated = await apiFetch<Budget>(
          `/api/budgets/${editingId}?id=${editingId}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          },
          token,
        );
        setBudgets((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
        setEditingId(null);
      } else {
        const created = await apiFetch<Budget>(
          "/api/budgets",
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
          token,
        );
        setBudgets((prev) => [created, ...prev]);
      }
      setStep(0);
      setBudgetName("");
      setIncome("");
      setSavingsPercentage("20");
      setExpenses([]);
      setUnexpectedIncome("");
      setUnexpectedExpenses("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const loadForEdit = async (id: string) => {
    if (!token) return;
    try {
      const b = await apiFetch<Budget>(`/api/budgets/${id}?id=${id}`, {}, token);
      setEditingId(b._id);
      setBudgetName(b.name);
      setIncome(String(b.income));
      setSavingsPercentage(String(b.savingsPercentage ?? 0));
      setExpenses((b.expenses || []).map((e, idx) => ({ id: String(idx) + e.name, name: e.name, amount: String(e.amount), category: e.category })));
      setUnexpectedIncome(String(b.unexpectedIncome || 0));
      setUnexpectedExpenses(String(b.unexpectedExpenses || 0));
      setStep(2);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (step === 0) {
    return (
      <div className="p-4 md:p-6 pb-24 md:pb-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
              <h1 className="mb-2">{t('my_budgets')}</h1>
              <p className="text-muted-foreground">{t('manage_budgets')}</p>
          </div>
          <Button
            variant="ghost"
            className="text-sm text-[#0bda3c]"
            onClick={() => onNavigate("history")}
          >
              {t('view_history')}
          </Button>
        </div>

        <Button onClick={() => setStep(1)} className="mb-6 w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Create New Budget
        </Button>

        <div className="space-y-4">
          {budgets.map((budget) => {
            const totalBudgetExpenses = budget.expenses.reduce(
              (sum, expense) => sum + expense.amount,
              0,
            );
            const savingsAmountForBudget =
              (budget.income * (budget.savingsPercentage ?? 0)) / 100;
            return (
              <Card key={budget._id} className="p-4 md:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3>{budget.name}</h3>
                      <Badge
                        variant={
                          budget.status === "active" ? "default" : "secondary"
                        }
                      >
                        {budget.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      Net Balance: {formatCurrency(
                        budget.income - totalBudgetExpenses - savingsAmountForBudget,
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {budget.debt ? (
                      <Badge variant="destructive">Debt: {formatCurrency(budget.debt)}</Badge>
                    ) : null}
                    <Button variant="ghost" size="sm" onClick={() => loadForEdit(budget._id)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-muted-foreground mb-1">Income</p>
                    <p className="text-primary">{formatCurrency(budget.income)}</p>
                    {budget.unexpectedIncome ? (
                      <p className="text-muted-foreground text-sm">+ {formatCurrency(budget.unexpectedIncome)} unexpected</p>
                    ) : null}
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Expenses</p>
                    <p className="text-destructive">
                      {formatCurrency(totalBudgetExpenses)}
                    </p>
                    {budget.unexpectedExpenses ? (
                      <p className="text-muted-foreground text-sm">+ {formatCurrency(budget.unexpectedExpenses)} unexpected</p>
                    ) : null}
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Savings</p>
                    <p className="text-accent-foreground">
                      {formatCurrency(savingsAmountForBudget)}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="mb-2">Create Budget</h1>
            <p className="text-muted-foreground">
              Step {step} of {totalSteps}
            </p>
          </div>
          <Button variant="outline" onClick={() => setStep(0)}>
            Cancel
          </Button>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="max-w-2xl mx-auto">
        {step === 1 && (
          <Card className="p-6">
            <h2 className="mb-6">Name Your Budget</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="budgetName">
                  Budget Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="budgetName"
                  type="text"
                  placeholder="e.g., June 2024 Budget"
                  value={budgetName}
                  onChange={(e) => setBudgetName(e.target.value)}
                  className="bg-input-background"
                />
              </div>
              <Button
                onClick={() => setStep(2)}
                disabled={!budgetName}
                className="w-full"
              >
                Next
              </Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-6">
            <h2 className="mb-6">Expected Income</h2>
            <div className="space-y-4">
              <CurrencyInput
                label="Monthly Income"
                value={income}
                onChange={setIncome}
                placeholder="0"
                required
              />
              <CurrencyInput
                label="Unexpected Income"
                value={unexpectedIncome}
                onChange={setUnexpectedIncome}
                placeholder="0"
              />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!income}
                  className="flex-1"
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="mb-6">Add Expenses</h2>

              <div className="space-y-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="expenseName">Expense Name</Label>
                  <Input
                    id="expenseName"
                    type="text"
                    placeholder="e.g., Rent, Groceries"
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
                    {categories.map((cat) => (
                      <option key={cat} value={cat.toLowerCase()}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <Button onClick={addExpense} variant="secondary" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Expense
                </Button>
              </div>

              {expenses.length > 0 && (
                <div className="space-y-3 mb-6">
                  <h4>Added Expenses</h4>
                  {expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted"
                    >
                      <div>
                        <p>{expense.name}</p>
                        <p className="text-muted-foreground">{expense.category}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p>{formatCurrency(parseInt(expense.amount || "0", 10))}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExpense(expense.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(4)} className="flex-1">
                  Next
                </Button>
              </div>
            </Card>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="mb-6">Savings Plan</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="savings">
                    Savings Percentage: {savingsPercentage}%
                  </Label>
                  <input
                    id="savings"
                    type="range"
                    min="0"
                    max="50"
                    value={savingsPercentage}
                    onChange={(e) => setSavingsPercentage(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-muted-foreground text-center">
                    {formatCurrency(savingsAmount)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="mb-6">Budget Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-muted-foreground">Budget Name</p>
                  <p>{budgetName}</p>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-muted-foreground">Total Income</p>
                  <p className="text-primary">{formatCurrency(totalIncome)}</p>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-muted-foreground">Total Expenses</p>
                  <p className="text-destructive">{formatCurrency(totalExpenses)}</p>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-muted-foreground">Savings</p>
                  <p className="text-accent-foreground">{formatCurrency(savingsAmount)}</p>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center">
                    <p>Net Balance</p>
                    <p className={netBalance >= 0 ? "text-primary" : "text-destructive"}>
                      {formatCurrency(netBalance)}
                    </p>
                  </div>
                </div>

                {netBalance < 0 && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <p>Your expenses and savings exceed your income. Please adjust your budget.</p>
                  </div>
                )}

              <div className="space-y-2 mb-6">
                <CurrencyInput
                  label="Unexpected Expenses"
                  value={unexpectedExpenses}
                  onChange={setUnexpectedExpenses}
                  placeholder="0"
                />
              </div>

                {netBalance >= 0 && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 text-primary">
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <p>Great! Your budget is balanced.</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleSaveBudget}
                  disabled={netBalance < 0 || saving}
                  className="flex-1"
                >
                  {saving ? "Saving..." : "Create Budget"}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {error && (
          <p className="mt-4 text-center text-sm text-destructive">{error}</p>
        )}
      </div>
    </div>
  );
}
