import { Schema, model, models, Document, Types } from "mongoose";

interface BudgetExpense {
  name: string;
  amount: number;
  category: string;
}

export interface BudgetDocument extends Document {
  user: Types.ObjectId;
  name: string;
  income: number;
  savingsPercentage: number;
  expenses: BudgetExpense[];
  unexpectedIncome?: number;
  unexpectedExpenses?: number;
  debt?: number;
  status: "active" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<BudgetExpense>(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
  },
  { _id: false },
);

const BudgetSchema = new Schema<BudgetDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    income: { type: Number, required: true },
    savingsPercentage: { type: Number, default: 0 },
    unexpectedIncome: { type: Number, default: 0 },
    unexpectedExpenses: { type: Number, default: 0 },
    debt: { type: Number, default: 0 },
    expenses: { type: [ExpenseSchema], default: [] },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
  },
  { timestamps: true },
);

export const Budget =
  models.Budget<BudgetDocument> || model<BudgetDocument>("Budget", BudgetSchema);

