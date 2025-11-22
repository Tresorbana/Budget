import { Schema, model, models, Document, Types } from "mongoose";

export interface NotificationDocument extends Document {
  user: Types.ObjectId;
  title: string;
  message: string;
  type: "info" | "warning" | "success";
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["info", "warning", "success"], default: "info" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const NotificationModel =
  models.Notification ||
  model<NotificationDocument>("Notification", NotificationSchema);

