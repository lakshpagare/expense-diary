import mongoose, { Schema, Model, Document } from "mongoose";
import bcrypt from "bcryptjs";
import type { PaymentMethod } from "@/types";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  profileImage?: string;
  currency: string;
  monthlyBudget: number;
  defaultPaymentMethod: PaymentMethod;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false, // never return password by default
    },
    profileImage: {
      type: String,
      default: "",
    },
    currency: {
      type: String,
      default: "INR",
    },
    monthlyBudget: {
      type: Number,
      default: 0,
      min: 0,
    },
    defaultPaymentMethod: {
      type: String,
      enum: ["UPI", "Cash", "Credit Card", "Debit Card", "Bank Transfer", "Wallet", "Other"],
      default: "UPI",
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// Hash password before saving, only if it was modified
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
