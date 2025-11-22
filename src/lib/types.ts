export type CurrencyCode = "rwf" | "usd" | "eur";

export interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  budgetAlerts: boolean;
  savingsReminders: boolean;
  expenseAlerts: boolean;
}

export interface PreferencesPayload {
  currency: CurrencyCode;
  theme: "dark";
  notifications: NotificationSettings;
  language?: "en" | "fr" | "rw";
}

export interface BudgetExpenseInput {
  name: string;
  amount: number;
  category: string;
}

export interface BudgetInput {
  name: string;
  income: number;
  savingsPercentage: number;
  expenses: BudgetExpenseInput[];
  status?: "active" | "completed";
}

export interface ExpenseInput {
  name: string;
  amount: number;
  category: string;
}

