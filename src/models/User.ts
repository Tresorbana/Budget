import { Schema, model, models, Document } from "mongoose";

import { NotificationSettings, PreferencesPayload } from "@/lib/types";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  location: string;
  avatarUrl?: string;
  memberSince: Date;
  currency: PreferencesPayload["currency"];
  theme: PreferencesPayload["theme"];
  language?: "en" | "fr" | "rw";
  notifications: NotificationSettings;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSettingsSchema = new Schema<NotificationSettings>(
  {
    pushNotifications: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    budgetAlerts: { type: Boolean, default: true },
    savingsReminders: { type: Boolean, default: true },
    expenseAlerts: { type: Boolean, default: true },
  },
  { _id: false },
);

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "+250 788 123 456" },
    location: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    memberSince: { type: Date, default: () => new Date() },
    currency: {
      type: String,
      enum: ["rwf", "usd", "eur"],
      default: "rwf",
    },
    theme: {
      type: String,
      enum: ["dark"],
      default: "dark",
    },
    language: {
      type: String,
      enum: ["en", "fr", "rw"],
      default: "en",
    },
    notifications: {
      type: NotificationSettingsSchema,
      default: {},
    },
  },
  { timestamps: true },
);

export const User =
  models.User<UserDocument> || model<UserDocument>("User", UserSchema);

