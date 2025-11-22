import { Schema, model, models, Document, Types } from "mongoose";

export interface ExpenseDocument extends Document {
  user: Types.ObjectId;
  name: string;
  amount: number;
  category: string;
  occurredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<ExpenseDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    occurredAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const Expense =
  models.Expense<ExpenseDocument> || model<ExpenseDocument>("Expense", ExpenseSchema);

