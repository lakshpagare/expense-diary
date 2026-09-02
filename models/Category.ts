import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface ICategory extends Document {
  userId: Types.ObjectId;
  name: string;
  icon: string;
  color: string;
  monthlyLimit?: number;
  isDefault: boolean;
  createdAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: 50,
    },
    icon: {
      type: String,
      default: "more-horizontal",
    },
    color: {
      type: String,
      default: "#64748b",
    },
    monthlyLimit: {
      type: Number,
      min: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

CategorySchema.index({ userId: 1, name: 1 }, { unique: true });

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
